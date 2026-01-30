/**
 * Database Migration System
 * 
 * Manages database schema migrations to keep the database structure up-to-date.
 * Migrations are run in order and tracked to prevent duplicate execution.
 */

import { getDatabase } from './connection';
import { logger } from '@/utils/logger';
import type Database from 'better-sqlite3';

/**
 * Migration interface
 */
export interface Migration {
  id: number;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

/**
 * Create migrations tracking table
 */
const createMigrationsTable = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
};

/**
 * Check if migration has been executed
 */
const isMigrationExecuted = (db: Database.Database, id: number): boolean => {
  const result = db.prepare('SELECT id FROM migrations WHERE id = ?').get(id);
  return result !== undefined;
};

/**
 * Record migration execution
 */
const recordMigration = (db: Database.Database, migration: Migration): void => {
  db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)').run(
    migration.id,
    migration.name
  );
};

/**
 * Remove migration record
 */
const removeMigration = (db: Database.Database, id: number): void => {
  db.prepare('DELETE FROM migrations WHERE id = ?').run(id);
};

/**
 * Define all migrations
 */
const migrations: Migration[] = [
  // ============================================================================
  // Migration 001: Create Users Table
  // ============================================================================
  {
    id: 1,
    name: 'create_users_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          last_login TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          is_admin INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX idx_users_username ON users(username);
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_created_at ON users(created_at);
      `);
      logger.info('Migration 001: Created users table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS users');
      logger.info('Migration 001: Dropped users table');
    }
  },

  // ============================================================================
  // Migration 002: Create Planets Table
  // ============================================================================
  {
    id: 2,
    name: 'create_planets_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS planets (
          id TEXT PRIMARY KEY,
          owner_id TEXT,
          name TEXT NOT NULL,
          x_position REAL NOT NULL,
          y_position REAL NOT NULL,
          size INTEGER NOT NULL DEFAULT 1,
          population REAL NOT NULL DEFAULT 0,
          max_population INTEGER NOT NULL DEFAULT 1000,
          minerals REAL NOT NULL DEFAULT 0,
          energy REAL NOT NULL DEFAULT 0,
          production_minerals REAL NOT NULL DEFAULT 0,
          production_energy REAL NOT NULL DEFAULT 0,
          production_credits REAL NOT NULL DEFAULT 0,
          buildings_json TEXT DEFAULT '[]',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE INDEX idx_planets_owner ON planets(owner_id);
        CREATE INDEX idx_planets_position ON planets(x_position, y_position);
        CREATE INDEX idx_planets_name ON planets(name);
      `);
      logger.info('Migration 002: Created planets table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS planets');
      logger.info('Migration 002: Dropped planets table');
    }
  },

  // ============================================================================
  // Migration 003: Create Ships Table
  // ============================================================================
  {
    id: 3,
    name: 'create_ships_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS ships (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          type TEXT NOT NULL,
          planet_id TEXT,
          fleet_id TEXT,
          x_position REAL NOT NULL DEFAULT 0,
          y_position REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'idle',
          health REAL NOT NULL,
          max_health REAL NOT NULL,
          speed REAL NOT NULL,
          damage REAL NOT NULL,
          stats_json TEXT DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (planet_id) REFERENCES planets(id) ON DELETE SET NULL
        );

        CREATE INDEX idx_ships_owner ON ships(owner_id);
        CREATE INDEX idx_ships_planet ON ships(planet_id);
        CREATE INDEX idx_ships_fleet ON ships(fleet_id);
        CREATE INDEX idx_ships_type ON ships(type);
        CREATE INDEX idx_ships_status ON ships(status);
      `);
      logger.info('Migration 003: Created ships table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS ships');
      logger.info('Migration 003: Dropped ships table');
    }
  },

  // ============================================================================
  // Migration 004: Create Messages Table
  // ============================================================================
  {
    id: 4,
    name: 'create_messages_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          sender_id TEXT NOT NULL,
          receiver_id TEXT,
          channel_id TEXT,
          content TEXT NOT NULL,
          timestamp TEXT NOT NULL DEFAULT (datetime('now')),
          is_read INTEGER NOT NULL DEFAULT 0,
          message_type TEXT NOT NULL DEFAULT 'private',
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_messages_sender ON messages(sender_id);
        CREATE INDEX idx_messages_receiver ON messages(receiver_id);
        CREATE INDEX idx_messages_channel ON messages(channel_id);
        CREATE INDEX idx_messages_timestamp ON messages(timestamp);
        CREATE INDEX idx_messages_is_read ON messages(is_read);
      `);
      logger.info('Migration 004: Created messages table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS messages');
      logger.info('Migration 004: Dropped messages table');
    }
  },

  // ============================================================================
  // Migration 005: Create Alliances Table
  // ============================================================================
  {
    id: 5,
    name: 'create_alliances_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS alliances (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          leader_id TEXT NOT NULL,
          description TEXT DEFAULT '',
          members_json TEXT DEFAULT '[]',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_alliances_name ON alliances(name);
        CREATE INDEX idx_alliances_leader ON alliances(leader_id);
        CREATE INDEX idx_alliances_created_at ON alliances(created_at);
      `);
      logger.info('Migration 005: Created alliances table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS alliances');
      logger.info('Migration 005: Dropped alliances table');
    }
  },

  // ============================================================================
  // Migration 006: Create Fleets Table
  // ============================================================================
  {
    id: 6,
    name: 'create_fleets_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS fleets (
          id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          x_position REAL NOT NULL,
          y_position REAL NOT NULL,
          destination_x REAL,
          destination_y REAL,
          speed REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'idle',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_fleets_owner ON fleets(owner_id);
        CREATE INDEX idx_fleets_status ON fleets(status);
      `);
      logger.info('Migration 006: Created fleets table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS fleets');
      logger.info('Migration 006: Dropped fleets table');
    }
  },

  // ============================================================================
  // Migration 007: Create Game Sessions Table
  // ============================================================================
  {
    id: 7,
    name: 'create_game_sessions_table',
    up: (db: Database.Database) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS game_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          socket_id TEXT,
          connected_at TEXT NOT NULL DEFAULT (datetime('now')),
          disconnected_at TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
        CREATE INDEX idx_game_sessions_socket ON game_sessions(socket_id);
        CREATE INDEX idx_game_sessions_active ON game_sessions(is_active);
      `);
      logger.info('Migration 007: Created game_sessions table');
    },
    down: (db: Database.Database) => {
      db.exec('DROP TABLE IF EXISTS game_sessions');
      logger.info('Migration 007: Dropped game_sessions table');
    }
  }
];

/**
 * Run all pending migrations
 */
export const runMigrations = (): void => {
  const db = getDatabase();
  
  try {
    logger.info('Starting database migrations...');
    
    // Create migrations tracking table
    createMigrationsTable(db);
    
    // Run each migration in order
    let executed = 0;
    migrations.forEach((migration) => {
      if (!isMigrationExecuted(db, migration.id)) {
        logger.info(`Running migration ${migration.id}: ${migration.name}`);
        
        // Run migration in transaction
        const txn = db.transaction(() => {
          migration.up(db);
          recordMigration(db, migration);
        });
        
        txn();
        executed++;
      }
    });
    
    if (executed === 0) {
      logger.info('All migrations already applied');
    } else {
      logger.info(`Applied ${executed} migration(s) successfully`);
    }
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Rollback last migration
 */
export const rollbackMigration = (): void => {
  const db = getDatabase();
  
  try {
    // Get last executed migration
    const lastMigration = db.prepare(`
      SELECT id, name FROM migrations 
      ORDER BY id DESC 
      LIMIT 1
    `).get() as any;
    
    if (!lastMigration) {
      logger.warn('No migrations to rollback');
      return;
    }
    
    const migration = migrations.find(m => m.id === lastMigration.id);
    
    if (!migration) {
      logger.error(`Migration ${lastMigration.id} not found in migration list`);
      return;
    }
    
    logger.info(`Rolling back migration ${migration.id}: ${migration.name}`);
    
    const txn = db.transaction(() => {
      migration.down(db);
      removeMigration(db, migration.id);
    });
    
    txn();
    
    logger.info('Migration rolled back successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  }
};

/**
 * Get migration status
 */
export const getMigrationStatus = (): any[] => {
  const db = getDatabase();
  
  const executedMigrations = db.prepare('SELECT * FROM migrations ORDER BY id').all();
  
  return migrations.map(migration => {
    const executed = executedMigrations.find((m: any) => m.id === migration.id);
    return {
      id: migration.id,
      name: migration.name,
      executed: executed !== undefined,
      executedAt: executed ? (executed as any).executed_at : null
    };
  });
};

/**
 * Reset database (rollback all migrations)
 */
export const resetDatabase = (): void => {
  const db = getDatabase();
  
  logger.warn('Resetting database - all data will be lost!');
  
  try {
    const executedMigrations = db.prepare('SELECT id FROM migrations ORDER BY id DESC').all();
    
    executedMigrations.forEach((migration: any) => {
      const m = migrations.find(x => x.id === migration.id);
      if (m) {
        logger.info(`Rolling back migration ${m.id}: ${m.name}`);
        m.down(db);
      }
    });
    
    db.exec('DROP TABLE IF EXISTS migrations');
    logger.info('Database reset complete');
  } catch (error) {
    logger.error('Database reset failed:', error);
    throw error;
  }
};
