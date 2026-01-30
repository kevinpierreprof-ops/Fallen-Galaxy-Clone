#!/usr/bin/env ts-node
/**
 * Database CLI Utility
 * 
 * Command-line tool for database management tasks.
 * Usage: npm run db <command>
 * 
 * Commands:
 *   migrate     - Run pending migrations
 *   rollback    - Rollback last migration
 *   reset       - Reset database (WARNING: destroys all data)
 *   seed        - Seed database with test data
 *   status      - Show migration status
 *   stats       - Show database statistics
 *   backup      - Backup database to file
 */

import { program } from 'commander';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { 
  runMigrations, 
  rollbackMigration, 
  resetDatabase, 
  getMigrationStatus 
} from './migrations';
import { seedDatabase } from './seed';
import { getDatabase, getDatabaseStats, backupDatabase } from './connection';
import { logger } from '@/utils/logger';

// Configure CLI
program
  .name('db')
  .description('Database management CLI')
  .version('1.0.0');

/**
 * Migrate command
 */
program
  .command('migrate')
  .description('Run pending database migrations')
  .action(() => {
    try {
      logger.info('Running migrations...');
      runMigrations();
      logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Migrations completed');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Migration failed:', error);
      process.exit(1);
    }
  });

/**
 * Rollback command
 */
program
  .command('rollback')
  .description('Rollback the last migration')
  .action(() => {
    try {
      logger.info('Rolling back last migration...');
      rollbackMigration();
      logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Rollback completed');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Rollback failed:', error);
      process.exit(1);
    }
  });

/**
 * Reset command
 */
program
  .command('reset')
  .description('Reset database (WARNING: destroys all data)')
  .option('-f, --force', 'Skip confirmation')
  .action((options) => {
    if (!options.force) {
      logger.warn('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â  This will destroy all data!');
      logger.warn('Run with --force to confirm');
      process.exit(0);
    }

    try {
      logger.info('Resetting database...');
      resetDatabase();
      logger.info('Running migrations...');
      runMigrations();
      logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Database reset completed');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Reset failed:', error);
      process.exit(1);
    }
  });

/**
 * Seed command
 */
program
  .command('seed')
  .description('Seed database with test data')
  .action(async () => {
    try {
      logger.info('Seeding database...');
      await seedDatabase();
      logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Seeding completed');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Seeding failed:', error);
      process.exit(1);
    }
  });

/**
 * Status command
 */
program
  .command('status')
  .description('Show migration status')
  .action(() => {
    try {
      const status = getMigrationStatus();
      
      console.log('\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â  Migration Status\n');
      console.log('ID | Name                        | Status     | Executed At');
      console.log('---|----------------------------|------------|------------------');
      
      status.forEach(migration => {
        const id = String(migration.id).padEnd(2);
        const name = migration.name.padEnd(28);
        const status = migration.executed ? 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Applied' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â  Pending';
        const executedAt = migration.executedAt || '-';
        
        console.log(`${id} | ${name} | ${status} | ${executedAt}`);
      });
      
      console.log('');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Failed to get status:', error);
      process.exit(1);
    }
  });

/**
 * Stats command
 */
program
  .command('stats')
  .description('Show database statistics')
  .action(() => {
    try {
      const stats = getDatabaseStats();
      
      console.log('\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â  Database Statistics\n');
      console.log('Table             | Records');
      console.log('------------------|--------');
      
      Object.entries(stats.tables).forEach(([table, count]) => {
        const tableName = table.padEnd(17);
        console.log(`${tableName} | ${count}`);
      });
      
      console.log('------------------|--------');
      console.log(`Total             | ${stats.totalRecords}`);
      console.log('');
      
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Failed to get stats:', error);
      process.exit(1);
    }
  });

/**
 * Backup command
 */
program
  .command('backup')
  .description('Backup database to file')
  .argument('[filename]', 'Backup filename', `backup-${Date.now()}.db`)
  .action((filename: string) => {
    try {
      const backupPath = path.join(process.cwd(), 'backups', filename);
      logger.info(`Backing up database to ${backupPath}...`);
      
      backupDatabase(backupPath);
      
      logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Backup completed');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Backup failed:', error);
      process.exit(1);
    }
  });

/**
 * Vacuum command
 */
program
  .command('vacuum')
  .description('Vacuum database (reclaim space and optimize)')
  .action(() => {
    try {
      const db = getDatabase();
      logger.info('Running VACUUM...');
      db.exec('VACUUM');
      logger.info('Running ANALYZE...');
      db.exec('ANALYZE');
      logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Database optimized');
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Vacuum failed:', error);
      process.exit(1);
    }
  });

/**
 * Check command
 */
program
  .command('check')
  .description('Check database integrity')
  .action(() => {
    try {
      const db = getDatabase();
      logger.info('Checking database integrity...');
      
      const result = db.prepare('PRAGMA integrity_check').all() as any[];
      
      if (result.length === 1 && result[0].integrity_check === 'ok') {
        logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Database integrity check passed');
      } else {
        logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Database integrity check failed:');
        result.forEach(row => logger.error(row.integrity_check));
        process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Integrity check failed:', error);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
