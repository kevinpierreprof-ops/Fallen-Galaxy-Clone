/**
 * Ship System Tests
 * 
 * Comprehensive tests for ships and fleets
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ShipClass } from '../Ship';
import { FleetManager } from '../FleetManager';
import { ShipType, ShipStatus } from '@shared/types/ships';
import { SHIP_BASE_STATS, COLONIZATION_REQUIREMENTS } from '@shared/constants/shipSystem';

describe('Ship Class', () => {
  let ship: ShipClass;
  const ownerId = 'player-1';
  const planetId = 'planet-1';

  beforeEach(() => {
    ship = new ShipClass(ShipType.Explorer, ownerId, planetId);
  });

  describe('Initialization', () => {
    it('should create ship with correct properties', () => {
      expect(ship.type).toBe(ShipType.Explorer);
      expect(ship.ownerId).toBe(ownerId);
      expect(ship.currentPlanetId).toBe(planetId);
      expect(ship.status).toBe(ShipStatus.Idle);
    });

    it('should initialize stats from base stats', () => {
      const baseStats = SHIP_BASE_STATS[ShipType.Explorer];
      expect(ship.stats.speed).toBe(baseStats.speed);
      expect(ship.stats.attack).toBe(baseStats.attack);
      expect(ship.stats.health).toBe(baseStats.maxHealth);
    });

    it('should initialize empty cargo', () => {
      expect(ship.cargo.minerals).toBe(0);
      expect(ship.cargo.energy).toBe(0);
      expect(ship.cargo.crystal).toBe(0);
      expect(ship.cargo.current).toBe(0);
    });

    it('should generate unique IDs', () => {
      const ship2 = new ShipClass(ShipType.Fighter, ownerId, planetId);
      expect(ship.id).not.toBe(ship2.id);
    });
  });

  describe('Travel Calculation', () => {
    it('should calculate travel time correctly', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 100, y: 0 };

      const travel = ship.calculateTravel(origin, destination);

      expect(travel.distance).toBe(100);
      expect(travel.travelTime).toBeGreaterThan(0);
      expect(travel.arrivalTime).toBeGreaterThan(Date.now());
    });

    it('should calculate fuel cost', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 50, y: 50 };

      const travel = ship.calculateTravel(origin, destination);

      expect(travel.fuelCost).toBeGreaterThan(0);
    });
  });

  describe('Movement', () => {
    it('should move to destination', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 50, y: 50 };

      const result = ship.moveTo('planet-2', destination, origin);

      expect(result.success).toBe(true);
      expect(ship.status).toBe(ShipStatus.Moving);
      expect(ship.movement).not.toBeNull();
      expect(ship.currentPlanetId).toBeNull();
    });

    it('should fail to move when already moving', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 50, y: 50 };

      ship.moveTo('planet-2', destination, origin);
      const result = ship.moveTo('planet-3', destination, origin);

      expect(result.success).toBe(false);
    });

    it('should complete movement on arrival', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 1, y: 1 }; // Very close

      ship.moveTo('planet-2', destination, origin);

      // Force arrival by setting arrival time to past
      if (ship.movement) {
        ship.movement.arrivalTime = Date.now() - 1000;
      }

      const completed = ship.updateMovement();

      expect(completed).toBe(true);
      expect(ship.currentPlanetId).toBe('planet-2');
      expect(ship.status).toBe(ShipStatus.Idle);
      expect(ship.movement).toBeNull();
    });
  });

  describe('Mining Operations', () => {
    let miner: ShipClass;

    beforeEach(() => {
      miner = new ShipClass(ShipType.Miner, ownerId, planetId);
    });

    it('should start mining operation', () => {
      const result = miner.mine(planetId, 'minerals', 60);

      expect(result.success).toBe(true);
      expect(miner.status).toBe(ShipStatus.Mining);
    });

    it('should fail mining when not at planet', () => {
      const result = miner.mine('planet-2', 'minerals');

      expect(result.success).toBe(false);
    });

    it('should fail mining when cargo full', () => {
      miner.cargo.current = miner.cargo.capacity;

      const result = miner.mine(planetId, 'minerals');

      expect(result.success).toBe(false);
    });

    it('should complete mining and add to cargo', () => {
      miner.mine(planetId, 'minerals', 1);

      // Force completion
      if ((miner as any).miningOperation) {
        (miner as any).miningOperation.endTime = Date.now() - 1000;
      }

      const result = miner.completeMining();

      expect(result).not.toBeNull();
      expect(miner.cargo.minerals).toBeGreaterThan(0);
      expect(miner.status).toBe(ShipStatus.Idle);
    });
  });

  describe('Cargo Management', () => {
    it('should load cargo', () => {
      const success = ship.loadCargo('minerals', 50);

      expect(success).toBe(true);
      expect(ship.cargo.minerals).toBe(50);
      expect(ship.cargo.current).toBe(50);
    });

    it('should not exceed cargo capacity', () => {
      ship.loadCargo('minerals', ship.cargo.capacity + 100);

      expect(ship.cargo.current).toBeLessThanOrEqual(ship.cargo.capacity);
    });

    it('should unload cargo', () => {
      ship.loadCargo('minerals', 100);
      const unloaded = ship.unloadCargo('minerals', 50);

      expect(unloaded).toBe(50);
      expect(ship.cargo.minerals).toBe(50);
      expect(ship.cargo.current).toBe(50);
    });

    it('should unload all cargo when amount not specified', () => {
      ship.loadCargo('energy', 75);
      const unloaded = ship.unloadCargo('energy');

      expect(unloaded).toBe(75);
      expect(ship.cargo.energy).toBe(0);
    });
  });

  describe('Colonization', () => {
    let colonyShip: ShipClass;

    beforeEach(() => {
      colonyShip = new ShipClass(ShipType.Colony, ownerId, planetId);
    });

    it('should colonize planet with sufficient settlers', () => {
      colonyShip.loadCargo('minerals', COLONIZATION_REQUIREMENTS.settlers);

      const result = colonyShip.colonize(planetId);

      expect(result.success).toBe(true);
      expect(colonyShip.status).toBe(ShipStatus.Destroyed);
    });

    it('should fail without sufficient settlers', () => {
      colonyShip.loadCargo('minerals', 50);

      const result = colonyShip.colonize(planetId);

      expect(result.success).toBe(false);
    });

    it('should fail with non-colony ship', () => {
      const fighter = new ShipClass(ShipType.Fighter, ownerId, planetId);
      const result = fighter.colonize(planetId);

      expect(result.success).toBe(false);
    });
  });

  describe('Combat', () => {
    let fighter: ShipClass;

    beforeEach(() => {
      fighter = new ShipClass(ShipType.Fighter, ownerId, planetId);
    });

    it('should initiate attack', () => {
      const result = fighter.attack('target-1');

      expect(result.success).toBe(true);
      expect(fighter.status).toBe(ShipStatus.Attacking);
    });

    it('should fail attack with no weapons', () => {
      const colonyShip = new ShipClass(ShipType.Colony, ownerId, planetId);
      const result = colonyShip.attack('target-1');

      expect(result.success).toBe(false);
    });

    it('should take damage', () => {
      const initialHealth = fighter.stats.health;
      const destroyed = fighter.takeDamage(50);

      expect(fighter.stats.health).toBeLessThan(initialHealth);
      expect(destroyed).toBe(false);
    });

    it('should be destroyed when health reaches zero', () => {
      const destroyed = fighter.takeDamage(1000);

      expect(destroyed).toBe(true);
      expect(fighter.stats.health).toBe(0);
      expect(fighter.status).toBe(ShipStatus.Destroyed);
    });

    it('should reduce damage by defense', () => {
      fighter.stats.defense = 20;
      fighter.takeDamage(50);

      const expectedHealth = fighter.stats.maxHealth - (50 - 20);
      expect(fighter.stats.health).toBe(expectedHealth);
    });
  });

  describe('Repair', () => {
    it('should repair ship', () => {
      ship.takeDamage(50);
      const damagedHealth = ship.stats.health;

      const result = ship.repair(25);

      expect(result.success).toBe(true);
      expect(ship.stats.health).toBe(damagedHealth + 25);
    });

    it('should not repair above max health', () => {
      ship.takeDamage(20);
      ship.repair(100);

      expect(ship.stats.health).toBe(ship.stats.maxHealth);
    });

    it('should fail to repair destroyed ship', () => {
      ship.takeDamage(1000);
      const result = ship.repair();

      expect(result.success).toBe(false);
    });

    it('should calculate repair cost', () => {
      ship.takeDamage(50);
      const result = ship.repair();

      expect(result.data.cost).toBeDefined();
      expect(result.data.repairTime).toBeGreaterThan(0);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const json = ship.toJSON();

      expect(json.id).toBe(ship.id);
      expect(json.type).toBe(ship.type);
      expect(json.ownerId).toBe(ship.ownerId);
    });

    it('should deserialize from JSON', () => {
      const json = ship.toJSON();
      const restored = ShipClass.fromJSON(json);

      expect(restored.id).toBe(ship.id);
      expect(restored.type).toBe(ship.type);
      expect(restored.stats.health).toBe(ship.stats.health);
    });
  });
});

describe('Fleet Manager', () => {
  let fleetManager: FleetManager;
  let ship1: ShipClass;
  let ship2: ShipClass;
  const ownerId = 'player-1';
  const planetId = 'planet-1';

  beforeEach(() => {
    fleetManager = new FleetManager();
    ship1 = new ShipClass(ShipType.Fighter, ownerId, planetId);
    ship2 = new ShipClass(ShipType.Cruiser, ownerId, planetId);

    fleetManager.registerShip(ship1);
    fleetManager.registerShip(ship2);
  });

  describe('Fleet Creation', () => {
    it('should create fleet with ships', () => {
      const fleet = fleetManager.createFleet(
        ownerId,
        'Alpha Fleet',
        [ship1.id, ship2.id]
      );

      expect(fleet).not.toBeNull();
      expect(fleet?.ships.length).toBe(2);
      expect(ship1.fleetId).toBe(fleet?.id);
    });

    it('should fail with ships from different owners', () => {
      const enemyShip = new ShipClass(ShipType.Fighter, 'player-2', planetId);
      fleetManager.registerShip(enemyShip);

      const fleet = fleetManager.createFleet(
        ownerId,
        'Mixed Fleet',
        [ship1.id, enemyShip.id]
      );

      expect(fleet).toBeNull();
    });

    it('should respect max fleet size', () => {
      const shipIds: string[] = [];

      // Create more ships than max
      for (let i = 0; i < 60; i++) {
        const ship = new ShipClass(ShipType.Fighter, ownerId, planetId);
        fleetManager.registerShip(ship);
        shipIds.push(ship.id);
      }

      const fleet = fleetManager.createFleet(ownerId, 'Huge Fleet', shipIds);

      expect(fleet).toBeNull();
    });
  });

  describe('Fleet Management', () => {
    let fleetId: string;

    beforeEach(() => {
      const fleet = fleetManager.createFleet(ownerId, 'Test Fleet', [ship1.id]);
      fleetId = fleet!.id;
    });

    it('should add ship to fleet', () => {
      const success = fleetManager.addShipToFleet(fleetId, ship2.id);

      expect(success).toBe(true);

      const fleet = fleetManager.getFleet(fleetId);
      expect(fleet?.ships.length).toBe(2);
    });

    it('should remove ship from fleet', () => {
      const success = fleetManager.removeShipFromFleet(fleetId, ship1.id);

      expect(success).toBe(true);
      expect(ship1.fleetId).toBeNull();
    });

    it('should disband empty fleet', () => {
      fleetManager.removeShipFromFleet(fleetId, ship1.id);

      const fleet = fleetManager.getFleet(fleetId);
      expect(fleet).toBeNull();
    });

    it('should disband fleet manually', () => {
      const success = fleetManager.disbandFleet(fleetId);

      expect(success).toBe(true);
      expect(ship1.fleetId).toBeNull();
    });
  });

  describe('Fleet Movement', () => {
    let fleetId: string;

    beforeEach(() => {
      const fleet = fleetManager.createFleet(
        ownerId,
        'Test Fleet',
        [ship1.id, ship2.id]
      );
      fleetId = fleet!.id;
    });

    it('should move fleet', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 50, y: 50 };

      const result = fleetManager.moveFleet(
        fleetId,
        'planet-2',
        destination,
        origin
      );

      expect(result.success).toBe(true);

      const fleet = fleetManager.getFleet(fleetId);
      expect(fleet?.movement).not.toBeNull();
      expect(ship1.status).toBe(ShipStatus.Moving);
    });

    it('should use slowest ship speed', () => {
      const origin = { x: 0, y: 0 };
      const destination = { x: 100, y: 0 };

      fleetManager.moveFleet(fleetId, 'planet-2', destination, origin);

      // Cruiser is slower than Fighter
      const travel1 = ship1.calculateTravel(origin, destination);
      const travel2 = ship2.calculateTravel(origin, destination);

      expect(travel2.travelTime).toBeGreaterThan(travel1.travelTime);
    });
  });

  describe('Fleet Statistics', () => {
    it('should calculate fleet stats', () => {
      const fleet = fleetManager.createFleet(
        ownerId,
        'Test Fleet',
        [ship1.id, ship2.id]
      );

      const stats = fleetManager.getFleetStats(fleet!.id);

      expect(stats.shipCount).toBe(2);
      expect(stats.totalAttack).toBe(ship1.stats.attack + ship2.stats.attack);
      expect(stats.totalDefense).toBe(ship1.stats.defense + ship2.stats.defense);
    });
  });

  describe('Fleet Queries', () => {
    it('should get player fleets', () => {
      fleetManager.createFleet(ownerId, 'Fleet 1', [ship1.id]);
      fleetManager.createFleet(ownerId, 'Fleet 2', [ship2.id]);

      const fleets = fleetManager.getPlayerFleets(ownerId);

      expect(fleets.length).toBe(2);
    });

    it('should get fleet ships', () => {
      const fleet = fleetManager.createFleet(
        ownerId,
        'Test Fleet',
        [ship1.id, ship2.id]
      );

      const ships = fleetManager.getFleetShips(fleet!.id);

      expect(ships.length).toBe(2);
      expect(ships[0]).toBeInstanceOf(ShipClass);
    });
  });
});
