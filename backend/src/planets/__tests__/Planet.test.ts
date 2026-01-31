/**
 * Planet Class Tests
 * 
 * Comprehensive tests for the Planet class functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Planet } from '../Planet';
import type { BuildingType } from '@shared/types/buildings';
import { BUILDINGS } from '@shared/constants/buildings';

describe('Planet Class', () => {
  let planet: Planet;

  beforeEach(() => {
    planet = new Planet({
      name: 'Test Planet',
      position: { x: 100, y: 200 },
      size: 3,
      ownerId: 'test-owner',
      resources: {
        minerals: 1000,
        energy: 500,
        credits: 500,
        population: 100
      }
    });
  });

  describe('Initialization', () => {
    it('should create a planet with default values', () => {
      const defaultPlanet = new Planet({
        name: 'Default Planet',
        position: { x: 0, y: 0 }
      });

      expect(defaultPlanet.name).toBe('Default Planet');
      expect(defaultPlanet.position).toEqual({ x: 0, y: 0 });
      expect(defaultPlanet.size).toBe(1);
      expect(defaultPlanet.ownerId).toBeNull();
      expect(defaultPlanet.resources.minerals).toBe(1000);
    });

    it('should create a planet with custom values', () => {
      expect(planet.name).toBe('Test Planet');
      expect(planet.size).toBe(3);
      expect(planet.ownerId).toBe('test-owner');
      expect(planet.resources.minerals).toBe(1000);
    });

    it('should generate a unique ID', () => {
      const planet1 = new Planet({ name: 'P1', position: { x: 0, y: 0 } });
      const planet2 = new Planet({ name: 'P2', position: { x: 0, y: 0 } });

      expect(planet1.id).not.toBe(planet2.id);
    });
  });

  describe('Building Slots', () => {
    it('should calculate max building slots based on size', () => {
      const smallPlanet = new Planet({ name: 'Small', position: { x: 0, y: 0 }, size: 1 });
      const largePlanet = new Planet({ name: 'Large', position: { x: 0, y: 0 }, size: 5 });

      expect(smallPlanet.getMaxBuildingSlots()).toBe(8); // 5 + (1 * 3)
      expect(largePlanet.getMaxBuildingSlots()).toBe(20); // 5 + (5 * 3) = 20 (max)
    });

    it('should calculate available slots correctly', () => {
      expect(planet.getAvailableSlots()).toBe(planet.getMaxBuildingSlots());
      
      planet.addBuilding('mine');
      expect(planet.getAvailableSlots()).toBe(planet.getMaxBuildingSlots() - 1);
    });
  });

  describe('Building Construction', () => {
    it('should add a building when resources are sufficient', () => {
      const building = planet.addBuilding('mine');

      expect(building).not.toBeNull();
      expect(building?.type).toBe('mine');
      expect(building?.level).toBe(1);
      expect(planet.buildings.length).toBe(1);
    });

    it('should deduct resources when building', () => {
      const initialMinerals = planet.resources.minerals;
      planet.addBuilding('mine');

      expect(planet.resources.minerals).toBeLessThan(initialMinerals);
    });

    it('should fail to build without sufficient resources', () => {
      planet.resources.minerals = 10;
      const building = planet.addBuilding('mine');

      expect(building).toBeNull();
    });

    it('should fail to build on unowned planet', () => {
      planet.ownerId = null;
      const result = planet.canBuild('mine');

      expect(result.canBuild).toBe(false);
      expect(result.reason).toContain('owned');
    });

    it('should enforce building prerequisites', () => {
      const result = planet.canBuild('shipyard');

      expect(result.canBuild).toBe(false);
      expect(result.reason).toContain('factory');
    });

    it('should allow building after prerequisite is met', () => {
      planet.addBuilding('factory');
      planet.buildings[0].level = 2; // Meet prerequisite level

      const result = planet.canBuild('shipyard');
      expect(result.canBuild).toBe(true);
    });

    it('should enforce population requirements', () => {
      planet.resources.population = 5;
      const result = planet.canBuild('mine');

      expect(result.canBuild).toBe(false);
      expect(result.reason).toContain('population');
    });

    it('should fail when no building slots available', () => {
      const maxSlots = planet.getMaxBuildingSlots();
      
      // Fill all slots
      for (let i = 0; i < maxSlots; i++) {
        planet.addBuilding('mine');
      }

      const result = planet.canBuild('mine');
      expect(result.canBuild).toBe(false);
      expect(result.reason).toContain('slots');
    });
  });

  describe('Building Upgrades', () => {
    let buildingId: string;

    beforeEach(() => {
      const building = planet.addBuilding('mine');
      buildingId = building!.id;
    });

    it('should upgrade a building when possible', () => {
      const success = planet.upgradeBuilding(buildingId);
      const building = planet.getBuilding(buildingId);

      expect(success).toBe(true);
      expect(building?.isUpgrading).toBe(true);
    });

    it('should deduct resources when upgrading', () => {
      const initialMinerals = planet.resources.minerals;
      planet.upgradeBuilding(buildingId);

      expect(planet.resources.minerals).toBeLessThan(initialMinerals);
    });

    it('should fail to upgrade without sufficient resources', () => {
      planet.resources.minerals = 10;
      const result = planet.canUpgrade(buildingId);

      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toContain('minerals');
    });

    it('should fail to upgrade already upgrading building', () => {
      planet.upgradeBuilding(buildingId);
      const result = planet.canUpgrade(buildingId);

      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toContain('upgrading');
    });

    it('should fail to upgrade at max level', () => {
      const building = planet.getBuilding(buildingId)!;
      building.level = BUILDINGS.mine.requirements.maxLevel;

      const result = planet.canUpgrade(buildingId);
      expect(result.canUpgrade).toBe(false);
      expect(result.reason).toContain('max level');
    });

    it('should complete upgrade after time elapses', () => {
      planet.upgradeBuilding(buildingId);
      const building = planet.getBuilding(buildingId)!;
      
      // Simulate time passage by setting completion time to past
      building.upgradeCompleteAt = Date.now() - 1000;
      
      planet.update(1);

      expect(building.level).toBe(2);
      expect(building.isUpgrading).toBe(false);
    });
  });

  describe('Production Calculation', () => {
    it('should calculate production from buildings', () => {
      planet.addBuilding('mine');
      planet.addBuilding('factory');

      const production = planet.calculateProduction();

      expect(production.minerals).toBeGreaterThan(0);
      expect(production.credits).toBeGreaterThan(0);
      expect(production.energy).toBeLessThan(0); // Energy consumption
    });

    it('should not count upgrading buildings in production', () => {
      const building = planet.addBuilding('mine');
      building!.isUpgrading = true;

      const production = planet.calculateProduction();
      expect(production.minerals).toBe(0);
    });

    it('should calculate defense rating from defense buildings', () => {
      planet.addBuilding('defense');
      const production = planet.calculateProduction();

      expect(production.defense).toBeGreaterThan(0);
    });

    it('should calculate population capacity from habitats', () => {
      planet.addBuilding('habitat');
      const production = planet.calculateProduction();

      expect(production.capacity).toBeGreaterThan(1000); // Base + habitat
    });
  });

  describe('Resource Updates', () => {
    beforeEach(() => {
      planet.addBuilding('mine');
    });

    it('should update resources based on production', () => {
      const initialMinerals = planet.resources.minerals;
      planet.update(1); // 1 second

      expect(planet.resources.minerals).toBeGreaterThan(initialMinerals);
    });

    it('should not allow negative resources', () => {
      planet.resources.energy = 5;
      planet.update(10); // Large time delta

      expect(planet.resources.energy).toBe(0);
    });

    it('should grow population up to capacity', () => {
      planet.resources.population = 50;
      planet.addBuilding('habitat');
      
      const initialPop = planet.resources.population;
      planet.update(10);

      expect(planet.resources.population).toBeGreaterThan(initialPop);
    });

    it('should not exceed population capacity', () => {
      planet.addBuilding('habitat');
      const stats = planet.getStats();
      
      planet.resources.population = stats.populationCapacity;
      planet.update(10);

      expect(planet.resources.population).toBeLessThanOrEqual(stats.populationCapacity);
    });
  });

  describe('Building Management', () => {
    it('should get building by ID', () => {
      const building = planet.addBuilding('mine');
      const found = planet.getBuilding(building!.id);

      expect(found).toBe(building);
    });

    it('should get buildings by type', () => {
      planet.addBuilding('mine');
      planet.addBuilding('mine');
      planet.addBuilding('factory');

      const mines = planet.getBuildingsByType('mine');
      expect(mines.length).toBe(2);
    });

    it('should demolish building', () => {
      const building = planet.addBuilding('mine');
      const success = planet.demolishBuilding(building!.id);

      expect(success).toBe(true);
      expect(planet.buildings.length).toBe(0);
    });

    it('should recalculate positions after demolish', () => {
      planet.addBuilding('mine');
      planet.addBuilding('factory');
      planet.addBuilding('defense');

      planet.demolishBuilding(planet.buildings[1].id);

      expect(planet.buildings[0].position).toBe(0);
      expect(planet.buildings[1].position).toBe(1);
    });

    it('should damage building', () => {
      const building = planet.addBuilding('mine');
      planet.damageBuilding(building!.id, 50);

      expect(building!.damage).toBe(50);
    });

    it('should destroy building when damage reaches 100', () => {
      const building = planet.addBuilding('mine');
      planet.damageBuilding(building!.id, 100);

      expect(planet.buildings.length).toBe(0);
    });

    it('should repair building', () => {
      const building = planet.addBuilding('mine');
      building!.damage = 50;
      
      planet.repairBuilding(building!.id, 30);
      expect(building!.damage).toBe(20);
    });
  });

  describe('Statistics', () => {
    it('should return planet statistics', () => {
      planet.addBuilding('mine');
      planet.addBuilding('defense');

      const stats = planet.getStats();

      expect(stats.totalProduction).toBeDefined();
      expect(stats.defenseRating).toBeGreaterThan(0);
      expect(stats.buildingSlots).toBe(planet.getMaxBuildingSlots());
      expect(stats.usedSlots).toBe(2);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      planet.addBuilding('mine');
      const json = planet.toJSON();

      expect(json.id).toBe(planet.id);
      expect(json.name).toBe(planet.name);
      expect(json.buildings.length).toBe(1);
      expect(json.stats).toBeDefined();
    });

    it('should deserialize from JSON', () => {
      planet.addBuilding('mine');
      const json = planet.toJSON();
      const restored = Planet.fromJSON(json);

      expect(restored.id).toBe(planet.id);
      expect(restored.name).toBe(planet.name);
      expect(restored.buildings.length).toBe(1);
    });
  });
});
