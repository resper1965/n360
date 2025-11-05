# 📚 n360 Platform - API Documentation

**Versão**: 1.0  
**Base URL**: `https://api.n360.nsecops.com.br`  
**Autenticação**: JWT Bearer Token

---

## 🔐 Autenticação

Todas as rotas (exceto `/health`) requerem autenticação JWT.

### Header de Autenticação
```http
Authorization: Bearer <JWT_TOKEN>
```

### Obter Token JWT
Use o Supabase Auth para obter o token JWT:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

const token = data.session.access_token
```

---

## 🏥 Health Check

### GET `/health`

Verifica o status da API e serviços integrados.

**Autenticação**: Não requerida

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-06T02:00:00.000Z",
  "uptime": 3600,
  "services": {
    "supabase": "online",
    "wazuh": "online",
    "zabbix": "online"
  }
}
```

---

## 🚨 SOC - Alertas

### GET `/api/alerts`

Lista todos os alertas de segurança com filtros e paginação.

**Parâmetros de Query**:
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `severity` (string): `critical`, `high`, `medium`, `low`, `info`, `all`
- `status` (string): `open`, `acknowledged`, `resolved`, `all`
- `source` (string): `wazuh`, filtro por fonte
- `search` (string): Busca em `title`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "title": "Failed SSH login attempt",
      "description": "Multiple failed login attempts detected",
      "severity": "high",
      "status": "open",
      "source": "wazuh",
      "rule_id": "5710",
      "assigned_to": null,
      "acknowledged_by": null,
      "acknowledged_at": null,
      "resolved_by": null,
      "resolved_at": null,
      "raw_data": {...},
      "created_at": "2025-11-06T01:00:00.000Z",
      "updated_at": "2025-11-06T01:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET `/api/alerts/:id`

Busca um alerta específico por ID.

**Response**: Objeto de alerta único

### PATCH `/api/alerts/:id/acknowledge`

Confirma/reconhece um alerta.

**Response**: Alerta atualizado com `acknowledged_by` e `acknowledged_at`

### PATCH `/api/alerts/:id/resolve`

Marca um alerta como resolvido.

**Response**: Alerta atualizado com `resolved_by` e `resolved_at`

### PATCH `/api/alerts/:id/assign`

Atribui um alerta a um usuário.

**Body**:
```json
{
  "assigned_to": "uuid"
}
```

**Response**: Alerta atualizado

---

## 🖥️ NOC - Problemas

### GET `/api/problems`

Lista todos os problemas de infraestrutura.

**Parâmetros de Query**:
- `page`, `limit` (paginação)
- `severity` (string): `disaster`, `high`, `average`, `warning`, `info`, `all`
- `status` (string): `active`, `resolved`, `all`
- `source` (string): `zabbix`
- `search` (string): Busca em `name`

**Response**: Estrutura similar a `/api/alerts`

### GET `/api/problems/:id`

Busca um problema específico.

### PATCH `/api/problems/:id/acknowledge`

Confirma um problema.

---

## 🎫 Tickets

### GET `/api/tickets`

Lista todos os tickets ITIL.

**Parâmetros de Query**: `page`, `limit`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "title": "Ticket title",
      "description": "Ticket description",
      "status": "open",
      "priority": "high",
      "category": "incident",
      "created_by": "uuid",
      "assigned_to": "uuid",
      "created_at": "2025-11-06T01:00:00.000Z",
      "updated_at": "2025-11-06T01:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### POST `/api/tickets`

Cria um novo ticket.

**Body**:
```json
{
  "title": "Ticket title",
  "description": "Ticket description",
  "priority": "high",
  "category": "incident"
}
```

**Response**: Ticket criado (status 201)

---

## 🎲 GRC - Risks (Riscos)

### GET `/api/risks`

Lista todos os riscos organizacionais.

**Parâmetros de Query**:
- `page`, `limit`
- `status`: `open`, `mitigating`, `mitigated`, `accepted`, `closed`, `all`
- `category`: `operational`, `financial`, `strategic`, `compliance`, `cyber`, `reputational`, `all`
- `severity`: `critical` (20-25), `high` (15-19), `medium` (6-14), `low` (1-5), `all`
- `search`: Busca em `title`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "title": "Risk title",
      "description": "Risk description",
      "category": "cyber",
      "likelihood": 4,
      "impact": 5,
      "risk_score": 20,
      "treatment": "mitigate",
      "mitigation_plan": "Plan details",
      "mitigation_status": "in_progress",
      "residual_likelihood": 2,
      "residual_impact": 3,
      "residual_score": 6,
      "status": "mitigating",
      "owner_id": "uuid",
      "target_date": "2025-12-31T23:59:59.000Z",
      "created_at": "2025-11-06T01:00:00.000Z",
      "updated_at": "2025-11-06T01:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### POST `/api/risks`

Cria um novo risco.

**Body**:
```json
{
  "title": "Risk title",
  "description": "Risk description",
  "category": "cyber",
  "likelihood": 4,
  "impact": 5,
  "treatment": "mitigate",
  "mitigation_plan": "Plan details"
}
```

### GET `/api/risks/:id`

Busca um risco específico.

### PATCH `/api/risks/:id`

Atualiza um risco.

### DELETE `/api/risks/:id`

Deleta um risco.

### PATCH `/api/risks/:id/close`

Fecha um risco.

### GET `/api/risks/matrix/data`

Retorna dados para Risk Matrix (Heat Map 5x5).

**Response**:
```json
{
  "matrix": [
    [
      {
        "count": 2,
        "risks": ["uuid1", "uuid2"],
        "titles": ["Risk 1", "Risk 2"],
        "score": 5
      },
      ...
    ],
    ...
  ]
}
```

---

## 🛡️ GRC - Controls (Controles)

### GET `/api/controls`

Lista controles de segurança.

**Parâmetros de Query**:
- `page`, `limit`
- `framework`: `ISO 27001`, `NIST CSF`, `CIS`, `PCI-DSS`, `LGPD`, `SOC2`, `all`
- `status`: `not_implemented`, `planned`, `partial`, `implemented`, `verified`, `all`
- `search`: Busca em `title` ou `control_id`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "control_id": "ISO-27001-A.5.1",
      "title": "Control title",
      "description": "Control description",
      "framework": "ISO 27001",
      "control_type": "preventive",
      "status": "implemented",
      "effectiveness_score": 0.95,
      "last_tested": "2025-10-01T00:00:00.000Z",
      "test_frequency": 90,
      "next_test_date": "2025-12-30T00:00:00.000Z",
      "evidence_url": "https://...",
      "owner_id": "uuid",
      "created_at": "2025-11-06T01:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### POST `/api/controls`

Cria um novo controle.

### POST `/api/controls/:id/test`

Registra um teste de controle.

**Body**:
```json
{
  "test_result": "passed",
  "effectiveness_score": 0.95,
  "evidence_url": "https://...",
  "evidence_description": "Test evidence"
}
```

### GET `/api/controls/compliance/score`

Score de conformidade por framework.

**Response**:
```json
{
  "data": [
    {
      "framework": "ISO 27001",
      "total_controls": 114,
      "implemented_controls": 90,
      "verified_controls": 75,
      "compliance_percentage": 78.95,
      "avg_effectiveness": 0.87
    }
  ]
}
```

### GET `/api/controls/overdue/list`

Controles com testes vencidos.

---

## 📄 GRC - Policies (Políticas)

### GET `/api/policies`

Lista políticas organizacionais.

**Parâmetros de Query**:
- `page`, `limit`
- `status`: `draft`, `review`, `approved`, `active`, `archived`, `all`
- `category`: `security`, `privacy`, `compliance`, `operational`, `hr`, `all`
- `search`

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "title": "Policy title",
      "description": "Policy description",
      "content": "Markdown content...",
      "category": "security",
      "framework": "ISO 27001",
      "version": "2.0",
      "status": "active",
      "effective_date": "2025-01-01T00:00:00.000Z",
      "review_date": "2026-01-01T00:00:00.000Z",
      "owner_id": "uuid",
      "approved_by": "uuid",
      "approved_at": "2024-12-15T00:00:00.000Z",
      "created_at": "2024-11-01T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### POST `/api/policies`

Cria uma nova política (status: `draft`).

### POST `/api/policies/:id/submit`

Submete para revisão (`draft` → `review`).

### POST `/api/policies/:id/approve`

Aprova política (`review` → `approved`).

### POST `/api/policies/:id/activate`

Ativa política (`approved` → `active`).

### POST `/api/policies/:id/archive`

Arquiva política.

---

## 📊 Dashboard

### GET `/api/dashboard/ciso`

Dashboard executivo CISO.

**Response**:
```json
{
  "summary": {
    "avg_risk_score": 12.5,
    "open_risks": 23,
    "avg_compliance": 85.3,
    "critical_alerts": 5,
    "critical_problems": 2,
    "open_tickets": 12
  },
  "topRisks": [...],
  "criticalAlerts": [...]
}
```

---

## ⚙️ Rate Limiting

A API implementa 3 níveis de rate limiting:

1. **Global Limiter**: 300 requests / 5 minutos
2. **User Limiter**: 300 requests / 5 minutos (autenticado)
3. **Strict Limiter**: 20 requests / 15 minutos (ações críticas: POST, DELETE)

**Headers de Response**:
- `X-RateLimit-Limit`: Limite total
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset

**Response 429 (Too Many Requests)**:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 300
}
```

---

## ❌ Error Responses

### Formato Padrão
```json
{
  "error": "Error Type",
  "message": "Human-readable message in Portuguese"
}
```

### HTTP Status Codes

- `200 OK`: Sucesso
- `201 Created`: Recurso criado
- `204 No Content`: Sucesso sem corpo (DELETE)
- `400 Bad Request`: Validação falhou
- `401 Unauthorized`: Token JWT inválido/ausente
- `403 Forbidden`: Sem permissão (RLS)
- `404 Not Found`: Recurso não encontrado
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Server Error`: Erro do servidor

---

## 🔒 Multi-tenancy

Todas as rotas implementam multi-tenancy via Supabase Row Level Security (RLS):

- Cada request é filtrado por `org_id`
- O `org_id` é extraído do JWT token
- Usuários só veem dados da sua organização
- Implementado a nível de banco de dados (RLS policies)

---

## 📦 Paginação

Todas as listagens suportam paginação:

**Parâmetros**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 📝 Logging

Todas as requisições são logadas com Winston:

```json
{
  "level": "info",
  "message": "Alert acknowledged",
  "timestamp": "2025-11-06T02:00:00.000Z",
  "alertId": "uuid",
  "userId": "uuid"
}
```

---

**Desenvolvido por**: ness.  
**Licença**: Proprietário  
**Suporte**: support@nsecops.com.br

