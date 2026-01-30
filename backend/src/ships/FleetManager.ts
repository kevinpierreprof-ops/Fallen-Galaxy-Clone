/**
 * Fleet Manager
 * 
 * Manages ship fleets for coordinated movement and combat
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { ShipClass } from './Ship';
import type { Position } from '@shared/types/galaxyMap';
import type {
  Fleet,
  ShipMovement,
  ShipActionResult
} from '@shared/types/ships';
import {
  MAX_FLEET_SIZE,
  FLEET_SPEED_MODE
} from '@shared/constants/shipSystem';

/**
 * Fleet Manager Class
 * 
 * Coordinates groups of ships for movement and combat operations
 */
export class FleetManager {
  private fleets: Map<string, Fleet>;
  private ships: Map<string, ShipClass>;

  constructor() {
    this.fleets = new Map();
    this.ships = new Map();
  }

  /**
   * Create a new fleet
   * 
   * @param ownerId - Fleet owner ID
   * @param name - Fleet name
   * @param shipIds - Initial ship IDs
   * @returns Created fleet or null
   */
  public createFleet(
    ownerId: string,
    name: string,
    shipIds: string[] = []
  ): Fleet | null {
    // Validate ships
    if (shipIds.length > MAX_FLEET_SIZE) {
      logger.warn(`Cannot create fleet with more than ${MAX_FLEET_SIZE} ships`);
      return null;
    }

    // Check all ships exist and belong to owner
    for (const shipId of shipIds) {
      const ship = this.ships.get(shipId);
      if (!ship || ship.ownerId !== ownerId) {
        logger.warn(`Ship ${shipId} not found or not owned by ${ownerId}`);
        return null;
      }

      if (ship.fleetId) {
        logger.warn(`Ship ${shipId} already in fleet ${ship.fleetId}`);
        return null;
      }
    }

    // Get current location from first ship
    const firstShip = this.ships.get(shipIds[0]);
    const currentPlanetId = firstShip?.currentPlanetId || null;

    const fleet: Fleet = {
      id: uuidv4(),
      name,
      ownerId,
      ships: shipIds,
      currentPlanetId,
      movement: null,
      createdAt: Date.now()
    };

    this.fleets.set(fleet.id, fleet);

    // Assign ships to fleet
    shipIds.forEach(shipId => {
      const ship = this.ships.get(shipId);
      if (ship) {
        ship.fleetId = fleet.id;
      }
    });

    logger.info(`Fleet created: ${fleet.name} with ${shipIds.length} ships`);

    return fleet;
  }

  /**
   * Add ship to fleet
   * 
   * @param fleetId - Fleet ID
   * @param shipId - Ship ID to add
   * @returns Success status
   */
  public addShipToFleet(fleetId: string, shipId: string): boolean {
    const fleet = this.fleets.get(fleetId);
    const ship = this.ships.get(shipId);

    if (!fleet || !ship) {
      return false;
    }

    // Check ownership
    if (ship.ownerId !== fleet.ownerId) {
      logger.warn(`Ship ${shipId} not owned by fleet owner`);
      return false;
    }

    // Check if ship already in a fleet
    if (ship.fleetId) {
      logger.warn(`Ship ${shipId} already in fleet ${ship.fleetId}`);
      return false;
    }

    // Check fleet size limit
    if (fleet.ships.length >= MAX_FLEET_SIZE) {
      logger.warn(`Fleet ${fleetId} is at maximum capacity`);
      return false;
    }

    // Check if ship is at same location
    if (ship.currentPlanetId !== fleet.currentPlanetId) {
      logger.warn(`Ship ${shipId} not at fleet location`);
      return false;
    }

    fleet.ships.push(shipId);
    ship.fleetId = fleetId;

    logger.info(`Ship ${ship.name} added to fleet ${fleet.name}`);

    return true;
  }

  /**
   * Remove ship from fleet
   * 
   * @param fleetId - Fleet ID
   * @param shipId - Ship ID to remove
   * @returns Success status
   */
  public removeShipFromFleet(fleetId: string, shipId: string): boolean {
    const fleet = this.fleets.get(fleetId);
    const ship = this.ships.get(shipId);

    if (!fleet || !ship) {
      return false;
    }

    const index = fleet.ships.indexOf(shipId);
    if (index === -1) {
      return false;
    }

    fleet.ships.splice(index, 1);
    ship.fleetId = null;

    logger.info(`Ship ${ship.name} removed from fleet ${fleet.name}`);

    // Disband fleet if empty
    if (fleet.ships.length === 0) {
      this.disbandFleet(fleetId);
    }

    return true;
  }

  /**
   * Disband a fleet
   * 
   * @param fleetId - Fleet ID
   * @returns Success status
   */
  public disbandFleet(fleetId: string): boolean {
    const fleet = this.fleets.get(fleetId);
    if (!fleet) {
      return false;
    }

    // Remove fleet assignment from all ships
    fleet.ships.forEach(shipId => {
      const ship = this.ships.get(shipId);
      if (ship) {
        ship.fleetId = null;
      }
    });

    this.fleets.delete(fleetId);

    logger.info(`Fleet disbanded: ${fleet.name}`);

    return true;
  }

  /**
   * Move fleet to destination
   * 
   * @param fleetId - Fleet ID
   * @param destinationPlanetId - Destination planet ID
   * @param destinationPosition - Destination position
   * @param originPosition - Origin position
   * @returns Action result
   */
  public moveFleet(
    fleetId: string,
    destinationPlanetId: string,
    destinationPosition: Position,
    originPosition: Position
  ): ShipActionResult {
    const fleet = this.fleets.get(fleetId);
    if (!fleet) {
      return { success: false, message: 'Fleet not found' };
    }

    if (fleet.ships.length === 0) {
      return { success: false, message: 'Fleet is empty' };
    }

    // Get all ships
    const ships = fleet.ships
      .map(id => this.ships.get(id))
      .filter(ship => ship !== undefined) as ShipClass[];

    // Calculate fleet speed (slowest ship)
    const fleetSpeed = FLEET_SPEED_MODE === 'slowest'
      ? Math.min(...ships.map(s => s.stats.speed))
      : Math.max(...ships.map(s => s.stats.speed));

    // Calculate travel time using slowest ship
    const slowestShip = ships.reduce((prev, curr) =>
      prev.stats.speed < curr.stats.speed ? prev : curr
    );

    const travel = slowestShip.calculateTravel(originPosition, destinationPosition);

    // Create fleet movement
    const fleetMovement: ShipMovement = {
      isMoving: true,
      origin: fleet.currentPlanetId!,
      destination: destinationPlanetId,
      startTime: Date.now(),
      arrivalTime: travel.arrivalTime,
      distance: travel.distance,
      travelTime: travel.travelTime
    };

    fleet.movement = fleetMovement;
    fleet.currentPlanetId = null; // Fleet in transit

    // Move all ships
    ships.forEach(ship => {
      ship.moveTo(destinationPlanetId, destinationPosition, originPosition);
    });

    logger.info(`Fleet ${fleet.name} moving to ${destinationPlanetId}`);

    return {
      success: true,
      message: `Fleet en route. ETA: ${travel.travelTime}s`,
      data: {
        fleet,
        travel,
        shipCount: ships.length
      }
    };
  }

  /**
   * Update fleet movement
   * 
   * @param fleetId - Fleet ID
   * @returns True if fleet arrived
   */
  public updateFleetMovement(fleetId: string): boolean {
    const fleet = this.fleets.get(fleetId);
    if (!fleet || !fleet.movement) {
      return false;
    }

    const now = Date.now();
    if (now >= fleet.movement.arrivalTime) {
      // Fleet arrived
      fleet.currentPlanetId = fleet.movement.destination;
      fleet.movement = null;

      logger.info(`Fleet ${fleet.name} arrived at destination`);
      return true;
    }

    return false;
  }

  /**
   * Get fleet statistics
   * 
   * @param fleetId - Fleet ID
   * @returns Fleet stats
   */
  public getFleetStats(fleetId: string): any {
    const fleet = this.fleets.get(fleetId);
    if (!fleet) {
      return null;
    }

    const ships = fleet.ships
      .map(id => this.ships.get(id))
      .filter(ship => ship !== undefined) as ShipClass[];

    const totalAttack = ships.reduce((sum, ship) => sum + ship.stats.attack, 0);
    const totalDefense = ships.reduce((sum, ship) => sum + ship.stats.defense, 0);
    const totalHealth = ships.reduce((sum, ship) => sum + ship.stats.health, 0);
    const totalCargo = ships.reduce((sum, ship) => sum + ship.cargo.capacity, 0);
    const avgSpeed = ships.reduce((sum, ship) => sum + ship.stats.speed, 0) / ships.length;

    return {
      fleetId: fleet.id,
      name: fleet.name,
      shipCount: ships.length,
      totalAttack,
      totalDefense,
      totalHealth,
      totalCargo,
      avgSpeed,
      currentLocation: fleet.currentPlanetId,
      isMoving: fleet.movement !== null
    };
  }

  /**
   * Register ship with manager
   * 
   * @param ship - Ship instance
   */
  public registerShip(ship: ShipClass): void {
    this.ships.set(ship.id, ship);
  }

  /**
   * Unregister ship from manager
   * 
   * @param shipId - Ship ID
   */
  public unregisterShip(shipId: string): void {
    const ship = this.ships.get(shipId);
    if (ship && ship.fleetId) {
      this.removeShipFromFleet(ship.fleetId, shipId);
    }
    this.ships.delete(shipId);
  }

  /**
   * Get all fleets for owner
   * 
   * @param ownerId - Owner ID
   * @returns Array of fleets
   */
  public getPlayerFleets(ownerId: string): Fleet[] {
    return Array.from(this.fleets.values()).filter(f => f.ownerId === ownerId);
  }

  /**
   * Get fleet by ID
   * 
   * @param fleetId - Fleet ID
   * @returns Fleet or null
   */
  public getFleet(fleetId: string): Fleet | null {
    return this.fleets.get(fleetId) || null;
  }

  /**
   * Get all ships in fleet
   * 
   * @param fleetId - Fleet ID
   * @returns Array of ships
   */
  public getFleetShips(fleetId: string): ShipClass[] {
    const fleet = this.fleets.get(fleetId);
    if (!fleet) {
      return [];
    }

    return fleet.ships
      .map(id => this.ships.get(id))
      .filter(ship => ship !== undefined) as ShipClass[];
  }

  /**
   * Clear all fleets and ships (for testing)
   */
  public clear(): void {
    this.fleets.clear();
    this.ships.clear();
  }
}

// Export singleton instance
export const fleetManager = new FleetManager();
