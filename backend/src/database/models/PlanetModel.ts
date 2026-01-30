/**
 * Planet Model
 * 
 * Provides CRUD operations for the planets table.
 * Manages planet ownership, resources, and production.
 */

import { getDatabase } from '../connection';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import type Database from 'better-sqlite3';

/**
 * Planet interface
 */
export interface Planet {
  id: string;
  owner_id: string | null;
  name: string;
  x_position: number;
  y_position: number;
  size: number;
  population: number;
  max_population: number;
  minerals: number;
  energy: number;
  production_minerals: number;
  production_energy: number;
  production_credits: number;
  buildings_json: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create planet data
 */
export interface CreatePlanetData {
  name: string;
  x_position: number;
  y_position: number;
  size?: number;
  max_population?: number;
  minerals?: number;
  energy?: number;
  production_minerals?: number;
  production_energy?: number;
  production_credits?: number;
}

/**
 * Update planet data
 */
export interface UpdatePlanetData {
  owner_id?: string | null;
  name?: string;
  population?: number;
  minerals?: number;
  energy?: number;
  buildings_json?: string;
}

/**
 * Planet Model Class
 */
export class PlanetModel {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Create a new planet
   */
  create(data: CreatePlanetData): Planet {
    try {
      const id = uuidv4();
      
      const stmt = this.db.prepare(`
        INSERT INTO planets (
          id, name, x_position, y_position, size, max_population,
          minerals, energy, production_minerals, production_energy, production_credits
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        data.name,
        data.x_position,
        data.y_position,
        data.size || 1,
        data.max_population || 1000,
        data.minerals || 0,
        data.energy || 0,
        data.production_minerals || 10,
        data.production_energy || 5,
        data.production_credits || 5
      );

      logger.debug(`Planet created: ${data.name} (${id})`);

      return this.findById(id)!;
    } catch (error) {
      logger.error('Error creating planet:', error);
      throw error;
    }
  }

  /**
   * Find planet by ID
   */
  findById(id: string): Planet | null {
    const stmt = this.db.prepare('SELECT * FROM planets WHERE id = ?');
    const planet = stmt.get(id) as Planet | undefined;
    return planet || null;
  }

  /**
   * Get all planets
   */
  findAll(limit: number = 1000, offset: number = 0): Planet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM planets 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Planet[];
  }

  /**
   * Find planets by owner
   */
  findByOwner(ownerId: string): Planet[] {
    const stmt = this.db.prepare('SELECT * FROM planets WHERE owner_id = ?');
    return stmt.all(ownerId) as Planet[];
  }

  /**
   * Find unowned planets
   */
  findUnowned(limit: number = 100): Planet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM planets 
      WHERE owner_id IS NULL 
      LIMIT ?
    `);
    return stmt.all(limit) as Planet[];
  }

  /**
   * Find planets in area
   */
  findInArea(x: number, y: number, radius: number): Planet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM planets 
      WHERE (x_position - ?) * (x_position - ?) + (y_position - ?) * (y_position - ?) <= ? * ?
    `);
    return stmt.all(x, x, y, y, radius, radius) as Planet[];
  }

  /**
   * Update planet
   */
  update(id: string, data: UpdatePlanetData): Planet | null {
    try {
      const planet = this.findById(id);
      if (!planet) {
        return null;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (data.owner_id !== undefined) {
        updates.push('owner_id = ?');
        values.push(data.owner_id);
      }

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }

      if (data.population !== undefined) {
        updates.push('population = ?');
        values.push(data.population);
      }

      if (data.minerals !== undefined) {
        updates.push('minerals = ?');
        values.push(data.minerals);
      }

      if (data.energy !== undefined) {
        updates.push('energy = ?');
        values.push(data.energy);
      }

      if (data.buildings_json !== undefined) {
        updates.push('buildings_json = ?');
        values.push(data.buildings_json);
      }

      if (updates.length === 0) {
        return planet;
      }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      const stmt = this.db.prepare(`
        UPDATE planets 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);

      stmt.run(...values);

      logger.debug(`Planet updated: ${id}`);

      return this.findById(id);
    } catch (error) {
      logger.error('Error updating planet:', error);
      throw error;
    }
  }

  /**
   * Colonize planet (set owner)
   */
  colonize(planetId: string, ownerId: string, initialPopulation: number = 100): Planet | null {
    return this.update(planetId, {
      owner_id: ownerId,
      population: initialPopulation
    });
  }

  /**
   * Add resources to planet
   */
  addResources(planetId: string, minerals: number, energy: number): Planet | null {
    const planet = this.findById(planetId);
    if (!planet) {
      return null;
    }

    return this.update(planetId, {
      minerals: planet.minerals + minerals,
      energy: planet.energy + energy
    });
  }

  /**
   * Deduct resources from planet
   */
  deductResources(planetId: string, minerals: number, energy: number): Planet | null {
    const planet = this.findById(planetId);
    if (!planet) {
      return null;
    }

    const newMinerals = Math.max(0, planet.minerals - minerals);
    const newEnergy = Math.max(0, planet.energy - energy);

    return this.update(planetId, {
      minerals: newMinerals,
      energy: newEnergy
    });
  }

  /**
   * Delete planet
   */
  delete(id: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM planets WHERE id = ?');
      const result = stmt.run(id);
      
      logger.debug(`Planet deleted: ${id}`);
      
      return result.changes > 0;
    } catch (error) {
      logger.error('Error deleting planet:', error);
      throw error;
    }
  }

  /**
   * Count total planets
   */
  count(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM planets');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Count planets by owner
   */
  countByOwner(ownerId: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM planets WHERE owner_id = ?');
    const result = stmt.get(ownerId) as { count: number };
    return result.count;
  }

  /**
   * Get total resources for owner
   */
  getTotalResourcesByOwner(ownerId: string): { minerals: number; energy: number } {
    const stmt = this.db.prepare(`
      SELECT 
        COALESCE(SUM(minerals), 0) as total_minerals,
        COALESCE(SUM(energy), 0) as total_energy
      FROM planets 
      WHERE owner_id = ?
    `);
    const result = stmt.get(ownerId) as any;
    return {
      minerals: result.total_minerals,
      energy: result.total_energy
    };
  }

  /**
   * Get total production for owner
   */
  getTotalProductionByOwner(ownerId: string): { minerals: number; energy: number; credits: number } {
    const stmt = this.db.prepare(`
      SELECT 
        COALESCE(SUM(production_minerals), 0) as total_production_minerals,
        COALESCE(SUM(production_energy), 0) as total_production_energy,
        COALESCE(SUM(production_credits), 0) as total_production_credits
      FROM planets 
      WHERE owner_id = ?
    `);
    const result = stmt.get(ownerId) as any;
    return {
      minerals: result.total_production_minerals,
      energy: result.total_production_energy,
      credits: result.total_production_credits
    };
  }

  /**
   * Get nearest planet to coordinates
   */
  findNearest(x: number, y: number, excludeId?: string): Planet | null {
    let query = `
      SELECT *, 
        ((x_position - ?) * (x_position - ?) + (y_position - ?) * (y_position - ?)) as distance_squared
      FROM planets
    `;
    const params: any[] = [x, x, y, y];

    if (excludeId) {
      query += ' WHERE id != ?';
      params.push(excludeId);
    }

    query += ' ORDER BY distance_squared ASC LIMIT 1';

    const stmt = this.db.prepare(query);
    const planet = stmt.get(...params) as Planet | undefined;
    return planet || null;
  }

  /**
   * Bulk create planets (for game initialization)
   */
  bulkCreate(planetsData: CreatePlanetData[]): Planet[] {
    const txn = this.db.transaction(() => {
      return planetsData.map(data => this.create(data));
    });

    return txn();
  }
}

// Export singleton instance
export const planetModel = new PlanetModel();
