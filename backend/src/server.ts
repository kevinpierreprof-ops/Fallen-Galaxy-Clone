/**
 * Space Strategy Game - Main Server Entry Point
 * 
 * This is the main server file that configures and starts the Express application
 * with Socket.io for real-time multiplayer game functionality.
 * 
 * Features:
 * - RESTful API for authentication and game management
 * - Socket.io for real-time bidirectional communication
 * - JWT-based authentication
 * - Session management for connected players
 * - CORS configuration for cross-origin requests
 * - Comprehensive error handling and logging
 * - Graceful shutdown handling
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import custom modules
import { GameManager } from '@/game/GameManager';
import { PlayerManager } from '@/players/PlayerManager';
import { logger } from '@/utils/logger';
import { initializeDatabase, shutdownDatabase, checkDatabaseHealth } from '@/database';
import { seedDatabase, needsSeeding } from '@/database/seed';

// Import routes
import authRoutes from '@/routes/authRoutes';
import gameRoutes from '@/routes/gameRoutes';
import planetRoutes from '@/routes/planetRoutes';

// Import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { rateLimiter } from '@/middleware/rateLimiter';

// Import Socket.io handlers
import { setupSocketHandlers } from '@/sockets/socketHandlers';

// Import types
import type { TypedSocket } from '@/types/socket';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'JWT_SECRET', 'CORS_ORIGIN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// ============================================================================
// EXPRESS APPLICATION SETUP
// ============================================================================

const app: Application = express();
const httpServer: HTTPServer = createServer(app);

// Configure Socket.io server with CORS and connection options
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Connection options
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 10000,
  maxHttpBufferSize: 1e6, // 1MB
  transports: ['websocket', 'polling']
});

// ============================================================================
// GAME MANAGERS INITIALIZATION
// ============================================================================

// Initialize database first
let databaseInitialized = false;

(async () => {
  try {
    await initializeDatabase();
    databaseInitialized = true;
    
    // Seed database if needed (development only)
    if (process.env.NODE_ENV === 'development' && needsSeeding()) {
      logger.info('Database is empty, running seeders...');
      await seedDatabase();
    }
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Initialize core game managers as singletons
const gameManager = new GameManager();
const playerManager = new PlayerManager();

// Make managers available globally for routes and socket handlers
app.locals.gameManager = gameManager;
app.locals.playerManager = playerManager;
app.locals.io = io;

logger.info('Game managers initialized successfully');

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * Allows the frontend to make requests to the backend API
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Body Parser Middleware
 * Parses incoming JSON payloads in request bodies
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 * Logs all incoming HTTP requests for debugging and monitoring
 */
app.use(requestLogger);

/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests per IP address
 */
app.use('/api/', rateLimiter);

/**
 * Security Headers
 * Add basic security headers to all responses
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Simple Health Check Endpoint (for load balancers)
 * Returns basic health status without database check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Detailed Health Check Endpoint
 * Used for monitoring and load balancer health checks with database info
 */
app.get('/api/health', (req: Request, res: Response) => {
  const dbHealth = checkDatabaseHealth();
  
  res.json({
    status: dbHealth.healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      healthy: dbHealth.healthy,
      message: dbHealth.message,
      stats: dbHealth.stats
    }
  });
});

/**
 * Root Endpoint
 * Provides basic API information
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Space Strategy Game API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      healthDetailed: '/api/health',
      auth: '/api/auth',
      game: '/api/game'
    }
  });
});

/**
 * Authentication Routes
 * Handles user registration, login, and logout
 */
app.use('/api/auth', authRoutes);

/**
 * Planet Routes
 * Handles planet-related API endpoints
 * NOTE: Must be mounted before general game routes to avoid route conflicts
 */
app.use('/api/game/planets', planetRoutes);

/**
 * Game Routes
 * Handles game-related API endpoints
 */
app.use('/api/game', gameRoutes);

/**
 * 404 Handler
 * Catches all undefined routes
 */
app.use((req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global Error Handler
 * Catches and handles all errors that occur during request processing
 */
app.use(errorHandler);

// ============================================================================
// SOCKET.IO CONNECTION HANDLING
// ============================================================================

/**
 * Socket.io Connection Event
 * Handles new client connections and sets up event listeners
 */
io.on('connection', (socket: TypedSocket) => {
  logger.info(`Socket connected: ${socket.id} from ${socket.handshake.address}`);

  // Setup all socket event handlers
  setupSocketHandlers(socket, io, gameManager, playerManager);

  /**
   * Socket Disconnection Event
   * Cleanup when a client disconnects
   */
  socket.on('disconnect', (reason: string) => {
    logger.info(`Socket disconnected: ${socket.id} - Reason: ${reason}`);
    
    // Clean up player data
    playerManager.removePlayer(socket.id);
    gameManager.handlePlayerLeave(socket.id);
    
    // Notify other players
    socket.broadcast.emit('player:left', {
      playerId: socket.id,
      timestamp: Date.now()
    });
  });

  /**
   * Socket Error Event
   * Handle socket errors
   */
  socket.on('error', (error: Error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// ============================================================================
// GAME LOOP
// ============================================================================

/**
 * Main Game Loop
 * Updates game state at a fixed rate and broadcasts to all connected clients
 * Running at 30 FPS (30 updates per second)
 */
const GAME_UPDATE_RATE = 30; // Updates per second
const UPDATE_INTERVAL = 1000 / GAME_UPDATE_RATE;

let lastUpdateTime = Date.now();
let updateCount = 0;

const gameLoop = setInterval(() => {
  try {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    
    // Update game state
    gameManager.update();
    
    // Get current game state
    const gameState = gameManager.getGameState();
    
    // Broadcast to all connected clients
    io.emit('game:update', gameState);
    
    // Update timing
    lastUpdateTime = now;
    updateCount++;
    
    // Log performance every 5 seconds
    if (updateCount % (GAME_UPDATE_RATE * 5) === 0) {
      const actualRate = 1000 / deltaTime;
      logger.debug(`Game loop running at ${actualRate.toFixed(2)} updates/sec`);
    }
  } catch (error) {
    logger.error('Error in game loop:', error);
  }
}, UPDATE_INTERVAL);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

/**
 * Start the HTTP server
 */
httpServer.listen(PORT, HOST, () => {
  logger.info('='.repeat(60));
  logger.info('ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Space Strategy Game Server Started');
  logger.info('='.repeat(60));
  logger.info(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€šÃ‚Â Server listening on ${HOST}:${PORT}`);
  logger.info(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã¢â‚¬â„¢Ãƒâ€šÃ‚Â Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â API URL: http://${HOST}:${PORT}`);
  logger.info(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€¦Ã¢â‚¬â„¢ WebSocket: ws://${HOST}:${PORT}`);
  logger.info(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â½Ãƒâ€šÃ‚Â® Game update rate: ${GAME_UPDATE_RATE} FPS`);
  logger.info(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€¦Ã‚Â  CORS origin: ${process.env.CORS_ORIGIN}`);
  logger.info('='.repeat(60));
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Graceful Shutdown Handler
 * Ensures all connections are closed properly before exiting
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, initiating graceful shutdown...`);
  
  // Stop accepting new connections
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    
    // Clear game loop
    clearInterval(gameLoop);
    logger.info('Game loop stopped');
    
    // Disconnect all socket connections
    io.disconnectSockets(true);
    logger.info('All socket connections closed');
    
    // Close Socket.io server
    await new Promise<void>((resolve) => {
      io.close(() => {
        logger.info('Socket.io server closed');
        resolve();
      });
    });
    
    // Close database connection
    try {
      shutdownDatabase();
    } catch (error) {
      logger.error('Error closing database:', error);
    }
    
    // Perform any cleanup tasks
    logger.info('Cleanup completed');
    
    // Exit process
    logger.info('Server shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Graceful shutdown timeout, forcing exit');
    process.exit(1);
  }, 10000);
};

// Register shutdown handlers for different signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Export app and io for testing purposes
export { app, io, httpServer };
