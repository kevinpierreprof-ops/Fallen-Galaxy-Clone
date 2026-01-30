# Docker Quick Reference

## Quick Start

```bash
# Production
./deploy.sh prod

# Development
./deploy.sh dev

# Stop
./deploy.sh stop
```

## Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build
```

## Service Management

```bash
# Restart single service
docker-compose restart app

# View logs for service
docker-compose logs -f database

# Execute command in container
docker-compose exec app sh

# Scale service
docker-compose up -d --scale app=3
```

## Database Access

```bash
# PostgreSQL CLI
docker-compose exec database psql -U gameuser -d space_strategy_game

# Backup
docker-compose exec database pg_dump -U gameuser space_strategy_game > backup.sql

# Restore
cat backup.sql | docker-compose exec -T database psql -U gameuser space_strategy_game

# PgAdmin (Dev)
http://localhost:5050
```

## Health Checks

```bash
# Application
curl http://localhost/health

# Container health
docker ps

# Backend API
curl http://localhost:3000/health
```

## Monitoring

```bash
# Container stats
docker stats

# Resource usage
docker-compose top

# Recent logs
docker-compose logs --tail=100

# Follow logs
docker-compose logs -f app
```

## Development

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up -d

# Hot reload (automatic)
# Edit files in ./backend/src or ./frontend/src

# Rebuild dev containers
docker-compose -f docker-compose.dev.yml up -d --build

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# PgAdmin: http://localhost:5050
```

## Production

```bash
# Build
docker-compose build

# Deploy
docker-compose up -d

# Update
git pull
docker-compose up -d --build

# Access
# Application: http://localhost
# Health: http://localhost/health
```

## Troubleshooting

```bash
# View logs
docker-compose logs app

# Inspect container
docker inspect space-game-app

# Restart service
docker-compose restart app

# Rebuild from scratch
docker-compose down
docker-compose up -d --build --force-recreate
```

## Cleanup

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
./deploy.sh clean
```

## Environment

```bash
# Copy template
cp .env.docker .env

# Edit
nano .env

# Required variables
DB_PASSWORD=changeme
REDIS_PASSWORD=changeme
JWT_SECRET=changeme

# Apply changes
docker-compose up -d
```

## Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect space-strategy-game_postgres_data

# Backup volume
docker run --rm -v space-strategy-game_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v space-strategy-game_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

## Networks

```bash
# List networks
docker network ls

# Inspect network
docker network inspect space-strategy-game_game-network

# Connect container to network
docker network connect game-network container_name
```

## Debugging

```bash
# Shell into container
docker-compose exec app sh

# View environment
docker-compose exec app env

# Check processes
docker-compose exec app ps aux

# Network test
docker-compose exec app ping database
```

## Performance

```bash
# Container resources
docker stats space-game-app

# Image size
docker images | grep space-game

# Build cache
DOCKER_BUILDKIT=1 docker-compose build
```

## Security

```bash
# Update images
docker-compose pull

# Scan for vulnerabilities
docker scan space-game-app

# Check security
docker-compose config
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| App (Prod) | 80 | Nginx + Frontend |
| Backend | 3000 | API + WebSocket |
| Database | 5432 | PostgreSQL |
| Redis | 6379 | Cache |
| PgAdmin (Dev) | 5050 | DB Management |
| Frontend (Dev) | 5173 | Vite Dev Server |

## URLs

| Environment | URL |
|-------------|-----|
| Production | http://localhost |
| Dev Frontend | http://localhost:5173 |
| Dev Backend | http://localhost:3000 |
| PgAdmin | http://localhost:5050 |
| Health Check | http://localhost/health |

## See Full Docs

[DOCKER-DEPLOYMENT.md](./DOCKER-DEPLOYMENT.md)
