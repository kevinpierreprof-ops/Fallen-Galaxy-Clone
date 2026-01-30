/**
 * Message Model
 * 
 * Provides CRUD operations for the messages table.
 * Manages in-game messaging between players.
 */

import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import type Database from 'better-sqlite3';

/**
 * Message interface
 */
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  channel_id: string | null;
  content: string;
  timestamp: string;
  is_read: number;
  message_type: string;
}

/**
 * Create message data
 */
export interface CreateMessageData {
  sender_id: string;
  receiver_id?: string;
  channel_id?: string;
  content: string;
  message_type?: 'private' | 'channel' | 'global' | 'alliance';
}

/**
 * Message Model Class
 */
export class MessageModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new message
   */
  create(data: CreateMessageData): Message {
    try {
      const id = uuidv4();
      
      const stmt = this.db.prepare(`
        INSERT INTO messages (
          id, sender_id, receiver_id, channel_id, content, message_type
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.sender_id,
        data.receiver_id || null,
        data.channel_id || null,
        data.content,
        data.message_type || 'private'
      );

      logger.debug(`Message created: ${id}`);

      return this.findById(id)!;
    } catch (error) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Find message by ID
   */
  findById(id: string): Message | null {
    const stmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    const message = stmt.get(id) as Message | undefined;
    return message || null;
  }

  /**
   * Get private messages between two users
   */
  findPrivateMessages(userId1: string, userId2: string, limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(userId1, userId2, userId2, userId1, limit) as Message[];
  }

  /**
   * Get messages sent to user
   */
  findReceivedMessages(userId: string, limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE receiver_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit) as Message[];
  }

  /**
   * Get messages sent by user
   */
  findSentMessages(userId: string, limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE sender_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit) as Message[];
  }

  /**
   * Get channel messages
   */
  findChannelMessages(channelId: string, limit: number = 100): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE channel_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(channelId, limit) as Message[];
  }

  /**
   * Get unread messages for user
   */
  findUnreadMessages(userId: string): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE receiver_id = ? AND is_read = 0
      ORDER BY timestamp DESC
    `);
    return stmt.all(userId) as Message[];
  }

  /**
   * Mark message as read
   */
  markAsRead(id: string): boolean {
    try {
      const stmt = this.db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      logger.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Mark all messages as read for user
   */
  markAllAsRead(userId: string): number {
    try {
      const stmt = this.db.prepare('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND is_read = 0');
      const result = stmt.run(userId);
      return result.changes;
    } catch (error) {
      logger.error('Error marking all messages as read:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  delete(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM messages WHERE id = ?');
      const result = stmt.run(id);
      
      logger.debug(`Message deleted: ${id}`);
      
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Delete conversation between two users
   */
  deleteConversation(userId1: string, userId2: string): number {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
      `);
      const result = stmt.run(userId1, userId2, userId2, userId1);
      
      logger.debug(`Deleted ${result.changes} messages in conversation`);
      
      return result.changes;
    } catch (error) {
      logger.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Count unread messages for user
   */
  countUnread(userId: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0');
    const result = stmt.get(userId) as { count: number };
    return result.count;
  }

  /**
   * Get recent conversations for user
   */
  getRecentConversations(userId: string, limit: number = 10): any[] {
    const stmt = this.db.prepare(`
      SELECT 
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        MAX(timestamp) as last_message_time,
        COUNT(*) as message_count,
        SUM(CASE WHEN receiver_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM messages
      WHERE (sender_id = ? OR receiver_id = ?) AND message_type = 'private'
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
      LIMIT ?
    `);
    return stmt.all(userId, userId, userId, userId, limit) as any[];
  }

  /**
   * Search messages by content
   */
  search(userId: string, query: string, limit: number = 50): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? OR receiver_id = ?) AND content LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(userId, userId, searchPattern, limit) as Message[];
  }
}

// Export singleton instance
export const messageModel = new MessageModel();
