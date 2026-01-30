#!/bin/bash

# Start Script for Space Strategy Game
# Builds Docker images, starts containers, and shows logs

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
ENV_FILE="${SCRIPT_DIR}/.env"
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

# Check if Docker is installed
check_docker() {
    print_step "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo -e "  ${CYAN}Visit: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        echo -e "  ${CYAN}Visit: https://docs.docker.com/compose/install/${NC}"
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
}

# Check if Docker daemon is running
check_docker_daemon() {
    print_step "Checking Docker daemon..."
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    print_success "Docker daemon is running"
}

# Create .env file if it doesn't exist
setup_env_file() {
    print_step "Checking environment configuration..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "${SCRIPT_DIR}/.env.docker" ]; then
            print_warn ".env file not found. Creating from .env.docker..."
            cp "${SCRIPT_DIR}/.env.docker" "$ENV_FILE"
            print_info "Please review and update .env with your configuration"
            print_warn "Important: Change default passwords before production!"
            echo -e "  ${YELLOW}▶ Edit .env file: nano .env${NC}"
            
            read -p "Continue with default settings? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Setup cancelled. Please configure .env and run again."
                exit 1
            fi
        else
            print_error ".env.docker template not found!"
            exit 1
        fi
    else
        print_success "Environment file found"
    fi
    
    # Source the .env file
    set -a
    source "$ENV_FILE"
    set +a
}

# Determine environment mode
determine_mode() {
    local mode="${1:-prod}"
    
    if [ "$mode" = "dev" ]; then
        COMPOSE_FILE="$DEV_COMPOSE_FILE"
        print_info "Mode: ${YELLOW}Development${NC}"
        return 0
    else
        print_info "Mode: ${GREEN}Production${NC}"
        return 0
    fi
}

# Clean up old containers
cleanup_old_containers() {
    print_step "Cleaning up old containers..."
    
    local stopped_containers=$(docker ps -a -q --filter "status=exited" --filter "name=space-game")
    if [ -n "$stopped_containers" ]; then
        print_info "Removing stopped containers..."
        docker rm $stopped_containers
        print_success "Old containers removed"
    else
        print_info "No stopped containers to remove"
    fi
}

# Build Docker images
build_images() {
    print_step "Building Docker images..."
    
    print_info "This may take several minutes on first build..."
    
    if docker-compose -f "$COMPOSE_FILE" build --parallel; then
        print_success "Images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start containers
start_containers() {
    print_step "Starting containers..."
    
    if docker-compose -f "$COMPOSE_FILE" up -d; then
        print_success "Containers started"
    else
        print_error "Failed to start containers"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_health() {
    print_step "Waiting for services to be healthy..."
    
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        
        # Check if all containers are running
        local running_containers=$(docker-compose -f "$COMPOSE_FILE" ps -q | wc -l)
        local total_containers=$(docker-compose -f "$COMPOSE_FILE" config --services | wc -l)
        
        if [ "$running_containers" -eq "$total_containers" ]; then
            print_success "All containers are running"
            
            # Check health endpoint if in production
            if [ "$COMPOSE_FILE" = "${SCRIPT_DIR}/docker-compose.yml" ]; then
                sleep 5
                if curl -f http://localhost/health &> /dev/null || curl -f http://localhost:${APP_PORT:-80}/health &> /dev/null; then
                    print_success "Application is healthy"
                    return 0
                fi
            else
                return 0
            fi
        fi
        
        echo -ne "\r${BLUE}[INFO]${NC} Waiting for services... ($attempt/$max_attempts)"
        sleep 2
    done
    
    echo ""
    print_warn "Health check timed out, but services may still be starting"
    print_info "Check logs with: ./logs.sh"
}

# Display service information
show_services() {
    print_step "Service Information"
    
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
}

# Display access URLs
show_urls() {
    print_header "Access URLs"
    
    if [ "$COMPOSE_FILE" = "$DEV_COMPOSE_FILE" ]; then
        echo -e "  ${GREEN}Frontend (Dev):${NC}   http://localhost:5173"
        echo -e "  ${GREEN}Backend API:${NC}      http://localhost:3000"
        echo -e "  ${GREEN}Database:${NC}         localhost:5432"
        echo -e "  ${GREEN}Redis:${NC}            localhost:6379"
        echo -e "  ${GREEN}PgAdmin:${NC}          http://localhost:5050"
    else
        echo -e "  ${GREEN}Application:${NC}      http://localhost:${APP_PORT:-80}"
        echo -e "  ${GREEN}Health Check:${NC}     http://localhost:${APP_PORT:-80}/health"
        echo -e "  ${GREEN}Backend API:${NC}      http://localhost:${API_PORT:-3000}"
    fi
    echo ""
}

# Show next steps
show_next_steps() {
    print_header "Next Steps"
    
    echo -e "  ${CYAN}View logs:${NC}        ./logs.sh"
    echo -e "  ${CYAN}Stop services:${NC}    ./stop.sh"
    echo -e "  ${CYAN}Backup data:${NC}      ./backup.sh"
    echo -e "  ${CYAN}Update app:${NC}       ./update.sh"
    echo ""
    
    if [ "$COMPOSE_FILE" = "${SCRIPT_DIR}/docker-compose.yml" ]; then
        echo -e "  ${YELLOW}⚠ Remember to change default passwords in production!${NC}"
        echo ""
    fi
}

# Show logs
show_logs() {
    print_step "Following logs (Ctrl+C to exit)..."
    echo ""
    
    docker-compose -f "$COMPOSE_FILE" logs -f --tail=50
}

# Main function
main() {
    local mode="${1:-prod}"
    local skip_logs="${2:-}"
    
    print_header "Space Strategy Game - Start"
    
    # Pre-flight checks
    check_docker
    check_docker_daemon
    setup_env_file
    determine_mode "$mode"
    
    # Cleanup
    cleanup_old_containers
    
    # Build and start
    build_images
    start_containers
    
    # Wait for health
    wait_for_health
    
    # Show information
    show_services
    show_urls
    show_next_steps
    
    # Show logs if not skipped
    if [ "$skip_logs" != "--no-logs" ]; then
        read -p "Show logs now? (Y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            show_logs
        else
            print_info "You can view logs later with: ./logs.sh"
        fi
    fi
}

# Handle script arguments
case "${1:-}" in
    dev)
        main "dev" "${2:-}"
        ;;
    prod)
        main "prod" "${2:-}"
        ;;
    --help|-h)
        echo "Usage: $0 [dev|prod] [--no-logs]"
        echo ""
        echo "Options:"
        echo "  dev         Start in development mode"
        echo "  prod        Start in production mode (default)"
        echo "  --no-logs   Don't show logs after starting"
        echo ""
        echo "Examples:"
        echo "  $0              # Start in production mode"
        echo "  $0 dev          # Start in development mode"
        echo "  $0 prod --no-logs  # Start without showing logs"
        exit 0
        ;;
    *)
        main "prod" "${1:-}"
        ;;
esac
