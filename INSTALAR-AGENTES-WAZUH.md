# 🔌 Instalação de Agentes Wazuh

## 📋 Informações do Manager

```
Manager IP: 148.230.77.242
Manager URL: https://wazuh.nsecops.com.br
Versão: 4.9.0
```

---

## 🐧 Linux (Debian/Ubuntu)

### 1. Download e Instalação

```bash
# Download do agente
curl -so wazuh-agent.deb https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.9.0-1_amd64.deb

# Instalar com configuração do Manager
WAZUH_MANAGER='148.230.77.242' \
WAZUH_AGENT_NAME='$(hostname)' \
dpkg -i ./wazuh-agent.deb

# Iniciar serviço
systemctl daemon-reload
systemctl enable wazuh-agent
systemctl start wazuh-agent
```

### 2. Verificar Status

```bash
# Ver status do agente
systemctl status wazuh-agent

# Ver logs em tempo real
tail -f /var/ossec/logs/ossec.log

# Verificar conexão com Manager
grep "Connected to the server" /var/ossec/logs/ossec.log
```

### 3. Comandos Úteis

```bash
# Reiniciar agente
systemctl restart wazuh-agent

# Parar agente
systemctl stop wazuh-agent

# Ver configuração
cat /var/ossec/etc/ossec.conf

# Ver ID do agente
cat /var/ossec/etc/client.keys
```

---

## 🪟 Windows

### 1. Download e Instalação

**PowerShell (Executar como Administrador):**

```powershell
# Download do instalador
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.9.0-1.msi -OutFile wazuh-agent.msi

# Instalar com configuração
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER='148.230.77.242' WAZUH_AGENT_NAME='WIN-PC01'

# Iniciar serviço
NET START WazuhSvc
```

### 2. Verificar Status

```powershell
# Ver status do serviço
Get-Service WazuhSvc

# Ver logs
Get-Content "C:\Program Files (x86)\ossec-agent\ossec.log" -Tail 50 -Wait
```

### 3. Comandos Úteis

```powershell
# Reiniciar serviço
NET STOP WazuhSvc
NET START WazuhSvc

# Ver configuração
notepad "C:\Program Files (x86)\ossec-agent\ossec.conf"
```

---

## 🍎 macOS

### 1. Download e Instalação

```bash
# Download do agente
curl -so wazuh-agent.pkg https://packages.wazuh.com/4.x/macos/wazuh-agent-4.9.0-1.pkg

# Extrair e configurar
echo "WAZUH_MANAGER='148.230.77.242'" > /tmp/wazuh_envs
installer -pkg wazuh-agent.pkg -target /

# Iniciar serviço
/Library/Ossec/bin/wazuh-control start
```

### 2. Verificar Status

```bash
# Ver status
/Library/Ossec/bin/wazuh-control status

# Ver logs
tail -f /Library/Ossec/logs/ossec.log
```

---

## 🎯 Validação da Instalação

### 1. No Agente (qualquer OS)

**Mensagens de sucesso esperadas:**

```
INFO: Connected to the server (148.230.77.242:1514/tcp)
INFO: (agent) connected to server [148.230.77.242:1514]
```

### 2. No Manager (VPS)

```bash
# SSH na VPS
ssh root@148.230.77.242

# Entrar no container do Manager
docker exec -it wazuh-manager bash

# Listar agentes conectados
/var/ossec/bin/agent_control -l

# Ver status de agente específico
/var/ossec/bin/agent_control -i <AGENT_ID>
```

### 3. No Dashboard Wazuh

1. Acesse: https://wazuh.nsecops.com.br
2. Login: `admin` / `Nessnet@10`
3. Menu: **Server Management** → **Endpoints Summary**
4. Verifique agentes **Active**

### 4. No n360 (5-30 minutos após instalação)

1. Acesse: https://n360.nsecops.com.br/soc/alerts
2. Veja alerts chegando em tempo real
3. Acesse: https://n360.nsecops.com.br/soc/posture
4. Veja SCA scores dos agentes

---

## 📊 Dados Esperados no n360

### Após 5 minutos:
- ✅ Alerts básicos (login, processos, etc)
- ✅ Agent status (active/disconnected)

### Após 30 minutos:
- ✅ SCA scans completos (Posture Management)
- ✅ Vulnerability detection
- ✅ File Integrity Monitoring (FIM)

### Após 1 hora:
- ✅ Incident auto-creation (se houver alerts críticos)
- ✅ Compliance scores (CIS, PCI-DSS, etc)
- ✅ Threat detection patterns

---

## 🔥 Testes Rápidos (Gerar Alerts)

### Linux - Testar Detecção

```bash
# Teste 1: Failed SSH login (gera alert de brute force)
ssh usuario_inexistente@localhost

# Teste 2: Sudo command (gera audit alert)
sudo ls /root

# Teste 3: Modificar arquivo monitorado
echo "test" >> /etc/hosts

# Teste 4: Scan de portas (gera alert de network scan)
nmap localhost
```

### Windows - Testar Detecção

```powershell
# Teste 1: Failed login attempt
runas /user:usuarioinexistente cmd

# Teste 2: PowerShell execution policy
Get-ExecutionPolicy

# Teste 3: Modificar Registry
reg add HKCU\Software\Test /v TestValue /t REG_SZ /d TestData

# Teste 4: Download suspeito
Invoke-WebRequest -Uri http://example.com/test
```

**Aguarde 1-5 minutos** → Alerts aparecem no n360!

---

## 🎯 Sugestão de Agentes (Ordem de Prioridade)

### 1. VPS (própria) ⭐⭐⭐
```bash
# Instalar agente na própria VPS 148.230.77.242
# Monitora Docker, Traefik, n360, Wazuh, etc
curl -so wazuh-agent.deb https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.9.0-1_amd64.deb
WAZUH_MANAGER='127.0.0.1' WAZUH_AGENT_NAME='vps-nsecops' dpkg -i ./wazuh-agent.deb
systemctl enable wazuh-agent && systemctl start wazuh-agent
```

### 2. Sua Workstation Linux/Windows ⭐⭐⭐
- Gera muitos eventos (navegação, apps, etc)
- Testa detecção de ameaças reais

### 3. Servidor de Desenvolvimento ⭐⭐
- Web server (Apache, nginx)
- Database server
- Application server

### 4. Outros (Opcional) ⭐
- Raspberry Pi
- VM de testes
- Container específico

---

## 🚨 Troubleshooting

### Agente não conecta

```bash
# 1. Verificar firewall
# No Manager (VPS), portas abertas:
# 1514/tcp (agent enrollment)
# 1515/tcp (agent events)

# 2. Verificar Manager IP no agente
grep "<address>" /var/ossec/etc/ossec.conf
# Deve mostrar: <address>148.230.77.242</address>

# 3. Forçar reconnect
systemctl restart wazuh-agent
```

### Agente conectado mas sem dados

```bash
# 1. Verificar logs do agente
tail -f /var/ossec/logs/ossec.log

# 2. Verificar se Manager recebeu registro
# No Manager:
docker exec -it wazuh-manager /var/ossec/bin/agent_control -l

# 3. Forçar SCA scan
# No agente:
/var/ossec/bin/wazuh-control restart
```

### Alerts não aparecem no n360

```bash
# 1. Verificar connector OpenSearch
# No n360:
curl http://localhost:3001/api/wazuh-alerts/health

# 2. Verificar Indexer tem dados
ssh root@148.230.77.242
docker exec -it wazuh-indexer bash
curl -k -u admin:Nessnet@10 https://localhost:9200/_cat/indices?v

# Deve mostrar índices wazuh-alerts-*
```

---

## ✅ Checklist Completo

- [ ] Agente instalado
- [ ] Serviço rodando (`systemctl status wazuh-agent`)
- [ ] Conectado ao Manager (logs mostram "Connected")
- [ ] Aparece no Dashboard Wazuh (Endpoints Summary)
- [ ] Alerts aparecem em `/soc/alerts` (após 5-30 min)
- [ ] SCA scores aparecem em `/soc/posture` (após 30 min)
- [ ] Incidents auto-criados (se houver critical alerts)

---

## 🎉 Resultado Esperado

Após **30 minutos** com **3 agentes** conectados:

- **n360 SOC**: 50-200 alerts/dia
- **n360 Posture**: 3 agentes com SCA scores
- **n360 GRC**: 2-5 incidents auto-criados
- **Executive Dashboard**: Métricas reais
- **Demo**: Sistema 100% funcional! 🚀

---

**Desenvolvido por: ness. 🔵**  
**Projeto: n360 - Security Operations Center**  
**Data: 06/11/2025**


