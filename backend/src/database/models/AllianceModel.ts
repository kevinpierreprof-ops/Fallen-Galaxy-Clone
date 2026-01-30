/**
 * Alliance Model
 * 
 * Provides CRUD operations for the alliances table.
 * Manages player alliances and coalition management.
 */

import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import type Database from 'better-sqlite3';

/**
 * Alliance interface
 */
export interface Alliance {
  id: string;
  name: string;
  leader_id: string;
  description: string;
  members_json: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create alliance data
 */
export interface CreateAllianceData {
  name: string;
  leader_id: string;
  description?: string;
}

/**
 * Update alliance data
 */
export interface UpdateAllianceData {
  name?: string;
  leader_id?: string;
  description?: string;
  members_json?: string;
}

/**
 * Alliance Model Class
 */
export class AllianceModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new alliance
   */
  create(data: CreateAllianceData): Alliance {
    try {
      const id = uuidv4();
      
      // Leader is automatically the first member
      const members = JSON.stringify([data.leader_id]);
      
      const stmt = this.db.prepare(`
        INSERT INTO alliances (
          id, name, leader_id, description, members_json
        ) VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.name,
        data.leader_id,
        data.description || '',
        members
      );

      logger.info(`Alliance created: ${data.name} (${id}) by ${data.leader_id}`);

      return this.findById(id)!;
    } catch (error) {
      logger.error('Error creating alliance:', error);
      throw error;
    }
  }

  /**
   * Find alliance by ID
   */
  findById(id: string): Alliance | null {
    const stmt = this.db.prepare('SELECT * FROM alliances WHERE id = ?');
    const alliance = stmt.get(id) as Alliance | undefined;
    return alliance || null;
  }

  /**
   * Find alliance by name
   */
  findByName(name: string): Alliance | null {
    const stmt = this.db.prepare('SELECT * FROM alliances WHERE name = ?');
    const alliance = stmt.get(name) as Alliance | undefined;
    return alliance || null;
  }

  /**
   * Get all alliances
   */
  findAll(limit: number = 100, offset: number = 0): Alliance[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliances 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Alliance[];
  }

  /**
   * Find alliances by leader
   */
  findByLeader(leaderId: string): Alliance[] {
    const stmt = this.db.prepare('SELECT * FROM alliances WHERE leader_id = ?');
    return stmt.all(leaderId) as Alliance[];
  }

  /**
   * Find alliance containing member
   */
  findByMember(memberId: string): Alliance | null {
    const alliances = this.findAll();
    
    for (const alliance of alliances) {
      const members = JSON.parse(alliance.members_json) as string[];
      if (members.includes(memberId)) {
        return alliance;
      }
    }
    
    return null;
  }

  /**
   * Update alliance
   */
  update(id: string, data: UpdateAllianceData): Alliance | null {
    try {
      const alliance = this.findById(id);
      if (!alliance) {
        return null;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }

      if (data.leader_id !== undefined) {
        updates.push('leader_id = ?');
        values.push(data.leader_id);
      }

      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }

      if (data.members_json !== undefined) {
        updates.push('members_json = ?');
        values.push(data.members_json);
      }

      if (updates.length === 0) {
        return alliance;
      }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE alliances 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      stmt.run(...values);

      logger.info(`Alliance updated: ${id}`);

      return this.findById(id);
    } catch (error) {
      logger.error('Error updating alliance:', error);
      throw error;
    }
  }

  /**
   * Add member to alliance
   */
  addMember(allianceId: string, memberId: string): Alliance | null {
    const alliance = this.findById(allianceId);
    if (!alliance) {
      return null;
    }

    const members = JSON.parse(alliance.members_json) as string[];
    
    if (members.includes(memberId)) {
      logger.warn(`Member ${memberId} already in alliance ${allianceId}`);
      return alliance;
    }

    members.push(memberId);
    
    return this.update(allianceId, {
      members_json: JSON.stringify(members)
    });
  }

  /**
   * Remove member from alliance
   */
  removeMember(allianceId: string, memberId: string): Alliance | null {
    const alliance = this.findById(allianceId);
    if (!alliance) {
      return null;
    }

    const members = JSON.parse(alliance.members_json) as string[];
    const filteredMembers = members.filter(id => id !== memberId);
    
    // If no members left, alliance should be deleted
    if (filteredMembers.length === 0) {
      this.delete(allianceId);
      return null;
    }

    // If leader left, assign new leader
    let newLeaderId = alliance.leader_id;
    if (memberId === alliance.leader_id) {
      newLeaderId = filteredMembers[0];
    }

    return this.update(allianceId, {
      leader_id: newLeaderId,
      members_json: JSON.stringify(filteredMembers)
    });
  }

  /**
   * Change alliance leader
   */
  changeLeader(allianceId: string, newLeaderId: string): Alliance | null {
    const alliance = this.findById(allianceId);
    if (!alliance) {
      return null;
    }

    const members = JSON.parse(alliance.members_json) as string[];
    
    if (!members.includes(newLeaderId)) {
      logger.warn(`Cannot set leader: ${newLeaderId} is not a member`);
      return null;
    }

    return this.update(allianceId, {
      leader_id: newLeaderId
    });
  }

  /**
   * Get alliance members
   */
  getMembers(allianceId: string): string[] {
    const alliance = this.findById(allianceId);
    if (!alliance) {
      return [];
    }

    return JSON.parse(alliance.members_json) as string[];
  }

  /**
   * Get member count
   */
  getMemberCount(allianceId: string): number {
    return this.getMembers(allianceId).length;
  }

  /**
   * Check if user is member
   */
  isMember(allianceId: string, userId: string): boolean {
    const members = this.getMembers(allianceId);
    return members.includes(userId);
  }

  /**
   * Check if user is leader
   */
  isLeader(allianceId: string, userId: string): boolean {
    const alliance = this.findById(allianceId);
    return alliance !== null && alliance.leader_id === userId;
  }

  /**
   * Delete alliance
   */
  delete(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM alliances WHERE id = ?');
      const result = stmt.run(id);
      
      logger.info(`Alliance deleted: ${id}`);
      
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting alliance:', error);
      throw error;
    }
  }

  /**
   * Count total alliances
   */
  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM alliances');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Get largest alliances
   */
  getLargestAlliances(limit: number = 10): Array<Alliance & { member_count: number }> {
    const alliances = this.findAll();
    
    const withCounts = alliances.map(alliance => ({
      ...alliance,
      member_count: JSON.parse(alliance.members_json).length
    }));

    return withCounts
      .sort((a, b) => b.member_count - a.member_count)
      .slice(0, limit);
  }

  /**
   * Search alliances by name
   */
  search(query: string, limit: number = 20): Alliance[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alliances 
      WHERE name LIKE ?
      LIMIT ?
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, limit) as Alliance[];
  }
}

// Export singleton instance
export const allianceModel = new AllianceModel();
