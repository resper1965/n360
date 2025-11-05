#!/bin/bash

##############################################################################
# n360 Platform - Automated Backup Script
# 
# Descrição: Backup completo do n360 (código, containers, database)
# Autor: ness. DevOps Team
# Data: 06/11/2025
# Versão: 1.0
##############################################################################

set -e  # Exit on error

# ============================================
# CONFIGURAÇÃO
# ============================================

BACKUP_DIR="/opt/stack/n360-platform/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="n360-backup-${TIMESTAMP}"
RETENTION_DAYS=30

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# FUNÇÕES
# ============================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================
# PRÉ-REQUISITOS
# ============================================

log_info "🚀 Iniciando backup do n360 Platform..."
log_info "Timestamp: ${TIMESTAMP}"

# Criar diretório de backups
mkdir -p "${BACKUP_DIR}"
cd "${BACKUP_DIR}"

# ============================================
# 1. BACKUP DO CÓDIGO (Git)
# ============================================

log_info "1️⃣ Backup do código-fonte..."

cd /opt/stack/n360-platform

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current)
log_info "Branch atual: ${CURRENT_BRANCH}"

# Git archive (código limpo, sem node_modules)
git archive --format=tar.gz --prefix=n360-code/ HEAD > \
    "${BACKUP_DIR}/${BACKUP_NAME}-code.tar.gz"

log_info "✅ Código arquivado: ${BACKUP_NAME}-code.tar.gz"

# ============================================
# 2. BACKUP DOS CONTAINERS
# ============================================

log_info "2️⃣ Backup dos containers n360..."

# Parar containers (para consistência)
log_warn "Parando containers temporariamente..."
docker-compose stop n360-backend n360-frontend

# Export containers
docker export n360-backend > "${BACKUP_DIR}/${BACKUP_NAME}-backend-container.tar"
docker export n360-frontend > "${BACKUP_DIR}/${BACKUP_NAME}-frontend-container.tar"

log_info "✅ Containers exportados"

# Reiniciar containers
log_info "Reiniciando containers..."
docker-compose start n360-backend n360-frontend

# Aguardar containers ficarem healthy
sleep 5

# ============================================
# 3. BACKUP DA CONFIGURAÇÃO
# ============================================

log_info "3️⃣ Backup das configurações..."

# Criar diretório temporário
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-config"

# Copiar arquivos de configuração
cp /opt/stack/n360-platform/docker-compose.yml "${BACKUP_DIR}/${BACKUP_NAME}-config/"
cp /opt/stack/n360-platform/backend/.env "${BACKUP_DIR}/${BACKUP_NAME}-config/.env.backend" 2>/dev/null || log_warn ".env não encontrado"
cp -r /opt/stack/n360-platform/.github "${BACKUP_DIR}/${BACKUP_NAME}-config/" 2>/dev/null || true

# Arquivar configurações
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}-config.tar.gz" \
    -C "${BACKUP_DIR}" "${BACKUP_NAME}-config"

# Limpar diretório temporário
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}-config"

log_info "✅ Configurações arquivadas"

# ============================================
# 4. BACKUP DO DATABASE (Supabase)
# ============================================

log_info "4️⃣ Backup do database (Supabase)..."

# Ler SUPABASE_SERVICE_KEY do .env
if [ -f "/opt/stack/n360-platform/backend/.env" ]; then
    source /opt/stack/n360-platform/backend/.env
    
    # Backup via API REST (tabelas principais)
    TABLES=("risks" "controls" "policies" "assets" "incidents" "alerts" "problems" "tickets")
    
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-database"
    
    for table in "${TABLES[@]}"; do
        log_info "Exportando tabela: ${table}"
        curl -s "${SUPABASE_URL}/rest/v1/${table}?select=*" \
            -H "apikey: ${SUPABASE_SERVICE_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
            > "${BACKUP_DIR}/${BACKUP_NAME}-database/${table}.json" 2>/dev/null || log_warn "Tabela ${table} não existe ou erro"
    done
    
    # Arquivar database
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}-database.tar.gz" \
        -C "${BACKUP_DIR}" "${BACKUP_NAME}-database"
    
    # Limpar
    rm -rf "${BACKUP_DIR}/${BACKUP_NAME}-database"
    
    log_info "✅ Database exportado (${#TABLES[@]} tabelas)"
else
    log_warn "⚠️ .env não encontrado, pulando backup de database"
fi

# ============================================
# 5. BACKUP DOS VOLUMES DOCKER
# ============================================

log_info "5️⃣ Backup dos volumes Docker..."

# Listar volumes n360
VOLUMES=$(docker volume ls --filter name=n360 --format "{{.Name}}")

if [ -n "$VOLUMES" ]; then
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}-volumes"
    
    for volume in $VOLUMES; do
        log_info "Exportando volume: ${volume}"
        docker run --rm \
            -v ${volume}:/data \
            -v ${BACKUP_DIR}/${BACKUP_NAME}-volumes:/backup \
            alpine tar -czf /backup/${volume}.tar.gz -C /data . || log_warn "Erro no volume ${volume}"
    done
    
    # Arquivar volumes
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}-volumes.tar.gz" \
        -C "${BACKUP_DIR}" "${BACKUP_NAME}-volumes"
    
    # Limpar
    rm -rf "${BACKUP_DIR}/${BACKUP_NAME}-volumes"
    
    log_info "✅ Volumes exportados"
else
    log_info "Nenhum volume n360 encontrado"
fi

# ============================================
# 6. CRIAR ARCHIVE COMPLETO
# ============================================

log_info "6️⃣ Criando archive completo..."

# Listar arquivos de backup
BACKUP_FILES=(
    "${BACKUP_NAME}-code.tar.gz"
    "${BACKUP_NAME}-backend-container.tar"
    "${BACKUP_NAME}-frontend-container.tar"
    "${BACKUP_NAME}-config.tar.gz"
)

# Adicionar database e volumes se existirem
[ -f "${BACKUP_NAME}-database.tar.gz" ] && BACKUP_FILES+=("${BACKUP_NAME}-database.tar.gz")
[ -f "${BACKUP_NAME}-volumes.tar.gz" ] && BACKUP_FILES+=("${BACKUP_NAME}-volumes.tar.gz")

# Criar archive final
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_FILES[@]}"

# Remover arquivos individuais
for file in "${BACKUP_FILES[@]}"; do
    rm -f "$file"
done

log_info "✅ Archive completo criado: ${BACKUP_NAME}.tar.gz"

# ============================================
# 7. VERIFICAR INTEGRIDADE
# ============================================

log_info "7️⃣ Verificando integridade..."

# Verificar se archive é válido
tar -tzf "${BACKUP_NAME}.tar.gz" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log_info "✅ Integridade verificada"
else
    log_error "❌ Archive corrompido!"
    exit 1
fi

# Tamanho do backup
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
log_info "Tamanho do backup: ${BACKUP_SIZE}"

# ============================================
# 8. LIMPEZA (Retention)
# ============================================

log_info "8️⃣ Limpando backups antigos (>${RETENTION_DAYS} dias)..."

find "${BACKUP_DIR}" -name "n360-backup-*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete

REMAINING_BACKUPS=$(ls -1 "${BACKUP_DIR}"/n360-backup-*.tar.gz 2>/dev/null | wc -l)
log_info "Backups restantes: ${REMAINING_BACKUPS}"

# ============================================
# 9. SUMÁRIO
# ============================================

log_info ""
log_info "╔════════════════════════════════════════╗"
log_info "║  ✅ BACKUP COMPLETO COM SUCESSO!       ║"
log_info "╚════════════════════════════════════════╝"
log_info ""
log_info "📦 Archive: ${BACKUP_NAME}.tar.gz"
log_info "📏 Tamanho: ${BACKUP_SIZE}"
log_info "📂 Localização: ${BACKUP_DIR}"
log_info ""
log_info "Conteúdo do backup:"
log_info "  • Código-fonte (git archive)"
log_info "  • Containers (n360-backend, n360-frontend)"
log_info "  • Configurações (docker-compose, .env)"
log_info "  • Database (tabelas via API)"
log_info "  • Volumes Docker (se existirem)"
log_info ""

# ============================================
# 10. OPCIONAL: Upload para S3/R2
# ============================================

# Descomentar se tiver Cloudflare R2 configurado:
# if [ -n "$R2_ENDPOINT" ]; then
#     log_info "Uploading para R2..."
#     aws s3 cp "${BACKUP_NAME}.tar.gz" \
#         "s3://n360-backups/${BACKUP_NAME}.tar.gz" \
#         --endpoint-url="$R2_ENDPOINT"
#     log_info "✅ Upload para R2 completo"
# fi

log_info "🎉 Backup finalizado!"
exit 0

