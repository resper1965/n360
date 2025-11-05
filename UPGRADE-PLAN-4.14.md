# 🔄 Plano de Upgrade: Wazuh 4.9.0 LTS → 4.14.0

**Data de Criação**: 06/11/2025  
**Prioridade**: 🔴 IMPERATIVO  
**Status**: 📋 Planejamento  
**Responsável**: DevOps Team (ness.)

---

## 🎯 Objetivo

Atualizar Wazuh Stack de **4.9.0 LTS** para **4.14.0** com **ZERO downtime crítico** e **ZERO perda de dados**.

---

## ⚠️ Problema Identificado na Primeira Tentativa

### Erro Encontrado

```
FATAL Error: Unknown configuration key(s): "wazuh.hosts"
```

### Causa Raiz

A versão **4.14.0** mudou a estrutura de configuração do **Wazuh Dashboard**:
- **4.9.0**: Usa `wazuh.hosts` no arquivo `wazuh.yml`
- **4.14.0**: Usa nova estrutura (a ser descoberta)

### Arquivos Afetados

- `/opt/stack/wazuh-stack/config/wazuh_dashboard/wazuh.yml` ⚠️
- Possivelmente: `opensearch_dashboards.yml`

---

## 📋 Plano de Execução (10 Fases)

### FASE 0: Pesquisa e Preparação (1-2 horas)

**Objetivos**:
- [ ] Ler Release Notes completas (4.10, 4.11, 4.12, 4.13, 4.14)
- [ ] Ler Migration Guide oficial do Wazuh
- [ ] Identificar ALL breaking changes
- [ ] Baixar nova estrutura de `wazuh.yml` para 4.14
- [ ] Documentar mudanças de configuração

**Recursos**:
- https://documentation.wazuh.com/current/release-notes/release-4-14-0.html
- https://documentation.wazuh.com/current/upgrade-guide/
- https://github.com/wazuh/wazuh-dashboard-plugins/releases

**Entregável**: Documento `WAZUH-4.14-CONFIG-CHANGES.md`

---

### FASE 1: Backup Completo (30 minutos)

**Objetivos**:
- [ ] Backup de volumes Docker
- [ ] Backup de configurações
- [ ] Backup de certificados SSL
- [ ] Backup de dados do Indexer
- [ ] Snapshot do servidor (se possível)

**Comandos**:
```bash
ssh root@148.230.77.242

# 1. Backup via script
cd /opt/stack/wazuh-stack
./backup-wazuh.sh

# 2. Backup adicional de configs
mkdir -p backups/config-4.9.0
cp -r config/* backups/config-4.9.0/
tar -czf backups/wazuh-config-4.9.0-$(date +%Y%m%d).tar.gz config/

# 3. Backup de volumes
docker run --rm \
  -v wazuh-stack_wazuh-indexer-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/indexer-data-4.9.0.tar.gz -C /data .

# 4. Export de dados críticos (opcional)
docker exec wazuh-indexer curl -X GET "https://localhost:9200/_cat/indices?v" \
  -u admin:admin --insecure > backups/indices-4.9.0.txt
```

**Critério de Sucesso**: 
- ✅ Arquivo de backup > 500 MB
- ✅ Todos os volumes salvos
- ✅ Configs preservadas

---

### FASE 2: Ambiente de Teste (2-4 horas)

**Objetivos**:
- [ ] Criar ambiente de staging (VM ou Docker local)
- [ ] Replicar configuração atual (4.9.0)
- [ ] Testar upgrade 4.9.0 → 4.14.0 em staging
- [ ] Documentar passos exatos que funcionaram
- [ ] Identificar nova estrutura de `wazuh.yml`

**Setup Staging**:
```bash
# Opção 1: Docker local
cd ~/wazuh-test
git clone https://github.com/wazuh/wazuh-docker.git
cd wazuh-docker/single-node
# Editar para usar 4.9.0 primeiro
docker-compose up -d

# Opção 2: VM temporária (DigitalOcean, AWS, etc)
```

**Testes a Realizar**:
1. Atualizar versões (4.9.0 → 4.14.0)
2. Identificar erro de config
3. Pesquisar nova estrutura de `wazuh.yml` para 4.14
4. Aplicar correção
5. Validar Dashboard funcional
6. Documentar passos EXATOS

**Entregável**: `STAGING-TEST-REPORT.md` com passos validados

---

### FASE 3: Preparar Configurações para 4.14 (1 hora)

**Objetivo**: Adaptar arquivos de configuração para 4.14.0

#### 3.1: Pesquisar Nova Estrutura de wazuh.yml

**Fontes**:
- Documentação oficial Wazuh 4.14
- GitHub issues/discussions
- Docker image default config

**Comando para extrair config padrão**:
```bash
# Pull imagem 4.14 e extrair config default
docker pull wazuh/wazuh-dashboard:4.14.0
docker run --rm wazuh/wazuh-dashboard:4.14.0 cat /usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml.template > wazuh-4.14-default.yml
```

#### 3.2: Criar Novo wazuh.yml

**Estrutura Antiga (4.9.0)**:
```yaml
hosts:
  - 1513629884013:
      url: "https://wazuh.manager"
      port: 55000
      username: wazuh-wui
      password: "Nessnet@10"
      run_as: false
```

**Estrutura Nova (4.14.0)** - *A SER DESCOBERTA*:
```yaml
# Possíveis mudanças:
# - wazuh.hosts → wazuh.api ?
# - Estrutura de autenticação diferente?
# - Novos campos obrigatórios?
```

**Ação**: Documentar estrutura correta em `config/wazuh_dashboard/wazuh-4.14.yml`

---

### FASE 4: Janela de Manutenção (Planejamento)

**Quando**: [DATA/HORA A DEFINIR]

**Duração Estimada**: 
- Otimista: 1 hora
- Realista: 2 horas
- Pessimista: 4 horas (se precisar rollback completo)

**Notificações**:
- [ ] Alertar usuários 48h antes
- [ ] Email de manutenção programada
- [ ] Status page atualizado
- [ ] On-call team disponível

**Horário Recomendado**:
- Madrugada (02:00 - 06:00 BRT)
- Fim de semana
- Baixo uso do sistema

---

### FASE 5: Pré-Migration Checklist (30 minutos)

**Antes de Iniciar**:
- [ ] Backup validado e testado
- [ ] Configurações 4.14 preparadas
- [ ] Staging testado com sucesso
- [ ] Equipe disponível
- [ ] Plano de rollback documentado
- [ ] Monitoramento ativo
- [ ] Comunicação enviada aos usuários

**Verificações de Saúde**:
```bash
# Wazuh
docker ps | grep wazuh
docker logs wazuh-manager --tail 50
docker logs wazuh-dashboard --tail 50

# Agentes
docker exec wazuh-manager /var/ossec/bin/agent_control -l

# n360
curl https://api.n360.nsecops.com.br/health
```

---

### FASE 6: Execução do Upgrade (1 hora)

#### 6.1: Parar Serviços (5 min)

```bash
ssh root@148.230.77.242

cd /opt/stack/wazuh-stack

# Parar na ordem correta
docker-compose stop wazuh-dashboard
docker-compose stop wazuh-manager
docker-compose stop wazuh-indexer
```

#### 6.2: Backup Adicional (5 min)

```bash
# Backup final antes da mudança
tar -czf backups/pre-upgrade-$(date +%Y%m%d-%H%M%S).tar.gz \
  docker-compose.yml \
  config/
```

#### 6.3: Atualizar docker-compose.yml (2 min)

```bash
# Backup
cp docker-compose.yml docker-compose.yml.4.9.0

# Update
sed -i 's/4\.9\.0/4.14.0/g' docker-compose.yml

# Verificar
grep "image: wazuh" docker-compose.yml
```

#### 6.4: Atualizar Configurações (10 min)

```bash
# Aplicar nova estrutura de wazuh.yml
cd config/wazuh_dashboard

# Backup da config antiga
cp wazuh.yml wazuh.yml.4.9.0

# Aplicar nova config (preparada na Fase 3)
cat > wazuh.yml << 'EOF'
[NOVA ESTRUTURA AQUI - A SER DESCOBERTA NA FASE 2/3]
EOF

# Ajustar permissões
chmod 666 wazuh.yml
```

#### 6.5: Pull Novas Imagens (10 min)

```bash
cd /opt/stack/wazuh-stack
docker-compose pull
```

#### 6.6: Iniciar Serviços (20 min)

```bash
# Iniciar na ordem correta
docker-compose up -d wazuh-indexer
sleep 30  # Aguardar Indexer ficar ready

docker-compose up -d wazuh-manager
sleep 20  # Aguardar Manager conectar

docker-compose up -d wazuh-dashboard
sleep 40  # Aguardar Dashboard inicializar
```

#### 6.7: Monitorar Logs (10 min)

```bash
# Terminal 1: Indexer
docker logs wazuh-indexer -f

# Terminal 2: Manager
docker logs wazuh-manager -f

# Terminal 3: Dashboard
docker logs wazuh-dashboard -f
```

**Procurar por**:
- ✅ "Server running" ou "started"
- ❌ "FATAL", "ERROR", "Unknown configuration"

---

### FASE 7: Validação Pós-Upgrade (30 minutos)

#### 7.1: Health Checks

```bash
# Containers rodando?
docker ps --filter name=wazuh

# Esperado:
# wazuh-indexer    Up X minutes
# wazuh-manager    Up X minutes
# wazuh-dashboard  Up X minutes (NÃO "Restarting"!)
```

#### 7.2: Dashboard Web

```bash
# Acessar
curl -I https://wazuh.nsecops.com.br

# Esperado: HTTP/2 200
# Browser: https://wazuh.nsecops.com.br
# Login: admin / Nessnet@10
```

#### 7.3: Agentes

```bash
# Verificar agentes conectados
docker exec wazuh-manager /var/ossec/bin/agent_control -l

# Esperado: Lista de agentes com status "Active"
```

#### 7.4: Alertas

```bash
# Gerar alerta de teste
docker exec wazuh-manager /var/ossec/bin/agent_control -u 000

# Verificar no Dashboard: Modules → Security Events
```

#### 7.5: Multi-tenancy

```bash
# Login no Dashboard
# Verificar no canto superior direito: "Global" ou tenant selector
```

#### 7.6: n360 Integration

```bash
# Health check
curl https://api.n360.nsecops.com.br/health

# Verificar status do Wazuh no dashboard
curl https://n360.nsecops.com.br
```

---

### FASE 8: Rollback (Se Necessário)

#### Critérios para Rollback

**Executar rollback SE**:
- ❌ Dashboard não sobe após 10 minutos
- ❌ Erro "FATAL" persistente nos logs
- ❌ Perda de conexão com agentes
- ❌ Dados do Indexer corrompidos
- ❌ Impossível fazer login

#### Passos de Rollback

```bash
cd /opt/stack/wazuh-stack

# 1. Parar tudo
docker-compose down

# 2. Restaurar docker-compose.yml
cp docker-compose.yml.4.9.0 docker-compose.yml

# 3. Restaurar configs
rm -rf config/wazuh_dashboard/wazuh.yml
cp backups/config-4.9.0/wazuh_dashboard/wazuh.yml config/wazuh_dashboard/

# 4. Pull imagens 4.9.0 (se necessário)
docker-compose pull

# 5. Iniciar
docker-compose up -d

# 6. Aguardar 2 minutos
sleep 120

# 7. Verificar
docker ps
curl https://wazuh.nsecops.com.br
```

**Tempo de Rollback**: 10-15 minutos

---

### FASE 9: Documentação Pós-Upgrade (30 minutos)

**Documentar**:
- [ ] Passos exatos executados
- [ ] Problemas encontrados e soluções
- [ ] Mudanças de configuração aplicadas
- [ ] Testes de validação realizados
- [ ] Lições aprendidas

**Arquivos a Criar**:
- `WAZUH-4.14-UPGRADE-REPORT.md`
- `WAZUH-4.14-CONFIG-CHANGES.md`

---

### FASE 10: Comunicação (15 minutos)

**Notificar**:
- [ ] Usuários: Manutenção concluída
- [ ] Time técnico: Upgrade bem-sucedido
- [ ] Stakeholders: Nova versão em produção
- [ ] Documentação atualizada

---

## 🔍 Investigação Necessária (ANTES de executar)

### 1. Descobrir Nova Estrutura de wazuh.yml

**Métodos**:

#### Método 1: Docker Inspect
```bash
docker pull wazuh/wazuh-dashboard:4.14.0
docker run --rm -it wazuh/wazuh-dashboard:4.14.0 bash

# Dentro do container
cat /usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml
# OU
find /usr/share/wazuh-dashboard -name "*.yml" -o -name "*.yaml"
```

#### Método 2: GitHub Source Code
```bash
# Clonar repositório
git clone https://github.com/wazuh/wazuh-dashboard-plugins.git
cd wazuh-dashboard-plugins
git checkout v4.14.0

# Procurar por config samples
find . -name "wazuh.yml*" -o -name "config*.yml"
cat plugins/main/server/routes/wazuh-api-http-status.test.ts
# Procurar estrutura de "hosts" ou "api"
```

#### Método 3: Documentação Oficial
```bash
# Buscar na documentação
https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/
https://documentation.wazuh.com/4.14/
```

#### Método 4: Community/Forum
```bash
# Pesquisar issues relacionadas
https://github.com/wazuh/wazuh/issues?q=wazuh.hosts+4.14
https://groups.google.com/g/wazuh
```

---

### 2. Identificar Mudanças de API

**Verificar**:
- [ ] Endpoint de autenticação mudou?
- [ ] Estrutura de response mudou?
- [ ] Novos headers obrigatórios?
- [ ] Token format mudou?

**Testar com curl**:
```bash
# 4.9.0
curl -u wazuh-wui:Nessnet@10 -X POST https://wazuh.manager:55000/security/user/authenticate --insecure

# 4.14.0
# (verificar se endpoint mudou)
```

---

### 3. Certificados SSL

**Verificar**:
- [ ] Certificados 4.9.0 compatíveis com 4.14?
- [ ] Precisa regenerar certificados?
- [ ] Hostname "wazuh.indexer" vs "demo.indexer" (erro encontrado nos logs)

**Ações**:
```bash
# Verificar certificados atuais
docker exec wazuh-indexer openssl x509 -in /usr/share/wazuh-indexer/certs/indexer.pem -noout -subject -issuer

# Se necessário, regenerar
cd /opt/stack/wazuh-stack
# Usar wazuh-certs-tool
```

---

## 📊 Checklist de Pré-Requisitos

Antes de executar o upgrade em produção:

- [ ] ✅ Backup completo realizado
- [ ] ✅ Staging testado com sucesso
- [ ] ✅ Nova estrutura de `wazuh.yml` identificada
- [ ] ✅ Mudanças de API documentadas
- [ ] ✅ Certificados SSL validados
- [ ] ✅ Janela de manutenção agendada
- [ ] ✅ Usuários notificados (48h antes)
- [ ] ✅ Plano de rollback testado
- [ ] ✅ Time on-call disponível
- [ ] ✅ Monitoramento configurado

---

## 🎯 Critérios de Sucesso

### Upgrade Bem-Sucedido SE:

✅ **Dashboard acessível** (https://wazuh.nsecops.com.br)  
✅ **Login funcional** (admin / Nessnet@10)  
✅ **Agentes conectados** (lista completa)  
✅ **Alertas sendo gerados** (últimas 24h visíveis)  
✅ **Multi-tenancy funcional** (tenant selector visível)  
✅ **Zero erros FATAL** nos logs  
✅ **Indexer com dados intactos** (índices visíveis)  
✅ **n360 health check** (Wazuh: online)  

---

## ⏱️ Timeline Estimada

| Fase | Duração | Dependências |
|------|---------|--------------|
| 0. Pesquisa | 1-2h | - |
| 1. Backup | 30min | - |
| 2. Staging | 2-4h | Fase 0 |
| 3. Config Prep | 1h | Fase 2 |
| 4. Agendamento | 1 dia | - |
| 5. Checklist | 30min | Todas |
| 6. Execução | 1h | Fase 5 |
| 7. Validação | 30min | Fase 6 |
| 8. Rollback (se necessário) | 15min | Fase 1 |
| 9. Documentação | 30min | Fase 6/7 |
| 10. Comunicação | 15min | Fase 9 |

**TOTAL**: 8-12 horas (distribuídas em 2-3 dias)

---

## 🔐 Plano de Contingência

### Cenário 1: Dashboard não sobe

**Sintomas**: Erro "Unknown configuration key"

**Solução**:
1. Verificar logs: `docker logs wazuh-dashboard`
2. Validar `wazuh.yml` (estrutura correta?)
3. Comparar com config padrão 4.14
4. Ajustar e restart
5. Se não resolver em 15 min: **ROLLBACK**

### Cenário 2: Indexer perde dados

**Sintomas**: Índices vazios, erros de query

**Solução**:
1. **ROLLBACK IMEDIATO**
2. Restaurar volume do Indexer
3. Investigar causa
4. Planejar nova tentativa

### Cenário 3: Agentes desconectam

**Sintomas**: Agents = 0 ou "Disconnected"

**Solução**:
1. Verificar Manager logs
2. Verificar conectividade (1514/tcp)
3. Restart agents remotamente
4. Se não resolver: **ROLLBACK**

### Cenário 4: Certificados SSL inválidos

**Sintomas**: "x509: certificate is valid for demo.indexer, not wazuh.indexer"

**Solução**:
1. Regenerar certificados com hostnames corretos
2. Aplicar novos certificados
3. Restart containers
4. Documentar para próxima vez

---

## 📚 Recursos e Referências

### Documentação Oficial

- **Release 4.14**: https://documentation.wazuh.com/current/release-notes/release-4-14-0.html
- **Upgrade Guide**: https://documentation.wazuh.com/current/upgrade-guide/
- **Docker Deployment**: https://documentation.wazuh.com/current/deployment-options/docker/
- **Config Reference**: https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/

### GitHub

- **Wazuh Docker**: https://github.com/wazuh/wazuh-docker
- **Dashboard Plugins**: https://github.com/wazuh/wazuh-dashboard-plugins
- **Issues 4.14**: https://github.com/wazuh/wazuh/issues?q=is%3Aissue+4.14

### Community

- **Google Groups**: https://groups.google.com/g/wazuh
- **Slack**: https://wazuh.com/community/join-us-on-slack/

---

## 🚀 Próximos Passos IMEDIATOS

### 1. Pesquisa (AGORA - 2 horas)

```bash
# Descobrir estrutura correta de wazuh.yml para 4.14
docker pull wazuh/wazuh-dashboard:4.14.0
docker run --rm wazuh/wazuh-dashboard:4.14.0 cat /usr/share/wazuh-dashboard/plugins/wazuh/wazuh.yml 2>/dev/null || echo "Procurar path correto"

# Clonar repo
git clone --depth 1 --branch v4.14.0 https://github.com/wazuh/wazuh-dashboard-plugins.git
cd wazuh-dashboard-plugins
find . -name "*.yml" | grep -i wazuh
```

### 2. Staging Test (AMANHÃ - 4 horas)

- Configurar VM de teste
- Replicar stack 4.9.0
- Executar upgrade
- Documentar passos exatos

### 3. Agendar Produção (PRÓXIMA SEMANA)

- Definir data/hora
- Notificar usuários
- Preparar equipe

---

## ✅ Aprovações Necessárias

- [ ] **Técnica**: DevOps Lead
- [ ] **Gerencial**: CISO/CTO
- [ ] **Operacional**: On-call Team
- [ ] **Usuários**: Notificados e cientes

---

## 📊 KPIs de Sucesso

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Downtime** | < 30 min | < 2h |
| **Data Loss** | 0% | < 1% |
| **Agents Lost** | 0 | < 5% |
| **Rollback Time** | N/A | < 15 min |
| **User Satisfaction** | 90%+ | 70%+ |

---

## 🔄 Iterações

### Tentativa 1 (06/11/2025 - 05:30h)

**Status**: ❌ FALHOU

**Problema**: Dashboard config incompatível

**Lição**: Precisa pesquisar estrutura nova ANTES

**Rollback**: ✅ Executado com sucesso

### Tentativa 2 (A DEFINIR)

**Pré-requisitos**:
- Estrutura `wazuh.yml` correta identificada
- Staging testado
- Config preparada

**Status**: 📋 PLANEJADO

---

**Criado por**: ness. DevOps Team  
**Última Atualização**: 06/11/2025 - 06:00h  
**Status**: ⏳ AGUARDANDO PESQUISA (Fase 0-3)  
**Próximo Step**: Descobrir estrutura de `wazuh.yml` para 4.14.0

