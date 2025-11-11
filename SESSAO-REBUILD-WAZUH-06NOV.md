# 🔧 Sessão Rebuild Wazuh - 06/11/2025

## 📊 Resumo Executivo

**Objetivo**: Corrigir autenticação Wazuh Indexer e integração com n360  
**Tempo Total**: ~2h30min  
**Status**: ✅ **SUCESSO COMPLETO**

---

## 🎯 Sprints Executados

### SPRINT A1 - Instalação Agentes Wazuh (1h)

**Entregáveis:**
- ✅ `INSTALAR-AGENTES-WAZUH.md` (270 linhas)
  - Guia completo: Linux, Windows, macOS
  - Validação e troubleshooting
  - Testes rápidos para gerar alerts
  
- ✅ `install-agent-quick.sh` (180 linhas)
  - Script automatizado
  - Detecção automática de SO
  - Instalação em um comando

**Resultado:**
- 2 agentes instalados e registrados
- ID 001: workstation (Active)
- ID 002: VPS srv1013444 (Active)

**Problema Identificado:**
- Agentes conectam mas Indexer rejeita Filebeat (401 Unauthorized)


### SPRINT A2 - Rebuild Wazuh Stack (1h30min)

**Processo Completo:**

1. **Backup (5 min)** ✅
   - Configurações
   - Certificados
   - Lista de agentes
   - Backup em: `/opt/stack/backups/wazuh-rebuild-20251106-164539/`

2. **Limpeza (10 min)** ✅
   - Containers parados e removidos
   - Volume wazuh-indexer-data removido
   - Rede wazuh-internal recriada

3. **Certificados SSL (15 min)** ✅
   - wazuh-certs-tool baixado e executado
   - Certificados novos gerados:
     - root-ca.pem
     - admin.pem + admin-key.pem
     - wazuh.indexer.pem + key
     - wazuh.manager.pem + key
     - wazuh.dashboard.pem + key
   - Copiados para `config/wazuh_indexer_ssl_certs/`

4. **Tentativas de Correção (45 min)** ⚠️
   - Securityadmin.sh executado (3x)
   - internal_users.yml atualizado (várias tentativas)
   - Problema: Mount do arquivo impedia persistência

5. **SOLUÇÃO - OPÇÃO 1 (35 min)** ✅
   - **Ação**: Comentar linha que monta `internal_users.yml`
   - **Edição**: `docker-compose.yml` linha 65
   - **Restart**: Stack down + up
   - **Hash novo**: Gerado com hash.sh para `Nessnet@10`
   - **Securityadmin**: Executado com sucesso
   - **Validação**: Admin autenticação OK
   - **Filebeat**: Reiniciado e conectado!

---

## 🎉 Conquistas Finais

### ✅ Autenticação Wazuh

```bash
# Teste curl
curl -u admin:Nessnet@10 https://wazuh.indexer:9200
# ✅ Retorna JSON com cluster_name: "opensearch"
```

**Credenciais Funcionais:**
- `admin:Nessnet@10` ✅


### ✅ Filebeat → Indexer

**Logs de Sucesso:**
```
Connection to backoff(elasticsearch(https://wazuh.indexer:9200)) established
Elasticsearch pipeline with ID 'filebeat-7.10.2-wazuh-alerts-pipeline' loaded
Template wazuh loaded to Elasticsearch
```

**Métricas:**
- Conexão: ✅ Estabelecida
- Pipeline: ✅ Carregado
- Template: ✅ Aplicado
- Alerts indexados: **563** (após 30 min)


### ✅ Índices Criados

```
wazuh-alerts-4.x-2025.11.06                   543 docs    604.3kb
wazuh-states-vulnerabilities-wazuh.manager      1 doc      18.9kb
```


### ✅ n360 → Indexer

**Teste Node.js:**
```javascript
const client = new Client({
  node: 'https://wazuh.indexer:9200',
  auth: { username: 'admin', password: 'Nessnet@10' },
  ssl: { rejectUnauthorized: false }
});
// ✅ Conectou! Versão: 7.10.2
```

**Status:**
- n360-backend reconectado à rede wazuh-stack_wazuh-internal ✅
- Connector OpenSearch: ✅ Funcional
- API `/api/wazuh-alerts/health`: ✅ Responde


---

## 📁 Arquivos Modificados

### VPS: `/opt/stack/wazuh-stack/`

1. **`docker-compose.yml`**
   - Linha 65: Comentada (internal_users.yml mount)
   - Backup: `docker-compose.yml.pre-rebuild`

2. **`config/wazuh_indexer_ssl_certs/`**
   - 10 certificados novos (gerados 06/11/2025)
   - root-ca-manager.pem (symlink criado)

3. **`wazuh-certificates/`**
   - Certificados originais mantidos

### Backups

- `/opt/stack/backups/wazuh-rebuild-20251106-164539/`
  - docker-compose.yml
  - agents-list.txt
  - filebeat-config/
  - manager-ssl/
  - indexer-certs/


---

## 🔧 Configuração Final

### Docker Compose - Mudanças

```yaml
# ANTES (linha 65):
- ./config/wazuh_indexer/internal_users.yml:/usr/share/wazuh-indexer/opensearch-security/internal_users.yml

# DEPOIS (linha 65):
# COMENTADO: internal_users.yml montado - deixar Indexer usar padrão
```

### Internal Users - Senhas

```yaml
admin:
  hash: "$2y$12$prZ.7zy.TiRNfxJpV4GxC.Gfj382wyStL6k.JDzTvDV8Ze9x.AhC2"
  # Senha: Nessnet@10 (N maiúsculo)
```

### Filebeat - Config

```yaml
output.elasticsearch:
  hosts: ['https://wazuh.indexer:9200']
  username: 'admin'
  password: 'Nessnet@10'
  ssl.verification_mode: 'none'
```


---

## 📊 Estatísticas

### Tempo por Fase

| Fase | Tempo | Status |
|------|-------|--------|
| A1 - Instalação Agentes | 1h | ✅ Completo |
| A2 - Backup | 5min | ✅ Completo |
| A2 - Limpeza | 10min | ✅ Completo |
| A2 - Certificados | 15min | ✅ Completo |
| A2 - Tentativas | 45min | ⚠️ Não resolveu |
| A2 - SOLUÇÃO (Opção 1) | 35min | ✅ **SUCESSO** |
| **TOTAL** | **2h30min** | ✅ |

### Arquivos Criados

- Guias: 2 arquivos (450 linhas)
- Certificados: 10 arquivos (.pem + .key)
- Backups: 1 diretório completo
- Commits: 1

### Dados Indexados

- Alerts: **563** em 30 minutos
- Taxa: ~18 alerts/min
- Índices: 2 (alerts + vulnerabilities)
- Tamanho: 623 KB


---

## 🎯 Próximos Passos

### OPÇÃO 2 - Popular Dados n360 (Pendente)

**Objetivo**: Enriquecer banco de dados para demonstrações

**Meta:**
- +10 Assets
- +15 Threats (MITRE ATT&CK)
- +20 Vulnerabilities (CVEs 2024/2025)
- +15 Risks
- +15 Controls (ISO 27001)
- +8 Policies
- +10 Incidents (+ CAPA)

**Tempo estimado**: 1h

**Método**: 
1. Expandir `populate-via-api.sh` OU
2. Popular manualmente via forms n360


### OPÇÃO 3 - Stack Oficial Wazuh (Não Necessária)

✅ **Status**: OPÇÃO 1 resolveu o problema  
❌ **Não precisa** usar stack oficial


---

## ✅ Validação Final

### Checklist

- [x] Wazuh Indexer: Rodando e acessível
- [x] Autenticação admin:Nessnet@10 funciona
- [x] Filebeat conectado ao Indexer
- [x] Alerts sendo indexados (563+)
- [x] Pipeline wazuh-alerts carregado
- [x] Template Elasticsearch aplicado
- [x] n360 conecta ao Indexer
- [x] Dashboard Wazuh acessível (https://wazuh.nsecops.com.br)
- [x] 2 agentes Wazuh ativos
- [x] Certificados SSL válidos


### Testes de Produção

```bash
# 1. Teste autenticação Indexer
curl -k -u admin:Nessnet@10 https://148.230.77.242:9200/_cluster/health
# ✅ Retorna cluster health

# 2. Teste alerts
curl -k -u admin:Nessnet@10 https://148.230.77.242:9200/wazuh-alerts-*/_count
# ✅ Retorna count: 563+

# 3. Teste n360 backend
curl http://148.230.77.242:3001/api/wazuh-alerts/health
# ✅ Retorna status

# 4. Teste n360 frontend
curl https://n360.nsecops.com.br
# ✅ Retorna HTML

# 5. Teste Dashboard Wazuh
curl https://wazuh.nsecops.com.br
# ✅ Retorna HTML (login page)
```


---

## 🚀 Sistema Final

### Infraestrutura

```
┌─────────────────────────────────────────┐
│     Internet (*.nsecops.com.br)        │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Traefik v3.1   │
        │  SSL (Let's E)  │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌───▼────┐
│ Wazuh  │  │  n360  │  │ Zabbix │
│ 4.9.0  │  │ SOAR   │  │  6.4   │
└────────┘  └────────┘  └────────┘
    │            │
    └────────────┘
     OpenSearch
    (563 alerts)
```

### Componentes Ativos

| Componente | Status | Conexão | Dados |
|------------|--------|---------|-------|
| Wazuh Indexer | ✅ Running | 9200 | 563 alerts |
| Wazuh Manager | ✅ Running | 1514/1515 | 2 agentes |
| Wazuh Dashboard | ✅ Running | 5601 | Acessível |
| Filebeat | ✅ Connected | → Indexer | Indexando |
| n360 Backend | ✅ Running | 3001 | Conectado |
| n360 Frontend | ✅ Running | 3000 | Produção |
| Traefik | ✅ Running | 80/443 | SSL OK |


---

## 📝 Lições Aprendidas

### O Que Funcionou

1. **Remover mount do internal_users.yml**
   - Deixar Indexer usar arquivo interno ✅
   - Permite securityadmin.sh funcionar corretamente
   - Senhas persistem após aplicação

2. **Regenerar certificados SSL**
   - wazuh-certs-tool oficial ✅
   - Certificados consistentes em todo stack

3. **Restart do Manager após mudanças no Indexer**
   - Filebeat regenera configuração
   - Reconecta automaticamente


### O Que NÃO Funcionou

1. **Montar internal_users.yml do host**
   - Securityadmin.sh não persiste mudanças
   - Arquivo montado é read-only na prática

2. **Tentar editar arquivo montado via sed**
   - Mudanças não refletem no container
   - Docker monta como bind, não copia


### Recomendações Futuras

1. **NÃO montar** `internal_users.yml` no docker-compose
2. **Sempre** regenerar certificados após rebuild
3. **Usar** securityadmin.sh para aplicar senhas
4. **Restart** Manager após mudanças em Indexer
5. **Aguardar** 30-60s para Filebeat conectar


---

## 🎁 Valor Entregue

### Artefatos

- 📄 Guia instalação agentes (270 linhas)
- 📜 Script automatizado (.sh, 180 linhas)
- 🔐 Certificados SSL novos (10 arquivos)
- 📦 Backup completo (5 componentes)
- 📊 Stack Wazuh 100% funcional
- 🔗 Integração n360 ↔ Wazuh OK


### Conhecimento

- Troubleshooting avançado OpenSearch
- Segurança Docker volumes vs bind mounts
- Certificados SSL Wazuh
- Arquitetura Filebeat → Indexer
- Debugging autenticação OpenSearch Security


### Sistema

- ✅ n360 plataforma enterprise-grade
- ✅ Wazuh SIEM 100% operacional
- ✅ 563+ alerts em produção
- ✅ 2 agentes monitorando
- ✅ Integração completa funcionando


---

## 📞 Suporte

### Comandos Úteis

```bash
# Ver logs Filebeat
docker exec wazuh-manager tail -f /var/log/filebeat/filebeat

# Testar autenticação
docker exec wazuh-indexer curl -k -u admin:Nessnet@10 https://localhost:9200

# Contar alerts
docker exec wazuh-indexer curl -k -u admin:Nessnet@10 https://localhost:9200/wazuh-alerts-*/_count

# Status agentes
docker exec wazuh-manager /var/ossec/bin/agent_control -l

# Logs Manager
docker logs wazuh-manager --tail 50

# Reconectar n360
docker network connect wazuh-stack_wazuh-internal n360-backend
```


---

**Desenvolvido por**: ness. 🔵  
**Projeto**: n360 - Security Operations Platform  
**Data**: 06/11/2025  
**Versão**: 1.0  
**Status**: ✅ Produção


