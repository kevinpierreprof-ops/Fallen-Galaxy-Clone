/**
 * Planet Class
 * 
 * Represents a planet in the space strategy game.
 * Manages resources, buildings, and production calculations.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  BUILDINGS, 
  getBuildingCost, 
  getBuildingProduction, 
  getBuildTime,
  MAX_BUILDING_SLOTS,
  BASE_POPULATION_CAPACITY,
  POPULATION_GROWTH_RATE
} from '@shared/constants/buildings';
import type { 
  Building, 
  BuildingType, 
  PlanetResources, 
  Position, 
  ResourceCost,
  PlanetStats,
  BuildingProduction
} from '@shared/types/buildings';

/**
 * Planet creation options
 */
export interface PlanetOptions {
  id?: string;
  ownerId?: string | null;
  name: string;
  position: Position;
  size?: number;
  resources?: Partial<PlanetResources>;
  buildings?: Building[];
}

/**
 * Planet Class
 * 
 * Core class for managing planets in the game.
 * Handles resources, buildings, production, and validation.
 */
export class Planet {
  /** Unique identifier for the planet */
  public readonly id: string;
  
  /** Owner's user ID (null if unowned) */
  public ownerId: string | null;
  
  /** Planet name */
  public name: string;
  
  /** Position in space */
  public position: Position;
  
  /** Planet size (affects building slots) */
  public size: number;
  
  /** Current resources */
  public resources: PlanetResources;
  
  /** Buildings on the planet */
  public buildings: Building[];
  
  /** Last update timestamp (for production calculation) */
  private lastUpdate: number;

  /**
   * Create a new Planet instance
   * 
   * @param options - Planet creation options
   * 
   * @example
   * ```typescript
   * const planet = new Planet({
   *   name: 'Alpha Centauri',
   *   position: { x: 100, y: 200 },
   *   size: 3
   * });
   * ```
   */
  constructor(options: PlanetOptions) {
    this.id = options.id || uuidv4();
    this.ownerId = options.ownerId || null;
    this.name = options.name;
    this.position = options.position;
    this.size = options.size || 1;
    
    // Initialize resources
    this.resources = {
      minerals: options.resources?.minerals ?? 1000,
      energy: options.resources?.energy ?? 500,
      credits: options.resources?.credits ?? 500,
      population: options.resources?.population ?? 100,
      research: options.resources?.research ?? 0
    };
    
    // Initialize buildings
    this.buildings = options.buildings || [];
    
    // Set initial timestamp
    this.lastUpdate = Date.now();
  }

  /**
   * Get maximum building slots based on planet size
   * 
   * @returns Maximum number of building slots
   */
  public getMaxBuildingSlots(): number {
    return Math.min(MAX_BUILDING_SLOTS, 5 + (this.size * 3));
  }

  /**
   * Get available building slots
   * 
   * @returns Number of available slots
   */
  public getAvailableSlots(): number {
    return this.getMaxBuildingSlots() - this.buildings.length;
  }

  /**
   * Check if a building can be built
   * 
   * @param type - Building type to check
   * @returns Object with canBuild flag and reason if false
   * 
   * @example
   * ```typescript
   * const result = planet.canBuild('mine');
   * if (result.canBuild) {
   *   planet.addBuilding('mine');
   * } else {
   *   console.log(result.reason);
   * }
   * ```
   */
  public canBuild(type: BuildingType): { canBuild: boolean; reason?: string } {
    // Check if planet is owned
    if (!this.ownerId) {
      return { canBuild: false, reason: 'Planet must be owned to build' };
    }

    // Check building slots
    if (this.getAvailableSlots() <= 0) {
      return { canBuild: false, reason: 'No available building slots' };
    }

    const buildingInfo = BUILDINGS[type];
    const cost = getBuildingCost(type, 1);

    // Check prerequisites
    if (buildingInfo.requirements.prerequisite) {
      const prereq = buildingInfo.requirements.prerequisite;
      const hasPrereq = this.buildings.some(
        b => b.type === prereq.buildingType && b.level >= prereq.level
      );
      
      if (!hasPrereq) {
        return { 
          canBuild: false, 
          reason: `Requires ${BUILDINGS[prereq.buildingType].name} level ${prereq.level}` 
        };
      }
    }

    // Check population requirement
    if (buildingInfo.requirements.populationRequired) {
      if (this.resources.population < buildingInfo.requirements.populationRequired) {
        return { 
          canBuild: false, 
          reason: `Requires ${buildingInfo.requirements.populationRequired} population` 
        };
      }
    }

    // Check resource costs
    if (this.resources.minerals < cost.minerals) {
      return { canBuild: false, reason: 'Not enough minerals' };
    }
    if (this.resources.energy < cost.energy) {
      return { canBuild: false, reason: 'Not enough energy' };
    }
    if (this.resources.credits < cost.credits) {
      return { canBuild: false, reason: 'Not enough credits' };
    }

    return { canBuild: true };
  }

  /**
   * Add a new building to the planet
   * 
   * @param type - Building type to add
   * @returns The new building or null if failed
   * 
   * @example
   * ```typescript
   * const building = planet.addBuilding('mine');
   * if (building) {
   *   console.log(`Built ${building.type} at position ${building.position}`);
   * }
   * ```
   */
  public addBuilding(type: BuildingType): Building | null {
    const canBuildResult = this.canBuild(type);
    
    if (!canBuildResult.canBuild) {
      return null;
    }

    // Deduct resources
    const cost = getBuildingCost(type, 1);
    this.resources.minerals -= cost.minerals;
    this.resources.energy -= cost.energy;
    this.resources.credits -= cost.credits;

    // Create new building
    const building: Building = {
      id: uuidv4(),
      type,
      level: 1,
      position: this.buildings.length,
      isUpgrading: false,
      damage: 0
    };

    this.buildings.push(building);
    return building;
  }

  /**
   * Check if a building can be upgraded
   * 
   * @param buildingId - Building ID to check
   * @returns Object with canUpgrade flag and reason if false
   */
  public canUpgrade(buildingId: string): { canUpgrade: boolean; reason?: string } {
    const building = this.buildings.find(b => b.id === buildingId);
    
    if (!building) {
      return { canUpgrade: false, reason: 'Building not found' };
    }

    if (building.isUpgrading) {
      return { canUpgrade: false, reason: 'Building is already upgrading' };
    }

    const buildingInfo = BUILDINGS[building.type];
    
    if (building.level >= buildingInfo.requirements.maxLevel) {
      return { canUpgrade: false, reason: 'Building is at max level' };
    }

    const cost = getBuildingCost(building.type, building.level + 1);

    // Check resources
    if (this.resources.minerals < cost.minerals) {
      return { canUpgrade: false, reason: 'Not enough minerals' };
    }
    if (this.resources.energy < cost.energy) {
      return { canUpgrade: false, reason: 'Not enough energy' };
    }
    if (this.resources.credits < cost.credits) {
      return { canUpgrade: false, reason: 'Not enough credits' };
    }

    return { canUpgrade: true };
  }

  /**
   * Upgrade a building
   * 
   * @param buildingId - Building ID to upgrade
   * @returns True if upgrade started successfully
   * 
   * @example
   * ```typescript
   * if (planet.upgradeBuilding(buildingId)) {
   *   console.log('Upgrade started');
   * }
   * ```
   */
  public upgradeBuilding(buildingId: string): boolean {
    const canUpgradeResult = this.canUpgrade(buildingId);
    
    if (!canUpgradeResult.canUpgrade) {
      return false;
    }

    const building = this.buildings.find(b => b.id === buildingId)!;
    const cost = getBuildingCost(building.type, building.level + 1);
    const buildTime = getBuildTime(building.type, building.level + 1);

    // Deduct resources
    this.resources.minerals -= cost.minerals;
    this.resources.energy -= cost.energy;
    this.resources.credits -= cost.credits;

    // Start upgrade
    building.isUpgrading = true;
    building.upgradeCompleteAt = Date.now() + (buildTime * 1000);

    return true;
  }

  /**
   * Calculate total production from all buildings
   * 
   * @returns Total production rates
   * 
   * @example
   * ```typescript
   * const production = planet.calculateProduction();
   * console.log(`Minerals/s: ${production.minerals}`);
   * ```
   */
  public calculateProduction(): BuildingProduction {
    const production: BuildingProduction = {
      minerals: 0,
      energy: 0,
      credits: 0,
      research: 0,
      defense: 0,
      capacity: BASE_POPULATION_CAPACITY
    };

    for (const building of this.buildings) {
      // Skip buildings that are upgrading
      if (building.isUpgrading) continue;

      const buildingProduction = getBuildingProduction(building.type, building.level);
      
      if (buildingProduction.minerals) {
        production.minerals! += buildingProduction.minerals;
      }
      if (buildingProduction.energy) {
        production.energy! += buildingProduction.energy;
      }
      if (buildingProduction.credits) {
        production.credits! += buildingProduction.credits;
      }
      if (buildingProduction.research) {
        production.research! += buildingProduction.research;
      }
      if (buildingProduction.defense) {
        production.defense! += buildingProduction.defense;
      }
      if (buildingProduction.capacity) {
        production.capacity! += buildingProduction.capacity;
      }
    }

    return production;
  }

  /**
   * Update planet resources based on production
   * Called every game tick
   * 
   * @param deltaTime - Time elapsed since last update (in seconds)
   * 
   * @example
   * ```typescript
   * // Update every second
   * setInterval(() => {
   *   planet.update(1);
   * }, 1000);
   * ```
   */
  public update(deltaTime: number = 1): void {
    const production = this.calculateProduction();

    // Update resources
    if (production.minerals) {
      this.resources.minerals += production.minerals * deltaTime;
    }
    if (production.energy) {
      this.resources.energy += production.energy * deltaTime;
    }
    if (production.credits) {
      this.resources.credits += production.credits * deltaTime;
    }
    if (production.research) {
      this.resources.research! += production.research * deltaTime;
    }

    // Ensure resources don't go negative
    this.resources.minerals = Math.max(0, this.resources.minerals);
    this.resources.energy = Math.max(0, this.resources.energy);
    this.resources.credits = Math.max(0, this.resources.credits);

    // Update population (growth based on capacity)
    if (production.capacity && this.resources.population < production.capacity) {
      const growthRate = POPULATION_GROWTH_RATE * (1 - this.resources.population / production.capacity);
      this.resources.population += growthRate * deltaTime;
      this.resources.population = Math.min(this.resources.population, production.capacity);
    }

    // Check and complete building upgrades
    const now = Date.now();
    for (const building of this.buildings) {
      if (building.isUpgrading && building.upgradeCompleteAt && now >= building.upgradeCompleteAt) {
        building.level++;
        building.isUpgrading = false;
        delete building.upgradeCompleteAt;
      }
    }

    this.lastUpdate = now;
  }

  /**
   * Get planet statistics
   * 
   * @returns Planet stats object
   */
  public getStats(): PlanetStats {
    const production = this.calculateProduction();
    
    return {
      totalProduction: production,
      defenseRating: production.defense || 0,
      populationCapacity: production.capacity || BASE_POPULATION_CAPACITY,
      buildingSlots: this.getMaxBuildingSlots(),
      usedSlots: this.buildings.length
    };
  }

  /**
   * Get building by ID
   * 
   * @param buildingId - Building ID
   * @returns Building or undefined if not found
   */
  public getBuilding(buildingId: string): Building | undefined {
    return this.buildings.find(b => b.id === buildingId);
  }

  /**
   * Get all buildings of a specific type
   * 
   * @param type - Building type
   * @returns Array of buildings
   */
  public getBuildingsByType(type: BuildingType): Building[] {
    return this.buildings.filter(b => b.type === type);
  }

  /**
   * Demolish a building
   * 
   * @param buildingId - Building ID to demolish
   * @returns True if demolished successfully
   */
  public demolishBuilding(buildingId: string): boolean {
    const index = this.buildings.findIndex(b => b.id === buildingId);
    
    if (index === -1) {
      return false;
    }

    this.buildings.splice(index, 1);
    
    // Recalculate positions
    this.buildings.forEach((building, idx) => {
      building.position = idx;
    });

    return true;
  }

  /**
   * Damage a building (from combat)
   * 
   * @param buildingId - Building ID
   * @param damageAmount - Damage amount (0-100)
   * @returns True if building was damaged
   */
  public damageBuilding(buildingId: string, damageAmount: number): boolean {
    const building = this.getBuilding(buildingId);
    
    if (!building) {
      return false;
    }

    building.damage = Math.min(100, (building.damage || 0) + damageAmount);
    
    // Destroy building if damage reaches 100
    if (building.damage >= 100) {
      this.demolishBuilding(buildingId);
    }

    return true;
  }

  /**
   * Repair a building
   * 
   * @param buildingId - Building ID
   * @param repairAmount - Repair amount
   * @returns True if building was repaired
   */
  public repairBuilding(buildingId: string, repairAmount: number = 100): boolean {
    const building = this.getBuilding(buildingId);
    
    if (!building) {
      return false;
    }

    building.damage = Math.max(0, (building.damage || 0) - repairAmount);
    return true;
  }

  /**
   * Serialize planet to JSON
   * 
   * @returns Plain object representation
   */
  public toJSON() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      position: this.position,
      size: this.size,
      resources: this.resources,
      buildings: this.buildings,
      stats: this.getStats(),
      lastUpdate: this.lastUpdate
    };
  }

  /**
   * Create planet from JSON data
   * 
   * @param data - Planet data
   * @returns Planet instance
   */
  public static fromJSON(data: any): Planet {
    return new Planet({
      id: data.id,
      ownerId: data.ownerId,
      name: data.name,
      position: data.position,
      size: data.size,
      resources: data.resources,
      buildings: data.buildings
    });
  }
}
