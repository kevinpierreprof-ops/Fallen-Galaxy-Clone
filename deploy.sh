#!/bin/bash

# Docker Deployment Script for Space Strategy Game
# Usage: ./deploy.sh [dev|prod|stop|clean]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Development deployment
deploy_dev() {
    print_info "Starting development environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warn ".env file not found. Creating from .env.docker..."
        cp .env.docker .env
    fi
    
    # Build and start containers
    docker-compose -f docker-compose.dev.yml up --build -d
    
    print_info "Development environment started!"
    print_info "Frontend: http://localhost:5173"
    print_info "Backend API: http://localhost:3000"
    print_info "PgAdmin: http://localhost:5050"
    
    # Show logs
    docker-compose -f docker-compose.dev.yml logs -f
}

# Production deployment
deploy_prod() {
    print_info "Starting production environment..."
    
    # Check for .env file
    if [ ! -f .env ]; then
        print_error ".env file not found. Please create one from .env.docker"
        exit 1
    fi
    
    # Build and start containers
    docker-compose up --build -d
    
    print_info "Production environment started!"
    print_info "Application: http://localhost"
    print_info "Health check: http://localhost/health"
    
    # Wait for health check
    print_info "Waiting for application to be healthy..."
    sleep 10
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_info "Application is healthy!"
    else
        print_warn "Health check failed. Check logs with: docker-compose logs"
    fi
}

# Stop all containers
stop_containers() {
    print_info "Stopping containers..."
    
    # Stop production
    docker-compose down
    
    # Stop development
    docker-compose -f docker-compose.dev.yml down
    
    print_info "All containers stopped!"
}

# Clean everything (including volumes)
clean_all() {
    print_warn "This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        
        # Stop and remove containers
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        
        # Remove images
        docker images | grep space-game | awk '{print $3}' | xargs -r docker rmi -f
        
        print_info "Cleanup complete!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Show logs
show_logs() {
    local service=$2
    
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Main script
main() {
    check_docker
    
    case "${1:-}" in
        dev)
            deploy_dev
            ;;
        prod)
            deploy_prod
            ;;
        stop)
            stop_containers
            ;;
        clean)
            clean_all
            ;;
        logs)
            show_logs "$@"
            ;;
        *)
            echo "Usage: $0 {dev|prod|stop|clean|logs [service]}"
            echo ""
            echo "Commands:"
            echo "  dev    - Start development environment with hot reload"
            echo "  prod   - Start production environment"
            echo "  stop   - Stop all containers"
            echo "  clean  - Remove all containers, images, and volumes"
            echo "  logs   - Show logs (optionally specify service)"
            exit 1
            ;;
    esac
}

main "$@"
