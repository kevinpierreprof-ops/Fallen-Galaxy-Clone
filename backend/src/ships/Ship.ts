/**
 * Ship Class
 * 
 * Represents individual ships with movement, combat, and resource management
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { GalaxyMapGenerator } from '@/galaxy/GalaxyMapGenerator';
import type { Position } from '@shared/types/galaxyMap';
import type {
  Ship,
  ShipType,
  ShipStatus,
  ShipStats,
  ShipCargo,
  ShipMovement,
  ShipActionResult,
  TravelCalculation,
  MiningOperation,
  ColonizationMission
} from '@shared/types/ships';
import {
  SHIP_BASE_STATS,
  SHIP_COSTS,
  MINING_RATES,
  REPAIR_COST_MULTIPLIER,
  REPAIR_TIME_PER_HP,
  FUEL_CONSUMPTION_RATE,
  COLONIZATION_REQUIREMENTS
} from '@shared/constants/shipSystem';

/**
 * Ship Class
 * 
 * Manages individual ship operations including movement, combat, and resource gathering
 */
export class ShipClass {
  public readonly id: string;
  public readonly type: ShipType;
  public name: string;
  public ownerId: string;
  public currentPlanetId: string | null;
  public fleetId: string | null;
  public stats: ShipStats;
  public cargo: ShipCargo;
  public movement: ShipMovement | null;
  public status: ShipStatus;
  public readonly createdAt: number;
  public lastAction?: number;

  private miningOperation: MiningOperation | null = null;

  /**
   * Create a new ship
   * 
   * @param type - Ship type
   * @param ownerId - Owner player ID
   * @param currentPlanetId - Starting planet ID
   * @param name - Ship name (optional)
   */
  constructor(
    type: ShipType,
    ownerId: string,
    currentPlanetId: string,
    name?: string
  ) {
    this.id = uuidv4();
    this.type = type;
    this.name = name || this.generateName();
    this.ownerId = ownerId;
    this.currentPlanetId = currentPlanetId;
    this.fleetId = null;
    this.stats = { ...SHIP_BASE_STATS[type] };
    this.cargo = {
      minerals: 0,
      energy: 0,
      crystal: 0,
      current: 0,
      capacity: this.stats.cargo
    };
    this.movement = null;
    this.status = ShipStatus.Idle;
    this.createdAt = Date.now();
  }

  /**
   * Generate random ship name
   */
  private generateName(): string {
    const prefixes = ['USS', 'HMS', 'ISS', 'SNS', 'CSS'];
    const names = [
      'Endeavor', 'Discovery', 'Voyager', 'Enterprise', 'Atlantis',
      'Phoenix', 'Nebula', 'Aurora', 'Valiant', 'Defiant',
      'Excalibur', 'Intrepid', 'Vigilant', 'Resolute', 'Victory'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${prefix} ${name}-${number}`;
  }

  /**
   * Calculate travel time and distance
   * 
   * @param origin - Origin position
   * @param destination - Destination position
   * @returns Travel calculation
   */
  public calculateTravel(origin: Position, destination: Position): TravelCalculation {
    const distResult = GalaxyMapGenerator.calculateDistance(origin, destination);
    const distance = distResult.distance;

    // Travel time = distance / speed (in hours)
    const travelTimeHours = distance / this.stats.speed;
    const travelTimeSeconds = Math.ceil(travelTimeHours * 3600);

    // Fuel cost
    const fuelCost = distance * FUEL_CONSUMPTION_RATE;

    return {
      distance,
      travelTime: travelTimeSeconds,
      arrivalTime: Date.now() + (travelTimeSeconds * 1000),
      fuelCost
    };
  }

  /**
   * Move ship to destination planet
   * 
   * @param destinationPlanetId - Destination planet ID
   * @param destinationPosition - Destination position
   * @param originPosition - Origin position
   * @returns Action result
   */
  public moveTo(
    destinationPlanetId: string,
    destinationPosition: Position,
    originPosition: Position
  ): ShipActionResult {
    // Check if ship can move
    if (this.status === ShipStatus.Destroyed) {
      return {
        success: false,
        message: 'Ship is destroyed'
      };
    }

    if (this.status === ShipStatus.Moving) {
      return {
        success: false,
        message: 'Ship is already moving'
      };
    }

    if (!this.currentPlanetId) {
      return {
        success: false,
        message: 'Ship has no origin planet'
      };
    }

    // Calculate travel
    const travel = this.calculateTravel(originPosition, destinationPosition);

    // Check fuel
    if (this.stats.fuelCapacity && travel.fuelCost > this.stats.fuelCapacity) {
      return {
        success: false,
        message: 'Insufficient fuel for journey'
      };
    }

    // Set movement data
    this.movement = {
      isMoving: true,
      origin: this.currentPlanetId,
      destination: destinationPlanetId,
      startTime: Date.now(),
      arrivalTime: travel.arrivalTime,
      distance: travel.distance,
      travelTime: travel.travelTime
    };

    this.status = ShipStatus.Moving;
    this.currentPlanetId = null; // Ship is in transit
    this.lastAction = Date.now();

    logger.info(`Ship ${this.name} moving to planet ${destinationPlanetId}`);

    return {
      success: true,
      message: `Ship en route to destination. ETA: ${travel.travelTime}s`,
      ship: this.toJSON(),
      data: travel
    };
  }

  /**
   * Check and complete movement if arrived
   * 
   * @returns True if movement completed
   */
  public updateMovement(): boolean {
    if (!this.movement || !this.movement.isMoving) {
      return false;
    }

    const now = Date.now();
    if (now >= this.movement.arrivalTime) {
      // Arrived at destination
      this.currentPlanetId = this.movement.destination;
      this.movement = null;
      this.status = ShipStatus.Idle;

      logger.info(`Ship ${this.name} arrived at destination`);
      return true;
    }

    return false;
  }

  /**
   * Start mining operation
   * 
   * @param planetId - Planet to mine at
   * @param resourceType - Type of resource to mine
   * @param duration - Mining duration in seconds
   * @returns Action result
   */
  public mine(
    planetId: string,
    resourceType: 'minerals' | 'energy' | 'crystal',
    duration: number = 3600
  ): ShipActionResult {
    // Check if can mine
    if (this.status === ShipStatus.Destroyed) {
      return { success: false, message: 'Ship is destroyed' };
    }

    if (this.status !== ShipStatus.Idle) {
      return { success: false, message: 'Ship is busy' };
    }

    if (this.currentPlanetId !== planetId) {
      return { success: false, message: 'Ship is not at planet' };
    }

    // Check cargo space
    if (this.cargo.current >= this.cargo.capacity) {
      return { success: false, message: 'Cargo hold is full' };
    }

    // Calculate mining amount
    const miningRate = MINING_RATES[this.type];
    const maxAmount = Math.min(
      miningRate * (duration / 3600),
      this.cargo.capacity - this.cargo.current
    );

    this.miningOperation = {
      shipId: this.id,
      planetId,
      startTime: Date.now(),
      endTime: Date.now() + (duration * 1000),
      resourceType,
      amount: maxAmount
    };

    this.status = ShipStatus.Mining;
    this.lastAction = Date.now();

    logger.info(`Ship ${this.name} started mining ${resourceType}`);

    return {
      success: true,
      message: `Mining operation started. Will collect ${maxAmount} ${resourceType}`,
      ship: this.toJSON(),
      data: this.miningOperation
    };
  }

  /**
   * Complete mining operation
   * 
   * @returns Mined resources or null
   */
  public completeMining(): { resourceType: string; amount: number } | null {
    if (!this.miningOperation) {
      return null;
    }

    const now = Date.now();
    if (now < this.miningOperation.endTime) {
      return null; // Not finished yet
    }

    const { resourceType, amount } = this.miningOperation;

    // Add to cargo
    this.cargo[resourceType] += amount;
    this.cargo.current += amount;

    // Reset mining operation
    this.miningOperation = null;
    this.status = ShipStatus.Idle;

    logger.info(`Ship ${this.name} completed mining: ${amount} ${resourceType}`);

    return { resourceType, amount };
  }

  /**
   * Colonize a planet
   * 
   * @param targetPlanetId - Planet to colonize
   * @returns Action result
   */
  public colonize(targetPlanetId: string): ShipActionResult {
    // Only colony ships can colonize
    if (this.type !== ShipType.Colony) {
      return {
        success: false,
        message: 'Only colony ships can colonize planets'
      };
    }

    if (this.status === ShipStatus.Destroyed) {
      return { success: false, message: 'Ship is destroyed' };
    }

    if (this.currentPlanetId !== targetPlanetId) {
      return { success: false, message: 'Ship must be at target planet' };
    }

    // Check cargo for settlers
    if (this.cargo.current < COLONIZATION_REQUIREMENTS.settlers) {
      return {
        success: false,
        message: `Need ${COLONIZATION_REQUIREMENTS.settlers} settlers to colonize`
      };
    }

    // Colony ship is consumed in colonization
    this.status = ShipStatus.Destroyed;
    this.lastAction = Date.now();

    logger.info(`Ship ${this.name} colonized planet ${targetPlanetId}`);

    return {
      success: true,
      message: 'Planet colonization initiated',
      ship: this.toJSON(),
      data: {
        planetId: targetPlanetId,
        settlers: COLONIZATION_REQUIREMENTS.settlers,
        buildTime: COLONIZATION_REQUIREMENTS.buildTime
      }
    };
  }

  /**
   * Attack another ship or planet
   * 
   * @param targetId - Target ship or planet ID
   * @returns Action result
   */
  public attack(targetId: string): ShipActionResult {
    if (this.status === ShipStatus.Destroyed) {
      return { success: false, message: 'Ship is destroyed' };
    }

    if (this.stats.attack === 0) {
      return { success: false, message: 'Ship has no weapons' };
    }

    if (this.status !== ShipStatus.Idle) {
      return { success: false, message: 'Ship is busy' };
    }

    this.status = ShipStatus.Attacking;
    this.lastAction = Date.now();

    logger.info(`Ship ${this.name} attacking ${targetId}`);

    return {
      success: true,
      message: 'Attack initiated',
      ship: this.toJSON(),
      data: {
        targetId,
        attackPower: this.stats.attack,
        range: this.stats.range
      }
    };
  }

  /**
   * Take damage
   * 
   * @param damage - Damage amount
   * @returns True if ship destroyed
   */
  public takeDamage(damage: number): boolean {
    const actualDamage = Math.max(0, damage - this.stats.defense);
    this.stats.health -= actualDamage;

    logger.info(`Ship ${this.name} took ${actualDamage} damage (${this.stats.health}/${this.stats.maxHealth} HP)`);

    if (this.stats.health <= 0) {
      this.stats.health = 0;
      this.status = ShipStatus.Destroyed;
      logger.info(`Ship ${this.name} destroyed`);
      return true;
    }

    return false;
  }

  /**
   * Repair ship
   * 
   * @param amount - Amount of health to repair (optional)
   * @returns Action result
   */
  public repair(amount?: number): ShipActionResult {
    if (this.status === ShipStatus.Destroyed) {
      return { success: false, message: 'Ship is destroyed and cannot be repaired' };
    }

    if (this.stats.health >= this.stats.maxHealth) {
      return { success: false, message: 'Ship is already at full health' };
    }

    const repairAmount = amount || (this.stats.maxHealth - this.stats.health);
    const actualRepair = Math.min(repairAmount, this.stats.maxHealth - this.stats.health);

    // Calculate repair cost
    const cost = SHIP_COSTS[this.type];
    const repairCost = {
      minerals: Math.floor(cost.minerals * REPAIR_COST_MULTIPLIER * (actualRepair / this.stats.maxHealth)),
      energy: Math.floor(cost.energy * REPAIR_COST_MULTIPLIER * (actualRepair / this.stats.maxHealth)),
      crystal: Math.floor(cost.crystal * REPAIR_COST_MULTIPLIER * (actualRepair / this.stats.maxHealth))
    };

    const repairTime = Math.ceil(actualRepair * REPAIR_TIME_PER_HP);

    this.stats.health += actualRepair;
    this.status = ShipStatus.Repairing;
    this.lastAction = Date.now();

    logger.info(`Ship ${this.name} repairing ${actualRepair} HP`);

    return {
      success: true,
      message: `Repairing ${actualRepair} HP`,
      ship: this.toJSON(),
      data: {
        repairAmount: actualRepair,
        cost: repairCost,
        repairTime
      }
    };
  }

  /**
   * Load cargo
   * 
   * @param resourceType - Resource type
   * @param amount - Amount to load
   * @returns Success status
   */
  public loadCargo(resourceType: 'minerals' | 'energy' | 'crystal', amount: number): boolean {
    const available = this.cargo.capacity - this.cargo.current;
    const loadAmount = Math.min(amount, available);

    if (loadAmount <= 0) {
      return false;
    }

    this.cargo[resourceType] += loadAmount;
    this.cargo.current += loadAmount;

    logger.info(`Ship ${this.name} loaded ${loadAmount} ${resourceType}`);
    return true;
  }

  /**
   * Unload cargo
   * 
   * @param resourceType - Resource type
   * @param amount - Amount to unload (optional, defaults to all)
   * @returns Amount unloaded
   */
  public unloadCargo(resourceType: 'minerals' | 'energy' | 'crystal', amount?: number): number {
    const unloadAmount = amount ? Math.min(amount, this.cargo[resourceType]) : this.cargo[resourceType];

    this.cargo[resourceType] -= unloadAmount;
    this.cargo.current -= unloadAmount;

    logger.info(`Ship ${this.name} unloaded ${unloadAmount} ${resourceType}`);
    return unloadAmount;
  }

  /**
   * Get remaining travel time
   * 
   * @returns Seconds until arrival, or 0 if not moving
   */
  public getRemainingTravelTime(): number {
    if (!this.movement || !this.movement.isMoving) {
      return 0;
    }

    const remaining = Math.max(0, this.movement.arrivalTime - Date.now());
    return Math.ceil(remaining / 1000);
  }

  /**
   * Serialize to JSON
   */
  public toJSON(): Ship {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      ownerId: this.ownerId,
      currentPlanetId: this.currentPlanetId,
      fleetId: this.fleetId,
      stats: { ...this.stats },
      cargo: { ...this.cargo },
      movement: this.movement ? { ...this.movement } : null,
      status: this.status,
      createdAt: this.createdAt,
      lastAction: this.lastAction
    };
  }

  /**
   * Create ship from JSON
   */
  public static fromJSON(data: Ship): ShipClass {
    const ship = new ShipClass(data.type, data.ownerId, data.currentPlanetId || '', data.name);

    ship.currentPlanetId = data.currentPlanetId;
    ship.fleetId = data.fleetId;
    ship.stats = data.stats;
    ship.cargo = data.cargo;
    ship.movement = data.movement;
    ship.status = data.status;
    ship.lastAction = data.lastAction;

    return ship;
  }
}
