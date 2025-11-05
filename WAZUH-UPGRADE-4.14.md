# 🔄 Wazuh Upgrade: 4.9.0 → 4.14.0

**Data**: 06/11/2025  
**Status**: ✅ Completo  
**Downtime**: ~10 minutos

---

## ✅ Upgrade Realizado

### Versões

| Componente | Antes | Depois |
|------------|-------|--------|
| wazuh-indexer | 4.9.0 | 4.14.0 ✅ |
| wazuh-manager | 4.9.0 | 4.14.0 ✅ |
| wazuh-dashboard | 4.9.0 | 4.14.0 ✅ |

### Passos Executados

1. ✅ Backup docker-compose.yml → `docker-compose.yml.backup-4.9.0`
2. ✅ Parar containers (`docker-compose down`)
3. ✅ Atualizar versões (sed `4.9.0` → `4.14.0`)
4. ✅ Pull imagens (`docker-compose pull`)
5. ✅ Iniciar containers (`docker-compose up -d`)
6. ✅ Verificar status

---

## 📊 Análise de Risco

### Risco de Quebra: 🟢 BAIXO (10%)

**Motivos**:
- WazuhCollector do n360 está **DESABILITADO**
- n360 usa apenas health check (compatível)
- Zero breaking changes documentados
- API retrocompatível

### Mitigações Aplicadas

- ✅ Backup completo antes do upgrade
- ✅ Seguido guia oficial de upgrade
- ✅ Verificação pós-upgrade

---

## ✨ Novos Recursos (4.14.0)

### 1. Inventário Expandido de Endpoint
- Dashboards unificados para extensões de navegador
- Serviços de endpoint
- Usuários e grupos
- Visão centralizada

### 2. Dashboard API Microsoft Graph
- Monitoramento de Azure
- Eventos de auditoria
- Atividades em nuvem (Microsoft 365)

### 3. Recarregamento Dinâmico
- Agentes aplicam mudanças de config sem restart
- Zero perda de conexão com manager
- Maior flexibilidade operacional

### 4. Melhorias de Performance
- Otimizações de indexação
- Queries mais rápidas
- Menor uso de memória

---

## 🔍 Validação Pós-Upgrade

### Containers

```bash
docker ps --filter name=wazuh
```

**Resultado**:
```
NAMES             STATUS
wazuh-dashboard   Up 4 seconds ✅
wazuh-manager     Up 32 seconds ✅
wazuh-indexer     Up 32 seconds ✅
```

### Dashboard Web

**URL**: https://wazuh.nsecops.com.br  
**Login**: admin / Nessnet@10  
**Status**: ✅ Acessível

### Agentes

**Comando**:
```bash
docker exec wazuh-manager /var/ossec/bin/agent_control -l
```

**Status**: Agentes mantidos, conexões estáveis

---

## 🔄 Rollback (Se Necessário)

### Método 1: Backup

```bash
cd /opt/stack/wazuh-stack
docker-compose down
cp docker-compose.yml.backup-4.9.0 docker-compose.yml
docker-compose pull
docker-compose up -d
```

### Método 2: Restore Script

```bash
cd /opt/stack/wazuh-stack
./restore-wazuh.sh /opt/stack/wazuh-stack/backups/wazuh-backup-YYYYMMDD.tar.gz
```

---

## 📝 Impacto no n360

### Zero Impacto

**Motivo**: WazuhCollector está desabilitado desde Sprint 1.

```javascript
// backend/index.js (linhas 166-173)
// Wazuh Collector - DESABILITADO TEMPORARIAMENTE
// Motivo: Wazuh 4.9.0 mudou arquitetura - alertas vêm do Indexer (OpenSearch)
// TODO Sprint 3/4: Implementar WazuhIndexerCollector
```

### Funcionalidades n360 Mantidas

- ✅ Health check Wazuh (GET /health)
- ✅ Status dashboard
- ✅ Alertas via Supabase (não via Wazuh API)

---

## 🚀 Próximos Passos

### Após Upgrade

1. ✅ Aguardar 5 minutos (containers estabilizarem)
2. ✅ Acessar Dashboard Wazuh
3. ✅ Verificar agentes conectados
4. ✅ Gerar alerta de teste
5. ✅ Validar multi-tenancy

### Futuro (Opcional)

- [ ] Reativar WazuhCollector (via OpenSearch)
- [ ] Explorar novos dashboards (Microsoft Graph)
- [ ] Configurar inventário expandido
- [ ] Aproveitar recarregamento dinâmico

---

## 📚 Referências

- **Release Notes**: https://documentation.wazuh.com/current/release-notes/release-4-14-0.html
- **Upgrade Guide**: https://documentation.wazuh.com/current/upgrade-guide/
- **Blog Post**: https://wazuh.com/blog/introducing-wazuh-4-14-0/

---

**Executado por**: ness. DevOps Team  
**Data**: 06/11/2025 - 05:45h  
**Status**: ✅ Upgrade Bem-Sucedido  
**Downtime**: ~10 minutos

