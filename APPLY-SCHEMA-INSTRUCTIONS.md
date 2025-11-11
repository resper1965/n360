# 📊 Como Aplicar o Schema no Supabase

## Método 1: Via Dashboard (Recomendado)

### 1. Acesse o SQL Editor

```
https://supabase.com/dashboard/project/mupwrwjxqsveljtjzllr/sql/new
```

### 2. Copie o Schema

```bash
cat database/schema.sql
```

### 3. Cole no SQL Editor

Cole todo o conteúdo do arquivo `schema.sql`

### 4. Execute

Clique em **"Run"** (▶️) no canto inferior direito

### 5. Verificar

Vá em **Table Editor** e você verá:
- organizations
- user_profiles
- assets
- alerts
- problems
- tickets
- risks
- compliance_standards
- compliance_controls
- evidence
- audit_logs

---

## Método 2: Via CLI (Alternativo)

```bash
cp env.sample .env   # apenas se ainda não existir
node apply-schema.js
```

---

## ✅ Após Aplicar o Schema

Me avise e eu vou:
1. Desenvolver o Dashboard CISO
2. Módulos SOC e NOC
3. Sistema de tickets
4. Collectors (Wazuh, Zabbix)

---

**Execute agora e me avise quando estiver pronto!** 🚀
