/**
 * Private Message Database Model
 * 
 * Database schema and operations for private messages
 */

import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type {
  Message,
  Conversation,
  BlockedUser,
  MessageStatus,
  MessageQueryParams,
  PaginatedMessages
} from '@shared/types/privateMessaging';

/**
 * Initialize private messaging tables
 */
export function initializePrivateMessagingTables(db: Database): void {
  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS private_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      conversation_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      read_at INTEGER,
      deleted_at INTEGER,
      deleted_by TEXT,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participant1_id TEXT NOT NULL,
      participant2_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(participant1_id, participant2_id)
    )
  `);

  // Blocked users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id TEXT PRIMARY KEY,
      blocker_id TEXT NOT NULL,
      blocked_user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(blocker_id, blocked_user_id)
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON private_messages(conversation_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON private_messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON private_messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON private_messages(status);
    CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
    CREATE INDEX IF NOT EXISTS idx_blocked_users ON blocked_users(blocker_id, blocked_user_id);
  `);
}

/**
 * Private Message Model
 */
export class PrivateMessageModel {
  constructor(private db: Database) {}

  /**
   * Create a new message
   */
  create(data: {
    senderId: string;
    receiverId: string;
    content: string;
    conversationId: string;
  }): Message {
    const now = Date.now();
    const message: Message = {
      id: uuidv4(),
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      status: 'sent' as MessageStatus,
      conversationId: data.conversationId,
      createdAt: now,
      updatedAt: now
    };

    const stmt = this.db.prepare(`
      INSERT INTO private_messages (
        id, sender_id, receiver_id, content, status, 
        conversation_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.id,
      message.senderId,
      message.receiverId,
      message.content,
      message.status,
      message.conversationId,
      message.createdAt,
      message.updatedAt
    );

    return message;
  }

  /**
   * Find message by ID
   */
  findById(id: string): Message | null {
    const stmt = this.db.prepare(`
      SELECT * FROM private_messages WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row ? this.mapToMessage(row) : null;
  }

  /**
   * Get messages with pagination and filters
   */
  findMessages(params: MessageQueryParams): PaginatedMessages {
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    let query = 'SELECT * FROM private_messages WHERE 1=1';
    const queryParams: any[] = [];

    if (params.conversationId) {
      query += ' AND conversation_id = ?';
      queryParams.push(params.conversationId);
    }

    if (params.participantId) {
      query += ' AND (sender_id = ? OR receiver_id = ?)';
      queryParams.push(params.participantId, params.participantId);
    }

    if (params.before) {
      query += ' AND created_at < ?';
      queryParams.push(params.before);
    }

    if (params.after) {
      query += ' AND created_at > ?';
      queryParams.push(params.after);
    }

    if (params.search) {
      query += ' AND content LIKE ?';
      queryParams.push(`%${params.search}%`);
    }

    // Exclude deleted messages
    query += ' AND deleted_at IS NULL';

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countStmt = this.db.prepare(countQuery);
    const { count } = countStmt.get(...queryParams) as { count: number };

    // Get messages
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    return {
      messages: rows.map(row => this.mapToMessage(row)),
      total: count,
      limit,
      offset,
      hasMore: offset + limit < count
    };
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string, userId: string): boolean {
    const message = this.findById(messageId);
    if (!message || message.receiverId !== userId) {
      return false;
    }

    const stmt = this.db.prepare(`
      UPDATE private_messages 
      SET status = 'read', read_at = ?, updated_at = ?
      WHERE id = ? AND receiver_id = ?
    `);

    const now = Date.now();
    const result = stmt.run(now, now, messageId, userId);

    return result.changes > 0;
  }

  /**
   * Mark all messages in conversation as read
   */
  markConversationAsRead(conversationId: string, userId: string): number {
    const stmt = this.db.prepare(`
      UPDATE private_messages 
      SET status = 'read', read_at = ?, updated_at = ?
      WHERE conversation_id = ? 
        AND receiver_id = ? 
        AND status != 'read'
        AND deleted_at IS NULL
    `);

    const now = Date.now();
    const result = stmt.run(now, now, conversationId, userId);

    return result.changes;
  }

  /**
   * Soft delete message
   */
  deleteMessage(messageId: string, userId: string): boolean {
    const message = this.findById(messageId);
    if (!message) {
      return false;
    }

    // Parse deletedBy array
    const deletedBy = message.deletedBy || [];
    if (deletedBy.includes(userId)) {
      return false; // Already deleted by this user
    }

    deletedBy.push(userId);

    const stmt = this.db.prepare(`
      UPDATE private_messages 
      SET deleted_by = ?, updated_at = ?, deleted_at = ?
      WHERE id = ?
    `);

    const now = Date.now();
    const result = stmt.run(
      JSON.stringify(deletedBy),
      now,
      now,
      messageId
    );

    return result.changes > 0;
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId: string, conversationId?: string): number {
    let query = `
      SELECT COUNT(*) as count 
      FROM private_messages 
      WHERE receiver_id = ? 
        AND status != 'read'
        AND deleted_at IS NULL
    `;

    const params: any[] = [userId];

    if (conversationId) {
      query += ' AND conversation_id = ?';
      params.push(conversationId);
    }

    const stmt = this.db.prepare(query);
    const { count } = stmt.get(...params) as { count: number };

    return count;
  }

  /**
   * Search messages
   */
  search(userId: string, searchQuery: string, limit = 50): Message[] {
    const stmt = this.db.prepare(`
      SELECT * FROM private_messages
      WHERE (sender_id = ? OR receiver_id = ?)
        AND content LIKE ?
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(
      userId,
      userId,
      `%${searchQuery}%`,
      limit
    ) as any[];

    return rows.map(row => this.mapToMessage(row));
  }

  /**
   * Map database row to Message
   */
  private mapToMessage(row: any): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      status: row.status as MessageStatus,
      conversationId: row.conversation_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      readAt: row.read_at || undefined,
      deletedAt: row.deleted_at || undefined,
      deletedBy: row.deleted_by ? JSON.parse(row.deleted_by) : undefined
    };
  }
}

/**
 * Conversation Model
 */
export class ConversationModel {
  constructor(private db: Database) {}

  /**
   * Get or create conversation between two users
   */
  getOrCreate(userId1: string, userId2: string): Conversation {
    // Ensure consistent ordering
    const [participant1, participant2] = [userId1, userId2].sort();

    const conversationId = `conv_${participant1}_${participant2}`;

    // Try to find existing conversation
    let conversation = this.findById(conversationId);

    if (!conversation) {
      // Create new conversation
      const now = Date.now();
      
      const stmt = this.db.prepare(`
        INSERT INTO conversations (id, participant1_id, participant2_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(conversationId, participant1, participant2, now, now);

      conversation = {
        id: conversationId,
        participants: [participant1, participant2],
        unreadCount: {},
        createdAt: now,
        updatedAt: now
      };
    }

    return conversation;
  }

  /**
   * Find conversation by ID
   */
  findById(id: string): Conversation | null {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    return row ? this.mapToConversation(row) : null;
  }

  /**
   * Get all conversations for a user
   */
  findByUser(userId: string, limit = 50, offset = 0): Conversation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations
      WHERE participant1_id = ? OR participant2_id = ?
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(userId, userId, limit, offset) as any[];
    return rows.map(row => this.mapToConversation(row));
  }

  /**
   * Update conversation timestamp
   */
  touch(conversationId: string): void {
    const stmt = this.db.prepare(`
      UPDATE conversations SET updated_at = ? WHERE id = ?
    `);

    stmt.run(Date.now(), conversationId);
  }

  /**
   * Map database row to Conversation
   */
  private mapToConversation(row: any): Conversation {
    return {
      id: row.id,
      participants: [row.participant1_id, row.participant2_id],
      unreadCount: {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

/**
 * Blocked Users Model
 */
export class BlockedUserModel {
  constructor(private db: Database) {}

  /**
   * Block a user
   */
  block(blockerId: string, blockedUserId: string): BlockedUser {
    const blocked: BlockedUser = {
      id: uuidv4(),
      blockerId,
      blockedUserId,
      createdAt: Date.now()
    };

    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO blocked_users (id, blocker_id, blocked_user_id, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(blocked.id, blocked.blockerId, blocked.blockedUserId, blocked.createdAt);

    return blocked;
  }

  /**
   * Unblock a user
   */
  unblock(blockerId: string, blockedUserId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM blocked_users
      WHERE blocker_id = ? AND blocked_user_id = ?
    `);

    const result = stmt.run(blockerId, blockedUserId);
    return result.changes > 0;
  }

  /**
   * Check if user is blocked
   */
  isBlocked(blockerId: string, blockedUserId: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM blocked_users
      WHERE blocker_id = ? AND blocked_user_id = ?
    `);

    const { count } = stmt.get(blockerId, blockedUserId) as { count: number };
    return count > 0;
  }

  /**
   * Check if either user has blocked the other
   */
  hasBlockedEachOther(userId1: string, userId2: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM blocked_users
      WHERE (blocker_id = ? AND blocked_user_id = ?)
         OR (blocker_id = ? AND blocked_user_id = ?)
    `);

    const { count } = stmt.get(userId1, userId2, userId2, userId1) as { count: number };
    return count > 0;
  }

  /**
   * Get all blocked users for a user
   */
  getBlockedUsers(blockerId: string): string[] {
    const stmt = this.db.prepare(`
      SELECT blocked_user_id FROM blocked_users WHERE blocker_id = ?
    `);

    const rows = stmt.all(blockerId) as any[];
    return rows.map(row => row.blocked_user_id);
  }
}
