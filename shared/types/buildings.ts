/**
 * Building Type Definitions
 * 
 * Defines all building types, requirements, and properties
 * for the planet building system.
 */

/**
 * Building types available in the game
 */
export type BuildingType = 'mine' | 'factory' | 'shipyard' | 'defense' | 'lab' | 'habitat';

/**
 * Resource cost interface
 */
export interface ResourceCost {
  minerals: number;
  energy: number;
  credits: number;
}

/**
 * Building requirements
 */
export interface BuildingRequirements {
  cost: ResourceCost;
  buildTime: number; // in seconds
  maxLevel: number;
  prerequisite?: {
    buildingType: BuildingType;
    level: number;
  };
  populationRequired?: number;
}

/**
 * Building production rates
 */
export interface BuildingProduction {
  minerals?: number;
  energy?: number;
  credits?: number;
  research?: number;
  defense?: number;
  capacity?: number; // population capacity
}

/**
 * Building instance interface
 */
export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  position: number; // slot on planet (0-based)
  isUpgrading: boolean;
  upgradeCompleteAt?: number; // timestamp when upgrade completes
  damage?: number; // current damage (0-100)
}

/**
 * Building info for display
 */
export interface BuildingInfo {
  type: BuildingType;
  name: string;
  description: string;
  icon: string;
  requirements: BuildingRequirements;
  production: (level: number) => BuildingProduction;
}

/**
 * Planet resources interface
 */
export interface PlanetResources {
  minerals: number;
  energy: number;
  credits: number;
  population: number;
  research?: number;
}

/**
 * Planet position interface
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Planet statistics
 */
export interface PlanetStats {
  totalProduction: BuildingProduction;
  defenseRating: number;
  populationCapacity: number;
  buildingSlots: number;
  usedSlots: number;
}
