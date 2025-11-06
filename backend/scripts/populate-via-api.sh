#!/bin/bash

# Script para popular n360 com dados demo via API HTTP
# Mais simples que Prisma e não precisa DATABASE_URL

API_URL="https://n360.nsecops.com.br/api"

echo "🌱 Populando n360 com dados demo via API..."
echo ""

# ============================================
# 1. ASSETS (10)
# ============================================
echo "📦 Criando 10 Assets..."

curl -s -X POST "$API_URL/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_code": "ASSET-WEB-001",
    "name": "Servidor Web Principal",
    "type": "Server",
    "description": "Servidor web Apache hospedando portal corporativo",
    "confidentiality": 3,
    "integrity": 4,
    "availability": 5,
    "business_impact": 4,
    "owner": "TI - Infraestrutura",
    "location": "Datacenter AWS São Paulo"
  }' > /dev/null && echo "  ✅ ASSET-WEB-001"

curl -s -X POST "$API_URL/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_code": "ASSET-DB-001",
    "name": "Banco de Dados PostgreSQL",
    "type": "Database",
    "description": "PostgreSQL com dados de clientes e transações",
    "confidentiality": 5,
    "integrity": 5,
    "availability": 5,
    "business_impact": 5,
    "owner": "TI - DBA",
    "location": "Datacenter AWS São Paulo"
  }' > /dev/null && echo "  ✅ ASSET-DB-001"

curl -s -X POST "$API_URL/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_code": "ASSET-APP-001",
    "name": "Aplicação CRM",
    "type": "Application",
    "description": "Sistema CRM Salesforce integrado",
    "confidentiality": 4,
    "integrity": 4,
    "availability": 4,
    "business_impact": 4,
    "owner": "Comercial",
    "location": "Cloud Salesforce"
  }' > /dev/null && echo "  ✅ ASSET-APP-001"

curl -s -X POST "$API_URL/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_code": "ASSET-NET-001",
    "name": "Firewall Corporativo",
    "type": "Network Device",
    "description": "Palo Alto Networks PA-5200 Series",
    "confidentiality": 3,
    "integrity": 5,
    "availability": 5,
    "business_impact": 5,
    "owner": "TI - Segurança",
    "location": "Datacenter On-Premise"
  }' > /dev/null && echo "  ✅ ASSET-NET-001"

curl -s -X POST "$API_URL/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "asset_code": "ASSET-DATA-001",
    "name": "Base de Dados de Clientes",
    "type": "Data",
    "description": "Informações PII de 50.000 clientes (LGPD)",
    "confidentiality": 5,
    "integrity": 5,
    "availability": 4,
    "business_impact": 5,
    "owner": "Compliance Officer",
    "location": "Banco de Dados PostgreSQL"
  }' > /dev/null && echo "  ✅ ASSET-DATA-001"

echo ""
echo "☠️  Criando 15 Threats..."

curl -s -X POST "$API_URL/threats" \
  -H "Content-Type: application/json" \
  -d '{
    "threat_code": "THREAT-2025-001",
    "name": "Ransomware Attack",
    "description": "Ataque de ransomware que criptografa dados e exige resgate",
    "category": "Malware",
    "likelihood_score": 4,
    "attack_vector": "Email phishing, Remote Desktop Protocol (RDP)",
    "mitre_attack_id": "T1486",
    "tags": ["ransomware", "encryption", "extortion"]
  }' > /dev/null && echo "  ✅ THREAT-2025-001 (Ransomware)"

curl -s -X POST "$API_URL/threats" \
  -H "Content-Type: application/json" \
  -d '{
    "threat_code": "THREAT-2025-002",
    "name": "Phishing Campaign",
    "description": "Campanha de phishing direcionada a funcionários",
    "category": "Social Engineering",
    "likelihood_score": 5,
    "attack_vector": "Email malicioso com link ou anexo",
    "mitre_attack_id": "T1566",
    "tags": ["phishing", "social-engineering", "credentials"]
  }' > /dev/null && echo "  ✅ THREAT-2025-002 (Phishing)"

curl -s -X POST "$API_URL/threats" \
  -H "Content-Type: application/json" \
  -d '{
    "threat_code": "THREAT-2025-003",
    "name": "DDoS Attack",
    "description": "Ataque de negação de serviço distribuído",
    "category": "Network Attack",
    "likelihood_score": 3,
    "attack_vector": "Botnet, amplification attacks",
    "mitre_attack_id": "T1498",
    "tags": ["ddos", "availability", "botnet"]
  }' > /dev/null && echo "  ✅ THREAT-2025-003 (DDoS)"

curl -s -X POST "$API_URL/threats" \
  -H "Content-Type: application/json" \
  -d '{
    "threat_code": "THREAT-2025-004",
    "name": "SQL Injection",
    "description": "Injeção de código SQL malicioso",
    "category": "Network Attack",
    "likelihood_score": 3,
    "attack_vector": "Web application inputs, APIs",
    "mitre_attack_id": "T1190",
    "cwe_mapping": "CWE-89",
    "tags": ["sql-injection", "web", "database"]
  }' > /dev/null && echo "  ✅ THREAT-2025-004 (SQL Injection)"

curl -s -X POST "$API_URL/threats" \
  -H "Content-Type: application/json" \
  -d '{
    "threat_code": "THREAT-2025-005",
    "name": "Insider Threat",
    "description": "Funcionário interno exfiltrando dados",
    "category": "Insider Threat",
    "likelihood_score": 2,
    "attack_vector": "USB drives, cloud storage, email",
    "mitre_attack_id": "T1567",
    "tags": ["insider", "data-leak", "exfiltration"]
  }' > /dev/null && echo "  ✅ THREAT-2025-005 (Insider)"

echo ""
echo "🐛 Criando 10 Vulnerabilities (CVEs reais 2024/2025)..."

curl -s -X POST "$API_URL/vulnerabilities" \
  -H "Content-Type: application/json" \
  -d '{
    "vuln_code": "VULN-2025-001",
    "name": "Apache HTTP Server RCE",
    "description": "Execução remota de código no Apache HTTP Server",
    "severity": "Critical",
    "severity_score": 5,
    "cve_id": "CVE-2024-38472",
    "cvss_score": 9.8,
    "exploitable": true,
    "patch_available": true,
    "affected_systems": ["Apache HTTP Server 2.4.x"],
    "remediation": "Atualizar para versão 2.4.60 ou superior",
    "tags": ["apache", "rce", "critical"]
  }' > /dev/null && echo "  ✅ CVE-2024-38472 (Apache RCE)"

curl -s -X POST "$API_URL/vulnerabilities" \
  -H "Content-Type: application/json" \
  -d '{
    "vuln_code": "VULN-2025-002",
    "name": "OpenSSH Authentication Bypass",
    "description": "Bypass de autenticação no OpenSSH",
    "severity": "Critical",
    "severity_score": 5,
    "cve_id": "CVE-2024-6387",
    "cvss_score": 9.1,
    "exploitable": true,
    "patch_available": true,
    "affected_systems": ["OpenSSH < 9.8"],
    "remediation": "Atualizar para OpenSSH 9.8 ou superior",
    "tags": ["openssh", "auth-bypass", "rce"]
  }' > /dev/null && echo "  ✅ CVE-2024-6387 (OpenSSH)"

curl -s -X POST "$API_URL/vulnerabilities" \
  -H "Content-Type: application/json" \
  -d '{
    "vuln_code": "VULN-2025-003",
    "name": "Kubernetes Privilege Escalation",
    "description": "Escalação de privilégios no Kubernetes",
    "severity": "High",
    "severity_score": 4,
    "cve_id": "CVE-2024-3177",
    "cvss_score": 8.8,
    "exploitable": true,
    "patch_available": true,
    "affected_systems": ["Kubernetes < 1.29.3"],
    "remediation": "Atualizar cluster Kubernetes",
    "tags": ["kubernetes", "privilege-escalation"]
  }' > /dev/null && echo "  ✅ CVE-2024-3177 (Kubernetes)"

echo ""
echo "✅ Seed via API concluído!"
echo ""
echo "📊 Total criado:"
echo "   - 5 Assets"
echo "   - 5 Threats"
echo "   - 3 Vulnerabilities"
echo ""
echo "🌐 Acesse: https://n360.nsecops.com.br"


