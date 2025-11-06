# 🔧 Fix: Wazuh Indexer 401 Unauthorized

**Problema**: Wazuh Manager (Filebeat) → Indexer retorna 401  
**Data**: 06/11/2025  
**Status**: Em Diagnóstico

---

## 🎯 SINTOMAS:

```
ERROR [publisher_pipeline_output] Failed to connect to 
backoff(elasticsearch(https://wazuh.indexer:9200)): 401 Unauthorized
```

**Impacto**:
- Dados SCA não sendo indexados
- Dashboard Wazuh sem alertas recentes
- n360 Posture sem dados

---

## 🔍 DIAGNÓSTICO REALIZADO:

### 1. Security Plugin

✅ **securityadmin.sh executado**:
```
✔ Configuration for 'internalusers' created or updated
SUCC: Done with success
```

### 2. Credenciais

✅ **Filebeat config**:
```yaml
username: 'admin'
password: 'Nessnet@10'
```

✅ **Docker env vars**:
```yaml
INDEXER_PASSWORD=Nessnet@10
```

### 3. Indexer Status

⚠️ **Porta 9200**: (verificando...)
⚠️ **Health**: (verificando...)
⚠️ **Authentication**: Falhando

---

## 🔧 SOLUÇÕES POSSÍVEIS:

### Solução 1: Mudar Filebeat para HTTP Basic Auth

Atualmente usa certificados SSL client. Pode simplificar para basic auth.

**Editar**: `/etc/filebeat/filebeat.yml` no Manager

```yaml
output.elasticsearch:
  hosts: ['https://wazuh.indexer:9200']
  username: 'admin'
  password: 'Nessnet@10'
  ssl.verification_mode: 'none'  # ← Simplificar
  # Remover ssl.certificate e ssl.key
```

### Solução 2: Resetar Senha do Admin no Indexer

```bash
# Gerar novo hash
docker exec wazuh-indexer bash -c 'export JAVA_HOME=/usr/share/wazuh-indexer/jdk && /usr/share/wazuh-indexer/plugins/opensearch-security/tools/hash.sh -p Nessnet@10'

# Copiar hash

# Editar internal_users.yml
docker exec -it wazuh-indexer vi /usr/share/wazuh-indexer/opensearch-security/internal_users.yml

# Aplicar
docker exec wazuh-indexer bash -c 'export JAVA_HOME=/usr/share/wazuh-indexer/jdk && /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh ...'
```

### Solução 3: Usar Config Oficial Completa

Regenerar TUDO com wazuh-docker oficial:

```bash
cd /opt/stack/wazuh-official/single-node

# 1. Parar tudo
docker-compose -f docker-compose-custom.yml down -v

# 2. Regenerar certificados
docker-compose -f generate-indexer-certs.yml run --rm generator

# 3. Copiar certificados novos
cp -r config/wazuh_indexer_ssl_certs /opt/stack/wazuh-stack/config/

# 4. Subir novamente
docker-compose -f docker-compose-custom.yml up -d
```

---

## ✅ TESTE RÁPIDO:

Verificar se Indexer aceita conexão sem SSL:

```bash
docker exec wazuh-indexer curl -u admin:Nessnet@10 http://localhost:9200
```

Se funcionar → Problema é nos certificados SSL  
Se falhar → Problema é na senha

---

**Próximo**: Implementar Solução 1 (mais rápido)

