/**
 * Alliance Database Models
 * 
 * Database schema and operations for alliances
 */

import { Database } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type {
  Alliance,
  AllianceMember,
  AllianceInvitation,
  AllianceChatMessage,
  AllianceRole,
  InvitationStatus,
  AllianceSettings
} from '@shared/types/alliance';

/**
 * Default alliance settings
 */
const DEFAULT_SETTINGS: AllianceSettings = {
  isPublic: true,
  autoAccept: false,
  allowOfficerInvite: false,
  sharedVision: true
};

/**
 * Initialize alliance tables
 */
export function initializeAllianceTables(db: Database): void {
  // Alliances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alliances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      tag TEXT NOT NULL UNIQUE,
      description TEXT,
      leader_id TEXT NOT NULL,
      max_members INTEGER DEFAULT 50,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      settings TEXT NOT NULL,
      FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Alliance members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alliance_members (
      user_id TEXT NOT NULL,
      alliance_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at INTEGER NOT NULL,
      contribution_points INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, alliance_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (alliance_id) REFERENCES alliances(id) ON DELETE CASCADE
    )
  `);

  // Alliance invitations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alliance_invitations (
      id TEXT PRIMARY KEY,
      alliance_id TEXT NOT NULL,
      inviter_id TEXT NOT NULL,
      invitee_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      responded_at INTEGER,
      FOREIGN KEY (alliance_id) REFERENCES alliances(id) ON DELETE CASCADE,
      FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Alliance chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alliance_chat (
      id TEXT PRIMARY KEY,
      alliance_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      edited_at INTEGER,
      deleted_at INTEGER,
      FOREIGN KEY (alliance_id) REFERENCES alliances(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_alliances_name ON alliances(name);
    CREATE INDEX IF NOT EXISTS idx_alliances_tag ON alliances(tag);
    CREATE INDEX IF NOT EXISTS idx_alliance_members_user ON alliance_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_alliance_members_alliance ON alliance_members(alliance_id);
    CREATE INDEX IF NOT EXISTS idx_alliance_invitations_invitee ON alliance_invitations(invitee_id, status);
    CREATE INDEX IF NOT EXISTS idx_alliance_chat_alliance ON alliance_chat(alliance_id, created_at DESC);
  `);
}

/**
 * Alliance Model
 */
export class AllianceModel {
  constructor(private db: Database) {}

  /**
   * Create a new alliance
   */
  create(data: {
    name: string;
    tag: string;
    leaderId: string;
    description?: string;
    settings?: Partial<AllianceSettings>;
  }): Alliance {
    const now = Date.now();
    const settings = { ...DEFAULT_SETTINGS, ...data.settings };

    const alliance: Alliance = {
      id: uuidv4(),
      name: data.name,
      tag: data.tag.toUpperCase(),
      description: data.description,
      leaderId: data.leaderId,
      members: [],
      maxMembers: 50,
      createdAt: now,
      updatedAt: now,
      settings
    };

    const stmt = this.db.prepare(`
      INSERT INTO alliances (
        id, name, tag, description, leader_id, max_members,
        created_at, updated_at, settings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      alliance.id,
      alliance.name,
      alliance.tag,
      alliance.description || null,
      alliance.leaderId,
      alliance.maxMembers,
      alliance.createdAt,
      alliance.updatedAt,
      JSON.stringify(alliance.settings)
    );

    // Add leader as member
    this.addMember(alliance.id, data.leaderId, 'leader');

    return alliance;
  }

  /**
   * Find alliance by ID
   */
  findById(id: string): Alliance | null {
    const stmt = this.db.prepare('SELECT * FROM alliances WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.mapToAlliance(row);
  }

  /**
   * Find alliance by name
   */
  findByName(name: string): Alliance | null {
    const stmt = this.db.prepare('SELECT * FROM alliances WHERE name = ?');
    const row = stmt.get(name) as any;

    if (!row) return null;

    return this.mapToAlliance(row);
  }

  /**
   * Find alliance by tag
   */
  findByTag(tag: string): Alliance | null {
    const stmt = this.db.prepare('SELECT * FROM alliances WHERE tag = ?');
    const row = stmt.get(tag.toUpperCase()) as any;

    if (!row) return null;

    return this.mapToAlliance(row);
  }

  /**
   * Find user's alliance
   */
  findByUserId(userId: string): Alliance | null {
    const stmt = this.db.prepare(`
      SELECT a.* FROM alliances a
      JOIN alliance_members m ON a.id = m.alliance_id
      WHERE m.user_id = ?
    `);

    const row = stmt.get(userId) as any;

    if (!row) return null;

    return this.mapToAlliance(row);
  }

  /**
   * Get all alliances with pagination
   */
  findAll(limit = 50, offset = 0): Alliance[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliances
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset) as any[];
    return rows.map(row => this.mapToAlliance(row));
  }

  /**
   * Search alliances
   */
  search(query: string, limit = 50): Alliance[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliances
      WHERE name LIKE ? OR tag LIKE ?
      ORDER BY name
      LIMIT ?
    `);

    const searchPattern = `%${query}%`;
    const rows = stmt.all(searchPattern, searchPattern, limit) as any[];
    return rows.map(row => this.mapToAlliance(row));
  }

  /**
   * Update alliance
   */
  update(id: string, data: Partial<Alliance>): boolean {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (data.settings) {
      updates.push('settings = ?');
      values.push(JSON.stringify(data.settings));
    }

    if (data.leaderId) {
      updates.push('leader_id = ?');
      values.push(data.leaderId);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE alliances
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  /**
   * Delete alliance
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM alliances WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Add member to alliance
   */
  addMember(allianceId: string, userId: string, role: AllianceRole = 'member'): boolean {
    const stmt = this.db.prepare(`
      INSERT INTO alliance_members (user_id, alliance_id, role, joined_at)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.run(userId, allianceId, role, Date.now());
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove member from alliance
   */
  removeMember(allianceId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM alliance_members
      WHERE alliance_id = ? AND user_id = ?
    `);

    const result = stmt.run(allianceId, userId);
    return result.changes > 0;
  }

  /**
   * Update member role
   */
  updateMemberRole(allianceId: string, userId: string, role: AllianceRole): boolean {
    const stmt = this.db.prepare(`
      UPDATE alliance_members
      SET role = ?
      WHERE alliance_id = ? AND user_id = ?
    `);

    const result = stmt.run(role, allianceId, userId);
    return result.changes > 0;
  }

  /**
   * Get alliance members
   */
  getMembers(allianceId: string): AllianceMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliance_members WHERE alliance_id = ?
    `);

    const rows = stmt.all(allianceId) as any[];
    return rows.map(row => ({
      userId: row.user_id,
      allianceId: row.alliance_id,
      role: row.role as AllianceRole,
      joinedAt: row.joined_at,
      contributionPoints: row.contribution_points
    }));
  }

  /**
   * Get member count
   */
  getMemberCount(allianceId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM alliance_members WHERE alliance_id = ?
    `);

    const { count } = stmt.get(allianceId) as { count: number };
    return count;
  }

  /**
   * Map database row to Alliance
   */
  private mapToAlliance(row: any): Alliance {
    const members = this.getMembers(row.id);

    return {
      id: row.id,
      name: row.name,
      tag: row.tag,
      description: row.description,
      leaderId: row.leader_id,
      members,
      maxMembers: row.max_members,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      settings: JSON.parse(row.settings)
    };
  }
}

/**
 * Alliance Invitation Model
 */
export class AllianceInvitationModel {
  constructor(private db: Database) {}

  /**
   * Create invitation
   */
  create(data: {
    allianceId: string;
    inviterId: string;
    inviteeId: string;
    message?: string;
  }): AllianceInvitation {
    const now = Date.now();
    const invitation: AllianceInvitation = {
      id: uuidv4(),
      allianceId: data.allianceId,
      inviterId: data.inviterId,
      inviteeId: data.inviteeId,
      status: 'pending',
      message: data.message,
      createdAt: now,
      expiresAt: now + 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    const stmt = this.db.prepare(`
      INSERT INTO alliance_invitations (
        id, alliance_id, inviter_id, invitee_id, status, message,
        created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      invitation.id,
      invitation.allianceId,
      invitation.inviterId,
      invitation.inviteeId,
      invitation.status,
      invitation.message || null,
      invitation.createdAt,
      invitation.expiresAt
    );

    return invitation;
  }

  /**
   * Find invitation by ID
   */
  findById(id: string): AllianceInvitation | null {
    const stmt = this.db.prepare('SELECT * FROM alliance_invitations WHERE id = ?');
    const row = stmt.get(id) as any;

    return row ? this.mapToInvitation(row) : null;
  }

  /**
   * Get pending invitations for user
   */
  getPendingForUser(userId: string): AllianceInvitation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliance_invitations
      WHERE invitee_id = ? AND status = 'pending' AND expires_at > ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId, Date.now()) as any[];
    return rows.map(row => this.mapToInvitation(row));
  }

  /**
   * Update invitation status
   */
  updateStatus(id: string, status: InvitationStatus): boolean {
    const stmt = this.db.prepare(`
      UPDATE alliance_invitations
      SET status = ?, responded_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(status, Date.now(), id);
    return result.changes > 0;
  }

  /**
   * Delete invitation
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM alliance_invitations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Map database row to AllianceInvitation
   */
  private mapToInvitation(row: any): AllianceInvitation {
    return {
      id: row.id,
      allianceId: row.alliance_id,
      inviterId: row.inviter_id,
      inviteeId: row.invitee_id,
      status: row.status as InvitationStatus,
      message: row.message,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      respondedAt: row.responded_at
    };
  }
}

/**
 * Alliance Chat Model
 */
export class AllianceChatModel {
  constructor(private db: Database) {}

  /**
   * Create chat message
   */
  create(allianceId: string, senderId: string, content: string): AllianceChatMessage {
    const message: AllianceChatMessage = {
      id: uuidv4(),
      allianceId,
      senderId,
      content,
      createdAt: Date.now()
    };

    const stmt = this.db.prepare(`
      INSERT INTO alliance_chat (id, alliance_id, sender_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.id,
      message.allianceId,
      message.senderId,
      message.content,
      message.createdAt
    );

    return message;
  }

  /**
   * Get chat messages
   */
  getMessages(allianceId: string, limit = 50, offset = 0): AllianceChatMessage[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliance_chat
      WHERE alliance_id = ? AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(allianceId, limit, offset) as any[];
    return rows.map(row => this.mapToChatMessage(row));
  }

  /**
   * Delete message
   */
  deleteMessage(id: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE alliance_chat SET deleted_at = ? WHERE id = ?
    `);

    const result = stmt.run(Date.now(), id);
    return result.changes > 0;
  }

  /**
   * Map database row to AllianceChatMessage
   */
  private mapToChatMessage(row: any): AllianceChatMessage {
    return {
      id: row.id,
      allianceId: row.alliance_id,
      senderId: row.sender_id,
      content: row.content,
      createdAt: row.created_at,
      editedAt: row.edited_at,
      deletedAt: row.deleted_at
    };
  }
}
