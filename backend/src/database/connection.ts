/**
 * Database Configuration
 * 
 * Manages SQLite database connection and initialization using better-sqlite3.
 * Provides a singleton connection instance for the entire application.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { logger } from '@/utils/logger';

/**
 * Database configuration options
 */
interface DatabaseConfig {
  filename: string;
  verbose?: boolean;
  readonly?: boolean;
  fileMustExist?: boolean;
}

/**
 * Database connection singleton class
 */
class DatabaseConnection {
  private static instance: Database.Database | null = null;
  private static config: DatabaseConfig;

  /**
   * Get or create database instance
   */
  public static getInstance(): Database.Database {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.initialize();
    }
    return DatabaseConnection.instance!;
  }

  /**
   * Initialize database connection
   */
  private static initialize(): void {
    try {
      // Determine database path based on environment
      const isProduction = process.env.NODE_ENV === 'production';
      const isTest = process.env.NODE_ENV === 'test';
      
      let dbPath: string;
      
      if (isTest) {
        // Use in-memory database for tests
        dbPath = ':memory:';
      } else if (isProduction) {
        // Production database location
        dbPath = process.env.DATABASE_PATH || '/app/data/space-strategy.db';
      } else {
        // Development database location
        dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'space-strategy.db');
      }

      // Create data directory if it doesn't exist (except for in-memory)
      if (dbPath !== ':memory:') {
        const dataDir = path.dirname(dbPath);
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true });
          logger.info(`Created database directory: ${dataDir}`);
        }
      }

      // Configure database
      DatabaseConnection.config = {
        filename: dbPath,
        verbose: process.env.DATABASE_VERBOSE === 'true' ? console.log : undefined,
        readonly: false,
        fileMustExist: false
      };

      // Create database connection
      DatabaseConnection.instance = new Database(
        DatabaseConnection.config.filename,
        {
          verbose: DatabaseConnection.config.verbose,
          readonly: DatabaseConnection.config.readonly,
          fileMustExist: DatabaseConnection.config.fileMustExist
        }
      );

      // Enable foreign keys (important for referential integrity)
      DatabaseConnection.instance.pragma('foreign_keys = ON');

      // Set WAL mode for better concurrency
      DatabaseConnection.instance.pragma('journal_mode = WAL');

      // Optimize performance
      DatabaseConnection.instance.pragma('synchronous = NORMAL');
      DatabaseConnection.instance.pragma('cache_size = 10000');
      DatabaseConnection.instance.pragma('temp_store = MEMORY');

      logger.info(`Database connected: ${dbPath === ':memory:' ? 'In-Memory' : dbPath}`);
      logger.info(`Database mode: ${process.env.NODE_ENV || 'development'}`);
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
      logger.info('Database connection closed');
    }
  }

  /**
   * Check if database is connected
   */
  public static isConnected(): boolean {
    return DatabaseConnection.instance !== null && DatabaseConnection.instance.open;
  }

  /**
   * Get database info
   */
  public static getInfo(): any {
    if (!DatabaseConnection.instance) {
      return null;
    }

    return {
      filename: DatabaseConnection.config.filename,
      inMemory: DatabaseConnection.config.filename === ':memory:',
      readonly: DatabaseConnection.config.readonly,
      open: DatabaseConnection.instance.open,
      pragma: {
        foreignKeys: DatabaseConnection.instance.pragma('foreign_keys', { simple: true }),
        journalMode: DatabaseConnection.instance.pragma('journal_mode', { simple: true }),
        synchronous: DatabaseConnection.instance.pragma('synchronous', { simple: true })
      }
    };
  }

  /**
   * Backup database to file
   */
  public static backup(destinationPath: string): void {
    if (!DatabaseConnection.instance) {
      throw new Error('Database not connected');
    }

    const backup = DatabaseConnection.instance.backup(destinationPath);
    backup.step(-1); // Complete backup in one step
    backup.close();
    
    logger.info(`Database backed up to: ${destinationPath}`);
  }

  /**
   * Execute a transaction
   */
  public static transaction<T>(fn: (db: Database.Database) => T): T {
    const db = DatabaseConnection.getInstance();
    const txn = db.transaction(fn);
    return txn(db);
  }

  /**
   * Get database statistics
   */
  public static getStats(): any {
    const db = DatabaseConnection.getInstance();
    
    const tables = db.prepare(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();

    const stats: any = {
      tables: {},
      totalRecords: 0
    };

    tables.forEach((table: any) => {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
      stats.tables[table.name] = count.count;
      stats.totalRecords += count.count;
    });

    return stats;
  }
}

// Export database instance getter
export const getDatabase = () => DatabaseConnection.getInstance();
export const closeDatabase = () => DatabaseConnection.close();
export const isConnected = () => DatabaseConnection.isConnected();
export const getDatabaseInfo = () => DatabaseConnection.getInfo();
export const backupDatabase = (path: string) => DatabaseConnection.backup(path);
export const transaction = <T>(fn: (db: Database.Database) => T) => DatabaseConnection.transaction(fn);
export const getDatabaseStats = () => DatabaseConnection.getStats();

export default DatabaseConnection;
