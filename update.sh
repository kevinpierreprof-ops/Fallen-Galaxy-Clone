#!/bin/bash

# Update Script for Space Strategy Game
# Pulls latest code, rebuilds, and restarts with zero downtime

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
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
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

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_success "Prerequisites OK"
}

# Check if services are running
check_running() {
    local containers=$(docker-compose -f "$COMPOSE_FILE" ps -q)
    
    if [ -z "$containers" ]; then
        print_error "No containers are running"
        print_info "Start services with: ./start.sh"
        exit 1
    fi
    
    print_success "Services are running"
}

# Create backup before update
create_backup() {
    print_step "Creating backup before update..."
    
    if [ -f "${SCRIPT_DIR}/backup.sh" ]; then
        if bash "${SCRIPT_DIR}/backup.sh" 1 &> /dev/null; then
            print_success "Backup created"
        else
            print_warn "Backup failed, but continuing with update"
        fi
    else
        print_warn "Backup script not found, skipping backup"
    fi
}

# Check for uncommitted changes
check_git_status() {
    print_step "Checking git status..."
    
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warn "You have uncommitted changes"
        git status --short
        echo ""
        
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Update cancelled"
            exit 1
        fi
    else
        print_success "Working directory clean"
    fi
}

# Get current version
get_current_version() {
    git describe --tags --always 2>/dev/null || git rev-parse --short HEAD 2>/dev/null || echo "unknown"
}

# Pull latest code
pull_code() {
    print_step "Pulling latest code..."
    
    local current_version=$(get_current_version)
    print_info "Current version: $current_version"
    
    if git pull origin main; then
        local new_version=$(get_current_version)
        
        if [ "$current_version" = "$new_version" ]; then
            print_info "Already up to date"
            return 1
        else
            print_success "Updated to version: $new_version"
            return 0
        fi
    else
        print_error "Failed to pull latest code"
        exit 1
    fi
}

# Update dependencies
update_dependencies() {
    print_step "Checking for dependency updates..."
    
    local changes_made=false
    
    # Check backend package.json
    if git diff HEAD~1 HEAD --name-only | grep -q "backend/package.json"; then
        print_info "Backend dependencies changed"
        changes_made=true
    fi
    
    # Check frontend package.json
    if git diff HEAD~1 HEAD --name-only | grep -q "frontend/package.json"; then
        print_info "Frontend dependencies changed"
        changes_made=true
    fi
    
    if [ "$changes_made" = true ]; then
        print_warn "Dependencies have changed, full rebuild required"
        return 0
    else
        print_info "No dependency changes detected"
        return 1
    fi
}

# Build new images
build_images() {
    local force_rebuild="${1:-false}"
    
    print_step "Building Docker images..."
    
    if [ "$force_rebuild" = true ]; then
        print_info "Force rebuilding all images..."
        if docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel; then
            print_success "Images built successfully"
        else
            print_error "Failed to build images"
            exit 1
        fi
    else
        print_info "Building updated images..."
        if docker-compose -f "$COMPOSE_FILE" build --parallel; then
            print_success "Images built successfully"
        else
            print_error "Failed to build images"
            exit 1
        fi
    fi
}

# Perform rolling update (zero downtime)
rolling_update() {
    print_step "Performing rolling update..."
    
    # Scale up new version alongside old
    print_info "Starting new containers..."
    if docker-compose -f "$COMPOSE_FILE" up -d --no-deps --scale app=2 app 2>/dev/null; then
        print_success "New containers started"
    else
        print_warn "Could not scale, performing standard restart"
        standard_restart
        return
    fi
    
    # Wait for new containers to be healthy
    print_info "Waiting for new containers to be healthy..."
    sleep 10
    
    # Check health
    if curl -f http://localhost/health &> /dev/null; then
        print_success "New containers are healthy"
    else
        print_warn "Health check uncertain, proceeding anyway"
    fi
    
    # Scale down to remove old containers
    print_info "Removing old containers..."
    docker-compose -f "$COMPOSE_FILE" up -d --no-deps --scale app=1 app
    
    print_success "Rolling update complete"
}

# Standard restart (brief downtime)
standard_restart() {
    print_step "Restarting services..."
    
    if docker-compose -f "$COMPOSE_FILE" up -d; then
        print_success "Services restarted"
    else
        print_error "Failed to restart services"
        exit 1
    fi
    
    # Wait for health check
    print_info "Waiting for services to be ready..."
    sleep 5
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost/health &> /dev/null; then
            print_success "Services are healthy"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    print_warn "Health check timeout, services may still be starting"
}

# Clean up old images
cleanup_images() {
    print_step "Cleaning up old Docker images..."
    
    local old_images=$(docker images -f "dangling=true" -q | grep space-game || true)
    
    if [ -n "$old_images" ]; then
        print_info "Removing dangling images..."
        docker rmi $old_images 2>/dev/null || true
        print_success "Old images removed"
    else
        print_info "No old images to remove"
    fi
}

# Verify update success
verify_update() {
    print_step "Verifying update..."
    
    # Check all containers are running
    local expected_containers=$(docker-compose -f "$COMPOSE_FILE" config --services | wc -l)
    local running_containers=$(docker-compose -f "$COMPOSE_FILE" ps -q | wc -l)
    
    if [ "$running_containers" -eq "$expected_containers" ]; then
        print_success "All containers are running"
    else
        print_warn "Not all containers are running ($running_containers/$expected_containers)"
    fi
    
    # Check application health
    if curl -f http://localhost/health &> /dev/null; then
        print_success "Application is healthy"
    else
        print_warn "Application health check failed"
        print_info "Check logs with: ./logs.sh"
    fi
}

# Show update summary
show_summary() {
    local old_version="$1"
    local new_version="$2"
    
    print_header "Update Complete"
    
    echo -e "  ${GREEN}Previous version:${NC}  $old_version"
    echo -e "  ${GREEN}Current version:${NC}   $new_version"
    echo ""
    echo -e "  ${CYAN}View logs:${NC}         ./logs.sh"
    echo -e "  ${CYAN}Check status:${NC}      docker-compose ps"
    echo -e "  ${CYAN}Rollback:${NC}          git checkout $old_version && ./update.sh"
    echo ""
}

# Main function
main() {
    local force_rebuild=false
    local skip_backup=false
    local zero_downtime=true
    
    # Parse arguments
    for arg in "$@"; do
        case $arg in
            --force-rebuild)
                force_rebuild=true
                ;;
            --skip-backup)
                skip_backup=true
                ;;
            --no-zero-downtime)
                zero_downtime=false
                ;;
        esac
    done
    
    print_header "Space Strategy Game - Update"
    
    # Pre-flight checks
    check_prerequisites
    check_running
    
    # Get current version
    local old_version=$(get_current_version)
    
    # Backup
    if [ "$skip_backup" = false ]; then
        create_backup
    fi
    
    # Check git status
    check_git_status
    
    # Pull latest code
    if ! pull_code; then
        print_info "No updates available"
        exit 0
    fi
    
    # Check dependencies
    if update_dependencies; then
        force_rebuild=true
    fi
    
    # Build images
    build_images "$force_rebuild"
    
    # Update services
    if [ "$zero_downtime" = true ]; then
        rolling_update
    else
        standard_restart
    fi
    
    # Cleanup
    cleanup_images
    
    # Verify
    verify_update
    
    # Get new version
    local new_version=$(get_current_version)
    
    # Summary
    show_summary "$old_version" "$new_version"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --force-rebuild        Force rebuild all images (ignore cache)"
        echo "  --skip-backup          Skip creating backup before update"
        echo "  --no-zero-downtime     Use standard restart instead of rolling update"
        echo "  -h, --help             Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                     # Standard update with zero downtime"
        echo "  $0 --force-rebuild     # Force rebuild all images"
        echo "  $0 --skip-backup       # Update without creating backup"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
