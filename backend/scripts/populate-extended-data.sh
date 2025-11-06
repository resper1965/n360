#!/bin/bash
#
# 📊 Script de População Estendida - n360
# 
# Popula banco de dados com dados realistas para demonstrações
# Total: ~90+ registros
#

set -e

# Configuração
API_URL="${API_URL:-http://localhost:3001/api}"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║              📊 População Estendida - n360 Database                   ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}API URL: ${API_URL}${NC}"
echo ""

# Contador de sucessos
SUCCESS_COUNT=0
TOTAL_COUNT=0

# Função para fazer POST
post_data() {
    local endpoint=$1
    local data=$2
    local desc=$3
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    response=$(curl -s -X POST "${API_URL}${endpoint}" \
        -H "Content-Type: application/json" \
        -d "${data}")
    
    if echo "$response" | grep -q '"id"'; then
        echo -e "  ${GREEN}✅${NC} $desc"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "  ❌ $desc - Erro: $(echo $response | head -c 100)"
    fi
}

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1️⃣  ASSETS (15 registros)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Servidores
post_data "/assets" '{
  "name": "Servidor Web Produção",
  "type": "server",
  "criticality": "high",
  "owner": "TI - Infraestrutura",
  "description": "Apache 2.4 - Site institucional ness.com.br"
}' "Servidor Web Produção"

post_data "/assets" '{
  "name": "Servidor de Banco de Dados",
  "type": "server",
  "criticality": "critical",
  "owner": "TI - Data Team",
  "description": "PostgreSQL 15.4 - Dados clientes e transações"
}' "Servidor Database"

post_data "/assets" '{
  "name": "Servidor de Email",
  "type": "server",
  "criticality": "high",
  "owner": "TI - Comunicações",
  "description": "Postfix + Dovecot - Emails corporativos"
}' "Servidor Email"

post_data "/assets" '{
  "name": "Servidor de Aplicação",
  "type": "server",
  "criticality": "high",
  "owner": "Dev Team",
  "description": "Node.js 18 LTS - APIs e microserviços"
}' "Servidor Aplicação"

# Workstations
post_data "/assets" '{
  "name": "Estação CEO",
  "type": "workstation",
  "criticality": "critical",
  "owner": "Diretoria",
  "description": "Windows 11 Pro - Dados estratégicos e financeiros"
}' "Estação CEO"

post_data "/assets" '{
  "name": "Estação CTO",
  "type": "workstation",
  "criticality": "high",
  "owner": "TI",
  "description": "Ubuntu 24.04 - Desenvolvimento e infraestrutura"
}' "Estação CTO"

post_data "/assets" '{
  "name": "Estação Financeiro",
  "type": "workstation",
  "criticality": "high",
  "owner": "Financeiro",
  "description": "Windows 11 - Sistema ERP e contabilidade"
}' "Estação Financeiro"

# Aplicações
post_data "/assets" '{
  "name": "Sistema ERP",
  "type": "application",
  "criticality": "critical",
  "owner": "TI + Financeiro",
  "description": "ERP Protheus - Gestão completa da empresa"
}' "Sistema ERP"

post_data "/assets" '{
  "name": "Portal do Cliente",
  "type": "application",
  "criticality": "high",
  "owner": "Dev Team",
  "description": "React SPA - Área do cliente com dados pessoais"
}' "Portal Cliente"

post_data "/assets" '{
  "name": "API Gateway",
  "type": "application",
  "criticality": "high",
  "owner": "Dev Team",
  "description": "Kong API Gateway - Roteamento e autenticação APIs"
}' "API Gateway"

# Dados
post_data "/assets" '{
  "name": "Banco de Dados Clientes",
  "type": "data",
  "criticality": "critical",
  "owner": "Data Team",
  "description": "PostgreSQL - Dados pessoais, LGPD sensitive"
}' "DB Clientes"

post_data "/assets" '{
  "name": "Backup Semanal",
  "type": "data",
  "criticality": "high",
  "owner": "TI - Infraestrutura",
  "description": "Veeam Backup - Snapshots semanais, retenção 30 dias"
}' "Backup Semanal"

# Redes
post_data "/assets" '{
  "name": "Firewall Corporativo",
  "type": "network",
  "criticality": "critical",
  "owner": "TI - Segurança",
  "description": "pfSense 2.7 - Perímetro de rede, VPN, IDS/IPS"
}' "Firewall"

post_data "/assets" '{
  "name": "Switch Core",
  "type": "network",
  "criticality": "high",
  "owner": "TI - Infraestrutura",
  "description": "Cisco Catalyst 3850 - Core da rede corporativa"
}' "Switch Core"

post_data "/assets" '{
  "name": "WiFi Corporativo",
  "type": "network",
  "criticality": "medium",
  "owner": "TI - Infraestrutura",
  "description": "Ubiquiti UniFi - Rede wireless escritório (WPA3)"
}' "WiFi Corporativo"

echo ""
echo -e "${GREEN}✅ Assets completos!${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2️⃣  THREATS (20 registros - MITRE ATT&CK)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""

post_data "/threats" '{
  "name": "Phishing - Email Malicioso",
  "category": "Social Engineering",
  "likelihood": "high",
  "mitre_attack_id": "T1566.001",
  "description": "Email spoofing com anexo malicioso ou link phishing"
}' "Phishing Email"

post_data "/threats" '{
  "name": "Ransomware",
  "category": "Malware",
  "likelihood": "medium",
  "mitre_attack_id": "T1486",
  "description": "Criptografia de dados com pedido de resgate (WannaCry, LockBit)"
}' "Ransomware"

post_data "/threats" '{
  "name": "SQL Injection",
  "category": "Exploitation",
  "likelihood": "medium",
  "mitre_attack_id": "T1190",
  "description": "Exploração de vulnerabilidade em formulários web para acesso DB"
}' "SQL Injection"

post_data "/threats" '{
  "name": "Brute Force - SSH",
  "category": "Credential Access",
  "likelihood": "high",
  "mitre_attack_id": "T1110",
  "description": "Tentativas massivas de login SSH com dicionário de senhas"
}' "Brute Force SSH"

post_data "/threats" '{
  "name": "DDoS - Layer 7",
  "category": "Availability",
  "likelihood": "medium",
  "mitre_attack_id": "T1498",
  "description": "Ataque de negação de serviço HTTP flood"
}' "DDoS Layer 7"

post_data "/threats" '{
  "name": "Insider Threat - Exfiltração",
  "category": "Data Exfiltration",
  "likelihood": "low",
  "mitre_attack_id": "T1041",
  "description": "Funcionário malicioso exfiltrando dados sensíveis"
}' "Insider Threat"

post_data "/threats" '{
  "name": "Man-in-the-Middle (MitM)",
  "category": "Interception",
  "likelihood": "low",
  "mitre_attack_id": "T1557",
  "description": "Interceptação de comunicação em rede não criptografada"
}' "MitM"

post_data "/threats" '{
  "name": "Privilege Escalation - Linux",
  "category": "Privilege Escalation",
  "likelihood": "medium",
  "mitre_attack_id": "T1068",
  "description": "Exploração de vulnerabilidade kernel para obter root"
}' "Privilege Escalation"

post_data "/threats" '{
  "name": "Credential Stuffing",
  "category": "Credential Access",
  "likelihood": "high",
  "mitre_attack_id": "T1078",
  "description": "Uso de credenciais vazadas de outros sites"
}' "Credential Stuffing"

post_data "/threats" '{
  "name": "Zero-Day Exploit",
  "category": "Exploitation",
  "likelihood": "low",
  "mitre_attack_id": "T1203",
  "description": "Exploração de vulnerabilidade desconhecida (0-day)"
}' "Zero-Day"

post_data "/threats" '{
  "name": "Supply Chain Attack",
  "category": "Supply Chain",
  "likelihood": "low",
  "mitre_attack_id": "T1195",
  "description": "Compromisso de dependência de software (ex: SolarWinds)"
}' "Supply Chain"

post_data "/threats" '{
  "name": "Crypto Mining Malware",
  "category": "Malware",
  "likelihood": "medium",
  "mitre_attack_id": "T1496",
  "description": "Mineração de criptomoeda usando recursos da empresa"
}' "Crypto Mining"

post_data "/threats" '{
  "name": "DNS Spoofing",
  "category": "Interception",
  "likelihood": "low",
  "mitre_attack_id": "T1557.002",
  "description": "Redirecionamento de tráfego via DNS poisoning"
}' "DNS Spoofing"

post_data "/threats" '{
  "name": "Lateral Movement - SMB",
  "category": "Lateral Movement",
  "likelihood": "medium",
  "mitre_attack_id": "T1021.002",
  "description": "Movimentação lateral na rede usando SMB/Windows Admin Shares"
}' "Lateral Movement"

post_data "/threats" '{
  "name": "Data Destruction",
  "category": "Impact",
  "likelihood": "low",
  "mitre_attack_id": "T1485",
  "description": "Destruição intencional de dados (ex: wiper malware)"
}' "Data Destruction"

post_data "/threats" '{
  "name": "Web Shell - Backdoor",
  "category": "Persistence",
  "likelihood": "medium",
  "mitre_attack_id": "T1505.003",
  "description": "Shell malicioso instalado em servidor web comprometido"
}' "Web Shell"

post_data "/threats" '{
  "name": "Password Spray",
  "category": "Credential Access",
  "likelihood": "high",
  "mitre_attack_id": "T1110.003",
  "description": "Tentativa de senha comum em múltiplas contas"
}' "Password Spray"

post_data "/threats" '{
  "name": "Rootkit",
  "category": "Defense Evasion",
  "likelihood": "low",
  "mitre_attack_id": "T1014",
  "description": "Software malicioso oculto no kernel do SO"
}' "Rootkit"

post_data "/threats" '{
  "name": "Business Email Compromise (BEC)",
  "category": "Social Engineering",
  "likelihood": "medium",
  "mitre_attack_id": "T1534",
  "description": "Spoofing de email executivo para transferências fraudulentas"
}' "BEC"

post_data "/threats" '{
  "name": "Cloud Account Takeover",
  "category": "Cloud",
  "likelihood": "medium",
  "mitre_attack_id": "T1078.004",
  "description": "Compromisso de conta cloud (AWS, Azure, GCP)"
}' "Cloud Takeover"

echo ""
echo -e "${GREEN}✅ Threats completos!${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3️⃣  VULNERABILITIES (25 registros - CVEs reais 2024/2025)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""

# CVEs críticos 2024/2025
post_data "/vulnerabilities" '{
  "name": "Apache HTTP Server - RCE",
  "cve_id": "CVE-2024-38472",
  "cvss_score": 9.1,
  "severity": "critical",
  "affected_systems": "Servidor Web Produção",
  "description": "Remote Code Execution via SSRF no mod_proxy",
  "remediation": "Atualizar para Apache 2.4.60 ou superior"
}' "CVE-2024-38472"

post_data "/vulnerabilities" '{
  "name": "PostgreSQL - Privilege Escalation",
  "cve_id": "CVE-2024-7348",
  "cvss_score": 8.8,
  "severity": "high",
  "affected_systems": "Servidor de Banco de Dados",
  "description": "Escalação de privilégios via extensões maliciosas",
  "remediation": "Atualizar para PostgreSQL 16.4, 15.8, 14.13"
}' "CVE-2024-7348"

post_data "/vulnerabilities" '{
  "name": "OpenSSH - Command Injection",
  "cve_id": "CVE-2024-6387",
  "cvss_score": 8.1,
  "severity": "high",
  "affected_systems": "Todos servidores Linux",
  "description": "RegressiSSHion - Race condition permitindo RCE como root",
  "remediation": "Atualizar OpenSSH para versão 9.8p1+"
}' "CVE-2024-6387"

post_data "/vulnerabilities" '{
  "name": "Linux Kernel - Use After Free",
  "cve_id": "CVE-2024-26925",
  "cvss_score": 7.8,
  "severity": "high",
  "affected_systems": "Servidores Linux (kernel < 6.8.2)",
  "description": "Vulnerabilidade no netfilter permitindo privilege escalation",
  "remediation": "Atualizar kernel para 6.8.2 ou superior"
}' "CVE-2024-26925"

post_data "/vulnerabilities" '{
  "name": "Docker Engine - Container Escape",
  "cve_id": "CVE-2024-21626",
  "cvss_score": 8.6,
  "severity": "high",
  "affected_systems": "Servidor de Aplicação (Docker)",
  "description": "Escape de container via runc exploit",
  "remediation": "Atualizar Docker para 25.0.2+ ou runc 1.1.12+"
}' "CVE-2024-21626"

post_data "/vulnerabilities" '{
  "name": "Node.js - Path Traversal",
  "cve_id": "CVE-2024-27980",
  "cvss_score": 7.5,
  "severity": "high",
  "affected_systems": "APIs Node.js",
  "description": "Bypass de permission model permitindo leitura de arquivos",
  "remediation": "Atualizar Node.js para 20.12.0, 18.20.0 ou 21.7.2"
}' "CVE-2024-27980"

post_data "/vulnerabilities" '{
  "name": "nginx - HTTP Request Smuggling",
  "cve_id": "CVE-2024-7347",
  "cvss_score": 7.3,
  "severity": "high",
  "affected_systems": "Proxies nginx",
  "description": "HTTP smuggling permitindo bypass de security controls",
  "remediation": "Atualizar nginx para 1.27.1+ ou 1.26.2+"
}' "CVE-2024-7347"

post_data "/vulnerabilities" '{
  "name": "Windows - Privilege Escalation",
  "cve_id": "CVE-2024-43572",
  "cvss_score": 7.8,
  "severity": "high",
  "affected_systems": "Todas workstations Windows",
  "description": "Elevação de privilégios via Microsoft Management Console",
  "remediation": "Aplicar patch KB5043083 (Windows Update)"
}' "CVE-2024-43572"

post_data "/vulnerabilities" '{
  "name": "Git - RCE via malicious clone",
  "cve_id": "CVE-2024-32002",
  "cvss_score": 9.0,
  "severity": "critical",
  "affected_systems": "Estações de desenvolvimento",
  "description": "Remote Code Execution ao clonar repositório malicioso",
  "remediation": "Atualizar Git para 2.45.1+, 2.44.1+, ou 2.43.4+"
}' "CVE-2024-32002"

post_data "/vulnerabilities" '{
  "name": "OpenSSL - Denial of Service",
  "cve_id": "CVE-2024-5535",
  "cvss_score": 5.9,
  "severity": "medium",
  "affected_systems": "Todos sistemas com OpenSSL",
  "description": "DoS via SSL_select_next_proto() com buffer overflow",
  "remediation": "Atualizar OpenSSL para 3.0.14, 3.1.6, 3.2.2 ou 3.3.1"
}' "CVE-2024-5535"

# Vulnerabilidades organizacionais (não CVEs)
post_data "/vulnerabilities" '{
  "name": "Senhas Fracas - Funcionários",
  "cve_id": "",
  "cvss_score": 6.5,
  "severity": "medium",
  "affected_systems": "Todos sistemas",
  "description": "Política de senha permite senhas de 6 caracteres sem complexidade",
  "remediation": "Implementar política: min 12 chars, complexidade, rotação 90 dias"
}' "Senhas Fracas"

post_data "/vulnerabilities" '{
  "name": "MFA Não Implementado",
  "cve_id": "",
  "cvss_score": 7.0,
  "severity": "high",
  "affected_systems": "Portal Cliente, VPN",
  "description": "Sistemas críticos sem autenticação multi-fator",
  "remediation": "Implementar MFA com TOTP ou hardware tokens"
}' "Sem MFA"

post_data "/vulnerabilities" '{
  "name": "Backup Sem Criptografia",
  "cve_id": "",
  "cvss_score": 6.0,
  "severity": "medium",
  "affected_systems": "Backup Semanal",
  "description": "Backups armazenados sem criptografia em rest",
  "remediation": "Implementar criptografia AES-256 nos backups"
}' "Backup Sem Crypto"

post_data "/vulnerabilities" '{
  "name": "Logs Não Centralizados",
  "cve_id": "",
  "cvss_score": 4.5,
  "severity": "medium",
  "affected_systems": "50% dos servidores",
  "description": "Logs locais apenas, sem SIEM",
  "remediation": "Integrar todos sistemas ao Wazuh"
}' "Logs Não Centralizados"

post_data "/vulnerabilities" '{
  "name": "Patch Management Irregular",
  "cve_id": "",
  "cvss_score": 7.5,
  "severity": "high",
  "affected_systems": "Workstations",
  "description": "Patches aplicados manualmente, sem SLA definido",
  "remediation": "Implementar WSUS/SCCM com patches automáticos mensais"
}' "Patch Irregular"

post_data "/vulnerabilities" '{
  "name": "Dispositivos IoT Sem Segmentação",
  "cve_id": "",
  "cvss_score": 6.5,
  "severity": "medium",
  "affected_systems": "WiFi Corporativo",
  "description": "Câmeras, impressoras na mesma VLAN que workstations",
  "remediation": "Criar VLAN separada para IoT"
}' "IoT Sem Segmentação"

post_data "/vulnerabilities" '{
  "name": "API Sem Rate Limiting",
  "cve_id": "",
  "cvss_score": 5.5,
  "severity": "medium",
  "affected_systems": "API Gateway",
  "description": "APIs públicas sem proteção contra abuso",
  "remediation": "Implementar rate limiting (100 req/min por IP)"
}' "API Sem Rate Limit"

post_data "/vulnerabilities" '{
  "name": "Dados Sensíveis em Logs",
  "cve_id": "",
  "cvss_score": 6.0,
  "severity": "medium",
  "affected_systems": "Portal Cliente",
  "description": "Logs de aplicação contêm CPF, emails, tokens",
  "remediation": "Sanitizar logs, implementar data masking"
}' "Dados em Logs"

post_data "/vulnerabilities" '{
  "name": "Firewall Rules Permissivas",
  "cve_id": "",
  "cvss_score": 5.0,
  "severity": "medium",
  "affected_systems": "Firewall Corporativo",
  "description": "Regras any-to-any em DMZ, sem least privilege",
  "remediation": "Revisar rules, aplicar whitelist approach"
}' "Firewall Permissivo"

post_data "/vulnerabilities" '{
  "name": "SSL/TLS Versões Antigas",
  "cve_id": "",
  "cvss_score": 6.5,
  "severity": "medium",
  "affected_systems": "Servidor Email",
  "description": "TLS 1.0 e 1.1 ainda habilitados",
  "remediation": "Desabilitar TLS < 1.2, preferir TLS 1.3"
}' "TLS Antigo"

post_data "/vulnerabilities" '{
  "name": "Sem Segregação de Funções",
  "cve_id": "",
  "cvss_score": 5.5,
  "severity": "medium",
  "affected_systems": "Sistema ERP",
  "description": "Usuários com perfis acumulando funções (SoD violation)",
  "remediation": "Implementar matriz de segregação de funções"
}' "Sem SoD"

post_data "/vulnerabilities" '{
  "name": "Código Legado PHP 7.4",
  "cve_id": "",
  "cvss_score": 7.0,
  "severity": "high",
  "affected_systems": "Portal Cliente (módulo antigo)",
  "description": "PHP 7.4 End-of-Life, sem patches de segurança",
  "remediation": "Migrar para PHP 8.2+"
}' "PHP EOL"

post_data "/vulnerabilities" '{
  "name": "Ausência de DLP",
  "cve_id": "",
  "cvss_score": 6.0,
  "severity": "medium",
  "affected_systems": "Email, USB, Cloud",
  "description": "Sem prevenção de perda de dados (DLP)",
  "remediation": "Implementar DLP em email gateway e endpoints"
}' "Sem DLP"

post_data "/vulnerabilities" '{
  "name": "Credenciais Hardcoded",
  "cve_id": "",
  "cvss_score": 8.0,
  "severity": "high",
  "affected_systems": "Scripts de deploy",
  "description": "Senhas hardcoded em scripts bash e Python",
  "remediation": "Migrar para secrets manager (Vault, AWS Secrets)"
}' "Hardcoded Creds"

post_data "/vulnerabilities" '{
  "name": "Desktops Sem Full Disk Encryption",
  "cve_id": "",
  "cvss_score": 6.5,
  "severity": "medium",
  "affected_systems": "70% das workstations",
  "description": "Notebooks corporativos sem criptografia de disco",
  "remediation": "Implementar BitLocker (Windows) ou LUKS (Linux)"
}' "Sem FDE"

echo ""
echo -e "${GREEN}✅ Vulnerabilities completos!${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 RESUMO PARCIAL${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Assets criados: 15"
echo -e "  Threats criados: 20"
echo -e "  Vulnerabilities criados: 25"
echo ""
echo -e "  Total até agora: 60 registros"
echo -e "  Sucesso: ${GREEN}${SUCCESS_COUNT}/${TOTAL_COUNT}${NC}"
echo ""
echo -e "${YELLOW}⏳ Continuando...${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4️⃣  CONTROLS (15 registros - ISO 27001 Annex A)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""

post_data "/controls" '{
  "name": "A.5.1 - Políticas de Segurança",
  "category": "Organizational",
  "implementation_status": "implemented",
  "effectiveness": 85,
  "last_test_date": "2025-10-15",
  "next_test_date": "2026-01-15",
  "description": "Política de Segurança da Informação aprovada e comunicada"
}' "A.5.1 Políticas"

post_data "/controls" '{
  "name": "A.5.15 - Controle de Acesso",
  "category": "Technical",
  "implementation_status": "implemented",
  "effectiveness": 75,
  "last_test_date": "2025-11-01",
  "next_test_date": "2026-02-01",
  "description": "RBAC implementado em todos sistemas críticos"
}' "A.5.15 Controle Acesso"

post_data "/controls" '{
  "name": "A.5.33 - Gestão de Incidentes",
  "category": "Organizational",
  "implementation_status": "implemented",
  "effectiveness": 80,
  "last_test_date": "2025-10-20",
  "next_test_date": "2026-01-20",
  "description": "Procedimento de resposta a incidentes definido e testado"
}' "A.5.33 Incidentes"

post_data "/controls" '{
  "name": "A.8.1 - Inventário de Ativos",
  "category": "Organizational",
  "implementation_status": "implemented",
  "effectiveness": 90,
  "last_test_date": "2025-11-05",
  "next_test_date": "2025-12-05",
  "description": "Inventário mantido em n360, revisão mensal"
}' "A.8.1 Inventário"

post_data "/controls" '{
  "name": "A.8.8 - Gestão de Vulnerabilidades",
  "category": "Technical",
  "implementation_status": "implemented",
  "effectiveness": 70,
  "last_test_date": "2025-10-30",
  "next_test_date": "2026-01-30",
  "description": "Scans mensais com Wazuh, remediation SLA 30 dias"
}' "A.8.8 Vulnerabilidades"

post_data "/controls" '{
  "name": "A.8.10 - Deleção de Informação",
  "category": "Technical",
  "implementation_status": "partially_implemented",
  "effectiveness": 60,
  "last_test_date": "2025-09-15",
  "next_test_date": "2025-12-15",
  "description": "Procedimento de deleção segura (shred, wipe) parcialmente aplicado"
}' "A.8.10 Deleção"

post_data "/controls" '{
  "name": "A.8.23 - Filtragem Web",
  "category": "Technical",
  "implementation_status": "implemented",
  "effectiveness": 85,
  "last_test_date": "2025-10-25",
  "next_test_date": "2026-01-25",
  "description": "Proxy Squid com bloqueio de categorias maliciosas"
}' "A.8.23 Filtragem Web"

post_data "/controls" '{
  "name": "A.8.24 - Criptografia em Trânsito",
  "category": "Technical",
  "implementation_status": "implemented",
  "effectiveness": 95,
  "last_test_date": "2025-11-01",
  "next_test_date": "2026-02-01",
  "description": "TLS 1.2+ obrigatório, certificados Let\'s Encrypt"
}' "A.8.24 Crypto Trânsito"

post_data "/controls" '{
  "name": "A.8.26 - Requisitos de Segurança em Aplicações",
  "category": "Organizational",
  "implementation_status": "partially_implemented",
  "effectiveness": 65,
  "last_test_date": "2025-09-20",
  "next_test_date": "2025-12-20",
  "description": "Checklist de segurança em 60% dos projetos novos"
}' "A.8.26 Seg Apps"

post_data "/controls" '{
  "name": "A.8.31 - Segregação de Ambientes",
  "category": "Technical",
  "implementation_status": "implemented",
  "effectiveness": 90,
  "last_test_date": "2025-10-10",
  "next_test_date": "2026-01-10",
  "description": "Prod/Staging/Dev em VPCs/VLANs separadas"
}' "A.8.31 Segregação"

post_data "/controls" '{
  "name": "A.7.8 - Conscientização em Segurança",
  "category": "Organizational",
  "implementation_status": "implemented",
  "effectiveness": 70,
  "last_test_date": "2025-09-30",
  "next_test_date": "2026-03-30",
  "description": "Treinamento anual obrigatório + simulações phishing trimestrais"
}' "A.7.8 Conscientização"

post_data "/controls" '{
  "name": "A.5.10 - Uso Aceitável",
  "category": "Organizational",
  "implementation_status": "implemented",
  "effectiveness": 80,
  "last_test_date": "2025-10-05",
  "next_test_date": "2026-04-05",
  "description": "Política de uso aceitável assinada por todos funcionários"
}' "A.5.10 Uso Aceitável"

post_data "/controls" '{
  "name": "A.8.9 - Gestão de Configuração",
  "category": "Technical",
  "implementation_status": "partially_implemented",
  "effectiveness": 60,
  "last_test_date": "2025-09-25",
  "next_test_date": "2025-12-25",
  "description": "Baselines documentadas, não automatizadas (sem Ansible/Puppet)"
}' "A.8.9 Config Mgmt"

post_data "/controls" '{
  "name": "A.8.16 - Monitoramento",
  "category": "Technical",
  "implementation_status": "implemented",
  "effectiveness": 90,
  "last_test_date": "2025-11-05",
  "next_test_date": "2025-12-05",
  "description": "Zabbix + Wazuh monitorando 100% dos ativos críticos"
}' "A.8.16 Monitoramento"

post_data "/controls" '{
  "name": "A.8.12 - Prevenção de Data Leakage",
  "category": "Technical",
  "implementation_status": "not_implemented",
  "effectiveness": 30,
  "last_test_date": "",
  "next_test_date": "2026-03-01",
  "description": "DLP não implementado, apenas controles básicos (firewall)"
}' "A.8.12 DLP"

echo ""
echo -e "${GREEN}✅ Controls completos!${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}5️⃣  POLICIES (8 registros)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""

post_data "/policies" '{
  "name": "Política de Segurança da Informação",
  "category": "Security",
  "approval_date": "2025-01-15",
  "review_date": "2026-01-15",
  "approved_by": "CEO + CISO",
  "description": "Política mestre de segurança, revisão anual obrigatória"
}' "PSI"

post_data "/policies" '{
  "name": "Política de Controle de Acesso",
  "category": "Security",
  "approval_date": "2025-02-01",
  "review_date": "2026-02-01",
  "approved_by": "CISO",
  "description": "RBAC, least privilege, segregação de funções"
}' "Controle Acesso"

post_data "/policies" '{
  "name": "Política de Backup e Recuperação",
  "category": "Business Continuity",
  "approval_date": "2025-01-20",
  "review_date": "2026-01-20",
  "approved_by": "CTO + CEO",
  "description": "RPO 24h, RTO 8h, backups diários, testes trimestrais"
}' "Backup"

post_data "/policies" '{
  "name": "Política de Privacidade - LGPD",
  "category": "Privacy",
  "approval_date": "2024-12-01",
  "review_date": "2025-12-01",
  "approved_by": "DPO + Jurídico",
  "description": "Conformidade LGPD, direitos dos titulares, retenção de dados"
}' "LGPD"

post_data "/policies" '{
  "name": "Política de Uso Aceitável",
  "category": "Security",
  "approval_date": "2025-01-10",
  "review_date": "2026-01-10",
  "approved_by": "RH + CISO",
  "description": "Uso de recursos de TI, penalidades por violações"
}' "Uso Aceitável"

post_data "/policies" '{
  "name": "Política de Gestão de Incidentes",
  "category": "Security",
  "approval_date": "2025-03-01",
  "review_date": "2026-03-01",
  "approved_by": "CISO",
  "description": "Classificação, resposta, investigação e lições aprendidas"
}' "Incidentes"

post_data "/policies" '{
  "name": "Política de Desenvolvimento Seguro",
  "category": "Development",
  "approval_date": "2025-04-01",
  "review_date": "2026-04-01",
  "approved_by": "CTO + CISO",
  "description": "SSDLC, code review, SAST/DAST, dependency scanning"
}' "Dev Seguro"

post_data "/policies" '{
  "name": "Política de Classificação da Informação",
  "category": "Security",
  "approval_date": "2025-01-25",
  "review_date": "2026-01-25",
  "approved_by": "CISO + Compliance",
  "description": "4 níveis: Pública, Interna, Confidencial, Restrita"
}' "Classificação Info"

echo ""
echo -e "${GREEN}✅ Policies completos!${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 RESUMO FINAL${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}Assets:${NC}           15"
echo -e "  ${GREEN}Threats:${NC}          20"
echo -e "  ${GREEN}Vulnerabilities:${NC}  25"
echo -e "  ${GREEN}Controls:${NC}         15"
echo -e "  ${GREEN}Policies:${NC}          8"
echo ""
echo -e "  ${BLUE}TOTAL:${NC}            ${GREEN}${SUCCESS_COUNT}/${TOTAL_COUNT} registros criados${NC}"
echo ""
echo -e "${YELLOW}⚠️  NOTA: Risks e Incidents devem ser criados via interface web${NC}"
echo -e "${YELLOW}          pois requerem seleção de relacionamentos (asset_id, threat_id, etc)${NC}"
echo ""
echo ""
echo -e "${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║              ✅ POPULAÇÃO AUTOMÁTICA COMPLETA!                        ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos manuais (via interface web):${NC}"
echo ""
echo -e "  1. ${BLUE}Criar 10-15 Risks:${NC}"
echo -e "     https://n360.nsecops.com.br/grc/risks/new"
echo -e "     • Selecionar Asset + Threat + Vulnerability"
echo -e "     • Risk Engine calcula scores automaticamente"
echo ""
echo -e "  2. ${BLUE}Criar 5-10 Incidents:${NC}"
echo -e "     https://n360.nsecops.com.br/grc/incidents/new"
echo -e "     • Cenários reais de segurança"
echo -e "     • Adicionar ações CAPA (Corrective & Preventive)"
echo ""
echo -e "  3. ${BLUE}Validar dashboards:${NC}"
echo -e "     • Executive: https://n360.nsecops.com.br/executive"
echo -e "     • GRC: https://n360.nsecops.com.br/grc/*"
echo -e "     • SOC: https://n360.nsecops.com.br/soc/alerts"
echo ""
echo ""

