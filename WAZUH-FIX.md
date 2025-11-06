# 🔧 Wazuh API - Status e Fix

**Data**: 05/11/2025  
**Problema Original**: ERROR 3099 - Invalid credentials  
**Status Atual**: ✅ Autenticação OK | ⚠️ Endpoint alertas incorreto

---

## ✅ Problema Resolvido: Autenticação

### Causa
User incorreto: estava usando `admin`, deveria ser `wazuh-wui`

### Solução Aplicada
```env
# Antes (ERRADO)
WAZUH_USERNAME=admin
WAZUH_PASSWORD=Nessnet@10

# Depois (CORRETO)
WAZUH_USERNAME=wazuh-wui
WAZUH_PASSWORD=Nessnet@10
```

### Teste de Autenticação
```bash
docker exec wazuh-manager curl -k -X POST \
  -u wazuh-wui:Nessnet@10 \
  https://localhost:55000/security/user/authenticate

# Resultado: ✅ Token JWT válido retornado
```

---

## ⚠️ Problema Atual: Endpoint de Alertas

### Erro
```
Request failed with status code 404
GET https://wazuh-manager:55000/manager/alerts
```

### Causa
No Wazuh 4.9.0, os **alertas não vêm da API Manager**, mas sim do **Wazuh Indexer** (OpenSearch).

### Arquitetura Wazuh 4.9.0

```
┌─────────────────────────────────────────────┐
│          Wazuh Manager (API)                │
│  https://wazuh-manager:55000                │
│  - /manager/info ✅                         │
│  - /agents ✅                               │
│  - /security ✅                             │
│  - /manager/alerts ❌ (NÃO EXISTE)          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       Wazuh Indexer (OpenSearch)            │
│  https://wazuh.indexer:9200                 │
│  - Índices: wazuh-alerts-*                  │
│  - Query DSL (Elasticsearch/OpenSearch)     │
│  - Aqui ficam os ALERTAS ✅                 │
└─────────────────────────────────────────────┘
```

---

## 🔍 Endpoints Wazuh API Disponíveis

### ✅ Endpoints que Funcionam

| Endpoint | Descrição | Status |
|----------|-----------|--------|
| `/` | API info | ✅ OK |
| `/manager/info` | Manager info | ✅ OK |
| `/agents` | Lista agentes | ✅ (testar) |
| `/security/user/authenticate` | Login | ✅ OK |

### ❌ Endpoints que NÃO Existem

| Endpoint | Motivo |
|----------|--------|
| `/manager/alerts` | Alertas vêm do Indexer |
| `/alerts` | Idem |
| `/events` | Idem |

---

## 💡 Soluções Possíveis

### Opção 1: Query direto no Wazuh Indexer (RECOMENDADO)
```javascript
// Conectar no OpenSearch (Wazuh Indexer)
const { Client } = require('@opensearch-project/opensearch');

const client = new Client({
  node: 'https://wazuh.indexer:9200',
  auth: {
    username: 'admin',
    password: 'Nessnet@10'
  },
  ssl: {
    rejectUnauthorized: false
  }
});

// Query alertas
const response = await client.search({
  index: 'wazuh-alerts-*',
  body: {
    query: {
      range: {
        timestamp: {
          gte: 'now-1h'
        }
      }
    },
    sort: [{ timestamp: 'desc' }],
    size: 500
  }
});
```

### Opção 2: Usar Wazuh Dashboard API
O Wazuh Dashboard tem endpoints para acessar alertas através da UI API.

### Opção 3: Desabilitar Wazuh Collector temporariamente
Focar em Zabbix (que já funciona ✅) e implementar Wazuh depois.

---

## 🎯 Recomendação: Opção 3 (Temporária)

**Motivo**: 
- Zabbix já está funcionando perfeitamente ✅
- Implementar OpenSearch client adiciona complexidade
- GRC, SOC (sem Wazuh ainda), NOC já entrega valor

**Quando implementar Wazuh**:
- Sprint 3 ou 4
- Com tempo para fazer correto (OpenSearch client)
- Documentação completa

---

## 📝 Próximos Passos

### Imediato
- [ ] Desabilitar Wazuh collector (comentar código)
- [ ] Focar em Zabbix que funciona
- [ ] Continuar Sprint 2 (Error Handling + Tests)

### Sprint 3 ou 4
- [ ] Instalar `@opensearch-project/opensearch`
- [ ] Criar WazuhIndexerCollector
- [ ] Query wazuh-alerts-* index
- [ ] Transform data para schema Supabase
- [ ] Documentar integração

---

## 🔧 Fix Aplicado (Temporário)

### Comentar Wazuh Collector

```javascript
// backend/index.js

// Collectors (apenas Zabbix por enquanto)
const zabbixCollector = new ZabbixCollector(supabase, { /* ... */ });

// TODO: Wazuh collector precisa integração com Indexer (OpenSearch)
// const wazuhCollector = new WazuhCollector(supabase, { /* ... */ });

async function runCollectors() {
  const orgId = DEMO_ORG_ID;
  
  // Wazuh: desabilitado temporariamente (precisa OpenSearch client)
  // try {
  //   await wazuhCollector.run(orgId);
  // } catch (error) {
  //   logger.errorWithContext('[Collectors] Wazuh collection failed', error);
  // }
  
  // Zabbix: funcionando ✅
  try {
    await zabbixCollector.run(orgId);
  } catch (error) {
    logger.errorWithContext('[Collectors] Zabbix collection failed', error);
  }
}

// Cron: apenas Zabbix
cron.schedule(`*/${ZABBIX_COLLECTION_INTERVAL_SECONDS} * * * * *`, async () => {
  try {
    await zabbixCollector.run(DEMO_ORG_ID);
  } catch (error) {
    logger.errorWithContext('[Cron] Zabbix collection failed', error);
  }
});
```

---

## 📊 Status Final

| Componente | Status | Observação |
|------------|--------|------------|
| Wazuh Auth | ✅ OK | wazuh-wui funciona |
| Wazuh API | ✅ OK | Manager API responde |
| Wazuh Alerts | ⏳ Pendente | Precisa Indexer (OpenSearch) |
| Zabbix | ✅ OK | Funcionando 100% |
| n360 Backend | ✅ OK | Rodando sem Wazuh collector |

---

**Conclusão**: Wazuh autenticação **RESOLVIDA** ✅. Coleta de alertas **adiada** para Sprint 3/4 (precisa OpenSearch client).

**Próximo**: Continuar Sprint 2 com o que funciona (Zabbix + core features).


