#!/bin/bash

# Docker Auto-Fix Script
# Intelligent script for automatic Docker problem detection and resolution

set -o pipefail

# ============================================================================
# CONFIGURATION
# ============================================================================

COMPOSE_FILE="docker-compose.dev.yml"
LOG_DIR="logs/docker-fix"
LOG_FILE="${LOG_DIR}/fix_$(date +%Y%m%d_%H%M%S).log"
MAX_RETRIES=3
RETRY_DELAYS=(5 10 20)
MIN_DISK_SPACE_GB=2

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

setup_logging() {
    mkdir -p "$LOG_DIR"
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1
}

log_header() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
}

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] [✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] [⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] [✗]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}▶${NC} ${BLUE}$1${NC}"
}

# ============================================================================
# DIAGNOSTIC FUNCTIONS
# ============================================================================

check_docker_daemon() {
    log_step "Checking Docker daemon status..."
    
    if ! docker info &>/dev/null; then
        log_warn "Docker daemon is not running"
        
        # Try to start Docker daemon
        log_info "Attempting to start Docker daemon..."
        
        if command -v systemctl &>/dev/null; then
            sudo systemctl start docker || return 1
            sleep 3
        elif command -v service &>/dev/null; then
            sudo service docker start || return 1
            sleep 3
        else
            log_error "Cannot start Docker daemon automatically"
            return 1
        fi
        
        if docker info &>/dev/null; then
            log_success "Docker daemon started successfully"
            return 0
        else
            log_error "Failed to start Docker daemon"
            return 1
        fi
    else
        log_success "Docker daemon is running"
        return 0
    fi
}

check_disk_space() {
    log_step "Checking available disk space..."
    
    local available_gb=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    
    log_info "Available disk space: ${available_gb}GB"
    
    if [ "$available_gb" -lt "$MIN_DISK_SPACE_GB" ]; then
        log_warn "Low disk space detected (${available_gb}GB < ${MIN_DISK_SPACE_GB}GB)"
        clean_docker_resources
        return 1
    else
        log_success "Sufficient disk space available"
        return 0
    fi
}

check_port_conflicts() {
    log_step "Checking for port conflicts..."
    
    local ports=(3000 5173 5432 6379 5050 80)
    local conflicts=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t &>/dev/null; then
            local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
            local process=$(ps -p $pid -o comm= 2>/dev/null)
            log_warn "Port $port is in use by process: $process (PID: $pid)"
            conflicts+=("$port:$pid")
        fi
    done
    
    if [ ${#conflicts[@]} -gt 0 ]; then
        return 1
    else
        log_success "No port conflicts detected"
        return 0
    fi
}

check_zombie_containers() {
    log_step "Checking for zombie containers..."
    
    local zombie_containers=$(docker ps -a --filter "status=exited" --filter "status=dead" -q)
    
    if [ -n "$zombie_containers" ]; then
        log_warn "Found $(echo "$zombie_containers" | wc -l) zombie containers"
        return 1
    else
        log_success "No zombie containers found"
        return 0
    fi
}

check_docker_networks() {
    log_step "Checking Docker networks..."
    
    # Check if default bridge network is working
    if ! docker network inspect bridge &>/dev/null; then
        log_error "Default Docker bridge network is missing"
        return 1
    fi
    
    log_success "Docker networks are healthy"
    return 0
}

# ============================================================================
# AUTO-CORRECTION FUNCTIONS
# ============================================================================

kill_port_processes() {
    log_step "Freeing up blocked ports..."
    
    local ports=(3000 5173 5432 6379 5050 80)
    local killed=0
    
    for port in "${ports[@]}"; do
        local pids=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
        
        if [ -n "$pids" ]; then
            for pid in $pids; do
                local process=$(ps -p $pid -o comm= 2>/dev/null)
                
                # Don't kill Docker processes
                if [[ ! "$process" =~ docker ]]; then
                    log_info "Killing process on port $port: $process (PID: $pid)"
                    kill -9 $pid 2>/dev/null && killed=$((killed + 1))
                fi
            done
        fi
    done
    
    if [ $killed -gt 0 ]; then
        log_success "Freed $killed port(s)"
        sleep 2
    else
        log_info "No ports needed freeing"
    fi
}

clean_docker_resources() {
    log_step "Cleaning Docker resources..."
    
    # Remove stopped containers
    log_info "Removing stopped containers..."
    local removed_containers=$(docker container prune -f 2>&1 | grep -oP 'Total reclaimed space: \K.*' || echo "0B")
    log_success "Containers cleaned: $removed_containers"
    
    # Remove unused images
    log_info "Removing unused images..."
    local removed_images=$(docker image prune -a -f 2>&1 | grep -oP 'Total reclaimed space: \K.*' || echo "0B")
    log_success "Images cleaned: $removed_images"
    
    # Remove unused volumes
    log_info "Removing unused volumes..."
    local removed_volumes=$(docker volume prune -f 2>&1 | grep -oP 'Total reclaimed space: \K.*' || echo "0B")
    log_success "Volumes cleaned: $removed_volumes"
    
    # Remove unused networks
    log_info "Removing unused networks..."
    docker network prune -f &>/dev/null
    log_success "Networks cleaned"
    
    # Clear build cache
    log_info "Clearing build cache..."
    local removed_cache=$(docker builder prune -a -f 2>&1 | grep -oP 'Total reclaimed space: \K.*' || echo "0B")
    log_success "Build cache cleared: $removed_cache"
}

fix_docker_networks() {
    log_step "Fixing Docker networks..."
    
    # Recreate default bridge if needed
    if ! docker network inspect bridge &>/dev/null; then
        log_info "Recreating default bridge network..."
        docker network create bridge &>/dev/null
    fi
    
    # Remove orphaned networks
    docker network prune -f &>/dev/null
    
    log_success "Docker networks fixed"
}

fix_file_permissions() {
    log_step "Fixing file permissions..."
    
    # Fix common permission issues
    local dirs=("logs" "backend/logs" "backend/node_modules" "frontend/node_modules")
    
    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            chmod -R u+rwX "$dir" 2>/dev/null || true
        fi
    done
    
    log_success "File permissions fixed"
}

# ============================================================================
# DOCKER OPERATIONS
# ============================================================================

stop_all_containers() {
    log_step "Stopping all containers..."
    
    if docker-compose -f "$COMPOSE_FILE" ps -q &>/dev/null; then
        docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
        log_success "Containers stopped"
    else
        log_info "No containers to stop"
    fi
    
    sleep 2
}

build_images() {
    local attempt=$1
    
    log_step "Building Docker images (attempt $attempt/$MAX_RETRIES)..."
    
    local build_log=$(mktemp)
    
    if docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel 2>&1 | tee "$build_log"; then
        log_success "Images built successfully"
        rm -f "$build_log"
        return 0
    else
        log_error "Build failed"
        
        # Analyze build errors
        if grep -q "no space left on device" "$build_log"; then
            log_warn "Detected: Insufficient disk space"
            clean_docker_resources
        elif grep -q "failed to solve" "$build_log"; then
            log_warn "Detected: Build solver error"
            docker builder prune -a -f &>/dev/null
        elif grep -q "network" "$build_log"; then
            log_warn "Detected: Network error"
            fix_docker_networks
        fi
        
        rm -f "$build_log"
        return 1
    fi
}

start_containers() {
    local attempt=$1
    
    log_step "Starting containers (attempt $attempt/$MAX_RETRIES)..."
    
    local start_log=$(mktemp)
    
    if docker-compose -f "$COMPOSE_FILE" up -d 2>&1 | tee "$start_log"; then
        log_success "Containers started"
        rm -f "$start_log"
        return 0
    else
        log_error "Failed to start containers"
        
        # Analyze startup errors
        if grep -q "port is already allocated" "$start_log"; then
            log_warn "Detected: Port conflict"
            kill_port_processes
        elif grep -q "network" "$start_log"; then
            log_warn "Detected: Network issue"
            fix_docker_networks
        fi
        
        rm -f "$start_log"
        return 1
    fi
}

verify_containers() {
    log_step "Verifying container health..."
    
    sleep 5
    
    local services=$(docker-compose -f "$COMPOSE_FILE" config --services)
    local running_count=0
    local total_count=0
    
    for service in $services; do
        total_count=$((total_count + 1))
        
        if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
            log_success "Service '$service' is running"
            running_count=$((running_count + 1))
        else
            log_error "Service '$service' is NOT running"
            
            # Show last 20 lines of logs
            log_info "Last logs for '$service':"
            docker-compose -f "$COMPOSE_FILE" logs --tail=20 "$service" 2>&1 | sed 's/^/  /'
        fi
    done
    
    if [ $running_count -eq $total_count ]; then
        log_success "All $total_count services are running"
        return 0
    else
        log_error "Only $running_count/$total_count services are running"
        return 1
    fi
}

# ============================================================================
# MAIN WORKFLOW
# ============================================================================

run_diagnostics() {
    log_header "Running Diagnostics"
    
    local issues=0
    
    check_docker_daemon || issues=$((issues + 1))
    check_disk_space || issues=$((issues + 1))
    check_port_conflicts || issues=$((issues + 1))
    check_zombie_containers || issues=$((issues + 1))
    check_docker_networks || issues=$((issues + 1))
    
    if [ $issues -eq 0 ]; then
        log_success "No issues detected"
    else
        log_warn "Detected $issues issue(s), will attempt auto-correction"
    fi
    
    return $issues
}

apply_corrections() {
    log_header "Applying Auto-Corrections"
    
    kill_port_processes
    clean_docker_resources
    fix_docker_networks
    fix_file_permissions
    
    log_success "Auto-corrections applied"
}

attempt_deployment() {
    local attempt=$1
    local delay=${RETRY_DELAYS[$((attempt - 1))]}
    
    log_header "Deployment Attempt $attempt/$MAX_RETRIES"
    
    if [ $attempt -gt 1 ]; then
        log_info "Waiting ${delay}s before retry..."
        sleep $delay
    fi
    
    # Stop everything
    stop_all_containers
    
    # Build
    if ! build_images $attempt; then
        return 1
    fi
    
    # Start
    if ! start_containers $attempt; then
        return 1
    fi
    
    # Verify
    if ! verify_containers; then
        return 1
    fi
    
    return 0
}

show_final_report() {
    local success=$1
    
    log_header "Final Report"
    
    if [ $success -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                    ✓ DEPLOYMENT SUCCESSFUL                     ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}Services Status:${NC}"
        docker-compose -f "$COMPOSE_FILE" ps
        echo ""
        echo -e "${CYAN}Access URLs:${NC}"
        echo -e "  ${GREEN}Frontend:${NC}  http://localhost:5173"
        echo -e "  ${GREEN}Backend:${NC}   http://localhost:3000"
        echo -e "  ${GREEN}Database:${NC}  localhost:5432"
        echo -e "  ${GREEN}PgAdmin:${NC}   http://localhost:5050"
        echo ""
        echo -e "${CYAN}Commands:${NC}"
        echo -e "  ${BLUE}View logs:${NC}  docker-compose -f $COMPOSE_FILE logs -f"
        echo -e "  ${BLUE}Stop all:${NC}   docker-compose -f $COMPOSE_FILE down"
        echo ""
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                    ✗ DEPLOYMENT FAILED                         ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Last 100 lines of logs:${NC}"
        docker-compose -f "$COMPOSE_FILE" logs --tail=100 2>&1 | sed 's/^/  /'
        echo ""
        echo -e "${YELLOW}Diagnostic Information:${NC}"
        echo -e "  ${CYAN}Docker version:${NC}  $(docker --version)"
        echo -e "  ${CYAN}Docker Compose:${NC} $(docker-compose --version)"
        echo -e "  ${CYAN}Disk space:${NC}     $(df -h / | awk 'NR==2 {print $4}')"
        echo -e "  ${CYAN}Memory:${NC}         $(free -h | awk 'NR==2 {print $7}')"
        echo ""
        echo -e "${YELLOW}Suggested Manual Actions:${NC}"
        echo -e "  1. Check full logs: ${BLUE}cat $LOG_FILE${NC}"
        echo -e "  2. Restart Docker: ${BLUE}sudo systemctl restart docker${NC}"
        echo -e "  3. Clean everything: ${BLUE}docker system prune -a --volumes -f${NC}"
        echo -e "  4. Check file encoding: ${BLUE}file -bi backend/package.json${NC}"
        echo -e "  5. Manual rebuild: ${BLUE}docker-compose -f $COMPOSE_FILE build --no-cache${NC}"
        echo ""
    fi
    
    echo -e "${CYAN}Full log saved to:${NC} $LOG_FILE"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    setup_logging
    
    log_header "Docker Auto-Fix Script - $(date)"
    
    # Run diagnostics
    run_diagnostics
    
    # Apply corrections if needed
    apply_corrections
    
    # Attempt deployment with retries
    local success=1
    
    for attempt in $(seq 1 $MAX_RETRIES); do
        if attempt_deployment $attempt; then
            success=0
            break
        else
            if [ $attempt -lt $MAX_RETRIES ]; then
                log_warn "Attempt $attempt failed, will retry..."
            fi
        fi
    done
    
    # Show final report
    show_final_report $success
    
    exit $success
}

# Run main function
main "$@"
