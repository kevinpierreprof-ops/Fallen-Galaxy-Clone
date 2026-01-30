/**
 * Server Integration with Game Tick Manager
 * 
 * Updated server.ts with game loop integration
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { logger } from '@/utils/logger';
import { GameTickManager } from '@/game/GameTickManager';
import { PlanetManager } from '@/planets/PlanetManager';
import { ShipManager } from '@/ships/ShipManager';
import { BuildingSystem } from '@/buildings/BuildingSystem';
import { ConstructionQueueManager } from '@/buildings/ConstructionQueueManager';
import { ShipMovementManager } from '@/ships/ShipMovementManager';
import { setupSocketHandlers } from '@/sockets/socketHandlers';
import authRoutes from '@/routes/authRoutes';
import gameRoutes from '@/routes/gameRoutes';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';

// Load environment variables
config();

const PORT = process.env.PORT || 3000;

// Create Express app
const app = express();
const httpServer = createServer(app);

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  const tickManager = (app as any).tickManager as GameTickManager;
  const stats = tickManager?.getStats();
  
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    gameLoop: {
      running: tickManager?.isActive() || false,
      tickCount: tickManager?.getTickCount() || 0,
      stats
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Error handling
app.use(errorHandler);

// Initialize game managers
const planetManager = new PlanetManager();
const shipManager = new ShipManager();
const buildingSystem = new BuildingSystem();
const queueManager = new ConstructionQueueManager();
const movementManager = new ShipMovementManager();

// Initialize game tick manager
const tickManager = new GameTickManager(
  io,
  planetManager,
  shipManager,
  buildingSystem,
  queueManager,
  movementManager,
  {
    tickInterval: 1000,        // 1 second
    saveInterval: 60,          // Save every 60 ticks (60 seconds)
    broadcastInterval: 1,      // Broadcast every tick
    enablePerformanceMonitoring: true
  }
);

// Store tickManager on app for access in routes
(app as any).tickManager = tickManager;

// Setup Socket.io handlers
setupSocketHandlers(io, planetManager, shipManager);

// Game tick manager event handlers
tickManager.on('started', () => {
  logger.info('Game loop started');
});

tickManager.on('stopped', () => {
  logger.info('Game loop stopped');
});

tickManager.on('tick', (tickCount) => {
  if (tickCount % 60 === 0) {
    logger.debug(`Game tick: ${tickCount}`);
  }
});

tickManager.on('stats', (stats) => {
  // Log stats every minute
  if (stats.tickNumber % 60 === 0) {
    logger.info('Game tick statistics', {
      tick: stats.tickNumber,
      duration: `${stats.tickDuration}ms`,
      avgDuration: `${stats.averageTickDuration.toFixed(2)}ms`,
      memory: `${stats.memoryUsage.toFixed(2)}MB`,
      planetsUpdated: stats.planetsUpdated,
      buildingsCompleted: stats.buildingsCompleted,
      shipsCompleted: stats.shipsCompleted
    });
  }
});

tickManager.on('error', (error) => {
  logger.error('Game tick error:', error);
});

tickManager.on('stateSaved', ({ duration, planets, ships }) => {
  logger.info('Game state saved', { duration: `${duration}ms`, planets, ships });
});

tickManager.on('saveError', (error) => {
  logger.error('Game state save error:', error);
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');

  // Stop accepting new connections
  httpServer.close(async () => {
    logger.info('HTTP server closed');

    // Stop game loop and save final state
    await tickManager.stop();

    // Close Socket.io connections
    io.close(() => {
      logger.info('Socket.io server closed');
    });

    // Close database connections
    // await db.close();

    logger.info('Server shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
  shutdown();
});

// Start server
httpServer.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start game loop
  tickManager.start();
});

export { app, httpServer, io, tickManager };
