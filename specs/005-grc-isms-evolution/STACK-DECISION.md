# 🏗️ Decisão de Stack: Abordagem Híbrida Supabase + Prisma

**Data**: 06/11/2025  
**Decisão**: Aprovada  
**Tipo**: Arquitetural - Stack Tecnológico

---

## 🎯 Decisão

Adotar uma **abordagem híbrida** para o N360 GRC Evolution, utilizando:

- **Supabase Client** (60% - atual)
- **Prisma ORM** (40% - novo, apenas para GRC)

---

## 📊 Divisão de Responsabilidades

### Supabase Client (Mantém)

| Funcionalidade | Justificativa |
|----------------|---------------|
| **Autenticação** | JWT, Auth helpers, integrado |
| **RLS (Row Level Security)** | Multi-tenancy automático |
| **Storage** | Evidências, anexos, screenshots |
| **Realtime** | Subscriptions para dashboards |
| **Módulos SOC/NOC** | Alerts, Problems (já implementado) |
| **Queries simples** | Listagens, filtros básicos |

### Prisma ORM (Adiciona)

| Funcionalidade | Justificativa |
|----------------|---------------|
| **Módulos GRC** | Asset, Risk, Control, Compliance |
| **Queries complexas** | 3+ joins, nested includes |
| **Type Safety** | Crítico para cálculos de risco |
| **Migrations** | Versionamento git, audit trail |
| **Relacionamentos** | Asset → Risk → Control → Compliance |
| **Cálculos** | Risk Score, Compliance Score |

---

## 🔧 Configuração Técnica

### 1. Connection String

Ambos conectam no **mesmo PostgreSQL (Supabase)**:

```env
# .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
SUPABASE_URL="https://[PROJECT].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."
```

### 2. Inicialização

```typescript
// backend/db/index.ts

// Supabase Client
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Prisma Client
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
})
```

### 3. Prisma Schema (apenas tabelas GRC)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ============================================
// GRC TABLES ONLY
// ============================================

model Asset {
  id              String   @id @default(uuid())
  orgId           String   @map("org_id")
  assetCode       String   @unique @map("asset_code")
  name            String
  // ... resto dos campos
  
  risks           Risk[]
  incidents       Incident[]
  
  @@map("assets")
}

model Risk {
  id                    String   @id @default(uuid())
  orgId                 String   @map("org_id")
  // ... campos de risco
  
  asset                 Asset    @relation(fields: [assetId], references: [id])
  assetId               String   @map("asset_id")
  
  controls              RiskControl[]
  incidents             Incident[]
  
  @@map("risks")
}

// ... outros modelos GRC
```

### 4. Uso no Código

```typescript
// routes/alerts.ts (MANTÉM SUPABASE)
import { supabase } from '../db'

app.get('/api/alerts', async (req, res) => {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
  // ✅ RLS automático!
  res.json(data)
})

// routes/grc/assets.ts (USA PRISMA)
import { prisma } from '../db'

app.get('/api/assets/:id/context', async (req, res) => {
  const context = await prisma.asset.findUnique({
    where: { 
      id: req.params.id,
      orgId: req.user.orgId // ⚠️ RLS manual
    },
    include: {
      risks: {
        include: {
          controls: {
            include: { control: true }
          }
        }
      }
    }
  })
  // ✅ Type-safe, autocomplete
  res.json(context)
})
```

---

## ⚠️ Considerações Importantes

### 1. RLS (Row Level Security)

**Problema**: Prisma **NÃO respeita** RLS policies do PostgreSQL.

**Solução**: Filtrar `org_id` manualmente em TODAS as queries Prisma:

```typescript
// ❌ ERRADO (vaza dados!)
const risks = await prisma.risk.findMany()

// ✅ CORRETO (filtra org_id)
const risks = await prisma.risk.findMany({
  where: { orgId: req.user.orgId }
})
```

**Middleware Prisma** (para garantir):

```typescript
// prisma/middleware.ts
prisma.$use(async (params, next) => {
  // Intercepta queries de modelos GRC
  const grcModels = ['asset', 'risk', 'control', 'incident']
  
  if (grcModels.includes(params.model?.toLowerCase())) {
    if (!params.args.where) params.args.where = {}
    
    // Force orgId filter (pega do context)
    if (!params.args.where.orgId) {
      throw new Error(`orgId obrigatório para ${params.model}`)
    }
  }
  
  return next(params)
})
```

### 2. Migrations

**Duas estratégias**:

**Opção A: Prisma gerencia apenas GRC**
```bash
# Criar migration GRC
npx prisma migrate dev --name grc_initial

# Tabelas SOC/NOC continuam via Supabase SQL Editor
```

**Opção B: Prisma gerencia tudo (introspection)**
```bash
# Importar schema completo do Supabase
npx prisma db pull

# Ajustar schema.prisma
# Criar migrations a partir de agora
npx prisma migrate dev
```

**Recomendação**: **Opção A** (Prisma só GRC)

### 3. Realtime

**Problema**: Prisma não tem subscriptions.

**Solução**: Usar Supabase Client para realtime:

```typescript
// Dashboard com realtime
const subscription = supabase
  .channel('incidents')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'incidents' },
    (payload) => {
      console.log('Novo incidente:', payload.new)
    }
  )
  .subscribe()
```

---

## 📅 Plano de Implementação

### Fase 1: Setup (Sprint 1)
- [ ] Instalar Prisma
- [ ] Criar `schema.prisma` (apenas GRC)
- [ ] Configurar middleware RLS
- [ ] Testar conexão

### Fase 2: Migração Gradual (Sprints 2-5)
- [ ] Sprint 2: CMDB (Assets) → Prisma
- [ ] Sprint 3: Risk Engine → Prisma
- [ ] Sprint 4: Controls → Prisma
- [ ] Sprint 5: Compliance → Prisma
- [ ] Incidents → Decisão posterior

### Fase 3: Manter Supabase para:
- Auth (sempre)
- Alerts/Problems (já pronto)
- Storage (evidências)
- Realtime (dashboards)

---

## 📊 Métricas de Sucesso

| Métrica | Objetivo |
|---------|----------|
| Type Safety | 100% em queries GRC |
| Performance | < 200ms (p95) |
| Developer Experience | Autocomplete 100% |
| Migrations | Git-versionadas |
| RLS | Zero vazamento de dados |

---

## 🔄 Rollback Plan

Se Prisma não funcionar bem:

1. **Fácil**: Todas queries Prisma são isoladas em `routes/grc/`
2. **Migração reversa**: Converter Prisma queries para Supabase Client
3. **Database intacto**: Schema permanece igual (PostgreSQL)

---

## 📚 Recursos

### Prisma
- **Docs**: https://www.prisma.io/docs
- **Supabase + Prisma**: https://www.prisma.io/docs/guides/database/supabase

### Supabase
- **Docs**: https://supabase.com/docs
- **RLS**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Decisão Final

**Aprovada**: Abordagem Híbrida (Supabase 60% + Prisma 40%)

**Próximos passos**:
1. Commitar esta decisão
2. Atualizar SPEC.md com detalhes da implementação híbrida
3. Criar setup inicial do Prisma
4. Começar Sprint 1 (CMDB)

---

**Decisão tomada por**: Time n360  
**Data**: 06/11/2025  
**Implementação**: A partir de Sprint 6 (GRC ISMS Evolution)



