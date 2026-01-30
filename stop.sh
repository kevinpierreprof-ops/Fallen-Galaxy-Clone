#!/bin/bash

# Stop Script for Space Strategy Game
# Gracefully stops all containers

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
DEV_COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.dev.yml"

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

# Check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
}

# Get running containers
get_running_containers() {
    local compose_file="$1"
    docker-compose -f "$compose_file" ps -q 2>/dev/null || echo ""
}

# Stop containers for a specific compose file
stop_containers() {
    local compose_file="$1"
    local mode="$2"
    
    local containers=$(get_running_containers "$compose_file")
    
    if [ -z "$containers" ]; then
        print_info "No $mode containers running"
        return 0
    fi
    
    print_step "Stopping $mode containers..."
    
    # Get container count
    local count=$(echo "$containers" | wc -l)
    print_info "Found $count container(s) to stop"
    
    # Stop containers gracefully
    if docker-compose -f "$compose_file" stop --timeout 30; then
        print_success "$mode containers stopped"
    else
        print_warn "Some containers may not have stopped cleanly"
    fi
    
    # Remove containers
    print_info "Removing $mode containers..."
    if docker-compose -f "$compose_file" down; then
        print_success "$mode containers removed"
    else
        print_warn "Some containers may not have been removed"
    fi
}

# Show container status before stopping
show_status() {
    print_step "Current container status"
    echo ""
    
    local has_containers=false
    
    # Check production
    if [ -n "$(get_running_containers "$COMPOSE_FILE")" ]; then
        echo -e "${GREEN}Production containers:${NC}"
        docker-compose -f "$COMPOSE_FILE" ps
        has_containers=true
    fi
    
    # Check development
    if [ -n "$(get_running_containers "$DEV_COMPOSE_FILE")" ]; then
        if [ "$has_containers" = true ]; then
            echo ""
        fi
        echo -e "${YELLOW}Development containers:${NC}"
        docker-compose -f "$DEV_COMPOSE_FILE" ps
        has_containers=true
    fi
    
    if [ "$has_containers" = false ]; then
        print_info "No containers are currently running"
        echo ""
        exit 0
    fi
    
    echo ""
}

# Confirm stop action
confirm_stop() {
    if [ "$1" = "-f" ] || [ "$1" = "--force" ]; then
        return 0
    fi
    
    read -p "Do you want to stop these containers? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stop cancelled"
        exit 0
    fi
}

# Save game state before stopping (optional)
save_game_state() {
    if [ "$1" = "--save" ]; then
        print_step "Saving game state..."
        
        # Trigger save via API if possible
        if curl -f http://localhost:${API_PORT:-3000}/api/admin/save &> /dev/null; then
            print_success "Game state saved"
        else
            print_warn "Could not save game state via API (may already be stopped)"
        fi
    fi
}

# Verify containers are stopped
verify_stopped() {
    print_step "Verifying containers are stopped..."
    
    local prod_containers=$(get_running_containers "$COMPOSE_FILE")
    local dev_containers=$(get_running_containers "$DEV_COMPOSE_FILE")
    
    if [ -z "$prod_containers" ] && [ -z "$dev_containers" ]; then
        print_success "All containers have been stopped"
    else
        print_warn "Some containers may still be running"
        echo ""
        docker ps | grep space-game || true
    fi
}

# Show summary
show_summary() {
    print_header "Summary"
    
    echo -e "  ${GREEN}✓${NC} All containers stopped"
    echo -e "  ${CYAN}→${NC} Volumes preserved (data intact)"
    echo ""
    echo -e "  ${BLUE}Start again:${NC}     ./start.sh"
    echo -e "  ${BLUE}View backups:${NC}    ls -lh backups/"
    echo -e "  ${BLUE}Clean volumes:${NC}   docker-compose down -v"
    echo ""
}

# Main function
main() {
    local force_flag=""
    local save_flag=""
    
    # Parse arguments
    for arg in "$@"; do
        case $arg in
            -f|--force)
                force_flag="--force"
                ;;
            --save)
                save_flag="--save"
                ;;
        esac
    done
    
    print_header "Space Strategy Game - Stop"
    
    # Pre-flight checks
    check_docker
    
    # Show current status
    show_status
    
    # Confirm
    confirm_stop "$force_flag"
    
    # Save game state if requested
    save_game_state "$save_flag"
    
    # Stop containers
    stop_containers "$COMPOSE_FILE" "production"
    stop_containers "$DEV_COMPOSE_FILE" "development"
    
    # Verify
    verify_stopped
    
    # Summary
    show_summary
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  -f, --force     Don't ask for confirmation"
        echo "  --save          Save game state before stopping"
        echo "  -h, --help      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              # Stop with confirmation"
        echo "  $0 --force      # Stop without confirmation"
        echo "  $0 --save       # Save game state and stop"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
