/**
 * Building System Manager
 * 
 * Main interface for the building system.
 * Handles resource checking, construction initiation, and building management.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { constructionQueueManager } from './ConstructionQueueManager';
import type {
  Building,
  BuildingType,
  BuildingCost,
  BuildResult,
  ResourceCheckResult
} from '@shared/types/buildingSystem';
import {
  calculateBuildingCost,
  calculateBuildTime,
  calculateProductionBonus,
  getBuildingStats,
  MAX_BUILDING_LEVELS,
  BUILDING_REQUIREMENTS
} from '@shared/constants/buildingSystem';

/**
 * Player resources interface
 */
export interface PlayerResources {
  metal: number;
  energy: number;
  crystal: number;
}

/**
 * Building System Manager Class
 */
export class BuildingSystem {
  /**
   * Check if player has enough resources for a building
   * 
   * @param playerResources - Current player resources
   * @param cost - Required cost
   * @returns Resource check result
   * 
   * @example
   * ```typescript
   * const result = buildingSystem.checkResources(
   *   { metal: 100, energy: 50, crystal: 25 },
   *   { metal: 60, energy: 15, crystal: 0 }
   * );
   * 
   * if (result.hasResources) {
   *   // Player can afford the building
   * } else {
   *   console.log(`Missing: ${JSON.stringify(result.missing)}`);
   * }
   * ```
   */
  public checkResources(
    playerResources: PlayerResources,
    cost: BuildingCost
  ): ResourceCheckResult {
    const missing: BuildingCost = {
      metal: 0,
      energy: 0,
      crystal: 0
    };

    let hasAll = true;

    if (playerResources.metal < cost.metal) {
      missing.metal = cost.metal - playerResources.metal;
      hasAll = false;
    }

    if (playerResources.energy < cost.energy) {
      missing.energy = cost.energy - playerResources.energy;
      hasAll = false;
    }

    if (playerResources.crystal < cost.crystal) {
      missing.crystal = cost.crystal - playerResources.crystal;
      hasAll = false;
    }

    if (!hasAll) {
      const missingItems: string[] = [];
      if (missing.metal > 0) missingItems.push(`${missing.metal} metal`);
      if (missing.energy > 0) missingItems.push(`${missing.energy} energy`);
      if (missing.crystal > 0) missingItems.push(`${missing.crystal} crystal`);

      return {
        hasResources: false,
        missing,
        message: `Insufficient resources. Need: ${missingItems.join(', ')}`
      };
    }

    return {
      hasResources: true,
      message: 'Sufficient resources available'
    };
  }

  /**
   * Check if building requirements are met
   * 
   * @param type - Building type
   * @param existingBuildings - Buildings already on planet
   * @param population - Current population
   * @returns True if requirements are met
   */
  public checkRequirements(
    type: BuildingType,
    existingBuildings: Building[],
    population: number
  ): { met: boolean; message?: string } {
    const requirements = BUILDING_REQUIREMENTS[type];

    // Check population requirement
    if (requirements.population && population < requirements.population) {
      return {
        met: false,
        message: `Requires ${requirements.population} population (current: ${population})`
      };
    }

    // Check building requirements
    if (requirements.buildings) {
      for (const req of requirements.buildings) {
        const building = existingBuildings.find(b => b.type === req.type);
        
        if (!building || building.level < req.level) {
          return {
            met: false,
            message: `Requires ${req.type} level ${req.level}`
          };
        }
      }
    }

    return { met: true };
  }

  /**
   * Start construction of a new building
   * 
   * @param planetId - Planet ID
   * @param type - Building type
   * @param playerResources - Player's current resources
   * @param existingBuildings - Buildings on the planet
   * @param shipyardLevel - Current shipyard level
   * @param population - Current population
   * @returns Build result with completion timestamp
   * 
   * @example
   * ```typescript
   * const result = buildingSystem.startConstruction(
   *   'planet-123',
   *   BuildingType.MetalMine,
   *   { metal: 100, energy: 50, crystal: 0 },
   *   [],
   *   0,
   *   100
   * );
   * 
   * if (result.success) {
   *   console.log(`Building completes at: ${new Date(result.completesAt!)}`);
   *   console.log(`Queue position: ${result.queuePosition}`);
   * }
   * ```
   */
  public startConstruction(
    planetId: string,
    type: BuildingType,
    playerResources: PlayerResources,
    existingBuildings: Building[],
    shipyardLevel: number = 0,
    population: number = 0
  ): BuildResult {
    // Initialize queue if needed
    const commandCenter = existingBuildings.find(b => b.type === 'command_center');
    constructionQueueManager.initializeQueue(
      planetId,
      commandCenter?.level || 0
    );

    // Calculate cost and stats for level 1
    const cost = calculateBuildingCost(type, 1);

    // Check requirements
    const reqCheck = this.checkRequirements(type, existingBuildings, population);
    if (!reqCheck.met) {
      return {
        success: false,
        message: reqCheck.message || 'Requirements not met'
      };
    }

    // Check resources
    const resourceCheck = this.checkResources(playerResources, cost);
    if (!resourceCheck.hasResources) {
      return {
        success: false,
        message: resourceCheck.message || 'Insufficient resources'
      };
    }

    // Add to construction queue
    return constructionQueueManager.addToQueue(
      planetId,
      type,
      1,
      cost,
      shipyardLevel
    );
  }

  /**
   * Start building upgrade
   * 
   * @param planetId - Planet ID
   * @param buildingId - Building to upgrade
   * @param currentLevel - Current building level
   * @param type - Building type
   * @param playerResources - Player's current resources
   * @param shipyardLevel - Current shipyard level
   * @returns Build result
   */
  public startUpgrade(
    planetId: string,
    buildingId: string,
    currentLevel: number,
    type: BuildingType,
    playerResources: PlayerResources,
    shipyardLevel: number = 0
  ): BuildResult {
    const targetLevel = currentLevel + 1;

    // Check max level
    if (targetLevel > MAX_BUILDING_LEVELS[type]) {
      return {
        success: false,
        message: `Building is already at max level (${MAX_BUILDING_LEVELS[type]})`
      };
    }

    // Calculate upgrade cost
    const cost = calculateBuildingCost(type, targetLevel);

    // Check resources
    const resourceCheck = this.checkResources(playerResources, cost);
    if (!resourceCheck.hasResources) {
      return {
        success: false,
        message: resourceCheck.message || 'Insufficient resources'
      };
    }

    // Add upgrade to queue
    return constructionQueueManager.addToQueue(
      planetId,
      type,
      targetLevel,
      cost,
      shipyardLevel,
      buildingId
    );
  }

  /**
   * Calculate build time with bonuses
   * 
   * @param type - Building type
   * @param level - Target level
   * @param existingBuildings - Buildings on planet (for bonuses)
   * @returns Build time in seconds
   * 
   * @example
   * ```typescript
   * const buildings = [
   *   { type: BuildingType.Shipyard, level: 5, ... }
   * ];
   * 
   * const time = buildingSystem.calculateBuildTimeWithBonuses(
   *   BuildingType.Defense,
   *   3,
   *   buildings
   * );
   * 
   * console.log(`Build time: ${time} seconds`);
   * ```
   */
  public calculateBuildTimeWithBonuses(
    type: BuildingType,
    level: number,
    existingBuildings: Building[]
  ): number {
    const shipyard = existingBuildings.find(b => b.type === 'shipyard');
    return calculateBuildTime(type, level, shipyard?.level || 0);
  }

  /**
   * Create a new building instance
   * 
   * @param type - Building type
   * @param level - Building level
   * @param position - Position on planet
   * @param shipyardLevel - Shipyard level for calculations
   * @returns New building
   */
  public createBuilding(
    type: BuildingType,
    level: number = 1,
    position: number = 0,
    shipyardLevel: number = 0
  ): Building {
    const stats = getBuildingStats(type, level, shipyardLevel);

    return {
      id: uuidv4(),
      type,
      level,
      cost: stats.cost,
      productionBonus: stats.productionBonus,
      buildTime: stats.buildTime,
      position,
      damage: 0
    };
  }

  /**
   * Deduct resources from player
   * 
   * @param playerResources - Current resources
   * @param cost - Cost to deduct
   * @returns Updated resources
   */
  public deductResources(
    playerResources: PlayerResources,
    cost: BuildingCost
  ): PlayerResources {
    return {
      metal: playerResources.metal - cost.metal,
      energy: playerResources.energy - cost.energy,
      crystal: playerResources.crystal - cost.crystal
    };
  }

  /**
   * Get total production from all buildings
   * 
   * @param buildings - All buildings on planet
   * @returns Total production bonus
   */
  public getTotalProduction(buildings: Building[]): {
    metal: number;
    energy: number;
    crystal: number;
    research: number;
    defense: number;
    storage: number;
  } {
    const total = {
      metal: 0,
      energy: 0,
      crystal: 0,
      research: 0,
      defense: 0,
      storage: 0
    };

    for (const building of buildings) {
      const bonus = calculateProductionBonus(building.type, building.level);
      
      total.metal += bonus.metal || 0;
      total.energy += bonus.energy || 0;
      total.crystal += bonus.crystal || 0;
      total.research += bonus.research || 0;
      total.defense += bonus.defense || 0;
      total.storage += bonus.storage || 0;
    }

    return total;
  }

  /**
   * Demolish a building
   * 
   * @param buildingId - Building ID
   * @param buildings - All buildings on planet
   * @returns True if demolished
   */
  public demolishBuilding(buildingId: string, buildings: Building[]): boolean {
    const index = buildings.findIndex(b => b.id === buildingId);
    
    if (index === -1) {
      return false;
    }

    buildings.splice(index, 1);
    logger.info(`Building demolished: ${buildingId}`);
    
    return true;
  }
}

// Export singleton instance
export const buildingSystem = new BuildingSystem();
