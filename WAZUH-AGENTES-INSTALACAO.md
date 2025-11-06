# 🔧 Instalação de Agentes Wazuh

**Wazuh Manager**: Configurado e pronto para receber agentes  
**Data**: 05/11/2025

---

## 📋 Informações do Servidor

### Server Address (Endereço do Servidor)

Use **qualquer uma** dessas opções:

#### Opção 1: IP Público (Recomendado)
```
148.230.77.242
```

#### Opção 2: Domínio (Alternativa)
```
wazuh.nsecops.com.br
```

**⚠️ Nota**: O domínio funciona **apenas se** o DNS estiver resolvendo para o IP da VPS.

---

## 🔌 Portas Configuradas

| Porta | Protocolo | Uso | Status |
|-------|-----------|-----|--------|
| **1514** | TCP | Agent Registration | ✅ LISTEN |
| **1515** | TCP | Agent Events/Logs | ✅ LISTEN |
| 514 | TCP/UDP | Syslog (opcional) | ✅ LISTEN |
| 55000 | TCP | Manager API | ✅ LISTEN (interno) |

**Status**: ✅ Portas 1514 e 1515 acessíveis externamente

---

## 📝 Formulário de Instalação

Ao instalar o agente Wazuh, preencha:

### Server address:
```
148.230.77.242
```

### Agent name:
```
[nome-do-endpoint]
```
Exemplo: `server-web-01`, `workstation-ti-05`, `firewall-edge`

### Agent groups (opcional):
```
default
```
Ou criar grupos customizados: `servers`, `workstations`, `network-devices`

### ☑️ Remember server address
✅ **Marque esta opção** para salvar e não precisar digitar novamente

---

## 🖥️ Comandos de Instalação por Sistema

### Linux (Ubuntu/Debian)
```bash
wget https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_4.9.0-1_amd64.deb
sudo WAZUH_MANAGER='148.230.77.242' dpkg -i wazuh-agent_4.9.0-1_amd64.deb
sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```

### Linux (CentOS/RHEL)
```bash
curl -o wazuh-agent-4.9.0-1.x86_64.rpm https://packages.wazuh.com/4.x/yum/wazuh-agent-4.9.0-1.x86_64.rpm
sudo WAZUH_MANAGER='148.230.77.242' rpm -ihv wazuh-agent-4.9.0-1.x86_64.rpm
sudo systemctl daemon-reload
sudo systemctl enable wazuh-agent
sudo systemctl start wazuh-agent
```

### Windows
```powershell
# Download do MSI
Invoke-WebRequest -Uri https://packages.wazuh.com/4.x/windows/wazuh-agent-4.9.0-1.msi -OutFile wazuh-agent.msi

# Instalar via PowerShell (Admin)
msiexec.exe /i wazuh-agent.msi /q WAZUH_MANAGER='148.230.77.242' WAZUH_REGISTRATION_SERVER='148.230.77.242'

# Iniciar serviço
NET START WazuhSvc
```

### macOS
```bash
curl -so wazuh-agent.pkg https://packages.wazuh.com/4.x/macos/wazuh-agent-4.9.0-1.pkg
echo "WAZUH_MANAGER='148.230.77.242'" > /tmp/wazuh_envs
sudo installer -pkg wazuh-agent.pkg -target /
sudo /Library/Ossec/bin/wazuh-control start
```

---

## ✅ Verificar Instalação

### No Endpoint (Agente)
```bash
# Linux
sudo systemctl status wazuh-agent
sudo cat /var/ossec/logs/ossec.log | tail -20

# Windows (PowerShell Admin)
Get-Service WazuhSvc
Get-Content "C:\Program Files (x86)\ossec-agent\ossec.log" -Tail 20
```

### No Manager (VPS)
```bash
ssh root@148.230.77.242
docker exec wazuh-manager /var/ossec/bin/agent_control -l

# Deve mostrar o agente conectado:
# ID: 001, Name: [seu-endpoint], IP: [ip-do-agente], Status: Active
```

### No Dashboard (Web)
1. Acesse: https://wazuh.nsecops.com.br
2. Login: `admin` / `Nessnet@10`
3. Menu: **Agents**
4. Verifique se o agente aparece como **Active**

---

## 🔐 Autenticação de Agentes

O Wazuh usa **registration password** para autenticar novos agentes.

### Verificar Password Atual
```bash
ssh root@148.230.77.242
docker exec wazuh-manager cat /var/ossec/etc/authd.pass
```

### Definir Password (se necessário)
```bash
docker exec wazuh-manager bash -c "echo 'Nessnet@10' > /var/ossec/etc/authd.pass"
docker exec wazuh-manager chown root:wazuh /var/ossec/etc/authd.pass
docker exec wazuh-manager chmod 640 /var/ossec/etc/authd.pass
docker restart wazuh-manager
```

### Usar Password na Instalação
```bash
# Linux
sudo WAZUH_MANAGER='148.230.77.242' WAZUH_REGISTRATION_PASSWORD='Nessnet@10' dpkg -i wazuh-agent.deb

# Windows
msiexec.exe /i wazuh-agent.msi WAZUH_MANAGER='148.230.77.242' WAZUH_REGISTRATION_PASSWORD='Nessnet@10'
```

---

## 🎯 Grupos de Agentes Recomendados

Organize seus agentes por função:

| Grupo | Descrição | Exemplos |
|-------|-----------|----------|
| `servers` | Servidores | Web, DB, App servers |
| `workstations` | Estações de trabalho | Desktop, Laptops |
| `network` | Dispositivos de rede | Firewalls, Switches, Routers |
| `cloud` | Cloud instances | AWS EC2, Azure VM, GCP |
| `containers` | Containers | Docker, Kubernetes |
| `critical` | Ativos críticos | Domain Controllers, Payment systems |

### Criar Grupo (via Dashboard)
1. Management → Groups
2. Add new group
3. Nome: `servers`
4. Salvar

### Atribuir Agente a Grupo (instalação)
```bash
sudo WAZUH_MANAGER='148.230.77.242' WAZUH_AGENT_GROUP='servers' dpkg -i wazuh-agent.deb
```

---

## 📊 Monitoramento

### Dashboard Wazuh
- **Agents Summary**: Quantos agentes ativos/desconectados
- **Agents Status**: Lista de todos os agentes
- **Security Events**: Alertas por agente
- **Vulnerability Detection**: CVEs detectados
- **File Integrity**: Mudanças em arquivos críticos

### n360 Platform (Futuro - Sprint 3)
Quando implementarmos o Wazuh Indexer collector:
- ✅ Alertas centralizados no n360
- ✅ Correlação SOC + NOC
- ✅ Tickets automáticos
- ✅ Dashboard executivo

---

## 🚨 Troubleshooting

### Agente não conecta

**1. Verificar conectividade**
```bash
# Do endpoint, testar conexão
telnet 148.230.77.242 1514
nc -zv 148.230.77.242 1514
```

**2. Verificar firewall**
```bash
# VPS (liberar portas se necessário)
ufw allow 1514/tcp
ufw allow 1515/tcp
```

**3. Verificar logs do agente**
```bash
# Linux
tail -f /var/ossec/logs/ossec.log

# Procurar por:
# - "Connected to the server"
# - "Waiting for server reply"
# - Erros de conexão
```

**4. Verificar Manager**
```bash
ssh root@148.230.77.242
docker logs wazuh-manager -f | grep -i agent
```

---

## 📋 Quick Reference

**Resposta curta**:

```
Server address: 148.230.77.242
```

Ou se preferir domínio:

```
Server address: wazuh.nsecops.com.br
```

**Portas usadas**: 1514 (registration), 1515 (events)  
**Status**: ✅ Prontas para receber agentes  
**Password**: Verificar com comando acima (pode precisar configurar)

---

Quer que eu verifique ou configure a registration password do Wazuh para facilitar a instalação dos agentes?

