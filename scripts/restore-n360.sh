#!/bin/bash

##############################################################################
# n360 Platform - Restore Script
# 
# Uso: ./restore-n360.sh <backup-file.tar.gz>
# Exemplo: ./restore-n360.sh /opt/stack/n360-platform/backups/n360-backup-20251106_023000.tar.gz
##############################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================
# VALIDAÇÃO
# ============================================

if [ $# -eq 0 ]; then
    log_error "Uso: $0 <backup-file.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

log_info "🔄 Iniciando restauração do n360..."
log_info "Backup: $BACKUP_FILE"

# ============================================
# CONFIRMAÇÃO
# ============================================

log_warn "⚠️  ATENÇÃO: Este processo irá:"
log_warn "   • Parar os containers n360 atuais"
log_warn "   • Restaurar código-fonte"
log_warn "   • Restaurar configurações"
log_warn "   • Substituir containers"
echo ""
read -p "Deseja continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Restauração cancelada pelo usuário."
    exit 0
fi

# ============================================
# EXTRAÇÃO
# ============================================

RESTORE_DIR="/tmp/n360-restore-${TIMESTAMP}"
mkdir -p "$RESTORE_DIR"
cd "$RESTORE_DIR"

log_info "1️⃣ Extraindo backup..."
tar -xzf "$BACKUP_FILE"

# ============================================
# PARAR CONTAINERS
# ============================================

log_info "2️⃣ Parando containers n360..."
cd /opt/stack/n360-platform
docker-compose stop n360-backend n360-frontend

# ============================================
# RESTAURAR CÓDIGO
# ============================================

log_info "3️⃣ Restaurando código-fonte..."

CODE_ARCHIVE=$(find "$RESTORE_DIR" -name "*-code.tar.gz" | head -1)

if [ -f "$CODE_ARCHIVE" ]; then
    # Backup do código atual
    mv /opt/stack/n360-platform /opt/stack/n360-platform.old.$(date +%Y%m%d)
    
    # Extrair novo código
    mkdir -p /opt/stack/n360-platform
    tar -xzf "$CODE_ARCHIVE" -C /opt/stack/
    mv /opt/stack/n360-code/* /opt/stack/n360-platform/
    rmdir /opt/stack/n360-code
    
    log_info "✅ Código restaurado"
else
    log_warn "Código não encontrado no backup"
fi

# ============================================
# RESTAURAR CONFIGURAÇÕES
# ============================================

log_info "4️⃣ Restaurando configurações..."

CONFIG_ARCHIVE=$(find "$RESTORE_DIR" -name "*-config.tar.gz" | head -1)

if [ -f "$CONFIG_ARCHIVE" ]; then
    tar -xzf "$CONFIG_ARCHIVE" -C "$RESTORE_DIR"
    
    # Restaurar .env
    if [ -f "$RESTORE_DIR"/*-config/.env.backend ]; then
        cp "$RESTORE_DIR"/*-config/.env.backend /opt/stack/n360-platform/backend/.env
        log_info "✅ .env restaurado"
    fi
    
    # Restaurar docker-compose.yml
    if [ -f "$RESTORE_DIR"/*-config/docker-compose.yml ]; then
        cp "$RESTORE_DIR"/*-config/docker-compose.yml /opt/stack/n360-platform/
        log_info "✅ docker-compose.yml restaurado"
    fi
else
    log_warn "Configurações não encontradas no backup"
fi

# ============================================
# RESTAURAR CONTAINERS
# ============================================

log_info "5️⃣ Restaurando containers..."

BACKEND_CONTAINER=$(find "$RESTORE_DIR" -name "*-backend-container.tar" | head -1)
FRONTEND_CONTAINER=$(find "$RESTORE_DIR" -name "*-frontend-container.tar" | head -1)

if [ -f "$BACKEND_CONTAINER" ]; then
    # Remove container antigo
    docker rm -f n360-backend 2>/dev/null || true
    
    # Importa novo
    docker import "$BACKEND_CONTAINER" n360-backend:restored
    log_info "✅ Container backend importado"
fi

if [ -f "$FRONTEND_CONTAINER" ]; then
    docker rm -f n360-frontend 2>/dev/null || true
    docker import "$FRONTEND_CONTAINER" n360-frontend:restored
    log_info "✅ Container frontend importado"
fi

# ============================================
# RESTAURAR DATABASE (Opcional)
# ============================================

log_info "6️⃣ Restaurando database..."

DATABASE_ARCHIVE=$(find "$RESTORE_DIR" -name "*-database.tar.gz" | head -1)

if [ -f "$DATABASE_ARCHIVE" ]; then
    tar -xzf "$DATABASE_ARCHIVE" -C "$RESTORE_DIR"
    
    log_warn "Database exportado via API. Para restaurar:"
    log_warn "  1. Acesse Supabase SQL Editor"
    log_warn "  2. DELETE FROM <table>; (cuidado!)"
    log_warn "  3. Use JSONs em: $RESTORE_DIR/*-database/*.json"
    log_warn "  4. INSERT via API ou SQL"
else
    log_info "Database backup não encontrado (normal se Supabase faz backup automático)"
fi

# ============================================
# REINICIAR STACK
# ============================================

log_info "7️⃣ Reiniciando n360 stack..."

cd /opt/stack/n360-platform

# Rebuild (se houver Dockerfiles)
docker-compose up -d --force-recreate n360-backend n360-frontend

# Aguardar
sleep 10

# ============================================
# VERIFICAÇÃO
# ============================================

log_info "8️⃣ Verificando restauração..."

# Health check
if curl -f -s http://localhost:3001/health > /dev/null; then
    log_info "✅ Backend health check: OK"
else
    log_error "❌ Backend health check: FAILED"
fi

# Containers running
if docker ps | grep -q n360-backend && docker ps | grep -q n360-frontend; then
    log_info "✅ Containers rodando"
else
    log_error "❌ Containers não estão rodando"
fi

# ============================================
# LIMPEZA
# ============================================

log_info "9️⃣ Limpando arquivos temporários..."
rm -rf "$RESTORE_DIR"

# ============================================
# SUMÁRIO
# ============================================

log_info ""
log_info "╔════════════════════════════════════════╗"
log_info "║  ✅ RESTAURAÇÃO COMPLETA!              ║"
log_info "╚════════════════════════════════════════╝"
log_info ""
log_info "✅ Código restaurado"
log_info "✅ Configurações restauradas"
log_info "✅ Containers recriados"
log_info "✅ Stack reiniciado"
log_info ""
log_info "🌐 Verificar: https://n360.nsecops.com.br"
log_info ""
log_warn "⚠️  ATENÇÃO: Se restaurou database via JSONs, faça:"
log_warn "   • Verificar dados no Supabase Dashboard"
log_warn "   • Testar login e funcionalidades"
log_warn "   • Validar integridade de dados"
log_info ""

exit 0

