/**
 * User Model
 * 
 * Provides CRUD operations for the users table.
 * Handles user authentication, registration, and profile management.
 */

import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { logger } from '@/utils/logger';
import type Database from 'better-sqlite3';

/**
 * User interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  last_login: string | null;
  is_active: number;
  is_admin: number;
}

/**
 * User creation data
 */
export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

/**
 * User update data
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

/**
 * User Model Class
 */
export class UserModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      const password_hash = await bcrypt.hash(data.password, saltRounds);

      const id = uuidv4();
      
      const stmt = this.db.prepare(`
        INSERT INTO users (id, username, email, password_hash)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(id, data.username, data.email, password_hash);

      logger.info(`User created: ${data.username} (${id})`);

      return this.findById(id)!;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  findById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user || null;
  }

  /**
   * Find user by email
   */
  findByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User | undefined;
    return user || null;
  }

  /**
   * Find user by username
   */
  findByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;
    return user || null;
  }

  /**
   * Get all users (with pagination)
   */
  findAll(limit: number = 100, offset: number = 0): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as User[];
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User | null> {
    try {
      const user = this.findById(id);
      if (!user) {
        return null;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.username !== undefined) {
        updates.push('username = ?');
        values.push(data.username);
      }

      if (data.email !== undefined) {
        updates.push('email = ?');
        values.push(data.email);
      }

      if (data.password !== undefined) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
        const password_hash = await bcrypt.hash(data.password, saltRounds);
        updates.push('password_hash = ?');
        values.push(password_hash);
      }

      if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(data.is_active ? 1 : 0);
      }

      if (data.is_admin !== undefined) {
        updates.push('is_admin = ?');
        values.push(data.is_admin ? 1 : 0);
      }

      if (updates.length === 0) {
        return user;
      }

      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      stmt.run(...values);

      logger.info(`User updated: ${id}`);

      return this.findById(id);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET last_login = datetime('now') 
      WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Delete user
   */
  delete(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
      const result = stmt.run(id);
      
      logger.info(`User deleted: ${id}`);
      
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = this.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * Count total users
   */
  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Count active users
   */
  countActive(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Search users by username or email
   */
  search(query: string, limit: number = 20): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE username LIKE ? OR email LIKE ?
      LIMIT ?
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern, limit) as User[];
  }

  /**
   * Get recently active users
   */
  getRecentlyActive(limit: number = 10): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE last_login IS NOT NULL 
      ORDER BY last_login DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as User[];
  }
}

// Export singleton instance
export const userModel = new UserModel();
