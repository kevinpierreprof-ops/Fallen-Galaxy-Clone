/**
 * Building System Types
 * 
 * Core type definitions for the building system including
 * construction queue, building stats, and upgrade mechanics.
 */

/**
 * Building type enumeration
 */
export enum BuildingType {
  MetalMine = 'metal_mine',
  EnergyPlant = 'energy_plant',
  Shipyard = 'shipyard',
  ResearchLab = 'research_lab',
  Defense = 'defense',
  CrystalMine = 'crystal_mine',
  CommandCenter = 'command_center',
  Storage = 'storage'
}

/**
 * Resource cost for building construction/upgrade
 */
export interface BuildingCost {
  metal: number;
  energy: number;
  crystal: number;
}

/**
 * Production bonus from a building
 */
export interface ProductionBonus {
  metal?: number;
  energy?: number;
  crystal?: number;
  research?: number;
  defense?: number;
  storage?: number;
}

/**
 * Building instance on a planet
 */
export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  cost: BuildingCost;
  productionBonus: ProductionBonus;
  buildTime: number; // in seconds
  position?: number; // slot position on planet
  damage?: number; // 0-100 percentage
}

/**
 * Building in construction queue
 */
export interface QueuedBuilding {
  id: string;
  buildingId?: string; // Existing building ID (for upgrades)
  type: BuildingType;
  targetLevel: number;
  cost: BuildingCost;
  buildTime: number;
  startedAt: number; // timestamp
  completesAt: number; // timestamp
  position: number; // queue position
  planetId: string;
}

/**
 * Building stats at a specific level
 */
export interface BuildingStats {
  type: BuildingType;
  level: number;
  baseCost: BuildingCost;
  cost: BuildingCost; // actual cost for this level
  buildTime: number;
  productionBonus: ProductionBonus;
  maxLevel: number;
  requirements?: {
    buildings?: Array<{ type: BuildingType; level: number }>;
    population?: number;
  };
}

/**
 * Construction queue for a planet
 */
export interface ConstructionQueue {
  planetId: string;
  queue: QueuedBuilding[];
  maxQueueSize: number;
  activeConstruction?: QueuedBuilding;
}

/**
 * Build result
 */
export interface BuildResult {
  success: boolean;
  message: string;
  queuedBuilding?: QueuedBuilding;
  completesAt?: number;
  queuePosition?: number;
}

/**
 * Resource check result
 */
export interface ResourceCheckResult {
  hasResources: boolean;
  missing?: BuildingCost;
  message?: string;
}
