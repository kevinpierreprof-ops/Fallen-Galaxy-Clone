/**
 * Building Constants and Configurations
 * 
 * Defines the properties, costs, and production rates for all building types.
 */

import type { BuildingInfo, BuildingType, ResourceCost, BuildingProduction } from '../types/buildings';

/**
 * Calculate building cost based on level
 * Cost increases exponentially with level
 */
const calculateCost = (baseCost: ResourceCost, level: number): ResourceCost => {
  const multiplier = Math.pow(1.5, level - 1);
  return {
    minerals: Math.floor(baseCost.minerals * multiplier),
    energy: Math.floor(baseCost.energy * multiplier),
    credits: Math.floor(baseCost.credits * multiplier)
  };
};

/**
 * Calculate production based on level
 * Production increases with level
 */
const calculateProduction = (baseProduction: number, level: number): number => {
  return Math.floor(baseProduction * (1 + (level - 1) * 0.5));
};

/**
 * Base costs for level 1 buildings
 */
const BASE_COSTS: Record<BuildingType, ResourceCost> = {
  mine: { minerals: 100, energy: 50, credits: 50 },
  factory: { minerals: 150, energy: 100, credits: 100 },
  shipyard: { minerals: 500, energy: 300, credits: 500 },
  defense: { minerals: 200, energy: 150, credits: 100 },
  lab: { minerals: 300, energy: 200, credits: 200 },
  habitat: { minerals: 80, energy: 40, credits: 60 }
};

/**
 * Base production values for level 1 buildings
 */
const BASE_PRODUCTION = {
  mine: { minerals: 20, energy: -5 },
  factory: { credits: 15, energy: -10 },
  shipyard: { energy: -20 },
  defense: { defense: 50, energy: -5 },
  lab: { research: 10, energy: -15 },
  habitat: { capacity: 500, energy: -3 }
};

/**
 * Building information database
 */
export const BUILDINGS: Record<BuildingType, BuildingInfo> = {
  /**
   * Mine - Produces minerals
   */
  mine: {
    type: 'mine',
    name: 'Mineral Mine',
    description: 'Extracts minerals from the planet. Each level increases production.',
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â',
    requirements: {
      cost: BASE_COSTS.mine,
      buildTime: 60, // 1 minute
      maxLevel: 20,
      populationRequired: 10
    },
    production: (level: number) => ({
      minerals: calculateProduction(BASE_PRODUCTION.mine.minerals, level),
      energy: BASE_PRODUCTION.mine.energy * level
    })
  },

  /**
   * Factory - Produces credits
   */
  factory: {
    type: 'factory',
    name: 'Manufacturing Factory',
    description: 'Produces credits through manufacturing. Requires energy to operate.',
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­',
    requirements: {
      cost: BASE_COSTS.factory,
      buildTime: 90, // 1.5 minutes
      maxLevel: 20,
      populationRequired: 20
    },
    production: (level: number) => ({
      credits: calculateProduction(BASE_PRODUCTION.factory.credits, level),
      energy: BASE_PRODUCTION.factory.energy * level
    })
  },

  /**
   * Shipyard - Builds ships
   */
  shipyard: {
    type: 'shipyard',
    name: 'Shipyard',
    description: 'Allows construction of ships. Higher levels unlock advanced ship types.',
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬',
    requirements: {
      cost: BASE_COSTS.shipyard,
      buildTime: 300, // 5 minutes
      maxLevel: 10,
      prerequisite: {
        buildingType: 'factory',
        level: 2
      },
      populationRequired: 50
    },
    production: (level: number) => ({
      energy: BASE_PRODUCTION.shipyard.energy * level
    })
  },

  /**
   * Defense Grid - Provides planetary defense
   */
  defense: {
    type: 'defense',
    name: 'Defense Grid',
    description: 'Protects the planet from attacks. Each level increases defense rating.',
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â',
    requirements: {
      cost: BASE_COSTS.defense,
      buildTime: 120, // 2 minutes
      maxLevel: 15,
      populationRequired: 15
    },
    production: (level: number) => ({
      defense: calculateProduction(BASE_PRODUCTION.defense.defense, level),
      energy: BASE_PRODUCTION.defense.energy * level
    })
  },

  /**
   * Research Lab - Produces research points
   */
  lab: {
    type: 'lab',
    name: 'Research Laboratory',
    description: 'Conducts research to unlock new technologies and improve efficiency.',
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬',
    requirements: {
      cost: BASE_COSTS.lab,
      buildTime: 180, // 3 minutes
      maxLevel: 15,
      prerequisite: {
        buildingType: 'factory',
        level: 1
      },
      populationRequired: 25
    },
    production: (level: number) => ({
      research: calculateProduction(BASE_PRODUCTION.lab.research, level),
      energy: BASE_PRODUCTION.lab.energy * level
    })
  },

  /**
   * Habitat - Increases population capacity
   */
  habitat: {
    type: 'habitat',
    name: 'Habitat Module',
    description: 'Provides housing for population. Each level increases capacity.',
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¹Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â',
    requirements: {
      cost: BASE_COSTS.habitat,
      buildTime: 60, // 1 minute
      maxLevel: 25,
      populationRequired: 0 // Doesn't require population to build
    },
    production: (level: number) => ({
      capacity: calculateProduction(BASE_PRODUCTION.habitat.capacity, level),
      energy: BASE_PRODUCTION.habitat.energy * level
    })
  }
};

/**
 * Get building cost for specific level
 */
export const getBuildingCost = (type: BuildingType, level: number): ResourceCost => {
  return calculateCost(BASE_COSTS[type], level);
};

/**
 * Get building production for specific level
 */
export const getBuildingProduction = (type: BuildingType, level: number): BuildingProduction => {
  return BUILDINGS[type].production(level);
};

/**
 * Get building build time for specific level
 * Higher levels take longer to build
 */
export const getBuildTime = (type: BuildingType, level: number): number => {
  const baseTime = BUILDINGS[type].requirements.buildTime;
  return Math.floor(baseTime * Math.pow(1.3, level - 1));
};

/**
 * Maximum buildings per planet
 */
export const MAX_BUILDING_SLOTS = 20;

/**
 * Base population capacity (without habitats)
 */
export const BASE_POPULATION_CAPACITY = 1000;

/**
 * Population growth rate per tick (per second)
 */
export const POPULATION_GROWTH_RATE = 0.5;
