# ==============================================================================
# Space Strategy Game - Docker Management Makefile
# ==============================================================================
# Usage:
#   make fix      - Complete fix: stop, clean, rebuild, start (ONE COMMAND FIX)
#   make restart  - Quick restart without rebuild
#   make clean    - Deep clean Docker resources
#   make logs     - View all service logs
#   make status   - Show container status
#   make backend  - View backend logs in real-time
# ==============================================================================

# Configuration
COMPOSE_FILE := docker-compose.dev.yml
COMPOSE := docker-compose -f $(COMPOSE_FILE)

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
NC := \033[0m # No Color

# ==============================================================================
# Main Commands
# ==============================================================================

.PHONY: help
help: ## Show this help message
	@echo -e "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo -e "$(CYAN)║$(NC) $(MAGENTA)Space Strategy Game - Docker Commands$(NC)"
	@echo -e "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Main Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

.PHONY: fix
fix: ## 🔧 COMPLETE FIX - Stop, clean, rebuild, start (ONE COMMAND SOLUTION)
	@echo -e "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo -e "$(CYAN)║$(NC) $(MAGENTA)Complete Docker Fix - This will solve everything$(NC)"
	@echo -e "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Step 1/5: Stopping all containers...$(NC)"
	-@$(COMPOSE) down -v --remove-orphans 2>/dev/null || true
	@echo -e "$(GREEN)✓ Containers stopped$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Step 2/5: Deep cleaning Docker resources...$(NC)"
	@$(MAKE) -s clean
	@echo -e "$(GREEN)✓ Docker cleaned$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Step 3/5: Building images (no cache)...$(NC)"
	@$(COMPOSE) build --no-cache --parallel || (echo -e "$(RED)✗ Build failed, retrying without parallel...$(NC)" && $(COMPOSE) build --no-cache)
	@echo -e "$(GREEN)✓ Images built$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Step 4/5: Starting containers...$(NC)"
	@$(COMPOSE) up -d
	@echo -e "$(GREEN)✓ Containers started$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Step 5/5: Verifying deployment...$(NC)"
	@sleep 3
	@$(MAKE) -s status
	@echo ""
	@echo -e "$(GREEN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo -e "$(GREEN)║                    ✓ FIX COMPLETE                              ║$(NC)"
	@echo -e "$(GREEN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo -e "$(CYAN)Access your application:$(NC)"
	@echo -e "  $(GREEN)Frontend:$(NC)  http://localhost:5173"
	@echo -e "  $(GREEN)Backend:$(NC)   http://localhost:3000"
	@echo -e "  $(GREEN)Database:$(NC)  localhost:5432"
	@echo -e "  $(GREEN)PgAdmin:$(NC)   http://localhost:5050"
	@echo ""
	@echo -e "$(CYAN)View logs:$(NC) make logs  $(BLUE)or$(NC)  make backend"
	@echo ""

.PHONY: restart
restart: ## 🔄 Quick restart without rebuild
	@echo -e "$(YELLOW)Restarting containers...$(NC)"
	-@$(COMPOSE) restart
	@echo -e "$(GREEN)✓ Containers restarted$(NC)"
	@$(MAKE) -s status

.PHONY: clean
clean: ## 🧹 Deep clean Docker resources (containers, volumes, images, cache)
	@echo -e "$(YELLOW)Cleaning Docker resources...$(NC)"
	-@docker container prune -f 2>/dev/null || true
	@echo -e "  $(GREEN)✓$(NC) Containers cleaned"
	-@docker image prune -a -f 2>/dev/null || true
	@echo -e "  $(GREEN)✓$(NC) Images cleaned"
	-@docker volume prune -f 2>/dev/null || true
	@echo -e "  $(GREEN)✓$(NC) Volumes cleaned"
	-@docker network prune -f 2>/dev/null || true
	@echo -e "  $(GREEN)✓$(NC) Networks cleaned"
	-@docker builder prune -a -f 2>/dev/null || true
	@echo -e "  $(GREEN)✓$(NC) Build cache cleaned"

# ==============================================================================
# Container Management
# ==============================================================================

.PHONY: start
start: ## ▶️  Start containers (without rebuild)
	@echo -e "$(YELLOW)Starting containers...$(NC)"
	@$(COMPOSE) up -d
	@echo -e "$(GREEN)✓ Containers started$(NC)"
	@$(MAKE) -s status

.PHONY: stop
stop: ## ⏸️  Stop containers (keep volumes)
	@echo -e "$(YELLOW)Stopping containers...$(NC)"
	@$(COMPOSE) stop
	@echo -e "$(GREEN)✓ Containers stopped$(NC)"

.PHONY: down
down: ## ⏹️  Stop and remove containers
	@echo -e "$(YELLOW)Stopping and removing containers...$(NC)"
	@$(COMPOSE) down
	@echo -e "$(GREEN)✓ Containers removed$(NC)"

.PHONY: kill
kill: ## 💀 Force kill all containers
	@echo -e "$(RED)Force killing all containers...$(NC)"
	-@$(COMPOSE) kill
	-@$(COMPOSE) down -v --remove-orphans
	@echo -e "$(GREEN)✓ Containers killed$(NC)"

# ==============================================================================
# Build Commands
# ==============================================================================

.PHONY: build
build: ## 🔨 Build images (with cache)
	@echo -e "$(YELLOW)Building images...$(NC)"
	@$(COMPOSE) build --parallel
	@echo -e "$(GREEN)✓ Images built$(NC)"

.PHONY: rebuild
rebuild: ## 🔨 Rebuild images (no cache)
	@echo -e "$(YELLOW)Rebuilding images (no cache)...$(NC)"
	@$(COMPOSE) build --no-cache --parallel
	@echo -e "$(GREEN)✓ Images rebuilt$(NC)"

.PHONY: rebuild-backend
rebuild-backend: ## 🔨 Rebuild only backend
	@echo -e "$(YELLOW)Rebuilding backend...$(NC)"
	@$(COMPOSE) build --no-cache backend
	@echo -e "$(GREEN)✓ Backend rebuilt$(NC)"

.PHONY: rebuild-frontend
rebuild-frontend: ## 🔨 Rebuild only frontend
	@echo -e "$(YELLOW)Rebuilding frontend...$(NC)"
	@$(COMPOSE) build --no-cache frontend
	@echo -e "$(GREEN)✓ Frontend rebuilt$(NC)"

# ==============================================================================
# Logs & Monitoring
# ==============================================================================

.PHONY: logs
logs: ## 📋 View all service logs
	@$(COMPOSE) logs --tail=100 -f

.PHONY: backend
backend: ## 📋 View backend logs (real-time)
	@echo -e "$(CYAN)Backend logs (Ctrl+C to exit):$(NC)"
	@$(COMPOSE) logs -f backend

.PHONY: frontend
frontend: ## 📋 View frontend logs (real-time)
	@echo -e "$(CYAN)Frontend logs (Ctrl+C to exit):$(NC)"
	@$(COMPOSE) logs -f frontend

.PHONY: database
database: ## 📋 View database logs
	@echo -e "$(CYAN)Database logs (Ctrl+C to exit):$(NC)"
	@$(COMPOSE) logs -f database

.PHONY: status
status: ## 📊 Show container status
	@echo -e "$(CYAN)Container Status:$(NC)"
	@$(COMPOSE) ps
	@echo ""
	@echo -e "$(CYAN)Health Check:$(NC)"
	@docker ps --filter "name=space-game" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo -e "$(YELLOW)No containers running$(NC)"

.PHONY: ps
ps: status ## 📊 Alias for status

# ==============================================================================
# Shell Access
# ==============================================================================

.PHONY: shell-backend
shell-backend: ## 🐚 Enter backend container shell
	@echo -e "$(CYAN)Entering backend container...$(NC)"
	@$(COMPOSE) exec backend sh || echo -e "$(RED)Backend container not running$(NC)"

.PHONY: shell-frontend
shell-frontend: ## 🐚 Enter frontend container shell
	@echo -e "$(CYAN)Entering frontend container...$(NC)"
	@$(COMPOSE) exec frontend sh || echo -e "$(RED)Frontend container not running$(NC)"

.PHONY: shell-db
shell-db: ## 🐚 Enter database container (psql)
	@echo -e "$(CYAN)Entering database...$(NC)"
	@$(COMPOSE) exec database psql -U postgres || echo -e "$(RED)Database not running$(NC)"

# ==============================================================================
# Database Commands
# ==============================================================================

.PHONY: db-reset
db-reset: ## 🗄️  Reset database (WARNING: deletes all data)
	@echo -e "$(RED)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo -e "$(YELLOW)Resetting database...$(NC)"
	-@$(COMPOSE) stop database
	@docker volume rm space-strategy-game_postgres-data 2>/dev/null || true
	@$(COMPOSE) up -d database
	@echo -e "$(GREEN)✓ Database reset$(NC)"

.PHONY: db-backup
db-backup: ## 🗄️  Backup database
	@echo -e "$(YELLOW)Creating database backup...$(NC)"
	@mkdir -p backups
	@$(COMPOSE) exec -T database pg_dump -U postgres space_strategy_game_dev > backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo -e "$(GREEN)✓ Backup created in backups/$(NC)"

# ==============================================================================
# Development Commands
# ==============================================================================

.PHONY: dev
dev: ## 🚀 Start development environment (alias for start)
	@$(MAKE) start
	@echo ""
	@echo -e "$(GREEN)Development environment ready!$(NC)"
	@echo -e "$(CYAN)Run 'make backend' to view backend logs$(NC)"

.PHONY: test
test: ## 🧪 Run tests
	@echo -e "$(YELLOW)Running tests...$(NC)"
	@$(COMPOSE) exec backend npm test
	@$(COMPOSE) exec frontend npm test

.PHONY: lint
lint: ## 🔍 Run linters
	@echo -e "$(YELLOW)Running linters...$(NC)"
	@$(COMPOSE) exec backend npm run lint
	@$(COMPOSE) exec frontend npm run lint

# ==============================================================================
# Utility Commands
# ==============================================================================

.PHONY: prune
prune: ## 🧹 Prune ALL unused Docker resources (system-wide)
	@echo -e "$(RED)WARNING: This will remove ALL unused Docker resources system-wide!$(NC)"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo -e "$(YELLOW)Pruning Docker system...$(NC)"
	@docker system prune -a --volumes -f
	@echo -e "$(GREEN)✓ System pruned$(NC)"

.PHONY: stats
stats: ## 📈 Show Docker resource usage
	@echo -e "$(CYAN)Docker Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

.PHONY: inspect
inspect: ## 🔍 Inspect Docker Compose configuration
	@$(COMPOSE) config

.PHONY: ports
ports: ## 🔌 Show exposed ports
	@echo -e "$(CYAN)Exposed Ports:$(NC)"
	@$(COMPOSE) ps --format "table {{.Name}}\t{{.Ports}}"

.PHONY: update
update: ## ⬆️  Pull latest images and rebuild
	@echo -e "$(YELLOW)Pulling latest images...$(NC)"
	@$(COMPOSE) pull
	@echo -e "$(GREEN)✓ Images updated$(NC)"
	@$(MAKE) rebuild

# ==============================================================================
# Diagnostic Commands
# ==============================================================================

.PHONY: doctor
doctor: ## 🩺 Run diagnostic check
	@echo -e "$(CYAN)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo -e "$(CYAN)║$(NC) $(MAGENTA)Docker Health Diagnostic$(NC)"
	@echo -e "$(CYAN)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Checking Docker...$(NC)"
	@docker --version || echo -e "$(RED)✗ Docker not found$(NC)"
	@docker-compose --version || echo -e "$(RED)✗ Docker Compose not found$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Checking daemon...$(NC)"
	@docker info >/dev/null 2>&1 && echo -e "$(GREEN)✓ Docker daemon running$(NC)" || echo -e "$(RED)✗ Docker daemon not running$(NC)"
	@echo ""
	@echo -e "$(YELLOW)Checking disk space...$(NC)"
	@df -h / | awk 'NR==2 {print "  Available: " $$4}'
	@echo ""
	@echo -e "$(YELLOW)Checking containers...$(NC)"
	@$(MAKE) -s status
	@echo ""
	@echo -e "$(YELLOW)Checking for port conflicts...$(NC)"
	@lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && echo -e "  $(RED)✗ Port 3000 in use$(NC)" || echo -e "  $(GREEN)✓ Port 3000 free$(NC)"
	@lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 && echo -e "  $(RED)✗ Port 5173 in use$(NC)" || echo -e "  $(GREEN)✓ Port 5173 free$(NC)"
	@lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 && echo -e "  $(RED)✗ Port 5432 in use$(NC)" || echo -e "  $(GREEN)✓ Port 5432 free$(NC)"

.PHONY: version
version: ## 📌 Show versions
	@echo -e "$(CYAN)Versions:$(NC)"
	@docker --version
	@docker-compose --version
	@node --version 2>/dev/null || echo "Node: not installed"

# ==============================================================================
# Default target
# ==============================================================================

.DEFAULT_GOAL := help
