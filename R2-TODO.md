# 🏷️ LEMBRETE: Configurar Cloudflare R2

## 📋 O que é

Cloudflare R2 é o storage "frio" (Cold Storage) para dados históricos (> 1 ano).

**Quando implementar**: Após 3-6 meses de uso do n360, quando começar a acumular dados.

---

## 💰 Por que é importante

**Economia de custos**:
- Supabase PostgreSQL: $0.125/GB/mês
- Cloudflare R2: $0.015/GB/mês
- **Diferença**: 8.3x mais barato!
- **Egress**: GRÁTIS no R2 (vs $0.09/GB no Supabase)

**Para 100 GB de dados históricos**:
- Sem R2: $12.50/mês
- Com R2: $1.50/mês
- **Economia**: $11/mês = $132/ano

---

## 🚀 Como Implementar (15 minutos)

### 1. Criar conta e buckets

```bash
# 1. Acessar https://dash.cloudflare.com
# 2. Ativar R2 Storage
# 3. Criar buckets:
#    - n360-archives
#    - wazuh-archives
#    - zabbix-archives
```

### 2. Gerar API Keys

```bash
# Dashboard R2 → Manage R2 API Tokens
# Create API Token:
#   Name: n360-archiver
#   Permissions: Read & Write
#   
# Copiar:
#   - CLOUDFLARE_ACCOUNT_ID
#   - R2_ACCESS_KEY_ID
#   - R2_SECRET_ACCESS_KEY
```

### 3. Configurar n360

```bash
# SSH na VPS
ssh root@148.230.77.242

# Editar .env do n360
nano /opt/stack/n360-platform/.env

# Descomentar e preencher:
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=n360-archives

# Reiniciar backend
docker restart n360-backend
```

### 4. Verificar funcionamento

```bash
# Ver logs
docker logs n360-backend -f

# Procurar por:
# "[Archiver] Starting daily archival job..."
```

---

## 📊 O que será arquivado

| Dados | Hot (Supabase) | Cold (R2) | Retenção Total |
|-------|----------------|-----------|----------------|
| Alerts | 90 dias | 90d - 7 anos | 7 anos |
| Problems | 90 dias | 90d - 7 anos | 7 anos |
| Audit Logs | 180 dias | 180d - 10 anos | 10 anos |

**Arquivamento automático**: Cron job diário às 03:00 UTC

---

## 📚 Documentação

Ver estratégia completa:
- `/home/resper/stack/DATA-LIFECYCLE-STRATEGY.md`
- `/home/resper/stack/COMPARACAO-CUSTOS-SUPABASE-R2.md`
- `/home/resper/stack/specs/002-n360-platform/DEPLOY-DATA-LIFECYCLE.md`

---

## ✅ Checklist de Implementação

- [ ] Criar conta Cloudflare
- [ ] Criar bucket `n360-archives`
- [ ] Gerar API Keys
- [ ] Configurar .env do n360
- [ ] Reiniciar backend
- [ ] Verificar logs
- [ ] Testar arquivamento manual
- [ ] Monitorar por 7 dias

---

**Status atual**: ⏳ Pendente (não urgente)  
**Prioridade**: Baixa  
**Quando fazer**: Quando n360 acumular > 10 GB de dados

**Criado**: 04/11/2025

