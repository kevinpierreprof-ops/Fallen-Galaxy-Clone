/**
 * Database Initialization
 * 
 * Initializes the database connection and runs migrations.
 * Should be called when the server starts.
 */

import { getDatabase, closeDatabase, getDatabaseInfo, getDatabaseStats } from './connection';
import { runMigrations, getMigrationStatus } from './migrations';
import { logger } from '@/utils/logger';

/**
 * Initialize database
 * Connects to database and runs migrations
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing database...');
    
    // Get database connection
    const db = getDatabase();
    
    // Run migrations
    runMigrations();
    
    // Get database info
    const info = getDatabaseInfo();
    logger.info('Database configuration:', info);
    
    // Get migration status
    const migrations = getMigrationStatus();
    const executedCount = migrations.filter(m => m.executed).length;
    logger.info(`Migrations: ${executedCount}/${migrations.length} executed`);
    
    // Get database stats
    const stats = getDatabaseStats();
    logger.info('Database statistics:', stats);
    
    logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Database initialized successfully');
  } catch (error) {
    logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Close database connection
 * Should be called when shutting down the server
 */
export const shutdownDatabase = (): void => {
  try {
    logger.info('Shutting down database...');
    closeDatabase();
    logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Database connection closed');
  } catch (error) {
    logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Error closing database:', error);
    throw error;
  }
};

/**
 * Health check for database
 */
export const checkDatabaseHealth = (): { healthy: boolean; message: string; stats?: any } => {
  try {
    const db = getDatabase();
    
    // Simple query to check if database is responsive
    const result = db.prepare('SELECT 1 as test').get() as { test: number };
    
    if (result.test !== 1) {
      return {
        healthy: false,
        message: 'Database query returned unexpected result'
      };
    }
    
    const stats = getDatabaseStats();
    
    return {
      healthy: true,
      message: 'Database is healthy',
      stats
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export { getDatabase, closeDatabase, getDatabaseInfo, getDatabaseStats };
export * from './migrations';
export * from './models/UserModel';
export * from './models/PlanetModel';
export * from './models/ShipModel';
export * from './models/MessageModel';
export * from './models/AllianceModel';
