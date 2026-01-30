#!/bin/bash

# Backup Script for Space Strategy Game
# Backs up database and game state

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ENV_FILE="${SCRIPT_DIR}/.env"

# Functions
print_header() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${MAGENTA}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_step() {
    echo -e "\n${CYAN}▶${NC} ${BLUE}$1${NC}"
}

# Load environment variables
load_env() {
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
        print_success "Environment loaded"
    else
        print_warn "No .env file found, using defaults"
    fi
}

# Create backup directory
create_backup_dir() {
    print_step "Preparing backup directory..."
    
    mkdir -p "$BACKUP_DIR"
    
    local backup_name="backup_${TIMESTAMP}"
    local current_backup_dir="${BACKUP_DIR}/${backup_name}"
    
    mkdir -p "$current_backup_dir"
    
    echo "$current_backup_dir"
}

# Check if database is running
check_database() {
    print_step "Checking database status..."
    
    if ! docker-compose ps database | grep -q "Up"; then
        print_error "Database container is not running"
        print_info "Start the database with: ./start.sh"
        exit 1
    fi
    
    print_success "Database is running"
}

# Backup PostgreSQL database
backup_database() {
    local backup_dir="$1"
    
    print_step "Backing up PostgreSQL database..."
    
    local db_name="${DB_NAME:-space_strategy_game}"
    local db_user="${DB_USER:-gameuser}"
    local backup_file="${backup_dir}/database.sql"
    
    print_info "Database: $db_name"
    print_info "Output: $backup_file"
    
    if docker-compose exec -T database pg_dump -U "$db_user" "$db_name" > "$backup_file"; then
        local size=$(du -h "$backup_file" | cut -f1)
        print_success "Database backup complete ($size)"
    else
        print_error "Database backup failed"
        return 1
    fi
}

# Backup Redis data
backup_redis() {
    local backup_dir="$1"
    
    print_step "Backing up Redis data..."
    
    if docker-compose ps redis | grep -q "Up"; then
        # Trigger Redis save
        docker-compose exec -T redis redis-cli -a "${REDIS_PASSWORD:-changeme}" BGSAVE &>/dev/null || true
        
        # Copy Redis dump file
        local redis_dump="${backup_dir}/redis_dump.rdb"
        
        if docker cp $(docker-compose ps -q redis):/data/dump.rdb "$redis_dump" 2>/dev/null; then
            local size=$(du -h "$redis_dump" | cut -f1)
            print_success "Redis backup complete ($size)"
        else
            print_warn "Redis backup skipped (no data or container not accessible)"
        fi
    else
        print_info "Redis not running, skipping"
    fi
}

# Backup application logs
backup_logs() {
    local backup_dir="$1"
    
    print_step "Backing up application logs..."
    
    local logs_backup="${backup_dir}/logs"
    mkdir -p "$logs_backup"
    
    # Copy backend logs
    if [ -d "${SCRIPT_DIR}/backend/logs" ]; then
        cp -r "${SCRIPT_DIR}/backend/logs" "${logs_backup}/backend" 2>/dev/null || true
    fi
    
    # Export container logs
    local containers=$(docker-compose ps -q)
    if [ -n "$containers" ]; then
        for container in $containers; do
            local container_name=$(docker inspect --format='{{.Name}}' "$container" | sed 's/\///')
            docker logs "$container" > "${logs_backup}/${container_name}.log" 2>&1 || true
        done
        print_success "Logs backed up"
    else
        print_info "No containers running, skipping container logs"
    fi
}

# Backup Docker volumes
backup_volumes() {
    local backup_dir="$1"
    
    print_step "Backing up Docker volumes..."
    
    local volumes_backup="${backup_dir}/volumes"
    mkdir -p "$volumes_backup"
    
    # Backup postgres data volume
    local postgres_volume=$(docker volume ls -q | grep postgres_data || true)
    if [ -n "$postgres_volume" ]; then
        print_info "Backing up postgres data volume..."
        docker run --rm \
            -v "$postgres_volume":/data \
            -v "$volumes_backup":/backup \
            alpine tar czf /backup/postgres_data.tar.gz -C /data . 2>/dev/null || true
        
        if [ -f "${volumes_backup}/postgres_data.tar.gz" ]; then
            local size=$(du -h "${volumes_backup}/postgres_data.tar.gz" | cut -f1)
            print_success "Postgres volume backed up ($size)"
        fi
    fi
    
    # Backup app data volume
    local app_data_volume=$(docker volume ls -q | grep app_data || true)
    if [ -n "$app_data_volume" ]; then
        print_info "Backing up app data volume..."
        docker run --rm \
            -v "$app_data_volume":/data \
            -v "$volumes_backup":/backup \
            alpine tar czf /backup/app_data.tar.gz -C /data . 2>/dev/null || true
        
        if [ -f "${volumes_backup}/app_data.tar.gz" ]; then
            local size=$(du -h "${volumes_backup}/app_data.tar.gz" | cut -f1)
            print_success "App data volume backed up ($size)"
        fi
    fi
}

# Create backup metadata
create_metadata() {
    local backup_dir="$1"
    
    print_step "Creating backup metadata..."
    
    local metadata_file="${backup_dir}/backup_info.txt"
    
    {
        echo "Space Strategy Game Backup"
        echo "=========================="
        echo ""
        echo "Backup Date: $(date)"
        echo "Timestamp: $TIMESTAMP"
        echo ""
        echo "Environment:"
        echo "  DB_NAME: ${DB_NAME:-space_strategy_game}"
        echo "  DB_USER: ${DB_USER:-gameuser}"
        echo ""
        echo "Git Info:"
        git log -1 --oneline 2>/dev/null || echo "  Not a git repository"
        echo ""
        echo "Docker Images:"
        docker-compose images 2>/dev/null || echo "  No images found"
        echo ""
        echo "Backup Contents:"
        find "$backup_dir" -type f -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ")"}'
    } > "$metadata_file"
    
    print_success "Metadata created"
}

# Compress backup
compress_backup() {
    local backup_dir="$1"
    
    print_step "Compressing backup..."
    
    local backup_name=$(basename "$backup_dir")
    local archive_file="${BACKUP_DIR}/${backup_name}.tar.gz"
    
    if tar czf "$archive_file" -C "$BACKUP_DIR" "$backup_name"; then
        local size=$(du -h "$archive_file" | cut -f1)
        print_success "Backup compressed: $archive_file ($size)"
        
        # Remove uncompressed backup
        rm -rf "$backup_dir"
        
        echo "$archive_file"
    else
        print_error "Failed to compress backup"
        return 1
    fi
}

# Clean old backups
clean_old_backups() {
    local keep_count="${1:-7}"
    
    print_step "Cleaning old backups (keeping last $keep_count)..."
    
    local backup_count=$(ls -1 "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$keep_count" ]; then
        local to_delete=$((backup_count - keep_count))
        print_info "Removing $to_delete old backup(s)..."
        
        ls -1t "${BACKUP_DIR}"/backup_*.tar.gz | tail -n "$to_delete" | xargs rm -f
        print_success "Old backups cleaned"
    else
        print_info "No old backups to remove"
    fi
}

# List existing backups
list_backups() {
    print_step "Existing backups"
    
    echo ""
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR")" ]; then
        ls -lh "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | awk '{print "  " $9 " - " $5 " - " $6 " " $7 " " $8}' || \
            echo -e "  ${YELLOW}No backups found${NC}"
    else
        echo -e "  ${YELLOW}No backups directory or no backups${NC}"
    fi
    echo ""
}

# Show backup summary
show_summary() {
    local backup_file="$1"
    
    print_header "Backup Complete"
    
    echo -e "  ${GREEN}Backup Location:${NC}  $backup_file"
    echo -e "  ${GREEN}Size:${NC}             $(du -h "$backup_file" | cut -f1)"
    echo ""
    echo -e "  ${CYAN}Restore:${NC}          tar xzf $backup_file -C ."
    echo -e "  ${CYAN}View contents:${NC}    tar tzf $backup_file"
    echo ""
}

# Main function
main() {
    local keep_backups="${1:-7}"
    
    print_header "Space Strategy Game - Backup"
    
    # Load environment
    load_env
    
    # Check database
    check_database
    
    # Create backup directory
    local backup_dir=$(create_backup_dir)
    print_info "Backup directory: $backup_dir"
    
    # Perform backups
    backup_database "$backup_dir"
    backup_redis "$backup_dir"
    backup_logs "$backup_dir"
    backup_volumes "$backup_dir"
    
    # Create metadata
    create_metadata "$backup_dir"
    
    # Compress
    local backup_file=$(compress_backup "$backup_dir")
    
    # Clean old backups
    clean_old_backups "$keep_backups"
    
    # List backups
    list_backups
    
    # Summary
    show_summary "$backup_file"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [KEEP_COUNT]"
        echo ""
        echo "Arguments:"
        echo "  KEEP_COUNT      Number of backups to keep (default: 7)"
        echo ""
        echo "Examples:"
        echo "  $0              # Backup and keep last 7"
        echo "  $0 14           # Backup and keep last 14"
        echo ""
        echo "Backup includes:"
        echo "  - PostgreSQL database dump"
        echo "  - Redis data"
        echo "  - Application logs"
        echo "  - Docker volumes"
        echo "  - Metadata"
        exit 0
        ;;
    *)
        main "${1:-7}"
        ;;
esac
