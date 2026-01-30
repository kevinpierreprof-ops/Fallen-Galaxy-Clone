/**
 * Ship System Types
 * 
 * Type definitions for ships, fleets, and ship-related operations
 */

/**
 * Ship type enumeration
 */
export enum ShipType {
  Explorer = 'explorer',
  Miner = 'miner',
  Colony = 'colony',
  Fighter = 'fighter',
  Cruiser = 'cruiser',
  Battleship = 'battleship',
  Carrier = 'carrier',
  Transport = 'transport'
}

/**
 * Ship statistics
 */
export interface ShipStats {
  speed: number;          // Units per hour
  cargo: number;          // Cargo capacity
  attack: number;         // Attack power
  defense: number;        // Defense rating
  health: number;         // Current health
  maxHealth: number;      // Maximum health
  range?: number;         // Attack range (for combat)
  fuelCapacity?: number;  // Fuel capacity
}

/**
 * Ship build cost
 */
export interface ShipCost {
  minerals: number;
  energy: number;
  crystal: number;
  buildTime: number;  // in seconds
}

/**
 * Ship requirements
 */
export interface ShipRequirements {
  shipyard: number;      // Minimum shipyard level
  researchLab?: number;  // Required research lab level
  technology?: string;   // Required technology
}

/**
 * Ship cargo
 */
export interface ShipCargo {
  minerals: number;
  energy: number;
  crystal: number;
  current: number;      // Current cargo amount
  capacity: number;     // Maximum capacity
}

/**
 * Ship movement data
 */
export interface ShipMovement {
  isMoving: boolean;
  origin: string;           // Origin planet ID
  destination: string;      // Destination planet ID
  startTime: number;        // Timestamp when movement started
  arrivalTime: number;      // Timestamp when ship arrives
  distance: number;         // Distance in units
  travelTime: number;       // Total travel time in seconds
}

/**
 * Ship instance
 */
export interface Ship {
  id: string;
  type: ShipType;
  name: string;
  ownerId: string;
  currentPlanetId: string | null;
  fleetId: string | null;
  stats: ShipStats;
  cargo: ShipCargo;
  movement: ShipMovement | null;
  status: ShipStatus;
  createdAt: number;
  lastAction?: number;
}

/**
 * Ship status
 */
export enum ShipStatus {
  Idle = 'idle',
  Moving = 'moving',
  Mining = 'mining',
  Attacking = 'attacking',
  Repairing = 'repairing',
  Destroyed = 'destroyed'
}

/**
 * Fleet of ships
 */
export interface Fleet {
  id: string;
  name: string;
  ownerId: string;
  ships: string[];        // Ship IDs
  currentPlanetId: string | null;
  movement: ShipMovement | null;
  createdAt: number;
}

/**
 * Mining operation
 */
export interface MiningOperation {
  shipId: string;
  planetId: string;
  startTime: number;
  endTime: number;
  resourceType: 'minerals' | 'energy' | 'crystal';
  amount: number;
}

/**
 * Colonization mission
 */
export interface ColonizationMission {
  shipId: string;
  targetPlanetId: string;
  startTime: number;
  settlers: number;
}

/**
 * Combat encounter
 */
export interface CombatEncounter {
  id: string;
  attackerShips: string[];
  defenderShips: string[];
  location: string;       // Planet ID
  startTime: number;
  rounds: CombatRound[];
  result?: CombatResult;
}

/**
 * Combat round
 */
export interface CombatRound {
  round: number;
  attackerDamage: number;
  defenderDamage: number;
  attackerLosses: string[];  // Ship IDs destroyed
  defenderLosses: string[];
}

/**
 * Combat result
 */
export interface CombatResult {
  winner: 'attacker' | 'defender' | 'draw';
  attackerSurvivors: string[];
  defenderSurvivors: string[];
  duration: number;
}

/**
 * Ship action result
 */
export interface ShipActionResult {
  success: boolean;
  message: string;
  ship?: Ship;
  data?: any;
}

/**
 * Travel calculation result
 */
export interface TravelCalculation {
  distance: number;
  travelTime: number;    // in seconds
  arrivalTime: number;   // timestamp
  fuelCost: number;
}
