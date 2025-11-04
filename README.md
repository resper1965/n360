# n360 Platform

> **Security Information Orchestrator** - Plataforma integrada de GRC, SOC e NOC

![Status](https://img.shields.io/badge/status-production-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## 📋 Sobre

**n360** é uma plataforma centralizada de orquestração de Segurança da Informação que integra:

- **GRC** (Governance, Risk & Compliance)
- **SOC** (Security Operations Center)
- **NOC** (Network Operations Center)

Fornecendo visibilidade 360° e gestão integrada para CISOs, Auditores e C-Level.

---

## 🌐 Acesso

**URL Produção**: https://n360.nsecops.com.br

### Status Atual (MVP v1.0)
- ✅ Dashboard de status em tempo real
- ✅ Health checks (Wazuh, Shuffle, Zabbix)
- ✅ Links de acesso rápido
- ✅ Auto-refresh (60s)
- ⏳ Módulos completos (em desenvolvimento)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│         n360 Platform               │
├─────────────────────────────────────┤
│  Frontend (Nginx + HTML/JS)         │
│  Backend (Node.js + Express)        │
│  Database (Supabase PostgreSQL)     │
├─────────────────────────────────────┤
│  Integrações:                       │
│  • Wazuh (SIEM)                     │
│  • Shuffle (SOAR)                   │
│  • Zabbix (Monitoring)              │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Pré-requisitos
- Docker >= 20.10
- Docker Compose >= 2.0
- Rede `traefik-proxy` configurada

### Deploy

```bash
# 1. Clone o repositório
git clone https://github.com/ness-company/n360-platform.git
cd n360-platform

# 2. Configure variáveis de ambiente
cp .env.example .env
nano .env

# 3. Deploy
docker-compose up -d

# 4. Verificar
docker logs n360-backend -f
```

### Acessar
```
https://n360.nsecops.com.br
```

---

## 📊 Funcionalidades

### MVP (v1.0) - Atual
- [x] Dashboard de status
- [x] Health checks automáticos
- [x] Monitoramento Wazuh, Shuffle, Zabbix
- [x] Links de acesso rápido

### Roadmap (v2.0)
- [ ] Dashboard CISO (risk score, compliance)
- [ ] SOC (alertas consolidados)
- [ ] NOC (problemas consolidados)
- [ ] Sistema de Tickets
- [ ] GRC (risks, compliance, evidence)
- [ ] Collectors (Wazuh, Zabbix, RMMs)
- [ ] Vulnerability Management
- [ ] Hybrid Storage (Hot/Warm/Cold)

---

## 📁 Estrutura

```
n360-platform/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── package.json
│   └── index.js           # API + Health Checks
└── frontend/
    ├── dist/
    │   └── index.html     # Dashboard
    └── nginx.conf
```

---

## 🔐 Integrações

### Wazuh (SIEM)
- URL: https://wazuh.nsecops.com.br
- API: Port 55000
- Versão: 4.9.0 LTS

### Shuffle (SOAR)
- URL: https://shuffle.nsecops.com.br
- API: Port 5001
- Versão: Latest

### Zabbix (Monitoring)
- URL: https://zabbix.nsecops.com.br
- API: JSON-RPC
- Versão: 6.4 LTS

---

## 💰 Data Lifecycle Management

Estratégia híbrida para redução de custos:

- **HOT** (Supabase PostgreSQL): 90 dias
- **WARM** (Supabase Storage): 90d - 1 ano
- **COLD** (Cloudflare R2): 1+ anos

**Economia projetada**: $1,090/ano (58% vs só PostgreSQL)

Ver detalhes: `docs/DATA-LIFECYCLE-STRATEGY.md`

---

## 📚 Documentação

- [Especificação Completa](specs/002-n360-platform/spec.md) (1,038 linhas)
- [Apresentação Executiva](specs/002-n360-platform/APRESENTACAO.md) (1,694 linhas)
- [Plano de Implementação](specs/002-n360-platform/PLAN.md) (6-8 semanas)
- [Diagramas](specs/002-n360-platform/DIAGRAMAS.md) (11 diagramas + 8 fluxos)

---

## 🛠️ Tecnologias

- **Frontend**: HTML5, JavaScript, CSS3
- **Backend**: Node.js 18, Express
- **Database**: Supabase (PostgreSQL 15) + Cloudflare R2
- **Proxy**: Traefik v3.1
- **SSL**: Let's Encrypt
- **Container**: Docker + Docker Compose

---

## 👥 Empresa

**ness.** - Tecnologia e Segurança da Informação

- Website: https://ness.com.br
- Produto: n.secops (https://nsecops.com.br)

---

## 📄 Licença

Proprietary - © 2025 ness. Todos os direitos reservados.

---

## 🤝 Contribuindo

Este é um projeto proprietário da **ness.**

Para desenvolvimento interno, siga o [PLAN.md](specs/002-n360-platform/PLAN.md).

---

**Versão**: 1.0.0 (MVP)  
**Status**: ✅ Em Produção  
**Health**: 100% (3/3 apps online)

