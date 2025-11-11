# 📖 Guia do Usuário - n360 Platform

**Versão**: 1.0  
**Desenvolvido por**: ness.  
**Idioma**: Português (Brasil)

---

## 🎯 Introdução

O **n360 Platform** é uma plataforma integrada de segurança cibernética que combina:

- **SOC** (Security Operations Center) - Central de Operações de Segurança
- **NOC** (Network Operations Center) - Central de Operações de Rede
- **GRC** (Governance, Risk & Compliance) - Governança, Risco e Conformidade
- **ITIL** - Gestão de Tickets e Incidentes

Todas as funcionalidades em uma única interface unificada.

---

## 🌐 Acessando a Plataforma

### URL de Acesso
```
https://n360.nsecops.com.br
```

### Credenciais Padrão
```
Email: seu-email@empresa.com
Senha: (fornecida pelo administrador)
```

### Primeiro Acesso
1. Acesse a URL acima
2. Faça login com suas credenciais
3. Você será direcionado ao **Dashboard CISO**

---

## 🏠 Dashboard CISO (Página Inicial)

O Dashboard CISO é sua **visão executiva** da postura de segurança.

### KPIs Principais

1. **Risk Score Médio** (vermelho)
   - Média dos riscos organizacionais (1-25)
   - Quanto menor, melhor

2. **Compliance Score** (verde)
   - Percentual de conformidade (0-100%)
   - Quanto maior, melhor

3. **Alertas Críticos** (laranja)
   - Alertas de segurança críticos nas últimas 24h
   - Requer atenção imediata

4. **Tickets Abertos** (azul)
   - Total de tickets em aberto
   - Status: open, in_progress

### Widgets

- **Top 5 Riscos Críticos**: Riscos com maior score
- **Alertas Críticos (24h)**: Últimos alertas de segurança
- **Top 5 Alertas**: Por severity
- **Top 5 Problemas**: Problemas ativos de infraestrutura

### Navegação
- Clique em qualquer widget para ver detalhes
- Use o menu lateral para navegar entre módulos

---

## 🚨 SOC - Security Operations Center

### Acessar SOC
Menu Lateral → **SOC - Alertas**  
URL: `/soc/alerts`

### Funcionalidades

#### 1. Listagem de Alertas
- **Visualização**: Cards com alertas de segurança
- **Filtros**:
  - Severidade: Critical, High, Medium, Low, Info
  - Status: Open, Acknowledged, Resolved
  - Fonte: Wazuh (SIEM)
  - Busca: Por título

#### 2. Detalhes do Alerta
- **Abrir**: Clique em qualquer alerta
- **Informações**:
  - Título e descrição
  - Severidade (badge colorido)
  - Fonte (Wazuh)
  - Rule ID
  - Timestamps (criado, confirmado, resolvido)
  - Dados brutos (JSON)

#### 3. Ações Disponíveis

**Confirmar Alerta** (Acknowledge)
- Indica que o alerta foi visto
- Status: Open → Acknowledged
- Registra quem confirmou e quando

**Resolver Alerta** (Resolve)
- Marca o alerta como resolvido
- Status: Acknowledged → Resolved
- Registra quem resolveu e quando

**Atribuir Alerta** (Assign)
- Atribui o alerta a um analista
- Facilita distribuição de trabalho

### Workflow Recomendado
```
1. Novo alerta chega (status: Open)
2. Analista confirma (Acknowledge)
3. Analista investiga
4. Analista resolve (Resolve)
```

---

## 🖥️ NOC - Network Operations Center

### Acessar NOC
Menu Lateral → **NOC - Problemas**  
URL: `/noc/problems`

### Funcionalidades

#### 1. Listagem de Problemas
- **Visualização**: Cards com problemas de infraestrutura
- **Filtros**:
  - Severidade: Disaster, High, Average, Warning, Info
  - Status: Active, Resolved
  - Fonte: Zabbix (Monitoring)
  - Busca: Por nome

#### 2. Detalhes do Problema
- **Abrir**: Clique em qualquer problema
- **Informações**:
  - Nome e descrição
  - Severidade (badge colorido)
  - Fonte (Zabbix)
  - Source ID
  - Timeline
  - Dados brutos (JSON)

#### 3. Ações Disponíveis

**Confirmar Problema** (Acknowledge)
- Indica que o problema foi visto
- Registra quem confirmou e quando

### Integração com Zabbix
- Dados vêm diretamente do Zabbix
- Sincronização: A cada 60 segundos
- Fonte: Zabbix API

---

## 🎯 GRC - Governance, Risk & Compliance

O módulo GRC é o **pilar fundamental** da plataforma n360.

### Submenu GRC
Menu Lateral → **GRC** → Dashboard GRC  
Submenu disponível:
- Dashboard GRC
- Gestão de Riscos
- Matriz de Riscos
- Controles de Segurança
- Políticas

---

### 📊 GRC Dashboard

**URL**: `/grc`

**KPIs**:
1. **Compliance Score Médio** - Média de conformidade (%)
2. **Risk Score Médio** - Média de riscos (1-25)
3. **Políticas Ativas** - Total de políticas vigentes
4. **Controles Pendentes** - Controles não implementados

**Widgets**:
- Compliance Score por Framework (ISO 27001, NIST, CIS, etc)
- Top 5 Riscos Críticos
- Quick Actions (Matriz, Risks, Controls)

---

### 🎲 Gestão de Riscos

**URL**: `/grc/risks`

#### Criar Novo Risco
1. Clique em **Novo Risco**
2. Preencha:
   - **Título**: Nome do risco
   - **Descrição**: Detalhes
   - **Categoria**: Operational, Financial, Strategic, Compliance, Cyber, Reputational
   - **Likelihood** (1-5): Probabilidade de ocorrer
     - 1 = Raro (< 10%)
     - 2 = Improvável (10-25%)
     - 3 = Possível (25-50%)
     - 4 = Provável (50-75%)
     - 5 = Quase Certo (> 75%)
   - **Impact** (1-5): Impacto caso ocorra
     - 1 = Insignificante
     - 2 = Menor
     - 3 = Moderado
     - 4 = Maior
     - 5 = Catastrófico
   - **Treatment**: Mitigate, Accept, Transfer, Avoid
   - **Plano de Mitigação**: Como vai mitigar

3. Salvar

#### Risk Score
```
Risk Score = Likelihood × Impact (1-25)

Classificação:
• 1-5:   Baixo (verde)
• 6-14:  Médio (amarelo)
• 15-19: Alto (laranja)
• 20-25: Crítico (vermelho)
```

#### Residual Risk
Após mitigar, reavaliar:
- **Residual Likelihood**: Nova probabilidade
- **Residual Impact**: Novo impacto
- **Residual Score**: Novo score

#### Filtros
- **Status**: Open, Mitigating, Mitigated, Accepted, Closed
- **Categoria**: Operational, Financial, etc
- **Severidade**: Critical, High, Medium, Low
- **Busca**: Por título

---

### 🗺️ Matriz de Riscos (Heat Map)

**URL**: `/grc/risks/matrix`

#### Visualização
- **Matriz 5×5**: Likelihood (eixo X) × Impact (eixo Y)
- **Color Coding**:
  - Verde: Baixo (1-5)
  - Amarelo: Médio (6-14)
  - Laranja: Alto (15-19)
  - Vermelho: Crítico (20-25)

#### Interação
- **Click em célula**: Filtra riscos daquela combinação
- **Hover**: Mostra score
- **Número**: Quantidade de riscos na célula

#### Use Case
- Visualizar distribuição de riscos
- Identificar concentrações
- Apresentações executivas

---

### 🛡️ Controles de Segurança

**URL**: `/grc/controls`

#### Criar Novo Controle
1. Clique em **Novo Controle**
2. Preencha:
   - **Control ID**: ISO-27001-A.5.1 (exemplo)
   - **Título**: Nome do controle
   - **Descrição**: Detalhes
   - **Framework**: ISO 27001, NIST CSF, CIS, PCI-DSS, LGPD, SOC2
   - **Tipo**: Preventive, Detective, Corrective, Compensating
   - **Status**: Not Implemented → Planned → Partial → Implemented → Verified

3. Salvar

#### Registrar Teste
1. Abrir controle
2. Clicar **Registrar Teste**
3. Preencher:
   - **Resultado**: Passed, Failed, Partial
   - **Effectiveness Score** (0-1): Quão efetivo é
   - **Evidência**: URL ou descrição

#### Compliance Score
```
Compliance % = (Implemented + Verified) / Total × 100
```

Calculado automaticamente por framework.

#### Filtros
- **Framework**: ISO 27001, NIST, etc
- **Status**: Not Implemented, Planned, Partial, Implemented, Verified
- **Busca**: Por título ou Control ID

---

### 📄 Políticas de Segurança

**URL**: `/grc/policies`

#### Criar Nova Política
1. Clique em **Nova Política**
2. Preencha:
   - **Título**: Nome da política
   - **Descrição**: Resumo
   - **Conteúdo**: Texto completo (Markdown suportado)
   - **Categoria**: Security, Privacy, Compliance, Operational, HR
   - **Framework**: ISO 27001, NIST, etc (opcional)
   - **Versão**: 1.0 (auto-incrementa)

3. Salvar (status: **Draft**)

#### Workflow de Aprovação

```
Draft (Rascunho)
  ↓ Submeter para Revisão
Review (Em Revisão)
  ↓ Aprovar
Approved (Aprovada)
  ↓ Ativar
Active (Ativa)
  ↓ Arquivar (quando obsoleta)
Archived (Arquivada)
```

#### Ações
- **Submeter**: Draft → Review
- **Aprovar**: Review → Approved (requer permissão)
- **Ativar**: Approved → Active (define effective_date)
- **Arquivar**: Qualquer → Archived

#### Versionamento
- Cada revisão = nova versão (1.0, 2.0, 3.0...)
- **parent_id**: Referência à versão anterior
- Histórico completo

#### Filtros
- **Status**: Draft, Review, Approved, Active, Archived
- **Categoria**: Security, Privacy, etc
- **Busca**: Por título

---

## 🎫 Tickets - ITIL Service Management

### Acessar Tickets
Menu Lateral → **Tickets**  
URL: `/tickets`

### Funcionalidades

#### 1. Listagem de Tickets
- **Visualização**: Lista de tickets ITIL
- **Informações**:
  - Título e descrição
  - Status (open, in_progress, resolved, closed)
  - Prioridade (low, medium, high, critical)
  - Categoria (incident, request, problem, change)
  - Atribuído a
  - Data de criação

#### 2. Criar Novo Ticket
1. Clique em **Novo Ticket**
2. Preencha:
   - Título
   - Descrição
   - Prioridade
   - Categoria
3. Salvar

#### 3. CRUD Completo
- **Create**: Novo ticket
- **Read**: Visualizar tickets
- **Update**: Editar ticket
- **Delete**: Deletar ticket

### Workflow ITIL (Básico)
```
Open → In Progress → Resolved → Closed
```

---

## 📊 Status - Application Monitoring

### Acessar Status
Menu Lateral → **Status**  
URL: `/status`

### Funcionalidades

#### 1. Status dos Aplicativos
- **Wazuh**: Online/Offline
- **Zabbix**: Online/Offline
- **Shuffle**: Online/Offline

#### 2. Informações
- URL de acesso
- Status de conexão
- Última verificação

#### 3. Health Check
Atualiza a cada 60 segundos.

---

## 🔐 Segurança e Permissões

### Multi-tenancy
- Cada usuário vê **apenas** dados de sua organização
- Isolamento via Row Level Security (RLS)
- `org_id` identificador único

### Autenticação
- JWT Bearer Token
- Session expira após inatividade
- Logout: Canto superior direito

### Permissões
- **Viewer**: Visualizar dados
- **Editor**: Criar/editar
- **Admin**: Aprovar políticas, gerenciar usuários

---

## 📱 Navegação

### Menu Lateral (Sidebar)
Sempre visível à esquerda:
1. 🏠 Dashboard
2. 🚨 SOC - Alertas
3. 🖥️ NOC - Problemas
4. 🛡️ GRC
5. 🎫 Tickets
6. 📊 Status

### Breadcrumbs
- Dashboard → SOC → Alertas → [Alerta #123]
- Dashboard → GRC → Riscos → [Risco #456]

### Atalhos de Teclado (futuro)
- `Ctrl+K`: Busca global
- `Ctrl+D`: Dashboard
- `Esc`: Fechar modal

---

## 🆘 Suporte

### Documentação Técnica
- **API Docs**: Ver `API-DOCS.md`
- **Admin Guide**: Ver `ADMIN-GUIDE.md`

### Contato
- **Email**: support@nsecops.com.br
- **Empresa**: ness.
- **Site**: https://nsecops.com.br

---

## 📝 Glossário

- **SIEM**: Security Information and Event Management
- **SOAR**: Security Orchestration, Automation and Response
- **GRC**: Governance, Risk & Compliance
- **ITIL**: IT Infrastructure Library
- **RLS**: Row Level Security
- **JWT**: JSON Web Token
- **SOC**: Security Operations Center
- **NOC**: Network Operations Center

---

**Desenvolvido por**: ness.  
**Versão**: 1.0  
**Data**: 06/11/2025  
**Licença**: Proprietário



