/**
 * Ship System Constants
 * 
 * Defines stats, costs, and requirements for all ship types
 */

import type { 
  ShipType, 
  ShipStats, 
  ShipCost, 
  ShipRequirements 
} from '../types/ships';

// ============================================================================
// BASE SHIP STATS
// ============================================================================

export const SHIP_BASE_STATS: Record<ShipType, ShipStats> = {
  [ShipType.Explorer]: {
    speed: 150,         // Fast
    cargo: 50,
    attack: 10,
    defense: 10,
    health: 100,
    maxHealth: 100,
    range: 50,
    fuelCapacity: 1000
  },

  [ShipType.Miner]: {
    speed: 80,          // Slow
    cargo: 500,         // Large cargo
    attack: 5,
    defense: 15,
    health: 150,
    maxHealth: 150,
    range: 25,
    fuelCapacity: 800
  },

  [ShipType.Colony]: {
    speed: 60,          // Very slow
    cargo: 200,
    attack: 0,          // Unarmed
    defense: 20,
    health: 200,
    maxHealth: 200,
    range: 0,
    fuelCapacity: 1200
  },

  [ShipType.Fighter]: {
    speed: 200,         // Very fast
    cargo: 20,
    attack: 40,         // High attack
    defense: 15,
    health: 80,
    maxHealth: 80,
    range: 100,
    fuelCapacity: 600
  },

  [ShipType.Cruiser]: {
    speed: 120,
    cargo: 100,
    attack: 80,
    defense: 50,
    health: 250,
    maxHealth: 250,
    range: 150,
    fuelCapacity: 1500
  },

  [ShipType.Battleship]: {
    speed: 80,          // Slow but powerful
    cargo: 150,
    attack: 150,        // Very high attack
    defense: 100,       // Very high defense
    health: 500,
    maxHealth: 500,
    range: 200,
    fuelCapacity: 2000
  },

  [ShipType.Carrier]: {
    speed: 100,
    cargo: 300,
    attack: 60,
    defense: 80,
    health: 400,
    maxHealth: 400,
    range: 250,
    fuelCapacity: 2500
  },

  [ShipType.Transport]: {
    speed: 90,
    cargo: 1000,        // Massive cargo
    attack: 5,
    defense: 25,
    health: 180,
    maxHealth: 180,
    range: 20,
    fuelCapacity: 1000
  }
};

// ============================================================================
// SHIP BUILD COSTS
// ============================================================================

export const SHIP_COSTS: Record<ShipType, ShipCost> = {
  [ShipType.Explorer]: {
    minerals: 500,
    energy: 300,
    crystal: 100,
    buildTime: 120      // 2 minutes
  },

  [ShipType.Miner]: {
    minerals: 800,
    energy: 400,
    crystal: 200,
    buildTime: 180      // 3 minutes
  },

  [ShipType.Colony]: {
    minerals: 2000,
    energy: 1000,
    crystal: 500,
    buildTime: 600      // 10 minutes
  },

  [ShipType.Fighter]: {
    minerals: 600,
    energy: 500,
    crystal: 300,
    buildTime: 150      // 2.5 minutes
  },

  [ShipType.Cruiser]: {
    minerals: 2000,
    energy: 1500,
    crystal: 1000,
    buildTime: 400      // 6.7 minutes
  },

  [ShipType.Battleship]: {
    minerals: 5000,
    energy: 3000,
    crystal: 2500,
    buildTime: 900      // 15 minutes
  },

  [ShipType.Carrier]: {
    minerals: 4000,
    energy: 2500,
    crystal: 2000,
    buildTime: 720      // 12 minutes
  },

  [ShipType.Transport]: {
    minerals: 1200,
    energy: 600,
    crystal: 300,
    buildTime: 240      // 4 minutes
  }
};

// ============================================================================
// SHIP REQUIREMENTS
// ============================================================================

export const SHIP_REQUIREMENTS: Record<ShipType, ShipRequirements> = {
  [ShipType.Explorer]: {
    shipyard: 1
  },

  [ShipType.Miner]: {
    shipyard: 2
  },

  [ShipType.Colony]: {
    shipyard: 5,
    researchLab: 3,
    technology: 'colonization'
  },

  [ShipType.Fighter]: {
    shipyard: 3
  },

  [ShipType.Cruiser]: {
    shipyard: 6,
    researchLab: 4,
    technology: 'advanced_weapons'
  },

  [ShipType.Battleship]: {
    shipyard: 10,
    researchLab: 8,
    technology: 'capital_ships'
  },

  [ShipType.Carrier]: {
    shipyard: 9,
    researchLab: 7,
    technology: 'fleet_command'
  },

  [ShipType.Transport]: {
    shipyard: 4
  }
};

// ============================================================================
// SHIP DESCRIPTIONS
// ============================================================================

export const SHIP_DESCRIPTIONS: Record<ShipType, string> = {
  [ShipType.Explorer]: 'Fast scout ship for exploring the galaxy and gathering intelligence.',
  [ShipType.Miner]: 'Specialized mining vessel with large cargo capacity for resource collection.',
  [ShipType.Colony]: 'Colonization ship capable of establishing new settlements on unclaimed planets.',
  [ShipType.Fighter]: 'Agile combat ship designed for fast attacks and hit-and-run tactics.',
  [ShipType.Cruiser]: 'Balanced warship combining firepower, defense, and versatility.',
  [ShipType.Battleship]: 'Heavy capital ship with devastating firepower and strong armor.',
  [ShipType.Carrier]: 'Fleet command ship with extended range and support capabilities.',
  [ShipType.Transport]: 'Large cargo vessel for transporting massive amounts of resources.'
};

// ============================================================================
// SHIP NAMES
// ============================================================================

export const SHIP_DISPLAY_NAMES: Record<ShipType, string> = {
  [ShipType.Explorer]: 'Explorer',
  [ShipType.Miner]: 'Mining Vessel',
  [ShipType.Colony]: 'Colony Ship',
  [ShipType.Fighter]: 'Fighter',
  [ShipType.Cruiser]: 'Cruiser',
  [ShipType.Battleship]: 'Battleship',
  [ShipType.Carrier]: 'Carrier',
  [ShipType.Transport]: 'Transport'
};

// ============================================================================
// GAME CONSTANTS
// ============================================================================

/**
 * Mining rates per hour by ship type
 */
export const MINING_RATES: Record<ShipType, number> = {
  [ShipType.Explorer]: 10,
  [ShipType.Miner]: 100,      // Specialized for mining
  [ShipType.Colony]: 0,
  [ShipType.Fighter]: 5,
  [ShipType.Cruiser]: 15,
  [ShipType.Battleship]: 10,
  [ShipType.Carrier]: 20,
  [ShipType.Transport]: 30
};

/**
 * Repair cost multiplier (percentage of build cost)
 */
export const REPAIR_COST_MULTIPLIER = 0.3;

/**
 * Repair time per health point (seconds)
 */
export const REPAIR_TIME_PER_HP = 0.5;

/**
 * Fuel consumption per unit distance
 */
export const FUEL_CONSUMPTION_RATE = 0.1;

/**
 * Maximum fleet size
 */
export const MAX_FLEET_SIZE = 50;

/**
 * Fleet speed (uses slowest ship)
 */
export const FLEET_SPEED_MODE = 'slowest';

/**
 * Colonization requirements
 */
export const COLONIZATION_REQUIREMENTS = {
  settlers: 100,          // Minimum settlers needed
  buildTime: 3600         // 1 hour to establish colony
};

/**
 * Combat constants
 */
export const COMBAT_CONSTANTS = {
  roundDuration: 10,      // 10 seconds per round
  maxRounds: 20,          // Maximum combat rounds
  retreatThreshold: 0.25  // 25% health to allow retreat
};
