# ==============================================================================
# SPACE STRATEGY GAME - AUTOMATED TEST SUITE (PowerShell)
# ==============================================================================
# Windows PowerShell version of run-tests.sh
# ==============================================================================

param(
    [string]$TestMode = "all",
    [switch]$Coverage = $false,
    [switch]$CI = $false
)

# Colors
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Magenta = "Magenta"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Space Strategy Game - Automated Tests (Windows)               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# PRE-FLIGHT CHECKS
# ==============================================================================

Write-Host "Pre-flight checks..." -ForegroundColor Yellow

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Check if containers are running
if (-not $CI) {
    Write-Host "Checking containers..." -ForegroundColor Yellow
    
    $backendRunning = docker ps --filter "name=space-game-backend" --format "{{.Names}}"
    $frontendRunning = docker ps --filter "name=space-game-frontend" --format "{{.Names}}"
    
    if (-not $backendRunning) {
        Write-Host "⚠️  Backend not running, starting it..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml up -d backend database redis
        Start-Sleep -Seconds 5
    }
    
    if (-not $frontendRunning) {
        Write-Host "⚠️  Frontend not running, starting it..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml up -d frontend
        Start-Sleep -Seconds 3
    }
    
    Write-Host "✓ All containers running" -ForegroundColor Green
}

Write-Host ""

# ==============================================================================
# BACKEND TESTS
# ==============================================================================

if ($TestMode -eq "all" -or $TestMode -eq "backend") {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ 🧪 BACKEND TESTS                                              ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Running backend tests in Docker..." -ForegroundColor Yellow
    
    if ($Coverage) {
        docker-compose -f docker-compose.dev.yml exec -T backend npm run test:coverage
    } else {
        docker-compose -f docker-compose.dev.yml exec -T backend npm test
    }
    
    $backendExitCode = $LASTEXITCODE
    
    if ($backendExitCode -eq 0) {
        Write-Host "✅ Backend tests PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend tests FAILED" -ForegroundColor Red
        exit $backendExitCode
    }
    
    Write-Host ""
}

# ==============================================================================
# FRONTEND TESTS
# ==============================================================================

if ($TestMode -eq "all" -or $TestMode -eq "frontend") {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ 🎨 FRONTEND TESTS                                             ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Running frontend tests in Docker..." -ForegroundColor Yellow
    
    if ($Coverage) {
        docker-compose -f docker-compose.dev.yml exec -T frontend npm run test:coverage
    } else {
        docker-compose -f docker-compose.dev.yml exec -T frontend npm test
    }
    
    $frontendExitCode = $LASTEXITCODE
    
    if ($frontendExitCode -eq 0) {
        Write-Host "✅ Frontend tests PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend tests FAILED" -ForegroundColor Red
        exit $frontendExitCode
    }
    
    Write-Host ""
}

# ==============================================================================
# E2E TESTS (PLAYWRIGHT)
# ==============================================================================

if ($TestMode -eq "all" -or $TestMode -eq "e2e") {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ 🌐 END-TO-END TESTS                                           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Running E2E tests..." -ForegroundColor Yellow
    npx playwright test
    
    $e2eExitCode = $LASTEXITCODE
    
    if ($e2eExitCode -eq 0) {
        Write-Host "✅ E2E tests PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ E2E tests FAILED" -ForegroundColor Red
        Write-Host "Opening Playwright report..." -ForegroundColor Yellow
        npx playwright show-report
        exit $e2eExitCode
    }
    
    Write-Host ""
}

# ==============================================================================
# LINTING
# ==============================================================================

if ($TestMode -eq "all" -or $TestMode -eq "lint") {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ 🔍 CODE QUALITY CHECKS                                        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # Backend linting
    Write-Host "Linting backend..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml exec -T backend npm run lint
    $backendLintExit = $LASTEXITCODE
    
    if ($backendLintExit -eq 0) {
        Write-Host "✅ Backend linting PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend linting FAILED" -ForegroundColor Red
    }
    
    # Frontend linting
    Write-Host "Linting frontend..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml exec -T frontend npm run lint
    $frontendLintExit = $LASTEXITCODE
    
    if ($frontendLintExit -eq 0) {
        Write-Host "✅ Frontend linting PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend linting FAILED" -ForegroundColor Red
    }
    
    if ($backendLintExit -ne 0 -or $frontendLintExit -ne 0) {
        exit 1
    }
    
    Write-Host ""
}

# ==============================================================================
# SUMMARY
# ==============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║ ✅ ALL TESTS PASSED                                           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

if ($Coverage) {
    Write-Host "Coverage reports available:" -ForegroundColor Cyan
    Write-Host "  Backend:  backend\coverage\lcov-report\index.html" -ForegroundColor Yellow
    Write-Host "  Frontend: frontend\coverage\lcov-report\index.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Open with: start backend\coverage\lcov-report\index.html" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Backend tests" -ForegroundColor Green
Write-Host "  ✓ Frontend tests" -ForegroundColor Green
if ($TestMode -eq "all") {
    Write-Host "  ✓ E2E tests" -ForegroundColor Green
    Write-Host "  ✓ Code quality checks" -ForegroundColor Green
}
Write-Host ""

Write-Host "🎉 All systems operational!" -ForegroundColor Green
Write-Host ""

exit 0
