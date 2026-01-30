#!/bin/bash

# ==============================================================================
# SPACE STRATEGY GAME - AUTOMATED TEST SUITE
# ==============================================================================
# This script runs all automated tests for the project
# ==============================================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ==============================================================================
# CONFIGURATION
# ==============================================================================

TEST_MODE="${1:-all}"  # all, backend, frontend, e2e
COVERAGE="${2:-false}"
CI_MODE="${3:-false}"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC} ${MAGENTA}Space Strategy Game - Automated Tests${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# PRE-FLIGHT CHECKS
# ==============================================================================

echo -e "${YELLOW}Pre-flight checks...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker and try again${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if containers are running
if [ "$CI_MODE" != "true" ]; then
    echo -e "${YELLOW}Checking containers...${NC}"
    
    BACKEND_RUNNING=$(docker ps --filter "name=space-game-backend" --format "{{.Names}}" | wc -l)
    FRONTEND_RUNNING=$(docker ps --filter "name=space-game-frontend" --format "{{.Names}}" | wc -l)
    
    if [ "$BACKEND_RUNNING" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Backend not running, starting it...${NC}"
        docker-compose -f docker-compose.dev.yml up -d backend database redis
        sleep 5
    fi
    
    if [ "$FRONTEND_RUNNING" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Frontend not running, starting it...${NC}"
        docker-compose -f docker-compose.dev.yml up -d frontend
        sleep 3
    fi
    
    echo -e "${GREEN}✓ All containers running${NC}"
fi

echo ""

# ==============================================================================
# BACKEND TESTS
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "backend" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🧪 BACKEND TESTS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Run unit tests
    echo -e "${YELLOW}Running backend unit tests...${NC}"
    if [ "$COVERAGE" == "true" ]; then
        npm run test:coverage
    else
        npm test
    fi
    
    BACKEND_EXIT_CODE=$?
    
    if [ $BACKEND_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Backend tests PASSED${NC}"
    else
        echo -e "${RED}❌ Backend tests FAILED${NC}"
        exit $BACKEND_EXIT_CODE
    fi
    
    cd ..
    echo ""
fi

# ==============================================================================
# FRONTEND TESTS
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "frontend" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🎨 FRONTEND TESTS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Run tests
    echo -e "${YELLOW}Running frontend tests...${NC}"
    if [ "$COVERAGE" == "true" ]; then
        npm run test:coverage
    else
        npm test
    fi
    
    FRONTEND_EXIT_CODE=$?
    
    if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend tests PASSED${NC}"
    else
        echo -e "${RED}❌ Frontend tests FAILED${NC}"
        exit $FRONTEND_EXIT_CODE
    fi
    
    cd ..
    echo ""
fi

# ==============================================================================
# API INTEGRATION TESTS
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "api" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🔌 API INTEGRATION TESTS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd backend
    
    echo -e "${YELLOW}Running API integration tests...${NC}"
    npm run test:integration
    
    API_EXIT_CODE=$?
    
    if [ $API_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ API tests PASSED${NC}"
    else
        echo -e "${RED}❌ API tests FAILED${NC}"
        exit $API_EXIT_CODE
    fi
    
    cd ..
    echo ""
fi

# ==============================================================================
# WEBSOCKET TESTS
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "websocket" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🔗 WEBSOCKET TESTS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd backend
    
    echo -e "${YELLOW}Running WebSocket tests...${NC}"
    npm run test:websocket
    
    WS_EXIT_CODE=$?
    
    if [ $WS_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ WebSocket tests PASSED${NC}"
    else
        echo -e "${RED}❌ WebSocket tests FAILED${NC}"
        exit $WS_EXIT_CODE
    fi
    
    cd ..
    echo ""
fi

# ==============================================================================
# E2E TESTS (PLAYWRIGHT)
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "e2e" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🌐 END-TO-END TESTS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Install Playwright if needed
    if [ ! -d "node_modules/@playwright/test" ]; then
        echo -e "${YELLOW}Installing Playwright...${NC}"
        npm install -D @playwright/test
        npx playwright install
    fi
    
    echo -e "${YELLOW}Running E2E tests...${NC}"
    npx playwright test
    
    E2E_EXIT_CODE=$?
    
    if [ $E2E_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ E2E tests PASSED${NC}"
    else
        echo -e "${RED}❌ E2E tests FAILED${NC}"
        
        # Show Playwright report
        echo -e "${YELLOW}Opening Playwright report...${NC}"
        npx playwright show-report
        
        exit $E2E_EXIT_CODE
    fi
    
    echo ""
fi

# ==============================================================================
# DATABASE TESTS
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "database" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🗄️  DATABASE TESTS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${YELLOW}Testing database connection...${NC}"
    
    docker exec space-game-backend-dev npm run db:check
    
    DB_EXIT_CODE=$?
    
    if [ $DB_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Database tests PASSED${NC}"
    else
        echo -e "${RED}❌ Database tests FAILED${NC}"
        exit $DB_EXIT_CODE
    fi
    
    echo ""
fi

# ==============================================================================
# LINTING & CODE QUALITY
# ==============================================================================

if [ "$TEST_MODE" == "all" ] || [ "$TEST_MODE" == "lint" ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${MAGENTA}🔍 CODE QUALITY CHECKS${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Backend linting
    echo -e "${YELLOW}Linting backend...${NC}"
    cd backend
    npm run lint
    BACKEND_LINT_EXIT=$?
    cd ..
    
    if [ $BACKEND_LINT_EXIT -eq 0 ]; then
        echo -e "${GREEN}✅ Backend linting PASSED${NC}"
    else
        echo -e "${RED}❌ Backend linting FAILED${NC}"
    fi
    
    # Frontend linting
    echo -e "${YELLOW}Linting frontend...${NC}"
    cd frontend
    npm run lint
    FRONTEND_LINT_EXIT=$?
    cd ..
    
    if [ $FRONTEND_LINT_EXIT -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend linting PASSED${NC}"
    else
        echo -e "${RED}❌ Frontend linting FAILED${NC}"
    fi
    
    if [ $BACKEND_LINT_EXIT -ne 0 ] || [ $FRONTEND_LINT_EXIT -ne 0 ]; then
        exit 1
    fi
    
    echo ""
fi

# ==============================================================================
# SUMMARY
# ==============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC} ${MAGENTA}✅ ALL TESTS PASSED${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$COVERAGE" == "true" ]; then
    echo -e "${CYAN}Coverage reports available:${NC}"
    echo -e "  Backend:  ${YELLOW}backend/coverage/lcov-report/index.html${NC}"
    echo -e "  Frontend: ${YELLOW}frontend/coverage/lcov-report/index.html${NC}"
    echo ""
fi

echo -e "${CYAN}Test Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Backend unit tests"
echo -e "  ${GREEN}✓${NC} Frontend component tests"
echo -e "  ${GREEN}✓${NC} API integration tests"
echo -e "  ${GREEN}✓${NC} WebSocket tests"
echo -e "  ${GREEN}✓${NC} E2E browser tests"
echo -e "  ${GREEN}✓${NC} Database tests"
echo -e "  ${GREEN}✓${NC} Code quality checks"
echo ""

echo -e "${GREEN}🎉 All systems operational!${NC}"
echo ""

exit 0
