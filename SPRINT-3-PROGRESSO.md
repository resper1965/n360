# Sprint 3 - Features Core (SOC + NOC)

**Status**: 🔄 Em Andamento  
**Progresso**: 4/10 tarefas (40%)  
**Tempo decorrido**: ~30 minutos

---

## ✅ Completo (4/10)

### SOC - Alertas
- [x] **API Actions**
  - `PATCH /api/alerts/:id/acknowledge`
  - `PATCH /api/alerts/:id/resolve`
  - `PATCH /api/alerts/:id/assign`
  - Tracking: acknowledged_by, resolved_by, assigned_to
  - Timestamps automáticos

### NOC - Problemas
- [x] **API Actions**
  - `PATCH /api/problems/:id/acknowledge`
  - Tracking: acknowledged_by, acknowledged_at

### Tickets
- [x] **CRUD Básico**
  - `GET /api/tickets` (listagem + paginação)
  - `POST /api/tickets` (criação)
  - Auto-fields: org_id, created_by, status
  - StrictLimiter aplicado

---

## ⏳ Pendente (6/10)

### Pages & UI
- [ ] SOC: Página de detalhes do alerta
- [ ] NOC: Página de detalhes do problema
- [ ] SOC: Dashboard widgets (top alerts, timeline)
- [ ] NOC: Dashboard widgets (top problems, SLA)
- [ ] NOC: Filtros avançados API
- [ ] Tickets: Workflow ITIL

---

## 🎯 Próximas Ações

1. **Widgets do Dashboard** (1-2h)
   - Top Alerts component
   - Top Problems component
   - Severity charts
   - Timeline graphs

2. **Páginas de Detalhes** (1-2h)
   - AlertDetailPage.jsx
   - ProblemDetailPage.jsx
   - Routing configurado

3. **Filtros NOC** (30min)
   - Severity filter
   - Status filter
   - Host filter

4. **Tickets Workflow** (1h)
   - Status transitions
   - SLA tracking básico

---

**Estimativa restante**: 3-4 horas  
**ETA Sprint 3**: Hoje mesmo! 🚀

