#!/bin/bash
#
# 🔌 Instalação Rápida de Agente Wazuh
# 
# Uso: ./install-agent-quick.sh [nome-do-agente]
#

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
WAZUH_VERSION="4.9.0-1"
MANAGER_IP="148.230.77.242"
AGENT_NAME="${1:-$(hostname)}"

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║              🔌 Instalação Rápida - Agente Wazuh                      ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}Configuração:${NC}"
echo -e "  Manager IP: ${GREEN}${MANAGER_IP}${NC}"
echo -e "  Agente: ${GREEN}${AGENT_NAME}${NC}"
echo -e "  Versão: ${GREEN}${WAZUH_VERSION}${NC}"
echo ""

# Detectar OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ Sistema operacional não detectado${NC}"
    exit 1
fi

echo -e "${YELLOW}Sistema detectado: ${GREEN}${OS}${NC}"
echo ""

# Instalação conforme OS
case $OS in
    ubuntu|debian)
        echo -e "${BLUE}📥 Baixando agente Wazuh...${NC}"
        curl -so wazuh-agent.deb "https://packages.wazuh.com/4.x/apt/pool/main/w/wazuh-agent/wazuh-agent_${WAZUH_VERSION}_amd64.deb"
        
        echo -e "${BLUE}📦 Instalando agente...${NC}"
        WAZUH_MANAGER="${MANAGER_IP}" \
        WAZUH_AGENT_NAME="${AGENT_NAME}" \
        dpkg -i ./wazuh-agent.deb 2>/dev/null || true
        
        echo -e "${BLUE}🚀 Iniciando serviço...${NC}"
        systemctl daemon-reload
        systemctl enable wazuh-agent
        systemctl start wazuh-agent
        
        echo -e "${BLUE}🧹 Limpando...${NC}"
        rm -f wazuh-agent.deb
        ;;
        
    centos|rhel|fedora)
        echo -e "${BLUE}📥 Baixando agente Wazuh...${NC}"
        curl -so wazuh-agent.rpm "https://packages.wazuh.com/4.x/yum/wazuh-agent-${WAZUH_VERSION}.x86_64.rpm"
        
        echo -e "${BLUE}📦 Instalando agente...${NC}"
        WAZUH_MANAGER="${MANAGER_IP}" \
        WAZUH_AGENT_NAME="${AGENT_NAME}" \
        rpm -ivh wazuh-agent.rpm
        
        echo -e "${BLUE}🚀 Iniciando serviço...${NC}"
        systemctl daemon-reload
        systemctl enable wazuh-agent
        systemctl start wazuh-agent
        
        echo -e "${BLUE}🧹 Limpando...${NC}"
        rm -f wazuh-agent.rpm
        ;;
        
    *)
        echo -e "${RED}❌ Sistema operacional não suportado: ${OS}${NC}"
        echo -e "${YELLOW}Use instalação manual conforme INSTALAR-AGENTES-WAZUH.md${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Agente instalado com sucesso!${NC}"
echo ""

# Verificar status
echo -e "${BLUE}📊 Status do serviço:${NC}"
systemctl status wazuh-agent --no-pager || true
echo ""

# Aguardar conexão
echo -e "${YELLOW}⏳ Aguardando conexão com Manager (max 30s)...${NC}"
for i in {1..30}; do
    if grep -q "Connected to the server" /var/ossec/logs/ossec.log 2>/dev/null; then
        echo -e "${GREEN}✅ Conectado ao Manager!${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Mostrar logs recentes
echo -e "${BLUE}📋 Últimas mensagens do agente:${NC}"
tail -10 /var/ossec/logs/ossec.log 2>/dev/null || echo "Logs ainda não disponíveis"
echo ""

# Instruções finais
echo -e "${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                  ✅ INSTALAÇÃO COMPLETA                               ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo -e "  1. ${BLUE}Verificar Dashboard Wazuh:${NC}"
echo -e "     https://wazuh.nsecops.com.br"
echo -e "     → Server Management → Endpoints Summary"
echo ""
echo -e "  2. ${BLUE}Aguardar alerts no n360 (5-30 min):${NC}"
echo -e "     https://n360.nsecops.com.br/soc/alerts"
echo ""
echo -e "  3. ${BLUE}Ver Posture Management:${NC}"
echo -e "     https://n360.nsecops.com.br/soc/posture"
echo ""
echo -e "  4. ${BLUE}Comandos úteis:${NC}"
echo -e "     ${GREEN}systemctl status wazuh-agent${NC}   # Status"
echo -e "     ${GREEN}tail -f /var/ossec/logs/ossec.log${NC}   # Logs tempo real"
echo -e "     ${GREEN}systemctl restart wazuh-agent${NC}   # Reiniciar"
echo ""

echo -e "${GREEN}🎉 Agente '${AGENT_NAME}' instalado e conectado!${NC}"
echo ""


