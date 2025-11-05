# 🏢 Multi-tenancy Habilitado - Wazuh Dashboard

**Data**: 05/11/2025  
**Status**: ✅ Ativo  
**Motivo**: POC com múltiplos tenants

---

## ✅ O Que Foi Feito

### Configuração Aplicada

Arquivo: `/opt/stack/wazuh-stack/config/wazuh_dashboard/opensearch_dashboards.yml`

```yaml
# Multi-tenancy Configuration
opensearch_security.multitenancy.enabled: true
opensearch_security.multitenancy.tenants.enable_global: true
opensearch_security.multitenancy.tenants.enable_private: true
opensearch_security.multitenancy.tenants.preferred: ["Global", "Private"]

# Request Headers
opensearch.requestHeadersWhitelist: ["securitytenant","Authorization"]

# Default Route with Global Tenant
uiSettings.overrides.defaultRoute: /app/wz-home?security_tenant=global
```

### Tenants Disponíveis

| Tenant | Descrição | Uso |
|--------|-----------|-----|
| **Global** | Compartilhado por todos | Dashboards padrão, dados globais |
| **Private** | Individual por usuário | Dashboards personalizados, experimentação |
| **Custom** | Criados sob demanda | Equipes (SOC, NOC, GRC), Clientes |

---

## 🎯 Como Usar

### 1. Acessar Dashboard
```
URL: https://wazuh.nsecops.com.br
User: admin
Pass: Nessnet@10
```

### 2. Selecionar Tenant

No **canto superior direito**, clique no nome do tenant atual (ex: "Global"):

```
┌────────────────────────────────────┐
│ [Avatar] admin     [Global ▼]      │
└────────────────────────────────────┘
                        ↑
                  Clique aqui
```

Opções disponíveis:
- ✅ Global (padrão)
- ✅ Private (individual)
- ✅ Custom tenants (se criados)

### 3. Criar Tenant Customizado (Opcional)

**Via OpenSearch Security Plugin**:

```bash
ssh root@148.230.77.242

# Criar tenant "ness-soc"
docker exec wazuh-indexer curl -k -X PUT \
  "https://localhost:9200/_plugins/_security/api/tenants/ness-soc" \
  -u admin:SecretPassword \
  -H 'Content-Type: application/json' \
  -d '{"description": "Tenant da equipe SOC da ness."}'
```

**Atribuir a usuário**:
```bash
# Via Dashboard UI
Security → Roles → Create Role
  - Name: soc-team
  - Tenant permissions: ness-soc (read/write)
  - Assign users
```

---

## 🏗️ Use Cases para POC

### Cenário 1: Múltiplas Equipes
```
Tenant: ness-soc
  → Dashboards de segurança
  → Alertas e eventos
  → Threat hunting

Tenant: ness-noc  
  → Dashboards de infraestrutura
  → Correlação com Zabbix
  → SLA monitoring

Tenant: ness-grc
  → Dashboards de compliance
  → Audit trails
  → Risk visualization
```

### Cenário 2: Múltiplos Clientes (MSP)
```
Tenant: cliente-a
  → Dados isolados do Cliente A
  → Dashboards customizados
  → Branding específico

Tenant: cliente-b
  → Dados isolados do Cliente B
  → Dashboards diferentes
  → Isolation completo
```

### Cenário 3: Desenvolvimento vs Produção
```
Tenant: production
  → Dados reais
  → Dashboards oficiais
  → Read-only para alguns users

Tenant: staging
  → Testes e experimentação
  → Dashboards em desenvolvimento
  → Full access para devs
```

---

## 🔐 RBAC + Multi-tenancy

### Permissões por Role

| Role | Global | Private | Custom Tenants |
|------|--------|---------|----------------|
| **Admin** | Read/Write | Read/Write | Full Access |
| **SOC Analyst** | Read | Read/Write | ness-soc (R/W) |
| **NOC Operator** | Read | Read/Write | ness-noc (R/W) |
| **Auditor** | Read | No Access | ness-grc (Read) |
| **Viewer** | Read | No Access | No Access |

### Configurar Roles

**Via Dashboard**:
1. Security → Roles
2. Create new role
3. Configurar tenant permissions
4. Assign users

---

## 🎨 Benefícios para n360 (POC)

### Demonstração de Capacidades

✅ **Isolamento**: Mostrar dados segregados por equipe/cliente  
✅ **Personalização**: Dashboards diferentes para SOC/NOC/GRC  
✅ **Segurança**: RBAC granular (quem vê o quê)  
✅ **Escalabilidade**: Preparado para multi-cliente  

### Diferencial Comercial

- ✅ POC mais sofisticada (multi-tenancy = enterprise feature)
- ✅ Demonstra arquitetura escalável
- ✅ Prova conceito de MSP (Managed Service Provider)
- ✅ Integração n360 + Wazuh mais rica

---

## 🧪 Validação

### Testar no Dashboard

1. **Acesse**: https://wazuh.nsecops.com.br
2. **Login**: admin / Nessnet@10
3. **Verifique**: Canto superior direito deve mostrar **"Global ▼"**
4. **Clique** no dropdown → deve listar:
   - Global
   - Private
5. **Troque** para "Private" → dashboards pessoais
6. **Volte** para "Global" → dashboards compartilhados

### Via API

```bash
# Listar tenants
docker exec wazuh-indexer curl -k -X GET \
  "https://localhost:9200/_plugins/_security/api/tenants" \
  -u admin:SecretPassword | jq
```

---

## 📋 Próximos Passos (Opcional)

### Para POC Avançada

- [ ] Criar tenant `ness-soc` (equipe SOC)
- [ ] Criar tenant `ness-noc` (equipe NOC)
- [ ] Criar tenant `ness-grc` (equipe GRC)
- [ ] Configurar roles específicas
- [ ] Criar usuários de teste
- [ ] Demonstrar isolamento

**Estimativa**: 1-2 horas

---

## 🔗 Integração com n360 (Futuro)

### Sprint 3 ou 4 - Embed Wazuh Dashboards

Quando implementarmos Wazuh Indexer no n360:

```javascript
// n360 pode especificar tenant na query
const response = await opensearchClient.search({
  index: 'wazuh-alerts-*',
  headers: {
    'securitytenant': 'ness-soc' // Tenant específico
  },
  body: { /* query */ }
});
```

**Benefício**: n360 pode mostrar dados de diferentes tenants em pages separadas.

---

## ✅ Status

| Item | Status |
|------|--------|
| Multi-tenancy | ✅ Habilitado |
| Tenant Global | ✅ Ativo |
| Tenant Private | ✅ Ativo |
| Dashboard | ✅ Running |
| Selector UI | ✅ Visível (testar no browser) |

**Acesse o Dashboard para validar!** 🚀

---

**Arquivo atualizado**: `opensearch_dashboards.yml`  
**Dashboard reiniciado**: ✅  
**Pronto para usar**: Acesse e teste o seletor de tenants!

