# 🏗️ Arquitetura Isolada - n360 Platform

**Princípio**: Aplicações base (Wazuh, Zabbix, Shuffle) devem permanecer **estáveis e isoladas**.  
**Desenvolvimento**: Apenas no **n360-platform**, sem mexer nas stacks externas.

---

## 📋 Regras de Ouro

### ✅ PODE (n360-platform)

✅ **Modificar** qualquer código do n360  
✅ **Adicionar** features e funcionalidades  
✅ **Atualizar** dependências npm do n360  
✅ **Ajustar** docker-compose do n360  
✅ **Integrar** via API com as aplicações  
✅ **Coletar** dados via collectors  
✅ **Armazenar** no Supabase  
✅ **Criar** novos endpoints e páginas  

### ❌ NÃO PODE (Aplicações Base)

❌ **Modificar** docker-compose do wazuh-stack  
❌ **Modificar** docker-compose do zabbix-stack  
❌ **Modificar** docker-compose do shuffle-stack  
❌ **Alterar** configurações internas do Wazuh  
❌ **Alterar** configurações internas do Zabbix  
❌ **Alterar** configurações internas do Shuffle  
❌ **Reiniciar** containers das aplicações (exceto troubleshooting)  

---

## 🏗️ Estrutura Física

```
/opt/stack/  (VPS Produção)
│
├── wazuh-stack/              ← 🔒 NÃO MEXER
│   ├── docker-compose.yml    (Mantido pela equipe Wazuh)
│   ├── config/
│   └── data/
│
├── zabbix-stack/             ← 🔒 NÃO MEXER
│   ├── docker-compose.yml    (Mantido pela equipe Zabbix)
│   ├── config/
│   └── data/
│
├── shuffle-stack/            ← 🔒 NÃO MEXER
│   ├── docker-compose.yml    (Mantido pela equipe Shuffle)
│   ├── config/
│   └── data/
│
└── n360-platform/            ← ✅ ÁREA DE DESENVOLVIMENTO
    ├── docker-compose.yml    (Nosso controle total)
    ├── backend/              (Desenvolvimento ativo)
    ├── frontend/             (Desenvolvimento ativo)
    ├── database/             (Migrations Supabase)
    └── docs/
```

---

## 🔌 Integração via Redes Docker

### Topologia de Rede

```
┌───────────────────────────────────────────────────────┐
│                 TRAEFIK-PROXY (SSL)                   │
│                 (Network Externa)                      │
└───────────────────────────────────────────────────────┘
         │                  │                  │
    ┌────▼────┐        ┌───▼────┐        ┌───▼────┐
    │ Wazuh   │        │Shuffle │        │Zabbix  │
    │Dashboard│        │Frontend│        │  Web   │
    └─────────┘        └────────┘        └────────┘
         │                  │                  │
         │                  │                  │
    ┌────▼──────────────────▼──────────────────▼────┐
    │           n360-platform (Backend)             │
    │   Conecta via Networks Externas:              │
    │   • wazuh-stack_wazuh-internal                │
    │   • zabbix-stack_zabbix-internal              │
    │   • shuffle-internal                          │
    └───────────────────────────────────────────────┘
```

### Conexões Estáveis

| Aplicação | Hostname | Porta | Network Externa |
|-----------|----------|-------|-----------------|
| Wazuh Manager | `wazuh-manager` | 55000 | wazuh-stack_wazuh-internal |
| Wazuh Indexer | `wazuh-indexer` | 9200 | wazuh-stack_wazuh-internal |
| Zabbix Web | `zabbix-web` | 8080 | zabbix-stack_zabbix-internal |
| Zabbix Server | `zabbix-server` | 10051 | zabbix-stack_zabbix-internal |
| Shuffle Backend | `shuffle-backend` | 5001 | shuffle-internal |
| Shuffle Frontend | `shuffle-frontend` | 3000 | shuffle-internal |

**✅ Garantido**: Nenhuma mudança nas aplicações afeta o n360.

---

## 🔄 Fluxo de Dados (Unidirecional)

### Coleta de Dados

```
┌─────────┐           ┌─────────┐           ┌──────────┐
│  Wazuh  │  ────────>│  n360   │  ────────>│ Supabase │
│  (API)  │  GET      │Collector│  INSERT   │ (alerts) │
└─────────┘           └─────────┘           └──────────┘
     ↑                                             ↓
     │                                             │
     └─────────────────────────────────────────────┘
              (n360 NÃO modifica Wazuh)
```

**Princípio**: n360 apenas **lê** dados das aplicações, **nunca modifica**.

### Exceções (Via API)

Apenas através de APIs oficiais, o n360 pode:
- ✅ Acknowledge alertas (Wazuh API)
- ✅ Maintenance mode (Zabbix API)
- ✅ Trigger workflows (Shuffle API)

**Jamais** modificando configurações ou dados internos.

---

## 📦 Deployment Strategy

### 1. Aplicações Base (Uma Vez)

```bash
# Deploy inicial (FEITO)
cd /opt/stack/wazuh-stack && docker-compose up -d
cd /opt/stack/zabbix-stack && docker-compose up -d
cd /opt/stack/shuffle-stack && docker-compose up -d

# Verificar saúde
docker ps --filter 'name=wazuh|zabbix|shuffle'
```

**Status**: ✅ Deployado e estável  
**Próxima ação**: Apenas troubleshooting se necessário

### 2. n360 Platform (Iterativo)

```bash
# Deploy contínuo (DEV → PROD)
cd /home/resper/stack/n360-platform

# Build local
cd frontend && npm run build

# Deploy VPS
scp -r dist/* root@148.230.77.242:/opt/stack/n360-platform/frontend/dist/
ssh root@148.230.77.242 "cd /opt/stack/n360-platform && docker-compose up -d --build"

# Ver logs
ssh root@148.230.77.242 "docker logs -f n360-backend"
```

**Status**: 🔄 Deploy contínuo  
**Frequência**: Múltiplas vezes por dia

---

## 🔐 Credenciais & Configuração

### Aplicações Base (Estáticas)

**Wazuh**:
- User: `admin` (dashboard) / `wazuh-wui` (API)
- Pass: `Nessnet@10`
- URL: https://wazuh.nsecops.com.br
- API: https://wazuh-manager:55000

**Zabbix**:
- User: `Admin`
- Pass: `Nessnet@10`
- URL: https://zabbix.nsecops.com.br
- API: http://zabbix-web:8080/api_jsonrpc.php

**Shuffle**:
- User: Criar no primeiro acesso
- URL: https://shuffle.nsecops.com.br
- API: http://shuffle-backend:5001

### n360 (Dinâmicas - .env)

```env
# Supabase
SUPABASE_URL=https://hyplrlakowbwntkidtcp.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Aplicações (URLs internas)
WAZUH_API_URL=https://wazuh-manager:55000
WAZUH_USERNAME=wazuh-wui
WAZUH_PASSWORD=Nessnet@10

ZABBIX_API_URL=http://zabbix-web:8080/api_jsonrpc.php
ZABBIX_USERNAME=Admin
ZABBIX_PASSWORD=Nessnet@10

SHUFFLE_API_URL=http://shuffle-backend:5001
```

**Regra**: Nunca modificar credenciais das aplicações base.

---

## 🚀 Roadmap de Desenvolvimento

### Fase 1: Estabilização (COMPLETO ✅)
- ✅ Wazuh, Zabbix, Shuffle deployados
- ✅ n360 conectado via networks
- ✅ Collectors estruturados
- ✅ Supabase integrado
- ✅ Sprint 1 refatoração concluída

### Fase 2: Features Core (EM ANDAMENTO 🔄)
- 🔄 Sprint 2: Error Handling + Tests
- ⏳ Sprint 3: SOC/NOC/Tickets completos
- ⏳ Sprint 4: GRC & Compliance
- ⏳ Sprint 5: Polish & Production

### Fase 3: Otimização (FUTURO 📅)
- 📅 Performance tuning
- 📅 Caching strategies
- 📅 Advanced analytics
- 📅 Mobile app

**Nota**: Todas as fases **apenas no n360-platform**.

---

## 🛠️ Troubleshooting

### Se Wazuh/Zabbix/Shuffle Caírem

```bash
# 1. Verificar containers
docker ps --filter 'name=wazuh|zabbix|shuffle'

# 2. Ver logs
docker logs wazuh-manager --tail 100
docker logs zabbix-server --tail 100
docker logs shuffle-backend --tail 100

# 3. Restart (se necessário)
cd /opt/stack/wazuh-stack && docker-compose restart
cd /opt/stack/zabbix-stack && docker-compose restart
cd /opt/stack/shuffle-stack && docker-compose restart
```

**Regra**: Apenas restart, **nunca** modificar configurações.

### Se n360 Cair

```bash
# 1. Ver logs
docker logs n360-backend --tail 100

# 2. Restart
cd /opt/stack/n360-platform && docker-compose restart

# 3. Rebuild (se necessário)
cd /opt/stack/n360-platform && docker-compose up -d --build
```

**Regra**: Pode modificar à vontade, é nossa aplicação.

---

## 📊 Monitoramento

### Health Checks Automáticos

O n360 verifica saúde das aplicações a cada 60 segundos:

```javascript
// backend/index.js
async function checkWazuh() {
  // Ping wazuh-manager:55000
}

async function checkZabbix() {
  // Ping zabbix-web:8080
}

async function checkShuffle() {
  // Ping shuffle-backend:5001/health
}
```

**Resultado**: Dashboard de status em tempo real.

### Alertas de Indisponibilidade

Se uma aplicação cai:
1. n360 detecta (health check)
2. Marca como offline no dashboard
3. Continua tentando reconectar (retry logic)
4. **NÃO tenta "consertar"** a aplicação

---

## 🎯 Benefícios da Arquitetura Isolada

### ✅ Vantagens

1. **Estabilidade**
   - Wazuh/Zabbix/Shuffle nunca são afetados pelo n360
   - Updates do n360 não quebram integrações
   - Zero downtime nas aplicações base

2. **Segurança**
   - Aplicações base protegidas de mudanças acidentais
   - Credenciais isoladas
   - Networks separadas

3. **Manutenibilidade**
   - Deploy do n360 independente
   - Rollback fácil (apenas n360)
   - Debug simplificado

4. **Escalabilidade**
   - n360 pode escalar horizontalmente
   - Aplicações base dimensionadas separadamente
   - Load balancing independente

### ⚠️ Responsabilidades

**Time n360**:
- Desenvolver e manter n360-platform
- Garantir integrações via API
- Monitorar saúde das conexões
- Documentar mudanças

**Time Infra** (se existir):
- Manter Wazuh/Zabbix/Shuffle atualizados
- Gerenciar backups
- Otimizar performance
- Troubleshooting de issues

---

## 📝 Checklist de Deploy

### Antes de Mexer no n360

- [ ] Verificar que aplicações base estão UP
- [ ] Testar conectividade de rede
- [ ] Backup do .env atual
- [ ] Commit do código no Git

### Após Deploy do n360

- [ ] Verificar logs (sem erros críticos)
- [ ] Testar health check `/health`
- [ ] Verificar dashboard `/api/dashboard`
- [ ] Confirmar collectors funcionando
- [ ] Validar aplicações base ainda UP

### Se Algo Der Errado

- [ ] Rollback do n360 (git checkout anterior)
- [ ] Restart containers do n360
- [ ] **NUNCA** mexer em wazuh/zabbix/shuffle
- [ ] Pedir ajuda se necessário

---

## 🎓 Comandos Úteis

### Desenvolvimento Local

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Testar produção local
docker-compose up -d
```

### Deploy Produção

```bash
# Via rsync (recomendado)
rsync -avz --exclude node_modules --exclude .git \
  /home/resper/stack/n360-platform/ \
  root@148.230.77.242:/opt/stack/n360-platform/

# Via Git (alternativa)
ssh root@148.230.77.242
cd /opt/stack/n360-platform
git pull origin main
docker-compose up -d --build
```

### Monitoramento

```bash
# Status containers
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'

# Logs em tempo real
docker logs -f n360-backend

# Ver networks
docker network ls
docker network inspect wazuh-stack_wazuh-internal
```

---

## 🔮 Futuro

### Possíveis Evoluções (Sem Mexer nas Aplicações)

1. **n360 v2.0**
   - Microservices architecture
   - Kubernetes deployment
   - Multi-tenancy completo

2. **Integrações Adicionais**
   - SIEM: Splunk, QRadar
   - SOAR: Cortex XSOAR
   - Ticketing: Jira, ServiceNow

3. **Features Avançadas**
   - Machine Learning (detecção anomalias)
   - Threat Intelligence (MISP)
   - Automated Response (playbooks)

**Nota**: Todas via APIs, **sem modificar** as aplicações base.

---

## ✅ Status Atual

| Componente | Status | Ação |
|------------|--------|------|
| Wazuh Stack | 🔒 ESTÁVEL | Nenhuma |
| Zabbix Stack | 🔒 ESTÁVEL | Nenhuma |
| Shuffle Stack | 🔒 ESTÁVEL | Nenhuma |
| n360 Platform | 🔄 ATIVO | Desenvolvimento contínuo |

**Última atualização**: 05/11/2025 - 23h30

---

**Princípio Final**: Se funciona, não mexa. Inove apenas no n360. 🚀

