@echo off
REM Docker Deployment Script for Space Strategy Game (Windows)
REM Usage: deploy.bat [dev|prod|stop|clean]

setlocal

set COMMAND=%1

if "%COMMAND%"=="" (
    echo Usage: deploy.bat [dev^|prod^|stop^|clean]
    echo.
    echo Commands:
    echo   dev    - Start development environment with hot reload
    echo   prod   - Start production environment
    echo   stop   - Stop all containers
    echo   clean  - Remove all containers, images, and volumes
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker Compose is not installed.
    exit /b 1
)

if "%COMMAND%"=="dev" (
    echo [INFO] Starting development environment...
    
    if not exist .env (
        echo [WARN] .env file not found. Creating from .env.docker...
        copy .env.docker .env
    )
    
    docker-compose -f docker-compose.dev.yml up --build -d
    
    echo [INFO] Development environment started!
    echo [INFO] Frontend: http://localhost:5173
    echo [INFO] Backend API: http://localhost:3000
    echo [INFO] PgAdmin: http://localhost:5050
    
    docker-compose -f docker-compose.dev.yml logs -f
)

if "%COMMAND%"=="prod" (
    echo [INFO] Starting production environment...
    
    if not exist .env (
        echo [ERROR] .env file not found. Please create one from .env.docker
        exit /b 1
    )
    
    docker-compose up --build -d
    
    echo [INFO] Production environment started!
    echo [INFO] Application: http://localhost
    echo [INFO] Health check: http://localhost/health
)

if "%COMMAND%"=="stop" (
    echo [INFO] Stopping containers...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo [INFO] All containers stopped!
)

if "%COMMAND%"=="clean" (
    echo [WARN] This will remove all containers, images, and volumes!
    set /p CONFIRM="Are you sure? (y/N): "
    
    if /i "%CONFIRM%"=="y" (
        echo [INFO] Cleaning up...
        docker-compose down -v --remove-orphans
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        
        for /f "tokens=3" %%i in ('docker images ^| findstr space-game') do docker rmi -f %%i
        
        echo [INFO] Cleanup complete!
    ) else (
        echo [INFO] Cleanup cancelled.
    )
)

endlocal
