# 🔧 Guia do Administrador - n360 Platform

**Versão**: 1.0  
**Data**: 06/11/2025  
**Público**: Administradores de Sistema, DevOps, SRE  
**Idioma**: Português (Brasil)

---

## 🎯 Introdução

Este guia é destinado a administradores responsáveis por:
- Deploy e manutenção da plataforma n360
- Configuração de integração com Wazuh/Zabbix/Shuffle
- Gerenciamento de usuários e organizações
- Backup e recuperação
- Monitoring e troubleshooting

---

## 🏗️ Arquitetura da Plataforma

### Componentes

```
Internet (*.nsecops.com.br)
         ↓
    ┌────────────┐
    │  Traefik   │ (Proxy Reverso, SSL)
    │  v3.1      │
    └─────┬──────┘
          │
    ┌─────┴──────────────────────┐
    │                            │
┌───▼─────┐  ┌───────┐  ┌───────┐  ┌───────┐
│  n360   │  │ Wazuh │  │Zabbix │  │Shuffle│
│ Platform│  │ 4.9.0 │  │  6.4  │  │ SOAR  │
└─────────┘  └───────┘  └───────┘  └───────┘
    │
    ↓
┌─────────────┐
│  Supabase   │ (PostgreSQL Cloud)
│  Database   │
└─────────────┘
```

### VPS de Produção

- **IP**: 148.230.77.242
- **OS**: Ubuntu 22.04 LTS
- **SSH**: root@148.230.77.242
- **Senha**: Gordinh@2009
- **Timezone**: America/Sao_Paulo

### Diretórios

```bash
/opt/stack/
├── traefik-setup/       # Proxy reverso
├── wazuh-stack/         # Wazuh (SIEM)
├── zabbix-stack/        # Zabbix (NOC)
├── shuffle-stack/       # Shuffle (SOAR)
└── n360-platform/       # n360 (GRC)
```

---

## 🚀 Deploy e Instalação

### 1. Pré-requisitos

```bash
# Conectar na VPS
ssh root@148.230.77.242

# Verificar Docker
docker --version  # >= 24.0
docker-compose --version  # >= 2.20

# Verificar diretórios
ls -la /opt/stack/
```

### 2. Deploy do n360

#### 2.1 Primeira Instalação

```bash
# Clonar repositório
cd /opt/stack
git clone https://github.com/resper1965/n360.git n360-platform
cd n360-platform

# Criar .env
cp backend/.env.example backend/.env
nano backend/.env
```

**Configurar variáveis**:
```env
# Supabase
SUPABASE_URL=https://hyplrlakowbwntkidtcp.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# Wazuh
WAZUH_API_URL=https://wazuh-manager:55000
WAZUH_USERNAME=wazuh-wui
WAZUH_PASSWORD=Nessnet@10

# Zabbix
ZABBIX_API_URL=http://zabbix-web:8080/api_jsonrpc.php
ZABBIX_USERNAME=Admin
ZABBIX_PASSWORD=Nessnet@10

# App
PORT=3001
NODE_ENV=production
```

```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Subir containers
docker-compose up -d

# Verificar logs
docker logs n360-backend -f
```

#### 2.2 Atualização (Deploy)

```bash
# SSH na VPS
ssh root@148.230.77.242

# Pull código
cd /opt/stack/n360-platform
git pull origin main

# Rebuild frontend (se houver mudanças)
cd frontend && npm install && npm run build && cd ..

# Reiniciar containers
docker-compose restart

# Verificar
docker ps | grep n360
docker logs n360-backend --tail 50
```

---

## 🔐 Gerenciamento de Usuários

### 1. Via Supabase Dashboard

**Acessar**: https://supabase.com/dashboard/project/hyplrlakowbwntkidtcp

**Criar Usuário**:
1. Authentication → Users → Add User
2. Email: user@empresa.com
3. Password: (gerar segura)
4. Confirm email: true
5. Save

**Criar Organização**:
```sql
-- Via SQL Editor no Supabase
INSERT INTO organizations (id, name, slug)
VALUES (gen_random_uuid(), 'Empresa XYZ', 'empresa-xyz');
```

**Associar Usuário à Org**:
```sql
-- Obter user_id
SELECT id, email FROM auth.users WHERE email = 'user@empresa.com';

-- Associar
INSERT INTO user_organizations (user_id, org_id, role)
VALUES (
  '<user_id>',
  (SELECT id FROM organizations WHERE slug = 'empresa-xyz'),
  'admin'
);
```

### 2. Via API (programático)

```bash
# Criar usuário via Supabase Auth API
curl -X POST 'https://hyplrlakowbwntkidtcp.supabase.co/auth/v1/signup' \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@empresa.com",
    "password": "senha-segura-123"
  }'
```

---

## 🔄 Backup e Recuperação

### 1. Backup do n360

**Backend** (código):
```bash
# Git é o backup!
cd /opt/stack/n360-platform
git remote -v
# Já está no GitHub: https://github.com/resper1965/n360
```

**Database** (Supabase):
```bash
# Supabase faz backup automático diário
# Recovery Point: 24 horas
# Para backup manual via API:
curl "https://hyplrlakowbwntkidtcp.supabase.co/rest/v1/risks?select=*" \
  -H "apikey: $SUPABASE_SERVICE_KEY" > backup-risks-$(date +%Y%m%d).json
```

**Frontend Build**:
```bash
# Backup do dist/
cd /opt/stack/n360-platform/frontend
tar -czf dist-backup-$(date +%Y%m%d).tar.gz dist/
scp dist-backup-*.tar.gz user@backup-server:/backups/n360/
```

### 2. Backup do Wazuh

**Script existente**: `/opt/stack/wazuh-stack/backup-wazuh.sh`

```bash
# Executar backup manual
cd /opt/stack/wazuh-stack
./backup-wazuh.sh

# Backups salvos em:
/opt/stack/wazuh-stack/backups/

# Cron job (diário às 2h):
0 2 * * * /opt/stack/wazuh-stack/backup-wazuh.sh >> /var/log/wazuh-backup.log 2>&1
```

### 3. Restauração

**n360**:
```bash
# Restaurar código
cd /opt/stack/n360-platform
git fetch origin
git reset --hard origin/main

# Rebuild
cd frontend && npm run build && cd ..
docker-compose up -d --force-recreate
```

**Wazuh**:
```bash
cd /opt/stack/wazuh-stack
./restore-wazuh.sh /opt/stack/wazuh-stack/backups/wazuh-backup-20251106.tar.gz
```

---

## 📊 Monitoring e Logs

### 1. Logs dos Containers

```bash
# n360 backend
docker logs n360-backend -f --tail 100

# n360 frontend (nginx)
docker logs n360-frontend -f --tail 100

# Todos os containers n360
docker-compose -f /opt/stack/n360-platform/docker-compose.yml logs -f

# Wazuh
docker logs wazuh-manager -f --tail 100

# Zabbix
docker logs zabbix-server -f --tail 100
```

### 2. Health Checks

```bash
# n360 API Health
curl -s http://localhost:3001/health | jq .

# Resposta esperada:
{
  "status": "healthy",
  "uptime": 3600,
  "services": {
    "supabase": "online",
    "wazuh": "online",
    "zabbix": "online"
  }
}

# Verificar todos os containers
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### 3. Métricas de Performance

```bash
# CPU/Memory dos containers n360
docker stats n360-backend n360-frontend --no-stream

# Tamanho dos logs
du -sh /var/lib/docker/containers/*/
```

### 4. Verificar SSL

```bash
# Certificados Traefik
docker exec traefik ls -lh /letsencrypt/acme.json

# Verificar validade
echo | openssl s_client -connect n360.nsecops.com.br:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔧 Troubleshooting

### Problema: n360 API não responde

**Sintomas**: `curl http://localhost:3001/health` timeout

**Diagnóstico**:
```bash
# 1. Container rodando?
docker ps | grep n360-backend

# 2. Logs de erro?
docker logs n360-backend --tail 50

# 3. Porta aberta?
netstat -tulpn | grep 3001

# 4. Processo Node.js?
docker exec n360-backend ps aux | grep node
```

**Solução**:
```bash
# Restart
docker-compose restart n360-backend

# Se não resolver, recreate
docker-compose up -d --force-recreate n360-backend

# Verificar .env
docker exec n360-backend cat /app/backend/.env | head -5
```

### Problema: Frontend carrega em branco

**Sintomas**: https://n360.nsecops.com.br mostra página branca

**Diagnóstico**:
```bash
# 1. Frontend container rodando?
docker ps | grep n360-frontend

# 2. Arquivos dist/ existem?
docker exec n360-frontend ls -la /usr/share/nginx/html/

# 3. Nginx logs
docker logs n360-frontend --tail 50
```

**Solução**:
```bash
# Rebuild frontend
cd /opt/stack/n360-platform/frontend
npm run build

# Verificar dist/
ls -la dist/

# Restart container
docker-compose restart n360-frontend
```

### Problema: Erro de conexão com Supabase

**Sintomas**: `{"error": "supabaseUrl is required"}`

**Diagnóstico**:
```bash
# Verificar .env
docker exec n360-backend cat /app/backend/.env | grep SUPABASE

# Verificar se .env está montado
docker inspect n360-backend | grep -A 5 Mounts
```

**Solução**:
```bash
# Copiar .env correto
cd /opt/stack/n360-platform
cp backend/.env.example backend/.env
nano backend/.env  # Preencher valores

# Restart
docker-compose restart n360-backend
```

### Problema: RLS (Row Level Security) bloqueando queries

**Sintomas**: Queries retornam vazio mesmo com dados no DB

**Diagnóstico**:
```sql
-- Via Supabase SQL Editor
SELECT * FROM risks;  -- Se retornar vazio, RLS está ativo

-- Verificar policies RLS
SELECT * FROM pg_policies WHERE tablename = 'risks';
```

**Solução**:
```bash
# Usar SUPABASE_SERVICE_KEY (bypass RLS)
# Verificar que backend está usando SERVICE_KEY, não ANON_KEY
docker exec n360-backend cat /app/backend/.env | grep SERVICE_KEY
```

---

## 🔐 Segurança

### 1. Senhas Padrão

**CRÍTICO**: Trocar em produção!

| Serviço | Usuário | Senha Padrão | Trocar Para |
|---------|---------|---------------|-------------|
| Wazuh | admin | Nessnet@10 | Senha forte única |
| Zabbix | Admin | Nessnet@10 | Senha forte única |
| Supabase | - | (Service Key) | Rotacionar chaves |

### 2. Firewall

```bash
# Verificar portas abertas
ufw status

# Regras recomendadas:
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirect)
ufw allow 443/tcp   # HTTPS
ufw allow 1514/tcp  # Wazuh agents
ufw allow 1515/tcp  # Wazuh agents
ufw enable
```

### 3. Rate Limiting

**Configurado no backend**:
- Global: 300 req/5min
- User: 300 req/5min
- Strict: 20 req/15min

**Ajustar**: `backend/middleware/rateLimiter.js`

### 4. SSL/TLS

**Traefik** gerencia automaticamente via Let's Encrypt.

**Renovação**: Automática (60 dias antes de expirar)

**Verificar certificados**:
```bash
docker logs traefik | grep -i certificate
```

---

## 📊 Monitoring

### 1. Health Check Endpoint

```bash
# Via curl
curl -s https://api.n360.nsecops.com.br/health | jq .

# Via browser
https://api.n360.nsecops.com.br/health
```

### 2. Logs Estruturados

**Backend** usa Winston (JSON logs):
```bash
docker logs n360-backend 2>&1 | grep level

# Filtrar por nível
docker logs n360-backend 2>&1 | grep '"level":"error"'
docker logs n360-backend 2>&1 | grep '"level":"warn"'
```

### 3. Métricas de Containers

```bash
# CPU/Memory real-time
docker stats

# Apenas n360
docker stats n360-backend n360-frontend
```

### 4. Disk Usage

```bash
# Uso de disco por container
docker system df -v

# Logs volumosos
du -sh /var/lib/docker/containers/*/* | sort -h | tail -10

# Limpar logs antigos
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

---

## 🔄 Manutenção

### 1. Atualizar n360

```bash
# 1. Backup primeiro!
cd /opt/stack/n360-platform
git status  # Verificar mudanças locais

# 2. Pull atualização
git pull origin main

# 3. Se houver mudanças no frontend
cd frontend
npm install  # Novos pacotes
npm run build
cd ..

# 4. Se houver mudanças no backend
docker-compose restart n360-backend

# 5. Verificar
docker logs n360-backend --tail 50
curl -s http://localhost:3001/health
```

### 2. Atualizar Wazuh/Zabbix/Shuffle

⚠️ **NÃO ATUALIZAR** sem planejar! Versões fixadas:
- Wazuh: 4.9.0 LTS
- Zabbix: 6.4 LTS
- Shuffle: stable

**Se necessário**:
1. Backup completo primeiro
2. Testar em ambiente de staging
3. Janela de manutenção agendada
4. Plano de rollback pronto

### 3. Limpar Recursos

```bash
# Remover containers parados
docker container prune -f

# Remover imagens antigas
docker image prune -a -f

# Remover volumes não usados (CUIDADO!)
docker volume prune -f  # ⚠️ Pode deletar dados!

# Remover tudo (EXTREMO CUIDADO!)
docker system prune -a --volumes  # ⚠️ BACKUP ANTES!
```

---

## 🗄️ Database (Supabase)

### 1. Acesso ao Database

**Dashboard**: https://supabase.com/dashboard/project/hyplrlakowbwntkidtcp

**SQL Editor**: Dashboard → SQL Editor

**Connection String**:
```
postgresql://postgres:[PASSWORD]@db.hyplrlakowbwntkidtcp.supabase.co:5432/postgres
```

### 2. Migrations

**Aplicar schema**:
```bash
# Via Supabase SQL Editor:
# 1. Copiar conteúdo de database/*.sql
# 2. Colar no SQL Editor
# 3. Run

# Schemas na ordem:
# - 01-organizations.sql
# - 02-soc-noc.sql
# - 03-tickets.sql
# - 04-grc-schema.sql
```

### 3. Backup do Database

**Automático** (Supabase):
- Daily backups
- 7 dias de retenção (Free Tier)
- 30+ dias (Pro Tier)

**Manual**:
```bash
# Via pg_dump (requer connection string)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 4. Row Level Security (RLS)

**Verificar policies**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('risks', 'controls', 'policies', 'alerts', 'problems');
```

**Testar RLS**:
```sql
-- Set context (simular usuário)
SET app.current_org_id = '<org_uuid>';

-- Query deve retornar só dados dessa org
SELECT * FROM risks;
```

---

## 🌐 Networking e DNS

### 1. Domínios

**Registrados em**: Cloudflare (presumivelmente)

| Subdomínio | Aponta Para | Serviço |
|------------|-------------|---------|
| n360.nsecops.com.br | 148.230.77.242 | n360 Frontend |
| api.n360.nsecops.com.br | 148.230.77.242 | n360 Backend |
| wazuh.nsecops.com.br | 148.230.77.242 | Wazuh Dashboard |
| zabbix.nsecops.com.br | 148.230.77.242 | Zabbix Web |
| shuffle.nsecops.com.br | 148.230.77.242 | Shuffle Frontend |

### 2. Traefik Routing

**Config**: `/opt/stack/traefik-setup/docker-compose.yml`

**Ver rotas ativas**:
```bash
# Traefik Dashboard
http://148.230.77.242:8080

# Via API
curl -s http://148.230.77.242:8080/api/http/routers | jq '.[] | {name, rule, service}'
```

### 3. Adicionar Novo Domínio

**Editar** `n360-platform/docker-compose.yml`:
```yaml
services:
  n360-frontend:
    labels:
      - "traefik.http.routers.n360-frontend.rule=Host(`n360.nsecops.com.br`) || Host(`novo.nsecops.com.br`)"
```

**Aplicar**:
```bash
docker-compose up -d
```

---

## 🧪 Testing

### 1. Testes Automatizados

```bash
# Backend (Jest)
cd /opt/stack/n360-platform/backend
npm test

# Com coverage
npm run test:coverage

# Frontend (Vitest)
cd /opt/stack/n360-platform/frontend
npm test
```

### 2. Testes de Integração

```bash
# Testar API completa
cd /opt/stack/n360-platform/backend
npm run test:integration

# Testar endpoint específico
curl -X GET https://api.n360.nsecops.com.br/health
curl -X GET https://api.n360.nsecops.com.br/api/risks
```

### 3. Load Testing (opcional)

```bash
# Instalar k6
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz
sudo mv k6-v0.47.0-linux-amd64/k6 /usr/local/bin/

# Criar script de teste
cat > load-test.js << 'EOF'
import http from 'k6/http';
export let options = { vus: 10, duration: '30s' };
export default function() {
  http.get('https://api.n360.nsecops.com.br/health');
}
EOF

# Executar
k6 run load-test.js
```

---

## 🚨 Alertas e Notificações

### 1. Configurar Email (futuro)

**Via Supabase Auth**:
- Dashboard → Authentication → Email Templates
- SMTP provider: SendGrid, AWS SES, Mailgun

### 2. Slack Integration (futuro)

**Webhook**:
```bash
# Via backend (adicionar endpoint)
POST /api/integrations/slack/webhook
Body: {
  "event": "incident_created",
  "webhook_url": "https://hooks.slack.com/services/..."
}
```

---

## 📈 Scaling

### 1. Horizontal Scaling (Docker Swarm/Kubernetes)

**Atual**: Single-node Docker Compose

**Futuro** (se > 1000 usuários):
- Migrate para Kubernetes
- Multiple replicas (n360-backend)
- Load balancer (Traefik já suporta)

### 2. Database Scaling

**Supabase** escala automaticamente (Free → Pro → Team → Enterprise)

**Custos**:
- Free: 500 MB database, 1 GB storage
- Pro: $25/mês (8 GB database, 100 GB storage)
- Team: $599/mês (unlimited)

### 3. Caching (futuro)

**Redis** para cache de queries frequentes:
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 🔑 Credenciais de Administração

### Produção (TROCAR!)

```bash
# VPS SSH
root@148.230.77.242
Senha: Gordinh@2009  # ⚠️ TROCAR!

# Wazuh
https://wazuh.nsecops.com.br
User: admin
Pass: Nessnet@10  # ⚠️ TROCAR!

# Zabbix
https://zabbix.nsecops.com.br
User: Admin
Pass: Nessnet@10  # ⚠️ TROCAR!

# Supabase
https://supabase.com/dashboard
(Login via GitHub/Google do resper1965)

# GitHub
https://github.com/resper1965/n360
(Token PAT necessário para CI/CD)
```

### Rotação de Credenciais

**Frequência recomendada**: 90 dias

**Checklist**:
- [ ] Senha SSH da VPS
- [ ] Senha Wazuh admin
- [ ] Senha Zabbix Admin
- [ ] SUPABASE_SERVICE_KEY (gerar nova)
- [ ] GitHub PAT (se usando CI/CD)

---

## 📞 Suporte

### Documentação

- **API Docs**: Ver `API-DOCS.md`
- **User Guide**: Ver `GUIA-USUARIO.md`
- **Specs Técnicas**: Ver `specs/`

### Contato

- **Email**: support@nsecops.com.br
- **Empresa**: ness.
- **GitHub**: https://github.com/resper1965/n360

### Logs de Auditoria

```sql
-- Ver últimas ações no GRC
SELECT 
  created_at,
  created_by,
  action,
  resource_type,
  resource_id
FROM audit_logs
ORDER BY created_at DESC
LIMIT 50;
```

---

## 📚 Referências

### Documentação Oficial

- **Supabase**: https://supabase.com/docs
- **Docker**: https://docs.docker.com
- **Traefik**: https://doc.traefik.io/traefik
- **Wazuh**: https://documentation.wazuh.com
- **Zabbix**: https://www.zabbix.com/documentation

### Comandos Úteis

```bash
# Ver todas as redes Docker
docker network ls

# Inspecionar rede
docker network inspect wazuh-stack_wazuh-internal

# Restart todos os stacks
cd /opt/stack/traefik-setup && docker-compose restart
cd /opt/stack/n360-platform && docker-compose restart

# Backup completo do servidor
tar -czf /root/backup-opt-stack-$(date +%Y%m%d).tar.gz /opt/stack/
```

---

**Desenvolvido por**: ness.  
**Versão**: 1.0  
**Atualizado**: 06/11/2025

