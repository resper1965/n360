# 📦 Como Adicionar Módulos ao Wazuh

**Versão**: Wazuh 4.9.0  
**Última Atualização**: 06/11/2025  
**Referências**: [Documentação Oficial Wazuh](https://documentation.wazuh.com/current/user-manual/)

---

## 🎯 3 TIPOS DE MÓDULOS NO WAZUH:

### 1️⃣ **Módulos do Manager** (Backend)
Executam detecções, coletas e análises de segurança

### 2️⃣ **Dashboards/Visualizações** (Frontend)
Interfaces visuais para análise de dados

### 3️⃣ **Integrações** (External)
Conexões com ferramentas externas (Slack, Shuffle, VirusTotal)

---

## 📊 MÓDULOS JÁ DISPONÍVEIS (Pré-instalados):

```
Detecção:
  ✅ File Integrity Monitoring (FIM)
  ✅ Security Configuration Assessment (SCA)
  ✅ Vulnerability Detection
  ✅ Malware Detection
  ✅ Log Analysis
  ✅ Rootkit Detection

Compliance:
  ✅ PCI DSS
  ✅ GDPR
  ✅ HIPAA
  ✅ NIST 800-53
  ✅ CIS Benchmarks
  ✅ TSC SOC2

Cloud:
  ✅ AWS (CloudTrail, GuardDuty, S3)
  ✅ Azure
  ✅ GCP
  ✅ Docker/Kubernetes

Threat Intelligence:
  ✅ MITRE ATT&CK Mapping
  ✅ VirusTotal
  ✅ Custom Threat Feeds
```

**Apenas precisam ser ATIVADOS!**

---

## 🔧 MÉTODO 1: Ativar Módulos via `ossec.conf` (RECOMENDADO)

### Passo a Passo

```bash
# 1. Fazer backup da config
docker exec wazuh-manager cp /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.backup

# 2. Editar configuração
docker exec -it wazuh-manager vi /var/ossec/etc/ossec.conf

# 3. Adicionar módulos (exemplos abaixo)

# 4. Validar configuração
docker exec wazuh-manager /var/ossec/bin/verify-agent-conf

# 5. Reiniciar Manager
docker restart wazuh-manager

# 6. Verificar logs
docker logs wazuh-manager --tail 50 -f
```

---

### Exemplo 1: Ativar Vulnerability Detection

**Adicionar em `ossec.conf`**:

```xml
<vulnerability-detection>
  <enabled>yes</enabled>
  <index-status>yes</index-status>
  <feed-update-interval>60m</feed-update-interval>
  
  <!-- Providers -->
  <provider name="canonical">
    <enabled>yes</enabled>
    <update_interval>1h</update_interval>
  </provider>
  
  <provider name="debian">
    <enabled>yes</enabled>
  </provider>
  
  <provider name="redhat">
    <enabled>yes</enabled>
  </provider>
  
  <provider name="nvd">
    <enabled>yes</enabled>
  </provider>
</vulnerability-detection>
```

**Ver Resultados**: Dashboard → Vulnerability Detection

---

### Exemplo 2: Ativar SCA (CIS Benchmarks)

```xml
<sca>
  <enabled>yes</enabled>
  <scan_on_start>yes</scan_on_start>
  <interval>12h</interval>
  <skip_nfs>yes</skip_nfs>
  
  <policies>
    <policy>/var/ossec/ruleset/sca/cis_debian.yml</policy>
    <policy>/var/ossec/ruleset/sca/cis_ubuntu.yml</policy>
    <policy>/var/ossec/ruleset/sca/cis_docker.yml</policy>
  </policies>
</sca>
```

**Ver Resultados**: Dashboard → Security Configuration Assessment

---

### Exemplo 3: Ativar Docker Monitoring

```xml
<wodle name="docker-listener">
  <disabled>no</disabled>
  <interval>10s</interval>
  <attempts>5</attempts>
  <run_on_start>yes</run_on_start>
</wodle>
```

**Ver Resultados**: Dashboard → Docker → Events

---

### Exemplo 4: Integrar com Shuffle (SOAR)

```xml
<integration>
  <name>custom-shuffle</name>
  <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
  <level>7</level>
  <group>syscheck,vulnerability-detector</group>
  <alert_format>json</alert_format>
</integration>
```

**Como Funciona**:
- Wazuh envia alertas nível ≥7 para Shuffle
- Shuffle processa via workflow
- Pode acionar respostas automatizadas

---

### Exemplo 5: Integrar com VirusTotal

```xml
<integration>
  <name>virustotal</name>
  <api_key>SUA_VIRUSTOTAL_API_KEY_AQUI</api_key>
  <group>syscheck</group>
  <alert_format>json</alert_format>
</integration>
```

**Como Funciona**:
- FIM detecta arquivo novo/modificado
- Wazuh calcula hash
- Envia para VirusTotal
- Gera alerta se malware detectado

**Ver Resultados**: Dashboard → VirusTotal

---

## 🎨 MÉTODO 2: Criar Dashboards Personalizados

### Via Interface Web (Recomendado)

**Baseado em**: [Documentação Oficial](https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/creating-custom-dashboards.html)

```
1. Acessar Dashboard
   https://wazuh.nsecops.com.br
   Login: admin / Nessnet@10

2. Navegar até
   Menu Superior → Explore → Dashboards

3. Criar Novo Dashboard
   Create new dashboard

4. Adicionar Visualizações
   Add an existing
   → Selecionar visualizações prontas
   
   OU
   
   Create new
   → Criar visualização customizada
   
5. Configurar Visualização
   • Tipo: Bar, Pie, Table, Line, etc
   • Data Source: wazuh-alerts-*
   • Query: Filtros OpenSearch
   • Metrics: Contadores, somas, médias
   • Buckets: Agrupamentos

6. Salvar Dashboard
   Save → Nome: "n.secops Custom Dashboard"
```

---

### Exemplo: Dashboard de Alertas Críticos

```
Visualização 1: Alertas por Severidade
  • Tipo: Pie Chart
  • Query: rule.level:>=7
  • Buckets: Terms → rule.level

Visualização 2: Top 10 Regras
  • Tipo: Bar Chart
  • Query: *
  • Buckets: Terms → rule.description (Top 10)

Visualização 3: Timeline de Alertas
  • Tipo: Line Chart
  • Query: *
  • Buckets: Date Histogram → @timestamp

Visualização 4: Agentes com Mais Alertas
  • Tipo: Table
  • Query: *
  • Buckets: Terms → agent.name
  • Metrics: Count
```

---

### Importar Dashboards da Comunidade

```bash
# 1. Baixar dashboards prontos
https://github.com/wazuh/wazuh-dashboard-plugins/tree/v4.9.0/plugins/main/public/templates

# 2. Via Dashboard Web
Stack Management → Saved Objects → Import

# 3. Selecionar arquivo .ndjson
Create new objects with random IDs ✓

# 4. Import
```

---

## 🔌 MÉTODO 3: Integrações com APIs Externas

### Integração com Shuffle (SOAR)

**No Wazuh**:

```xml
<integration>
  <name>custom-shuffle</name>
  <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh-alerts</hook_url>
  <level>7</level>
  <rule_id>510,511,514</rule_id>
  <alert_format>json</alert_format>
</integration>
```

**No Shuffle**:
1. Criar Webhook Trigger
2. URL: `/api/v1/hooks/wazuh-alerts`
3. Processar JSON do Wazuh
4. Criar workflow de resposta

---

### Integração com n360 Platform

**No Wazuh**:

```xml
<integration>
  <name>custom-n360</name>
  <hook_url>https://api.n360.nsecops.com.br/webhooks/wazuh</hook_url>
  <level>5</level>
  <alert_format>json</alert_format>
</integration>
```

**No n360 Backend** (já implementado!):

```javascript
// backend/routes/webhooks.js
app.post('/webhooks/wazuh', async (req, res) => {
  const alert = req.body;
  
  // Salvar no Supabase
  await supabase.from('soc_alerts').insert({
    source: 'wazuh',
    rule_id: alert.rule.id,
    severity: alert.rule.level,
    description: alert.rule.description,
    agent: alert.agent.name,
    data: alert
  });
  
  res.status(200).send('OK');
});
```

---

## 📚 MÓDULOS RECOMENDADOS PARA n.secops:

### ✅ Fase 1: Essenciais (Ativar AGORA)

```xml
<!-- 1. Vulnerability Detection -->
<vulnerability-detection>
  <enabled>yes</enabled>
  <index-status>yes</index-status>
  <feed-update-interval>60m</feed-update-interval>
</vulnerability-detection>

<!-- 2. SCA (CIS Benchmarks) -->
<sca>
  <enabled>yes</enabled>
  <scan_on_start>yes</scan_on_start>
  <interval>12h</interval>
</sca>

<!-- 3. Docker Monitoring -->
<wodle name="docker-listener">
  <disabled>no</disabled>
</wodle>

<!-- 4. FIM (File Integrity) - já ativo por padrão -->

<!-- 5. Integração Shuffle -->
<integration>
  <name>custom-shuffle</name>
  <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
  <level>7</level>
  <alert_format>json</alert_format>
</integration>
```

---

### ⏳ Fase 2: Importantes (Curto Prazo)

```xml
<!-- VirusTotal -->
<integration>
  <name>virustotal</name>
  <api_key>SUA_API_KEY</api_key>
  <group>syscheck</group>
  <alert_format>json</alert_format>
</integration>

<!-- Active Response -->
<active-response>
  <command>firewall-drop</command>
  <location>local</location>
  <rules_id>5710</rules_id>
  <timeout>600</timeout>
</active-response>

<!-- Osquery Integration -->
<wodle name="osquery">
  <disabled>no</disabled>
  <run_daemon>yes</run_daemon>
  <log_path>/var/log/osquery/osqueryd.results.log</log_path>
  <config_path>/etc/osquery/osquery.conf</config_path>
</wodle>
```

---

## 🚀 GUIA PRÁTICO: Ativar Top 5 Módulos

### Script Automático

```bash
#!/bin/bash
# ativar-modulos-wazuh.sh

echo "🔧 Ativando módulos essenciais do Wazuh..."

# 1. Backup
docker exec wazuh-manager cp /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.backup-$(date +%Y%m%d)

# 2. Copiar config
docker cp wazuh-manager:/var/ossec/etc/ossec.conf ./ossec.conf

# 3. Adicionar módulos (antes do </ossec_config>)
cat >> ossec.conf << 'EOF'

  <!-- ========================================== -->
  <!-- Módulos Adicionais n.secops               -->
  <!-- ========================================== -->

  <!-- 1. Vulnerability Detection -->
  <vulnerability-detection>
    <enabled>yes</enabled>
    <index-status>yes</index-status>
    <feed-update-interval>60m</feed-update-interval>
  </vulnerability-detection>

  <!-- 2. Docker Monitoring -->
  <wodle name="docker-listener">
    <disabled>no</disabled>
    <interval>10s</interval>
    <attempts>5</attempts>
    <run_on_start>yes</run_on_start>
  </wodle>

  <!-- 3. Integração Shuffle -->
  <integration>
    <name>custom-shuffle</name>
    <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
  </integration>

  <!-- 4. Integração n360 -->
  <integration>
    <name>custom-n360</name>
    <hook_url>https://api.n360.nsecops.com.br/webhooks/wazuh</hook_url>
    <level>5</level>
    <alert_format>json</alert_format>
  </integration>

</ossec_config>
EOF

# 4. Enviar de volta
docker cp ./ossec.conf wazuh-manager:/var/ossec/etc/ossec.conf

# 5. Reiniciar
docker restart wazuh-manager

echo "✅ Módulos ativados! Aguarde 30s para Manager reiniciar..."
sleep 30

# 6. Verificar
docker logs wazuh-manager --tail 30

echo "✅ Concluído! Acesse: https://wazuh.nsecops.com.br"
```

---

## 📊 CRIAR DASHBOARDS PERSONALIZADOS:

### Via Interface Web

**Baseado em**: [Creating Custom Dashboards](https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/creating-custom-dashboards.html)

```
📍 Passo 1: Acessar
   https://wazuh.nsecops.com.br
   Menu → Explore → Dashboards

📍 Passo 2: Criar Dashboard
   Create new dashboard

📍 Passo 3: Adicionar Visualizações
   
   Opção A: Usar existentes
     • Add an existing
     • Selecionar de biblioteca
   
   Opção B: Criar nova
     • Create new
     • Escolher tipo (Bar, Pie, Table, etc)
     • Configurar query OpenSearch
     
📍 Passo 4: Configurar Visualização

   Data Source: wazuh-alerts-*
   
   Query Examples:
     • Alertas críticos: rule.level:>=10
     • Por agente: agent.name:"servidor-web"
     • Por regra: rule.id:5710
     • MITRE: rule.mitre.id:T1110
   
   Metrics:
     • Count: Contador de eventos
     • Sum: Soma de valores
     • Average: Média
     • Unique Count: Valores únicos
   
   Buckets (Agrupamentos):
     • Terms: Agrupar por campo
     • Date Histogram: Timeline
     • Range: Faixas de valores
     
📍 Passo 5: Salvar
   Save → Nome: "n.secops - Alertas Críticos"
```

---

### Exemplo: Dashboard de Compliance PCI DSS

```
Visualização 1: Score PCI DSS
  • Tipo: Metric
  • Query: rule.pci_dss:*
  • Metric: Unique Count → agent.id

Visualização 2: Requisitos PCI DSS
  • Tipo: Pie Chart
  • Query: rule.pci_dss:*
  • Buckets: Terms → rule.pci_dss (Top 10)

Visualização 3: Timeline de Falhas
  • Tipo: Line Chart
  • Query: rule.level:>=7 AND rule.pci_dss:*
  • Buckets: Date Histogram → @timestamp

Visualização 4: Agentes Não Conformes
  • Tipo: Table
  • Query: rule.pci_dss:*
  • Columns: agent.name, rule.description, rule.pci_dss
```

**Salvar Dashboard**: "PCI DSS Compliance - n.secops"

---

## 🔐 MÓDULOS ESPECÍFICOS PARA n.secops:

### Configuração Completa Recomendada

```xml
<!-- ========================================== -->
<!-- Configuração n.secops - Módulos Ativos    -->
<!-- ========================================== -->

<!-- 1. Vulnerability Detection -->
<vulnerability-detection>
  <enabled>yes</enabled>
  <index-status>yes</index-status>
  <feed-update-interval>60m</feed-update-interval>
  
  <provider name="canonical"><enabled>yes</enabled></provider>
  <provider name="debian"><enabled>yes</enabled></provider>
  <provider name="redhat"><enabled>yes</enabled></provider>
  <provider name="nvd"><enabled>yes</enabled></provider>
</vulnerability-detection>

<!-- 2. Security Configuration Assessment -->
<sca>
  <enabled>yes</enabled>
  <scan_on_start>yes</scan_on_start>
  <interval>12h</interval>
  <skip_nfs>yes</skip_nfs>
</sca>

<!-- 3. Docker Monitoring -->
<wodle name="docker-listener">
  <disabled>no</disabled>
  <interval>10s</interval>
  <attempts>5</attempts>
  <run_on_start>yes</run_on_start>
</wodle>

<!-- 4. Integração Shuffle (SOAR) -->
<integration>
  <name>custom-shuffle</name>
  <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
  <level>7</level>
  <alert_format>json</alert_format>
</integration>

<!-- 5. Integração n360 Platform -->
<integration>
  <name>custom-n360</name>
  <hook_url>https://api.n360.nsecops.com.br/webhooks/wazuh</hook_url>
  <level>5</level>
  <alert_format>json</alert_format>
</integration>

<!-- 6. Active Response -->
<active-response>
  <disabled>no</disabled>
</active-response>

<command>
  <name>firewall-drop</name>
  <executable>firewall-drop</executable>
  <timeout_allowed>yes</timeout_allowed>
</command>

<active-response>
  <command>firewall-drop</command>
  <location>local</location>
  <rules_id>5710,5711,5712</rules_id>
  <timeout>600</timeout>
</active-response>
```

---

## 📁 ESTRUTURA DE ARQUIVOS:

```
/var/ossec/
├── etc/
│   ├── ossec.conf              → Config principal ⭐
│   ├── rules/
│   │   └── local_rules.xml     → Regras customizadas
│   ├── decoders/
│   │   └── local_decoder.xml   → Decoders customizados
│   └── lists/
│       └── custom-list         → Listas (IPs, hashes)
│
├── ruleset/
│   ├── sca/                    → Policies (CIS, PCI, etc)
│   │   ├── cis_debian.yml
│   │   ├── cis_ubuntu.yml
│   │   └── cis_docker.yml
│   ├── rules/                  → Regras oficiais
│   └── decoders/               → Decoders oficiais
│
└── logs/
    ├── ossec.log               → Logs do Manager
    └── alerts/
        └── alerts.json         → Alertas gerados
```

---

## 🔍 VERIFICAR MÓDULOS ATIVOS:

### Via CLI

```bash
# 1. Ver configuração completa
docker exec wazuh-manager cat /var/ossec/etc/ossec.conf

# 2. Ver módulos específicos
docker exec wazuh-manager cat /var/ossec/etc/ossec.conf | grep -A 10 "vulnerability-detection\|sca\|docker-listener\|integration"

# 3. Ver status do Manager
docker exec wazuh-manager /var/ossec/bin/wazuh-control status

# 4. Ver logs de módulos
docker exec wazuh-manager tail -f /var/ossec/logs/ossec.log | grep -i "vulnerability\|sca\|docker\|integration"
```

### Via Dashboard Web

```
Management → Configuration → Edit configuration
```

### Via API

```bash
# Obter token
TOKEN=$(curl -u wazuh-wui:Nessnet@10 -k -X POST \
  "https://wazuh-manager:55000/security/user/authenticate" \
  | jq -r .data.token)

# Ver config de integrações
curl -k -X GET \
  "https://wazuh-manager:55000/manager/configuration?section=integration" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 EXEMPLO COMPLETO: Ativar 5 Módulos Essenciais

### Via Docker (Método Mais Fácil)

```bash
# 1. Conectar no VPS
ssh root@148.230.77.242

# 2. Editar config
cd /opt/stack/wazuh-official/single-node
docker exec -it wazuh-manager vi /var/ossec/etc/ossec.conf

# 3. Adicionar ANTES de </ossec_config>:
```

```xml
  <!-- n.secops - Módulos Ativos -->
  
  <vulnerability-detection>
    <enabled>yes</enabled>
    <index-status>yes</index-status>
    <feed-update-interval>60m</feed-update-interval>
  </vulnerability-detection>

  <sca>
    <enabled>yes</enabled>
    <scan_on_start>yes</scan_on_start>
    <interval>12h</interval>
  </sca>

  <wodle name="docker-listener">
    <disabled>no</disabled>
  </wodle>

  <integration>
    <name>shuffle</name>
    <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
  </integration>

  <integration>
    <name>n360</name>
    <hook_url>https://api.n360.nsecops.com.br/webhooks/wazuh</hook_url>
    <level>5</level>
    <alert_format>json</alert_format>
  </integration>
```

```bash
# 4. Salvar e sair (:wq)

# 5. Reiniciar Manager
docker restart wazuh-manager

# 6. Verificar (aguardar 30s)
sleep 30
docker logs wazuh-manager --tail 50

# 7. Acessar Dashboard
# https://wazuh.nsecops.com.br
# Modules → [Ver novos módulos]
```

---

## 📊 DASHBOARDS RECOMENDADOS:

### 1. Dashboard CISO (Executivo)

```
Visualizações:
  • KPI: Total de Alertas Críticos (level>=10)
  • Pie: Distribuição por MITRE ATT&CK
  • Table: Top 10 Agentes com Alertas
  • Line: Timeline de Severidade
  • Bar: Compliance Score (PCI, GDPR, NIST)
```

### 2. Dashboard SOC (Analista)

```
Visualizações:
  • Table: Últimos Alertas (tempo real)
  • Pie: Distribuição por Categoria
  • Map: Geolocalização de IPs
  • Timeline: Alertas por Hora
  • Heatmap: Atividade por Agente
```

### 3. Dashboard Compliance

```
Visualizações:
  • Gauge: Score PCI DSS
  • Gauge: Score GDPR
  • Gauge: Score NIST
  • Bar: Requisitos Falhando
  • Table: Controles Não Conformes
```

---

## ⚙️ CONFIGURAÇÃO PERSISTENTE (Docker):

### No `docker-compose.yml`

Para garantir que módulos continuem ativos após restart:

```yaml
wazuh.manager:
  volumes:
    # Config customizada
    - ./config/wazuh_manager/ossec.conf:/var/ossec/etc/ossec.conf
    
    # Regras customizadas
    - ./config/wazuh_manager/local_rules.xml:/var/ossec/etc/rules/local_rules.xml
    
    # Decoders customizados
    - ./config/wazuh_manager/local_decoder.xml:/var/ossec/etc/decoders/local_decoder.xml
```

**Criar**:

```bash
# Copiar config atual para persistir
docker cp wazuh-manager:/var/ossec/etc/ossec.conf \
  /opt/stack/wazuh-official/single-node/config/wazuh_manager/ossec.conf

# Adicionar mount no docker-compose.yml

# Restart
docker-compose up -d
```

---

## 🔗 INTEGRAÇÕES COM ECOSSISTEMA n.secops:

### Wazuh → Shuffle → n360

```
1. Wazuh detecta alerta (rule.level >= 7)
   ↓
2. Envia webhook para Shuffle
   POST https://shuffle.nsecops.com.br/api/v1/hooks/wazuh
   ↓
3. Shuffle processa (workflow)
   • Enriquece dados
   • Valida ameaça
   • Decide ação
   ↓
4. Shuffle envia para n360
   POST https://api.n360.nsecops.com.br/api/alerts
   ↓
5. n360 exibe em Dashboard
   https://n360.nsecops.com.br (SOC Alerts)
```

**Configuração Necessária**:

```xml
<!-- No Wazuh -->
<integration>
  <name>shuffle</name>
  <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
  <level>7</level>
  <alert_format>json</alert_format>
</integration>
```

---

## 📚 RECURSOS E DOCUMENTAÇÃO:

### Oficial

- **Capabilities**: https://documentation.wazuh.com/current/user-manual/capabilities/
- **Ruleset**: https://documentation.wazuh.com/current/user-manual/ruleset/
- **API Reference**: https://documentation.wazuh.com/current/user-manual/api/
- **Custom Dashboards**: https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/creating-custom-dashboards.html

### Comunidade

- **GitHub Plugins**: https://github.com/wazuh/wazuh-dashboard-plugins
- **Custom Rules**: https://github.com/wazuh/wazuh-ruleset
- **Blog**: https://wazuh.com/blog/

---

## ⚠️ BOAS PRÁTICAS:

### 1. Sempre Fazer Backup

```bash
docker exec wazuh-manager cp /var/ossec/etc/ossec.conf \
  /var/ossec/etc/ossec.conf.backup-$(date +%Y%m%d)
```

### 2. Validar Antes de Aplicar

```bash
# Verificar sintaxe XML
docker exec wazuh-manager /var/ossec/bin/verify-agent-conf
```

### 3. Monitorar Performance

```bash
# Ver uso de recursos
docker stats wazuh-manager

# Se degradar: desativar módulos pesados
```

### 4. Começar Pequeno

- Ativar 1-2 módulos por vez
- Monitorar impacto
- Validar funcionamento
- Adicionar gradualmente

### 5. Documentar Mudanças

```bash
# Criar changelog
echo "$(date): Ativado Vulnerability Detection" >> /opt/stack/wazuh-stack/CHANGELOG.md
```

---

## 🚀 QUICK START: 3 Módulos Agora Mesmo

```bash
ssh root@148.230.77.242

# Backup
docker exec wazuh-manager cp /var/ossec/etc/ossec.conf /var/ossec/etc/ossec.conf.bkp

# Editar
docker exec -it wazuh-manager vi /var/ossec/etc/ossec.conf

# Adicionar antes de </ossec_config>:
```

```xml
  <!-- Vulnerability Detection -->
  <vulnerability-detection>
    <enabled>yes</enabled>
  </vulnerability-detection>

  <!-- Docker Monitoring -->
  <wodle name="docker-listener">
    <disabled>no</disabled>
  </wodle>

  <!-- Shuffle Integration -->
  <integration>
    <name>shuffle</name>
    <hook_url>https://shuffle.nsecops.com.br/api/v1/hooks/wazuh</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
  </integration>
```

```bash
# Salvar (:wq) e reiniciar
docker restart wazuh-manager

# Aguardar 30s
sleep 30

# Verificar
docker logs wazuh-manager --tail 30

# Acessar Dashboard
# https://wazuh.nsecops.com.br → Modules
```

**Tempo**: 5-10 minutos  
**Resultado**: 3 módulos essenciais ativos! ✅

---

## 📞 PRÓXIMOS PASSOS SUGERIDOS:

### Imediato

- [ ] Ativar Vulnerability Detection
- [ ] Ativar SCA (CIS Benchmarks)
- [ ] Ativar Docker Monitoring
- [ ] Configurar integração Shuffle
- [ ] Criar dashboard "n.secops CISO"

### Curto Prazo

- [ ] Integrar VirusTotal
- [ ] Ativar Active Response
- [ ] Criar regras customizadas
- [ ] Importar dashboards da comunidade

### Médio Prazo

- [ ] Integrar AWS/Azure (se aplicável)
- [ ] Custom Threat Intel Feeds
- [ ] Osquery Integration
- [ ] Compliance Automation

---

**Criado por**: ness. DevOps Team 🔵  
**Wazuh Version**: 4.9.0 LTS  
**Última Atualização**: 06/11/2025
