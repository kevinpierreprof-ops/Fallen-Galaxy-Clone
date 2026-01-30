# Multi-Stage Dockerfile for Space Strategy Game
# Optimized for production with minimal image size

# ============================================
# Stage 1: Build Shared Types
# ============================================
FROM node:18-alpine AS shared-builder

WORKDIR /app/shared

# Copy shared package files
COPY shared/package*.json ./
COPY shared/tsconfig.base.json ./

# Install dependencies
RUN npm ci --only=production

# Copy shared source
COPY shared/ ./

# Build shared types
RUN npm run build || echo "Shared types compiled inline"

# ============================================
# Stage 2: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy shared types from previous stage
COPY --from=shared-builder /app/shared /app/shared

# Copy frontend source
COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/public ./public

# Build frontend
ARG VITE_API_URL=http://localhost:3000
ARG VITE_WS_URL=ws://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# ============================================
# Stage 3: Build Backend
# ============================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy shared types from stage 1
COPY --from=shared-builder /app/shared /app/shared

# Copy backend source
COPY backend/src ./src

# Build backend
RUN npm run build

# ============================================
# Stage 4: Production Image
# ============================================
FROM node:18-alpine AS production

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor curl

# Create app directory
WORKDIR /app

# ============================================
# Setup Backend
# ============================================

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built backend from builder
COPY --from=backend-builder /app/backend/dist ./dist

# Copy shared types
COPY --from=shared-builder /app/shared /app/shared

# Create logs directory
RUN mkdir -p logs

# ============================================
# Setup Frontend with Nginx
# ============================================

WORKDIR /app/frontend

# Copy built frontend from builder
COPY --from=frontend-builder /app/frontend/dist ./dist

# ============================================
# Nginx Configuration
# ============================================

# Remove default nginx config
RUN rm -f /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx-site.conf /etc/nginx/conf.d/default.conf

# Create nginx cache directories
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    && chown -R nginx:nginx /var/cache/nginx \
    && chmod -R 755 /var/cache/nginx

# ============================================
# Supervisor Configuration
# ============================================

# Copy supervisor config
COPY docker/supervisord.conf /etc/supervisord.conf

# ============================================
# Environment & Permissions
# ============================================

# Create volume mount points
RUN mkdir -p /app/data /app/logs \
    && chown -R node:node /app \
    && chmod -R 755 /app

# Set working directory
WORKDIR /app

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Expose ports
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Run supervisor to manage nginx and backend
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
