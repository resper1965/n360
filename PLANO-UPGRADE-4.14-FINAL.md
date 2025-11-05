# 📋 Plano de Upgrade Wazuh 4.14.0 - VERSÃO FINAL

**Data**: 06/11/2025  
**Status**: ✅ PRONTO PARA EXECUÇÃO  
**Base**: [Documentação Oficial Wazuh](https://documentation.wazuh.com/current/deployment-options/docker/upgrading-wazuh-docker.html)

---

## ✅ PROBLEMAS RESOLVIDOS:

### 1. Erro "wazuh.hosts" no Dashboard

**Solução**: Usar variáveis de ambiente em vez de mount de `wazuh.yml`

```yaml
environment:
  - WAZUH_API_URL=https://wazuh.manager
  - API_USERNAME=wazuh-wui
  - API_PASSWORD=Nessnet@10
```

### 2. Volume do Indexer Corrompido

**Causa**: Upgrade/downgrade 4.9→4.14→4.9 corrompeu índices Lucene

**Solução**: Remover volume `wazuh-indexer-data` e recriar

---

## 🎯 PLANO DE EXECUÇÃO (Baseado em Doc Oficial)

### FASE 1: Backup (15 min)

```bash
ssh root@148.230.77.242

cd /opt/stack/wazuh-stack

# Backup completo
./backup-wazuh.sh

# Backup de configs
tar -czf backup-configs-$(date +%Y%m%d).tar.gz config/ docker-compose.yml
```

### FASE 2: Preparação (30 min)

#### 2.1: Update de Configurações

```bash
# 1. Editar defaultRoute (se < 4.8)
nano config/wazuh_dashboard/opensearch_dashboards.yml
# Adicionar:
# uiSettings.overrides.defaultRoute: /app/wz-home

# 2. Já aplicado: paths de certificados (upgrade de 4.4-4.13)
# ✅ /usr/share/wazuh-indexer/certs/ → /usr/share/wazuh-indexer/config/certs/
```

#### 2.2: Regenerar Certificados

```bash
cd /opt/stack/wazuh-stack

# Editar generate-indexer-certs.yml
nano generate-indexer-certs.yml
# Trocar para:
# image: wazuh/wazuh-certs-generator:0.0.2

# Regenerar
docker compose -f generate-indexer-certs.yml run --rm generator
```

#### 2.3: Atualizar docker-compose.yml

```yaml
# Trocar versões 4.9.0 → 4.14.0
wazuh.manager:
  image: wazuh/wazuh-manager:4.14.0

wazuh.indexer:
  image: wazuh/wazuh-indexer:4.14.0

wazuh.dashboard:
  image: wazuh/wazuh-dashboard:4.14.0
```

#### 2.4: Atualizar wazuh_manager.conf

```bash
# Baixar nova versão
curl -o config/wazuh_cluster/wazuh_manager.conf \
  https://raw.githubusercontent.com/wazuh/wazuh-docker/v4.14.0/single-node/config/wazuh_cluster/wazuh_manager.conf
```

### FASE 3: Execução (10 min)

```bash
cd /opt/stack/wazuh-stack

# 1. Parar ambiente
docker compose down

# 2. Remover volume corrompido do Indexer
docker volume rm wazuh-stack_wazuh-indexer-data

# 3. Iniciar nova versão
docker compose up -d

# 4. Aguardar 2-3 minutos
sleep 120

# 5. Verificar
docker ps | grep wazuh
```

### FASE 4: Validação (15 min)

```bash
# 1. Containers rodando?
docker ps --filter name=wazuh

# 2. Dashboard acessível?
curl -I https://wazuh.nsecops.com.br
# Esperado: HTTP/2 200

# 3. Login funcional?
# https://wazuh.nsecops.com.br
# admin / Nessnet@10

# 4. Agentes conectados?
docker exec wazuh-manager /var/ossec/bin/agent_control -l

# 5. n360 online?
curl https://api.n360.nsecops.com.br/health
```

### FASE 5: Rollback (SE NECESSÁRIO)

```bash
# 1. Parar
cd /opt/stack/wazuh-stack
docker compose down

# 2. Restaurar docker-compose.yml
cp docker-compose.yml.4.9.0 docker-compose.yml

# 3. Restaurar configs
tar -xzf backup-configs-YYYYMMDD.tar.gz

# 4. Restaurar volumes (se necessário)
# ./restore-wazuh.sh [arquivo-backup]

# 5. Iniciar 4.9.0
docker compose up -d
```

---

## 📊 CHECKLIST PRÉ-UPGRADE

- [ ] Backup completo executado
- [ ] Backup de configs separado
- [ ] Certificados regenerados (0.0.2)
- [ ] `defaultRoute` atualizado
- [ ] `wazuh_manager.conf` baixado (v4.14.0)
- [ ] `docker-compose.yml` atualizado (4.14.0)
- [ ] Janela de manutenção agendada
- [ ] Usuários notificados
- [ ] Time disponível

---

## ⚠️ AVISOS IMPORTANTES

### Volume do Indexer

**Será RECRIADO do zero!**
- Dados antigos serão perdidos
- Manager vai reenviar alertas
- Aceitável em ambiente POC

### Downtime Esperado

- **Otimista**: 5 minutos
- **Realista**: 10 minutos
- **Pessimista**: 15 minutos (se precisar rollback)

### Compatibilidade

- ✅ Agentes 4.x continuam funcionando
- ✅ n360 não afetado
- ✅ Traefik não afetado

---

## 🎯 CRITÉRIOS DE SUCESSO

✅ Dashboard acessível (https://wazuh.nsecops.com.br)  
✅ Login funcional (admin / Nessnet@10)  
✅ Agentes conectados (lista completa)  
✅ Alertas sendo gerados (últimas 24h)  
✅ n360 health check (Wazuh: online)  
✅ Zero erros FATAL nos logs  

---

## 📞 EXECUTAR QUANDO?

### Opção A: AGORA (10-15 min)

- Ambiente POC
- Sem dados críticos
- Volume já corrompido
- Downtime aceitável

**Comando rápido**:
```bash
cd /opt/stack/wazuh-stack
docker compose down
docker volume rm wazuh-stack_wazuh-indexer-data
# Editar docker-compose.yml (4.9.0 → 4.14.0)
docker compose up -d
```

### Opção B: Planejado (Próxima semana)

- Seguir TODAS as fases (1-5)
- Testar em staging primeiro
- Janela de manutenção formal
- Comunicação aos usuários

**Recomendação**: **Opção A** (volume já está corrompido, nada a perder)

---

**Criado por**: ness. DevOps Team  
**Baseado em**: https://documentation.wazuh.com/current/deployment-options/docker/upgrading-wazuh-docker.html  
**Última Atualização**: 06/11/2025 - 07:15h  
**Status**: ✅ PRONTO PARA EXECUÇÃO

