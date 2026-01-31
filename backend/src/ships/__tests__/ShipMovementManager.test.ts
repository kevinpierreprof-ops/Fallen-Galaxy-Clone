/**
 * Ship Movement Manager Tests
 * 
 * Comprehensive tests for ship movement system
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ShipMovementManager } from '../ShipMovementManager';
import { ShipClass } from '../Ship';
import { Planet } from '@/planets/Planet';
import { ShipType } from '@shared/types/ships';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

describe('Ship Movement Manager', () => {
  let movementManager: ShipMovementManager;
  let ship: ShipClass;
  let planet1: Planet;
  let planet2: Planet;
  let io: SocketIOServer;

  beforeEach(() => {
    movementManager = new ShipMovementManager();

    // Create test planets
    planet1 = new Planet({
      name: 'Planet 1',
      position: { x: 0, y: 0 },
      ownerId: 'player-1'
    });

    planet2 = new Planet({
      name: 'Planet 2',
      position: { x: 100, y: 0 },
      ownerId: null // Neutral
    });

    // Register planets
    movementManager.registerPlanet(planet1);
    movementManager.registerPlanet(planet2);

    // Create test ship
    ship = new ShipClass(ShipType.Fighter, 'player-1', planet1.id);
    movementManager.registerShip(ship);

    // Create mock Socket.IO server
    const httpServer = createServer();
    io = new SocketIOServer(httpServer);
    movementManager.initialize(io);
  });

  afterEach(() => {
    movementManager.clear();
    io.close();
  });

  describe('Distance Calculation', () => {
    it('should calculate correct distance', () => {
      const distance = movementManager.calculateDistance(
        { x: 0, y: 0 },
        { x: 100, y: 0 }
      );

      expect(distance).toBe(100);
    });

    it('should calculate diagonal distance', () => {
      const distance = movementManager.calculateDistance(
        { x: 0, y: 0 },
        { x: 3, y: 4 }
      );

      expect(distance).toBe(5); // 3-4-5 triangle
    });
  });

  describe('Travel Time Calculation', () => {
    it('should calculate travel time correctly', () => {
      const distance = 100;
      const speed = 200; // units per hour

      const time = movementManager.calculateTravelTime(distance, speed);

      // 100 / 200 = 0.5 hours = 1800 seconds
      expect(time).toBe(1800);
    });

    it('should round up travel time', () => {
      const distance = 10;
      const speed = 100;

      const time = movementManager.calculateTravelTime(distance, speed);

      // 10 / 100 = 0.1 hours = 360 seconds
      expect(time).toBe(360);
    });
  });

  describe('Movement Validation', () => {
    it('should allow movement to neutral planet', () => {
      const result = movementManager.moveShip(ship.id, planet2.id);

      expect(result.success).toBe(true);
    });

    it('should prevent movement when already moving', () => {
      movementManager.moveShip(ship.id, planet2.id);

      const result = movementManager.moveShip(ship.id, planet2.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already moving');
    });

    it('should prevent movement to same planet', () => {
      const result = movementManager.moveShip(ship.id, planet1.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already at destination');
    });

    it('should detect collision with enemy planet', () => {
      // Make planet2 owned by enemy
      planet2.ownerId = 'player-2';

      const result = movementManager.moveShip(ship.id, planet2.id, false);

      expect(result.success).toBe(false);
      expect(result.data?.requiresCombat).toBe(true);
    });

    it('should allow movement to enemy planet with combat flag', () => {
      planet2.ownerId = 'player-2';

      const result = movementManager.moveShip(ship.id, planet2.id, true);

      expect(result.success).toBe(true);
      expect(result.data?.requiresCombat).toBe(true);
    });
  });

  describe('Ship Movement', () => {
    it('should move ship successfully', () => {
      const result = movementManager.moveShip(ship.id, planet2.id);

      expect(result.success).toBe(true);
      expect(ship.status).toBe('moving');
      expect(ship.currentPlanetId).toBeNull();
    });

    it('should calculate correct travel data', () => {
      const result = movementManager.moveShip(ship.id, planet2.id);

      expect(result.data?.distance).toBe(100);
      expect(result.data?.travelTime).toBeGreaterThan(0);
      expect(result.data?.arrivalTime).toBeGreaterThan(Date.now());
    });

    it('should add ship to movement queue', () => {
      movementManager.moveShip(ship.id, planet2.id);

      const movements = movementManager.getActiveMovements();
      expect(movements.length).toBe(1);
      expect(movements[0].shipId).toBe(ship.id);
    });
  });

  describe('Movement Cancellation', () => {
    it('should cancel movement', () => {
      movementManager.moveShip(ship.id, planet2.id);

      const result = movementManager.cancelMovement(ship.id);

      expect(result.success).toBe(true);
      expect(ship.status).toBe('idle');
      expect(ship.movement).toBeNull();
    });

    it('should remove from queue on cancel', () => {
      movementManager.moveShip(ship.id, planet2.id);
      movementManager.cancelMovement(ship.id);

      const movements = movementManager.getActiveMovements();
      expect(movements.length).toBe(0);
    });

    it('should fail to cancel if not moving', () => {
      const result = movementManager.cancelMovement(ship.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not moving');
    });
  });

  describe('Movement Queue', () => {
    it('should track multiple movements', () => {
      const ship2 = new ShipClass(ShipType.Cruiser, 'player-1', planet1.id);
      movementManager.registerShip(ship2);

      movementManager.moveShip(ship.id, planet2.id);
      movementManager.moveShip(ship2.id, planet2.id);

      const movements = movementManager.getActiveMovements();
      expect(movements.length).toBe(2);
    });

    it('should get player movements', () => {
      const ship2 = new ShipClass(ShipType.Cruiser, 'player-2', planet1.id);
      movementManager.registerShip(ship2);

      movementManager.moveShip(ship.id, planet2.id);
      movementManager.moveShip(ship2.id, planet2.id);

      const player1Movements = movementManager.getPlayerMovements('player-1');
      expect(player1Movements.length).toBe(1);
      expect(player1Movements[0].ownerId).toBe('player-1');
    });

    it('should get movements to planet', () => {
      const planet3 = new Planet({
        name: 'Planet 3',
        position: { x: 50, y: 50 },
        ownerId: null
      });
      movementManager.registerPlanet(planet3);

      const ship2 = new ShipClass(ShipType.Cruiser, 'player-1', planet1.id);
      movementManager.registerShip(ship2);

      movementManager.moveShip(ship.id, planet2.id);
      movementManager.moveShip(ship2.id, planet2.id);

      const toPlanet2 = movementManager.getMovementsToPlanet(planet2.id);
      expect(toPlanet2.length).toBe(2);
    });
  });

  describe('Arrival Time', () => {
    it('should get arrival time', () => {
      movementManager.moveShip(ship.id, planet2.id);

      const arrivalTime = movementManager.getArrivalTime(ship.id);
      expect(arrivalTime).toBeGreaterThan(Date.now());
    });

    it('should get remaining time', () => {
      movementManager.moveShip(ship.id, planet2.id);

      const remaining = movementManager.getRemainingTime(ship.id);
      expect(remaining).toBeGreaterThan(0);
    });

    it('should return 0 for non-moving ship', () => {
      const remaining = movementManager.getRemainingTime(ship.id);
      expect(remaining).toBe(0);
    });
  });

  describe('Collision Detection', () => {
    it('should detect no collision on neutral planet', () => {
      const collision = movementManager.checkCollision(planet2.id, 'player-1');
      expect(collision).toBe(false);
    });

    it('should detect no collision on own planet', () => {
      const collision = movementManager.checkCollision(planet1.id, 'player-1');
      expect(collision).toBe(false);
    });

    it('should detect collision on enemy planet', () => {
      planet2.ownerId = 'player-2';

      const collision = movementManager.checkCollision(planet2.id, 'player-1');
      expect(collision).toBe(true);
    });
  });

  describe('Ships at Planet', () => {
    it('should get ships at planet', () => {
      const ships = movementManager.getShipsAtPlanet(planet1.id);

      expect(ships.length).toBe(1);
      expect(ships[0]).toBe(ship.id);
    });

    it('should return empty array for planet with no ships', () => {
      const ships = movementManager.getShipsAtPlanet(planet2.id);
      expect(ships.length).toBe(0);
    });

    it('should track ships correctly after movement', () => {
      movementManager.moveShip(ship.id, planet2.id);

      const atPlanet1 = movementManager.getShipsAtPlanet(planet1.id);
      const atPlanet2 = movementManager.getShipsAtPlanet(planet2.id);

      // Ship is in transit, not at either planet
      expect(atPlanet1.length).toBe(0);
      expect(atPlanet2.length).toBe(0);
    });
  });

  describe('Movement Completion', () => {
    it('should complete movement on arrival', (done) => {
      movementManager.moveShip(ship.id, planet2.id);

      // Force immediate arrival
      if (ship.movement) {
        ship.movement.arrivalTime = Date.now() - 1000;
      }

      // Wait for update loop
      setTimeout(() => {
        const movements = movementManager.getActiveMovements();
        expect(movements.length).toBe(0);
        expect(ship.currentPlanetId).toBe(planet2.id);
        expect(ship.status).toBe('idle');
        done();
      }, 1500);
    });
  });

  describe('Ship Registration', () => {
    it('should register ship', () => {
      const newShip = new ShipClass(ShipType.Explorer, 'player-1', planet1.id);
      movementManager.registerShip(newShip);

      const result = movementManager.moveShip(newShip.id, planet2.id);
      expect(result.success).toBe(true);
    });

    it('should unregister ship', () => {
      movementManager.unregisterShip(ship.id);

      const result = movementManager.moveShip(ship.id, planet2.id);
      expect(result.success).toBe(false);
    });

    it('should remove from queue on unregister', () => {
      movementManager.moveShip(ship.id, planet2.id);
      movementManager.unregisterShip(ship.id);

      const movements = movementManager.getActiveMovements();
      expect(movements.length).toBe(0);
    });
  });
});
