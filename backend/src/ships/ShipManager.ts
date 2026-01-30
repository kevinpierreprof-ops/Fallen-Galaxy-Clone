import { Ship, Fleet, Position } from '@shared/types/game';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { SHIP_TYPES } from '@shared/constants/ships';

export class ShipManager {
  private ships: Map<string, Ship> = new Map();
  private fleets: Map<string, Fleet> = new Map();

  buildShip(playerId: string, shipType: string, planetId: string): Ship | null {
    const shipConfig = SHIP_TYPES[shipType];
    
    if (!shipConfig) {
      logger.warn(`Unknown ship type: ${shipType}`);
      return null;
    }

    const ship: Ship = {
      id: uuidv4(),
      type: shipType,
      ownerId: playerId,
      position: { x: 0, y: 0 }, // Will be set to planet position
      health: shipConfig.maxHealth,
      maxHealth: shipConfig.maxHealth,
      speed: shipConfig.speed,
      damage: shipConfig.damage,
      fleetId: null
    };

    this.ships.set(ship.id, ship);
    logger.info(`Ship ${ship.type} built for player ${playerId}`);
    return ship;
  }

  createFleet(playerId: string, shipIds: string[]): Fleet | null {
    const ships = shipIds.map(id => this.ships.get(id)).filter(s => s !== undefined) as Ship[];
    
    if (ships.length === 0) {
      return null;
    }

    const fleet: Fleet = {
      id: uuidv4(),
      ownerId: playerId,
      shipIds: shipIds,
      position: ships[0].position,
      destination: null,
      speed: Math.min(...ships.map(s => s.speed))
    };

    // Assign ships to fleet
    ships.forEach(ship => {
      ship.fleetId = fleet.id;
    });

    this.fleets.set(fleet.id, fleet);
    logger.info(`Fleet ${fleet.id} created with ${ships.length} ships`);
    return fleet;
  }

  moveFleet(fleetId: string, destination: Position): void {
    const fleet = this.fleets.get(fleetId);
    
    if (!fleet) {
      logger.warn(`Fleet ${fleetId} not found`);
      return;
    }

    fleet.destination = destination;
    logger.info(`Fleet ${fleetId} moving to (${destination.x}, ${destination.y})`);
  }

  update(deltaTime: number): void {
    // Update fleet movements
    this.fleets.forEach((fleet) => {
      if (fleet.destination) {
        const dx = fleet.destination.x - fleet.position.x;
        const dy = fleet.destination.y - fleet.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < fleet.speed * deltaTime) {
          // Arrived at destination
          fleet.position = fleet.destination;
          fleet.destination = null;
          logger.info(`Fleet ${fleet.id} arrived at destination`);
        } else {
          // Move towards destination
          const ratio = (fleet.speed * deltaTime) / distance;
          fleet.position.x += dx * ratio;
          fleet.position.y += dy * ratio;

          // Update ship positions
          fleet.shipIds.forEach(shipId => {
            const ship = this.ships.get(shipId);
            if (ship) {
              ship.position = { ...fleet.position };
            }
          });
        }
      }
    });
  }

  getShips(): Ship[] {
    return Array.from(this.ships.values());
  }

  getFleets(): Fleet[] {
    return Array.from(this.fleets.values());
  }

  getPlayerShips(playerId: string): Ship[] {
    return Array.from(this.ships.values()).filter(ship => ship.ownerId === playerId);
  }

  getPlayerFleets(playerId: string): Fleet[] {
    return Array.from(this.fleets.values()).filter(fleet => fleet.ownerId === playerId);
  }

  destroyShip(shipId: string): void {
    const ship = this.ships.get(shipId);
    if (ship) {
      // Remove from fleet if part of one
      if (ship.fleetId) {
        const fleet = this.fleets.get(ship.fleetId);
        if (fleet) {
          fleet.shipIds = fleet.shipIds.filter(id => id !== shipId);
          if (fleet.shipIds.length === 0) {
            this.fleets.delete(ship.fleetId);
          }
        }
      }
      this.ships.delete(shipId);
      logger.info(`Ship ${shipId} destroyed`);
    }
  }
}
