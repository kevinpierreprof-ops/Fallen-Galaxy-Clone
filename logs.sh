#!/bin/bash

# Logs Script for Space Strategy Game
# Tails container logs with filtering options

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

# Determine which compose file to use
get_compose_file() {
    local prod_containers=$(docker-compose -f "$COMPOSE_FILE" ps -q 2>/dev/null)
    local dev_containers=$(docker-compose -f "$DEV_COMPOSE_FILE" ps -q 2>/dev/null)
    
    if [ -n "$dev_containers" ]; then
        echo "$DEV_COMPOSE_FILE"
    elif [ -n "$prod_containers" ]; then
        echo "$COMPOSE_FILE"
    else
        echo "$COMPOSE_FILE"  # Default to production
    fi
}

# List available services
list_services() {
    local compose_file=$(get_compose_file)
    
    print_step "Available services"
    echo ""
    
    docker-compose -f "$compose_file" ps
    echo ""
    
    print_info "Available service names:"
    docker-compose -f "$compose_file" config --services | sed 's/^/  - /'
    echo ""
}

# Show logs for specific service
show_service_logs() {
    local service="$1"
    local lines="${2:-100}"
    local follow="${3:-true}"
    local compose_file=$(get_compose_file)
    
    print_step "Showing logs for service: $service"
    echo -e "${BLUE}Lines: $lines | Follow: $follow${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
    echo ""
    
    if [ "$follow" = true ]; then
        docker-compose -f "$compose_file" logs -f --tail="$lines" "$service"
    else
        docker-compose -f "$compose_file" logs --tail="$lines" "$service"
    fi
}

# Show logs for all services
show_all_logs() {
    local lines="${1:-100}"
    local follow="${2:-true}"
    local compose_file=$(get_compose_file)
    
    print_step "Showing logs for all services"
    echo -e "${BLUE}Lines: $lines | Follow: $follow${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
    echo ""
    
    if [ "$follow" = true ]; then
        docker-compose -f "$compose_file" logs -f --tail="$lines"
    else
        docker-compose -f "$compose_file" logs --tail="$lines"
    fi
}

# Search logs for pattern
search_logs() {
    local pattern="$1"
    local service="${2:-}"
    local compose_file=$(get_compose_file)
    
    print_step "Searching logs for: $pattern"
    echo ""
    
    if [ -n "$service" ]; then
        print_info "Service: $service"
        docker-compose -f "$compose_file" logs --tail=1000 "$service" | grep --color=always -i "$pattern" || \
            echo -e "${YELLOW}No matches found${NC}"
    else
        print_info "All services"
        docker-compose -f "$compose_file" logs --tail=1000 | grep --color=always -i "$pattern" || \
            echo -e "${YELLOW}No matches found${NC}"
    fi
}

# Show logs since timestamp
show_logs_since() {
    local timestamp="$1"
    local service="${2:-}"
    local compose_file=$(get_compose_file)
    
    print_step "Showing logs since: $timestamp"
    echo ""
    
    if [ -n "$service" ]; then
        docker-compose -f "$compose_file" logs --since="$timestamp" "$service"
    else
        docker-compose -f "$compose_file" logs --since="$timestamp"
    fi
}

# Show error logs only
show_errors() {
    local service="${1:-}"
    local compose_file=$(get_compose_file)
    
    print_step "Showing error logs"
    echo ""
    
    if [ -n "$service" ]; then
        docker-compose -f "$compose_file" logs --tail=500 "$service" | \
            grep --color=always -iE "error|exception|fail|fatal|panic" || \
            echo -e "${GREEN}No errors found${NC}"
    else
        docker-compose -f "$compose_file" logs --tail=500 | \
            grep --color=always -iE "error|exception|fail|fatal|panic" || \
            echo -e "${GREEN}No errors found${NC}"
    fi
}

# Export logs to file
export_logs() {
    local output_file="${1:-logs_export_$(date +%Y%m%d_%H%M%S).txt}"
    local service="${2:-}"
    local compose_file=$(get_compose_file)
    
    print_step "Exporting logs to: $output_file"
    
    if [ -n "$service" ]; then
        docker-compose -f "$compose_file" logs --no-color "$service" > "$output_file"
    else
        docker-compose -f "$compose_file" logs --no-color > "$output_file"
    fi
    
    local size=$(du -h "$output_file" | cut -f1)
    print_success "Logs exported ($size)"
    echo -e "  ${CYAN}View:${NC} less $output_file"
}

# Interactive mode
interactive_mode() {
    local compose_file=$(get_compose_file)
    
    while true; do
        clear
        print_header "Space Strategy Game - Logs"
        
        echo -e "${CYAN}Running containers:${NC}"
        docker-compose -f "$compose_file" ps
        echo ""
        
        echo -e "${CYAN}Options:${NC}"
        echo "  1) View all logs (live)"
        echo "  2) View specific service logs"
        echo "  3) Search logs"
        echo "  4) Show errors only"
        echo "  5) Export logs to file"
        echo "  6) Show last 50 lines"
        echo "  7) Show last 500 lines"
        echo "  q) Quit"
        echo ""
        
        read -p "Select option: " -n 1 -r
        echo ""
        
        case $REPLY in
            1)
                show_all_logs 100 true
                ;;
            2)
                echo ""
                echo -e "${CYAN}Available services:${NC}"
                docker-compose -f "$compose_file" config --services | sed 's/^/  - /'
                echo ""
                read -p "Enter service name: " service
                show_service_logs "$service" 100 true
                ;;
            3)
                echo ""
                read -p "Enter search pattern: " pattern
                read -p "Enter service (or leave empty for all): " service
                search_logs "$pattern" "$service"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            4)
                show_errors
                echo ""
                read -p "Press Enter to continue..."
                ;;
            5)
                echo ""
                read -p "Enter output file (or leave empty for default): " output_file
                read -p "Enter service (or leave empty for all): " service
                export_logs "$output_file" "$service"
                echo ""
                read -p "Press Enter to continue..."
                ;;
            6)
                show_all_logs 50 false
                echo ""
                read -p "Press Enter to continue..."
                ;;
            7)
                show_all_logs 500 false
                echo ""
                read -p "Press Enter to continue..."
                ;;
            q|Q)
                print_info "Exiting"
                exit 0
                ;;
            *)
                print_warn "Invalid option"
                sleep 1
                ;;
        esac
    done
}

# Show log statistics
show_stats() {
    local compose_file=$(get_compose_file)
    
    print_header "Log Statistics"
    
    local services=$(docker-compose -f "$compose_file" config --services)
    
    for service in $services; do
        local container=$(docker-compose -f "$compose_file" ps -q "$service" 2>/dev/null)
        
        if [ -n "$container" ]; then
            echo ""
            echo -e "${CYAN}Service: $service${NC}"
            
            local total_lines=$(docker logs "$container" 2>&1 | wc -l)
            local error_lines=$(docker logs "$container" 2>&1 | grep -icE "error|exception|fail" || echo 0)
            local warn_lines=$(docker logs "$container" 2>&1 | grep -icE "warn|warning" || echo 0)
            
            echo -e "  Total lines:  $total_lines"
            echo -e "  Errors:       ${RED}$error_lines${NC}"
            echo -e "  Warnings:     ${YELLOW}$warn_lines${NC}"
        fi
    done
    
    echo ""
}

# Main function
main() {
    local service=""
    local lines=100
    local follow=true
    local action="all"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--service)
                service="$2"
                shift 2
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            --no-follow)
                follow=false
                shift
                ;;
            --errors)
                action="errors"
                shift
                ;;
            --search)
                action="search"
                search_pattern="$2"
                shift 2
                ;;
            --export)
                action="export"
                export_file="${2:-}"
                shift
                [ -n "$2" ] && shift
                ;;
            --since)
                action="since"
                since_time="$2"
                shift 2
                ;;
            --stats)
                action="stats"
                shift
                ;;
            --list)
                list_services
                exit 0
                ;;
            -i|--interactive)
                interactive_mode
                exit 0
                ;;
            *)
                service="$1"
                shift
                ;;
        esac
    done
    
    # Execute action
    case $action in
        errors)
            show_errors "$service"
            ;;
        search)
            search_logs "$search_pattern" "$service"
            ;;
        export)
            export_logs "$export_file" "$service"
            ;;
        since)
            show_logs_since "$since_time" "$service"
            ;;
        stats)
            show_stats
            ;;
        all)
            if [ -n "$service" ]; then
                show_service_logs "$service" "$lines" "$follow"
            else
                show_all_logs "$lines" "$follow"
            fi
            ;;
    esac
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS] [SERVICE]"
        echo ""
        echo "Options:"
        echo "  -s, --service SERVICE   Show logs for specific service"
        echo "  -n, --lines N           Number of lines to show (default: 100)"
        echo "  --no-follow             Don't follow logs (show and exit)"
        echo "  --errors                Show only error logs"
        echo "  --search PATTERN        Search logs for pattern"
        echo "  --export [FILE]         Export logs to file"
        echo "  --since TIME            Show logs since timestamp"
        echo "  --stats                 Show log statistics"
        echo "  --list                  List available services"
        echo "  -i, --interactive       Interactive mode"
        echo "  -h, --help              Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                      # Show all logs (live)"
        echo "  $0 app                  # Show app service logs"
        echo "  $0 -s database -n 50    # Show last 50 lines of database"
        echo "  $0 --errors             # Show only errors from all services"
        echo "  $0 --search \"timeout\"   # Search for 'timeout' in logs"
        echo "  $0 --export logs.txt    # Export all logs to file"
        echo "  $0 --since \"1h\"         # Show logs from last hour"
        echo "  $0 --stats              # Show log statistics"
        echo "  $0 -i                   # Interactive mode"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
