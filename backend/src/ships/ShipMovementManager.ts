/**
 * Ship Movement Manager
 * 
 * Manages ship movements, travel calculations, and real-time updates
 */

import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { ShipClass } from './Ship';
import { Planet } from '@/planets/Planet';
import { GalaxyMapGenerator } from '@/galaxy/GalaxyMapGenerator';
import type { Position } from '@shared/types/galaxyMap';
import type {
  ShipMovement,
  ShipActionResult,
  TravelCalculation
} from '@shared/types/ships';

/**
 * Movement queue entry
 */
interface MovementQueueEntry {
  shipId: string;
  movement: ShipMovement;
  ownerId: string;
}

/**
 * Movement validation result
 */
interface MovementValidation {
  valid: boolean;
  reason?: string;
  requiresCombat?: boolean;
  enemyPlanetId?: string;
}

/**
 * Ship arrival notification
 */
interface ArrivalNotification {
  shipId: string;
  shipName: string;
  ownerId: string;
  planetId: string;
  planetName: string;
  timestamp: number;
}

/**
 * Ship Movement Manager Class
 * 
 * Handles ship movement operations, validation, and real-time updates
 */
export class ShipMovementManager {
  private ships: Map<string, ShipClass>;
  private planets: Map<string, Planet>;
  private movementQueue: MovementQueueEntry[];
  private io: SocketIOServer | null;
  private updateInterval: NodeJS.Timeout | null;

  constructor() {
    this.ships = new Map();
    this.planets = new Map();
    this.movementQueue = [];
    this.io = null;
    this.updateInterval = null;
  }

  /**
   * Initialize with Socket.IO server
   * 
   * @param io - Socket.IO server instance
   */
  public initialize(io: SocketIOServer): void {
    this.io = io;
    this.startMovementUpdates();
    logger.info('Ship Movement Manager initialized');
  }

  /**
   * Register ship with movement manager
   * 
   * @param ship - Ship instance
   */
  public registerShip(ship: ShipClass): void {
    this.ships.set(ship.id, ship);
  }

  /**
   * Unregister ship
   * 
   * @param shipId - Ship ID
   */
  public unregisterShip(shipId: string): void {
    this.ships.delete(shipId);
    this.removeFromQueue(shipId);
  }

  /**
   * Register planet
   * 
   * @param planet - Planet instance
   */
  public registerPlanet(planet: Planet): void {
    this.planets.set(planet.id, planet);
  }

  /**
   * Calculate distance between two positions
   * 
   * @param from - Origin position
   * @param to - Destination position
   * @returns Distance in units
   */
  public calculateDistance(from: Position, to: Position): number {
    const result = GalaxyMapGenerator.calculateDistance(from, to);
    return result.distance;
  }

  /**
   * Calculate travel time
   * 
   * @param distance - Distance in units
   * @param speed - Ship speed (units per hour)
   * @returns Travel time in seconds
   */
  public calculateTravelTime(distance: number, speed: number): number {
    const travelTimeHours = distance / speed;
    return Math.ceil(travelTimeHours * 3600);
  }

  /**
   * Get planet position
   * 
   * @param planetId - Planet ID
   * @returns Position or null
   */
  private getPlanetPosition(planetId: string): Position | null {
    const planet = this.planets.get(planetId);
    return planet ? planet.position : null;
  }

  /**
   * Validate movement
   * 
   * @param ship - Ship instance
   * @param destinationPlanetId - Destination planet ID
   * @returns Validation result
   */
  private validateMovement(
    ship: ShipClass,
    destinationPlanetId: string
  ): MovementValidation {
    // Check if ship exists
    if (!ship) {
      return { valid: false, reason: 'Ship not found' };
    }

    // Check if ship can move
    if (ship.status === 'destroyed') {
      return { valid: false, reason: 'Ship is destroyed' };
    }

    if (ship.status === 'moving') {
      return { valid: false, reason: 'Ship is already moving' };
    }

    // Check origin planet
    if (!ship.currentPlanetId) {
      return { valid: false, reason: 'Ship has no origin planet' };
    }

    // Check if destination exists
    const destinationPlanet = this.planets.get(destinationPlanetId);
    if (!destinationPlanet) {
      return { valid: false, reason: 'Destination planet not found' };
    }

    // Check if already at destination
    if (ship.currentPlanetId === destinationPlanetId) {
      return { valid: false, reason: 'Ship is already at destination' };
    }

    // Check if destination is occupied by enemy
    if (destinationPlanet.ownerId && destinationPlanet.ownerId !== ship.ownerId) {
      return {
        valid: false,
        reason: 'Destination occupied by enemy',
        requiresCombat: true,
        enemyPlanetId: destinationPlanetId
      };
    }

    return { valid: true };
  }

  /**
   * Move ship to destination
   * 
   * @param shipId - Ship ID
   * @param destinationPlanetId - Destination planet ID
   * @param allowCombat - Allow movement to enemy planets (initiates combat)
   * @returns Action result
   */
  public moveShip(
    shipId: string,
    destinationPlanetId: string,
    allowCombat: boolean = false
  ): ShipActionResult {
    const ship = this.ships.get(shipId);
    if (!ship) {
      return { success: false, message: 'Ship not found' };
    }

    // Validate movement
    const validation = this.validateMovement(ship, destinationPlanetId);
    
    if (!validation.valid) {
      // If combat required and not allowed, return error
      if (validation.requiresCombat && !allowCombat) {
        return {
          success: false,
          message: validation.reason || 'Movement not allowed',
          data: {
            requiresCombat: true,
            enemyPlanetId: validation.enemyPlanetId
          }
        };
      }

      // Other validation failures
      if (!validation.requiresCombat) {
        return { success: false, message: validation.reason || 'Invalid movement' };
      }
    }

    // Get positions
    const originPos = this.getPlanetPosition(ship.currentPlanetId!);
    const destPos = this.getPlanetPosition(destinationPlanetId);

    if (!originPos || !destPos) {
      return { success: false, message: 'Could not determine planet positions' };
    }

    // Calculate travel
    const distance = this.calculateDistance(originPos, destPos);
    const travelTime = this.calculateTravelTime(distance, ship.stats.speed);

    // Move ship
    const moveResult = ship.moveTo(destinationPlanetId, destPos, originPos);

    if (!moveResult.success) {
      return moveResult;
    }

    // Add to movement queue
    this.addToQueue(ship);

    // Broadcast movement to all players
    this.broadcastShipMovement(ship, destinationPlanetId, travelTime);

    logger.info(
      `Ship ${ship.name} (${ship.id}) moving to planet ${destinationPlanetId}. ` +
      `Distance: ${distance.toFixed(2)}, Time: ${travelTime}s`
    );

    return {
      success: true,
      message: `Ship en route to destination`,
      ship: ship.toJSON(),
      data: {
        distance,
        travelTime,
        arrivalTime: ship.movement?.arrivalTime,
        requiresCombat: validation.requiresCombat || false
      }
    };
  }

  /**
   * Cancel ship movement
   * 
   * @param shipId - Ship ID
   * @returns Action result
   */
  public cancelMovement(shipId: string): ShipActionResult {
    const ship = this.ships.get(shipId);
    if (!ship) {
      return { success: false, message: 'Ship not found' };
    }

    if (!ship.movement || ship.status !== 'moving') {
      return { success: false, message: 'Ship is not moving' };
    }

    const originalDestination = ship.movement.destination;

    // Cancel movement - ship stays at current position in space
    // In a real implementation, you might want to return to origin or continue to nearest planet
    ship.movement = null;
    ship.status = 'idle';

    // Remove from queue
    this.removeFromQueue(shipId);

    // Broadcast cancellation
    this.broadcastMovementCancelled(ship, originalDestination);

    logger.info(`Ship ${ship.name} movement cancelled`);

    return {
      success: true,
      message: 'Movement cancelled',
      ship: ship.toJSON()
    };
  }

  /**
   * Add ship to movement queue
   * 
   * @param ship - Ship instance
   */
  private addToQueue(ship: ShipClass): void {
    if (!ship.movement) return;

    const entry: MovementQueueEntry = {
      shipId: ship.id,
      movement: ship.movement,
      ownerId: ship.ownerId
    };

    this.movementQueue.push(entry);
  }

  /**
   * Remove ship from queue
   * 
   * @param shipId - Ship ID
   */
  private removeFromQueue(shipId: string): void {
    const index = this.movementQueue.findIndex(e => e.shipId === shipId);
    if (index !== -1) {
      this.movementQueue.splice(index, 1);
    }
  }

  /**
   * Start movement update loop
   */
  private startMovementUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Update every second
    this.updateInterval = setInterval(() => {
      this.processMovements();
    }, 1000);

    logger.info('Movement update loop started');
  }

  /**
   * Stop movement update loop
   */
  public stopMovementUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Movement update loop stopped');
    }
  }

  /**
   * Process all active movements
   */
  private processMovements(): void {
    const now = Date.now();
    const arrivals: ArrivalNotification[] = [];

    // Check each ship in queue
    for (const entry of this.movementQueue) {
      const ship = this.ships.get(entry.shipId);
      if (!ship) {
        continue;
      }

      // Update ship movement
      const arrived = ship.updateMovement();

      if (arrived) {
        const planet = this.planets.get(ship.currentPlanetId!);
        
        arrivals.push({
          shipId: ship.id,
          shipName: ship.name,
          ownerId: ship.ownerId,
          planetId: ship.currentPlanetId!,
          planetName: planet?.name || 'Unknown',
          timestamp: now
        });
      }
    }

    // Remove arrived ships from queue
    this.movementQueue = this.movementQueue.filter(entry => {
      const ship = this.ships.get(entry.shipId);
      return ship && ship.status === 'moving';
    });

    // Broadcast arrivals
    arrivals.forEach(arrival => {
      this.broadcastShipArrival(arrival);
    });
  }

  /**
   * Broadcast ship movement to all players
   * 
   * @param ship - Ship instance
   * @param destinationPlanetId - Destination planet ID
   * @param travelTime - Travel time in seconds
   */
  private broadcastShipMovement(
    ship: ShipClass,
    destinationPlanetId: string,
    travelTime: number
  ): void {
    if (!this.io) return;

    const planet = this.planets.get(destinationPlanetId);

    this.io.emit('ship:moving', {
      shipId: ship.id,
      shipName: ship.name,
      shipType: ship.type,
      ownerId: ship.ownerId,
      origin: ship.movement?.origin,
      destination: destinationPlanetId,
      destinationName: planet?.name || 'Unknown',
      travelTime,
      arrivalTime: ship.movement?.arrivalTime,
      timestamp: Date.now()
    });

    // Also send to owner's personal channel
    this.io.to(`player:${ship.ownerId}`).emit('ship:movement:started', {
      shipId: ship.id,
      shipName: ship.name,
      destination: destinationPlanetId,
      destinationName: planet?.name,
      travelTime,
      arrivalTime: ship.movement?.arrivalTime
    });

    logger.debug(`Broadcasted ship movement: ${ship.name} -> ${planet?.name}`);
  }

  /**
   * Broadcast ship arrival
   * 
   * @param arrival - Arrival notification
   */
  private broadcastShipArrival(arrival: ArrivalNotification): void {
    if (!this.io) return;

    // Broadcast to all players
    this.io.emit('ship:arrived', {
      shipId: arrival.shipId,
      shipName: arrival.shipName,
      ownerId: arrival.ownerId,
      planetId: arrival.planetId,
      planetName: arrival.planetName,
      timestamp: arrival.timestamp
    });

    // Send notification to owner
    this.io.to(`player:${arrival.ownerId}`).emit('notification', {
      type: 'ship_arrival',
      message: `${arrival.shipName} has arrived at ${arrival.planetName}`,
      data: {
        shipId: arrival.shipId,
        planetId: arrival.planetId
      },
      timestamp: arrival.timestamp
    });

    logger.info(`Ship ${arrival.shipName} arrived at ${arrival.planetName}`);
  }

  /**
   * Broadcast movement cancellation
   * 
   * @param ship - Ship instance
   * @param destinationPlanetId - Original destination
   */
  private broadcastMovementCancelled(ship: ShipClass, destinationPlanetId: string): void {
    if (!this.io) return;

    this.io.emit('ship:movement:cancelled', {
      shipId: ship.id,
      shipName: ship.name,
      ownerId: ship.ownerId,
      destination: destinationPlanetId,
      timestamp: Date.now()
    });

    logger.debug(`Broadcasted movement cancellation: ${ship.name}`);
  }

  /**
   * Get all active movements
   * 
   * @returns Array of movement queue entries
   */
  public getActiveMovements(): MovementQueueEntry[] {
    return [...this.movementQueue];
  }

  /**
   * Get movements for specific player
   * 
   * @param playerId - Player ID
   * @returns Array of player's movements
   */
  public getPlayerMovements(playerId: string): MovementQueueEntry[] {
    return this.movementQueue.filter(e => e.ownerId === playerId);
  }

  /**
   * Get movements to specific planet
   * 
   * @param planetId - Planet ID
   * @returns Array of movements to planet
   */
  public getMovementsToPlanet(planetId: string): MovementQueueEntry[] {
    return this.movementQueue.filter(e => e.movement.destination === planetId);
  }

  /**
   * Get estimated arrival time for ship
   * 
   * @param shipId - Ship ID
   * @returns Arrival timestamp or null
   */
  public getArrivalTime(shipId: string): number | null {
    const entry = this.movementQueue.find(e => e.shipId === shipId);
    return entry ? entry.movement.arrivalTime : null;
  }

  /**
   * Get remaining travel time for ship
   * 
   * @param shipId - Ship ID
   * @returns Remaining seconds or 0
   */
  public getRemainingTime(shipId: string): number {
    const ship = this.ships.get(shipId);
    return ship ? ship.getRemainingTravelTime() : 0;
  }

  /**
   * Check for collision at destination
   * 
   * @param destinationPlanetId - Destination planet ID
   * @param ownerId - Ship owner ID
   * @returns True if collision detected
   */
  public checkCollision(destinationPlanetId: string, ownerId: string): boolean {
    const planet = this.planets.get(destinationPlanetId);
    
    if (!planet || !planet.ownerId) {
      return false; // Neutral planet, no collision
    }

    return planet.ownerId !== ownerId; // Collision if different owner
  }

  /**
   * Get all ships at planet
   * 
   * @param planetId - Planet ID
   * @returns Array of ship IDs
   */
  public getShipsAtPlanet(planetId: string): string[] {
    return Array.from(this.ships.values())
      .filter(ship => ship.currentPlanetId === planetId)
      .map(ship => ship.id);
  }

  /**
   * Clear all movements (for testing/reset)
   */
  public clear(): void {
    this.movementQueue = [];
    this.ships.clear();
    this.planets.clear();
    this.stopMovementUpdates();
  }
}

// Export singleton instance
export const shipMovementManager = new ShipMovementManager();
