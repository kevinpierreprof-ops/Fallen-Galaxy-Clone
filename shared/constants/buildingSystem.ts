/**
 * Building System Constants
 * 
 * Defines all building statistics, costs, production bonuses,
 * and upgrade formulas for the building system.
 */

import { BuildingType, BuildingCost, ProductionBonus, BuildingStats } from '../types/buildingSystem';

// ============================================================================
// BASE BUILDING COSTS (Level 1)
// ============================================================================

export const BASE_BUILDING_COSTS: Record<BuildingType, BuildingCost> = {
  [BuildingType.MetalMine]: { metal: 60, energy: 15, crystal: 0 },
  [BuildingType.EnergyPlant]: { metal: 48, energy: 0, crystal: 20 },
  [BuildingType.CrystalMine]: { metal: 48, energy: 24, crystal: 0 },
  [BuildingType.Shipyard]: { metal: 400, energy: 200, crystal: 100 },
  [BuildingType.ResearchLab]: { metal: 200, energy: 400, crystal: 200 },
  [BuildingType.Defense]: { metal: 150, energy: 50, crystal: 75 },
  [BuildingType.CommandCenter]: { metal: 500, energy: 300, crystal: 200 },
  [BuildingType.Storage]: { metal: 100, energy: 50, crystal: 50 }
};

// ============================================================================
// BASE BUILD TIMES (Level 1, in seconds)
// ============================================================================

export const BASE_BUILD_TIMES: Record<BuildingType, number> = {
  [BuildingType.MetalMine]: 30,
  [BuildingType.EnergyPlant]: 25,
  [BuildingType.CrystalMine]: 35,
  [BuildingType.Shipyard]: 180,
  [BuildingType.ResearchLab]: 120,
  [BuildingType.Defense]: 90,
  [BuildingType.CommandCenter]: 300,
  [BuildingType.Storage]: 40
};

// ============================================================================
// BASE PRODUCTION (Level 1, per hour)
// ============================================================================

export const BASE_PRODUCTION: Record<BuildingType, ProductionBonus> = {
  [BuildingType.MetalMine]: { metal: 30, energy: -10 },
  [BuildingType.EnergyPlant]: { energy: 50 },
  [BuildingType.CrystalMine]: { crystal: 20, energy: -15 },
  [BuildingType.Shipyard]: { energy: -25 },
  [BuildingType.ResearchLab]: { research: 10, energy: -20 },
  [BuildingType.Defense]: { defense: 100, energy: -5 },
  [BuildingType.CommandCenter]: { energy: -10 },
  [BuildingType.Storage]: { storage: 10000 }
};

// ============================================================================
// MAXIMUM BUILDING LEVELS
// ============================================================================

export const MAX_BUILDING_LEVELS: Record<BuildingType, number> = {
  [BuildingType.MetalMine]: 30,
  [BuildingType.EnergyPlant]: 30,
  [BuildingType.CrystalMine]: 30,
  [BuildingType.Shipyard]: 15,
  [BuildingType.ResearchLab]: 20,
  [BuildingType.Defense]: 25,
  [BuildingType.CommandCenter]: 10,
  [BuildingType.Storage]: 20
};

// ============================================================================
// BUILDING REQUIREMENTS
// ============================================================================

export const BUILDING_REQUIREMENTS: Record<BuildingType, { buildings?: Array<{ type: BuildingType; level: number }>; population?: number }> = {
  [BuildingType.MetalMine]: {},
  [BuildingType.EnergyPlant]: {},
  [BuildingType.CrystalMine]: {},
  [BuildingType.Shipyard]: {
    buildings: [{ type: BuildingType.CommandCenter, level: 2 }],
    population: 50
  },
  [BuildingType.ResearchLab]: {
    buildings: [{ type: BuildingType.CommandCenter, level: 1 }],
    population: 30
  },
  [BuildingType.Defense]: {
    population: 20
  },
  [BuildingType.CommandCenter]: {
    population: 0
  },
  [BuildingType.Storage]: {}
};

// ============================================================================
// COST SCALING FACTORS
// ============================================================================

/**
 * Cost multiplier per level
 * Formula: baseCost * (COST_FACTOR ^ (level - 1))
 */
export const COST_FACTOR = 1.5;

/**
 * Build time multiplier per level
 * Formula: baseTime * (TIME_FACTOR ^ (level - 1))
 */
export const TIME_FACTOR = 1.4;

/**
 * Production multiplier per level
 * Formula: baseProduction * (1 + (level - 1) * PRODUCTION_FACTOR)
 */
export const PRODUCTION_FACTOR = 0.6;

// ============================================================================
// QUEUE SETTINGS
// ============================================================================

/**
 * Maximum construction queue size (base)
 */
export const BASE_QUEUE_SIZE = 3;

/**
 * Additional queue slots per Command Center level
 */
export const QUEUE_SIZE_PER_CC_LEVEL = 1;

/**
 * Build time reduction per Shipyard level (percentage)
 */
export const SHIPYARD_TIME_REDUCTION = 0.02; // 2% per level

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate building cost for a specific level
 * 
 * @param type - Building type
 * @param level - Target level
 * @returns Cost for the specified level
 */
export function calculateBuildingCost(type: BuildingType, level: number): BuildingCost {
  const baseCost = BASE_BUILDING_COSTS[type];
  const multiplier = Math.pow(COST_FACTOR, level - 1);

  return {
    metal: Math.floor(baseCost.metal * multiplier),
    energy: Math.floor(baseCost.energy * multiplier),
    crystal: Math.floor(baseCost.crystal * multiplier)
  };
}

/**
 * Calculate base build time for a specific level
 * Does not include any bonuses or reductions
 * 
 * @param type - Building type
 * @param level - Target level
 * @returns Build time in seconds
 */
export function calculateBaseBuildTime(type: BuildingType, level: number): number {
  const baseTime = BASE_BUILD_TIMES[type];
  const multiplier = Math.pow(TIME_FACTOR, level - 1);

  return Math.floor(baseTime * multiplier);
}

/**
 * Calculate actual build time with bonuses from existing buildings
 * 
 * @param type - Building type
 * @param level - Target level
 * @param shipyardLevel - Current shipyard level (reduces build time)
 * @returns Actual build time in seconds
 */
export function calculateBuildTime(
  type: BuildingType,
  level: number,
  shipyardLevel: number = 0
): number {
  const baseTime = calculateBaseBuildTime(type, level);
  
  // Apply shipyard bonus (only for certain building types)
  let reduction = 0;
  if ([BuildingType.Shipyard, BuildingType.Defense, BuildingType.CommandCenter].includes(type)) {
    reduction = shipyardLevel * SHIPYARD_TIME_REDUCTION;
  }

  const actualTime = baseTime * (1 - Math.min(reduction, 0.5)); // Max 50% reduction
  return Math.max(1, Math.floor(actualTime)); // Minimum 1 second
}

/**
 * Calculate production bonus for a specific level
 * 
 * @param type - Building type
 * @param level - Building level
 * @returns Production bonus
 */
export function calculateProductionBonus(type: BuildingType, level: number): ProductionBonus {
  const baseProduction = BASE_PRODUCTION[type];
  const bonus: ProductionBonus = {};

  for (const [key, value] of Object.entries(baseProduction)) {
    const resourceKey = key as keyof ProductionBonus;
    if (value !== undefined) {
      // For negative values (consumption), scale linearly
      // For positive values (production), scale with bonus factor
      if (value < 0) {
        bonus[resourceKey] = Math.floor(value * level);
      } else {
        bonus[resourceKey] = Math.floor(value * (1 + (level - 1) * PRODUCTION_FACTOR));
      }
    }
  }

  return bonus;
}

/**
 * Get complete building stats for a specific level
 * 
 * @param type - Building type
 * @param level - Building level
 * @param shipyardLevel - Shipyard level for time calculation
 * @returns Complete building statistics
 */
export function getBuildingStats(
  type: BuildingType,
  level: number,
  shipyardLevel: number = 0
): BuildingStats {
  return {
    type,
    level,
    baseCost: BASE_BUILDING_COSTS[type],
    cost: calculateBuildingCost(type, level),
    buildTime: calculateBuildTime(type, level, shipyardLevel),
    productionBonus: calculateProductionBonus(type, level),
    maxLevel: MAX_BUILDING_LEVELS[type],
    requirements: BUILDING_REQUIREMENTS[type]
  };
}

/**
 * Calculate maximum queue size based on Command Center level
 * 
 * @param commandCenterLevel - Current Command Center level
 * @returns Maximum queue size
 */
export function calculateMaxQueueSize(commandCenterLevel: number): number {
  return BASE_QUEUE_SIZE + (commandCenterLevel * QUEUE_SIZE_PER_CC_LEVEL);
}

/**
 * Get building display name
 * 
 * @param type - Building type
 * @returns Human-readable name
 */
export function getBuildingName(type: BuildingType): string {
  const names: Record<BuildingType, string> = {
    [BuildingType.MetalMine]: 'Metal Mine',
    [BuildingType.EnergyPlant]: 'Energy Plant',
    [BuildingType.CrystalMine]: 'Crystal Mine',
    [BuildingType.Shipyard]: 'Shipyard',
    [BuildingType.ResearchLab]: 'Research Laboratory',
    [BuildingType.Defense]: 'Defense Grid',
    [BuildingType.CommandCenter]: 'Command Center',
    [BuildingType.Storage]: 'Resource Storage'
  };

  return names[type];
}

/**
 * Get building description
 * 
 * @param type - Building type
 * @returns Building description
 */
export function getBuildingDescription(type: BuildingType): string {
  const descriptions: Record<BuildingType, string> = {
    [BuildingType.MetalMine]: 'Extracts metal resources from the planet. Higher levels increase production.',
    [BuildingType.EnergyPlant]: 'Generates energy required to power other buildings and facilities.',
    [BuildingType.CrystalMine]: 'Harvests rare crystals used for advanced technologies and ships.',
    [BuildingType.Shipyard]: 'Enables construction of ships and reduces build time for military structures.',
    [BuildingType.ResearchLab]: 'Conducts research to unlock new technologies and improve efficiency.',
    [BuildingType.Defense]: 'Provides planetary defense against enemy attacks.',
    [BuildingType.CommandCenter]: 'Central facility that increases construction queue capacity.',
    [BuildingType.Storage]: 'Expands resource storage capacity to prevent waste.'
  };

  return descriptions[type];
}
