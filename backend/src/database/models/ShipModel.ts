/**
 * Ship Model
 * 
 * Provides CRUD operations for the ships table.
 * Manages ship construction, movement, and combat.
 */

import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import type Database from 'better-sqlite3';

/**
 * Ship interface
 */
export interface Ship {
  id: string;
  owner_id: string;
  type: string;
  planet_id: string | null;
  fleet_id: string | null;
  x_position: number;
  y_position: number;
  status: string;
  health: number;
  max_health: number;
  speed: number;
  damage: number;
  stats_json: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create ship data
 */
export interface CreateShipData {
  owner_id: string;
  type: string;
  planet_id?: string;
  x_position?: number;
  y_position?: number;
  health: number;
  max_health: number;
  speed: number;
  damage: number;
  stats_json?: string;
}

/**
 * Update ship data
 */
export interface UpdateShipData {
  fleet_id?: string | null;
  planet_id?: string | null;
  x_position?: number;
  y_position?: number;
  status?: string;
  health?: number;
  stats_json?: string;
}

/**
 * Ship Model Class
 */
export class ShipModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new ship
   */
  create(data: CreateShipData): Ship {
    try {
      const id = uuidv4();
      
      const stmt = this.db.prepare(`
        INSERT INTO ships (
          id, owner_id, type, planet_id, x_position, y_position,
          health, max_health, speed, damage, stats_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.owner_id,
        data.type,
        data.planet_id || null,
        data.x_position || 0,
        data.y_position || 0,
        data.health,
        data.max_health,
        data.speed,
        data.damage,
        data.stats_json || '{}'
      );

      logger.debug(`Ship created: ${data.type} (${id}) for owner ${data.owner_id}`);

      return this.findById(id)!;
    } catch (error) {
      logger.error('Error creating ship:', error);
      throw error;
    }
  }

  /**
   * Find ship by ID
   */
  findById(id: string): Ship | null {
    const stmt = this.db.prepare('SELECT * FROM ships WHERE id = ?');
    const ship = stmt.get(id) as Ship | undefined;
    return ship || null;
  }

  /**
   * Get all ships
   */
  findAll(limit: number = 1000, offset: number = 0): Ship[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ships 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Ship[];
  }

  /**
   * Find ships by owner
   */
  findByOwner(ownerId: string): Ship[] {
    const stmt = this.db.prepare('SELECT * FROM ships WHERE owner_id = ?');
    return stmt.all(ownerId) as Ship[];
  }

  /**
   * Find ships by fleet
   */
  findByFleet(fleetId: string): Ship[] {
    const stmt = this.db.prepare('SELECT * FROM ships WHERE fleet_id = ?');
    return stmt.all(fleetId) as Ship[];
  }

  /**
   * Find ships at planet
   */
  findAtPlanet(planetId: string): Ship[] {
    const stmt = this.db.prepare('SELECT * FROM ships WHERE planet_id = ?');
    return stmt.all(planetId) as Ship[];
  }

  /**
   * Find ships by type
   */
  findByType(type: string, ownerId?: string): Ship[] {
    if (ownerId) {
      const stmt = this.db.prepare('SELECT * FROM ships WHERE type = ? AND owner_id = ?');
      return stmt.all(type, ownerId) as Ship[];
    } else {
      const stmt = this.db.prepare('SELECT * FROM ships WHERE type = ?');
      return stmt.all(type) as Ship[];
    }
  }

  /**
   * Find ships by status
   */
  findByStatus(status: string): Ship[] {
    const stmt = this.db.prepare('SELECT * FROM ships WHERE status = ?');
    return stmt.all(status) as Ship[];
  }

  /**
   * Update ship
   */
  update(id: string, data: UpdateShipData): Ship | null {
    try {
      const ship = this.findById(id);
      if (!ship) {
        return null;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.fleet_id !== undefined) {
        updates.push('fleet_id = ?');
        values.push(data.fleet_id);
      }

      if (data.planet_id !== undefined) {
        updates.push('planet_id = ?');
        values.push(data.planet_id);
      }

      if (data.x_position !== undefined) {
        updates.push('x_position = ?');
        values.push(data.x_position);
      }

      if (data.y_position !== undefined) {
        updates.push('y_position = ?');
        values.push(data.y_position);
      }

      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }

      if (data.health !== undefined) {
        updates.push('health = ?');
        values.push(data.health);
      }

      if (data.stats_json !== undefined) {
        updates.push('stats_json = ?');
        values.push(data.stats_json);
      }

      if (updates.length === 0) {
        return ship;
      }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE ships 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      stmt.run(...values);

      logger.debug(`Ship updated: ${id}`);

      return this.findById(id);
    } catch (error) {
      logger.error('Error updating ship:', error);
      throw error;
    }
  }

  /**
   * Move ship to position
   */
  moveTo(shipId: string, x: number, y: number): Ship | null {
    return this.update(shipId, {
      x_position: x,
      y_position: y,
      status: 'moving'
    });
  }

  /**
   * Assign ship to fleet
   */
  assignToFleet(shipId: string, fleetId: string): Ship | null {
    return this.update(shipId, {
      fleet_id: fleetId,
      planet_id: null
    });
  }

  /**
   * Remove ship from fleet
   */
  removeFromFleet(shipId: string): Ship | null {
    return this.update(shipId, {
      fleet_id: null
    });
  }

  /**
   * Dock ship at planet
   */
  dockAtPlanet(shipId: string, planetId: string): Ship | null {
    return this.update(shipId, {
      planet_id: planetId,
      fleet_id: null,
      status: 'docked'
    });
  }

  /**
   * Damage ship
   */
  damage(shipId: string, damageAmount: number): Ship | null {
    const ship = this.findById(shipId);
    if (!ship) {
      return null;
    }

    const newHealth = Math.max(0, ship.health - damageAmount);
    
    return this.update(shipId, {
      health: newHealth,
      status: newHealth === 0 ? 'destroyed' : ship.status
    });
  }

  /**
   * Repair ship
   */
  repair(shipId: string, repairAmount: number): Ship | null {
    const ship = this.findById(shipId);
    if (!ship) {
      return null;
    }

    const newHealth = Math.min(ship.max_health, ship.health + repairAmount);
    
    return this.update(shipId, {
      health: newHealth
    });
  }

  /**
   * Delete ship
   */
  delete(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM ships WHERE id = ?');
      const result = stmt.run(id);
      
      logger.debug(`Ship deleted: ${id}`);
      
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting ship:', error);
      throw error;
    }
  }

  /**
   * Delete all ships in fleet
   */
  deleteByFleet(fleetId: string): number {
    try {
      const stmt = this.db.prepare('DELETE FROM ships WHERE fleet_id = ?');
      const result = stmt.run(fleetId);
      
      logger.debug(`Deleted ${result.changes} ships from fleet ${fleetId}`);
      
      return result.changes;
    } catch (error) {
      logger.error('Error deleting ships by fleet:', error);
      throw error;
    }
  }

  /**
   * Count total ships
   */
  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM ships');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Count ships by owner
   */
  countByOwner(ownerId: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM ships WHERE owner_id = ?');
    const result = stmt.get(ownerId) as { count: number };
    return result.count;
  }

  /**
   * Count ships by type for owner
   */
  countByType(ownerId: string, type: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM ships WHERE owner_id = ? AND type = ?');
    const result = stmt.get(ownerId, type) as { count: number };
    return result.count;
  }

  /**
   * Get fleet strength (total damage)
   */
  getFleetStrength(fleetId: string): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(damage), 0) as total_damage
      FROM ships 
      WHERE fleet_id = ? AND status != 'destroyed'
    `);
    const result = stmt.get(fleetId) as any;
    return result.total_damage;
  }

  /**
   * Bulk create ships
   */
  bulkCreate(shipsData: CreateShipData[]): Ship[] {
    const txn = this.db.transaction(() => {
      return shipsData.map(data => this.create(data));
    });

    return txn();
  }
}

// Export singleton instance
export const shipModel = new ShipModel();
