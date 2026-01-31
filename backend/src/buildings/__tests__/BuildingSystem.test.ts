/**
 * Building System Tests
 * 
 * Comprehensive tests for the building system including
 * construction, upgrades, queues, and resource management.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { buildingSystem } from '../BuildingSystem';
import { constructionQueueManager } from '../ConstructionQueueManager';
import { BuildingType } from '@shared/types/buildingSystem';
import {
  calculateBuildingCost,
  calculateBuildTime,
  calculateProductionBonus,
  BASE_QUEUE_SIZE
} from '@shared/constants/buildingSystem';

describe('Building System', () => {
  const planetId = 'test-planet-123';
  const playerResources = {
    metal: 1000,
    energy: 500,
    crystal: 300
  };

  beforeEach(() => {
    constructionQueueManager.clearAll();
  });

  afterEach(() => {
    constructionQueueManager.clearAll();
  });

  describe('Resource Checking', () => {
    it('should detect sufficient resources', () => {
      const cost = { metal: 100, energy: 50, crystal: 25 };
      const result = buildingSystem.checkResources(playerResources, cost);

      expect(result.hasResources).toBe(true);
      expect(result.message).toContain('Sufficient');
    });

    it('should detect insufficient metal', () => {
      const cost = { metal: 2000, energy: 50, crystal: 25 };
      const result = buildingSystem.checkResources(playerResources, cost);

      expect(result.hasResources).toBe(false);
      expect(result.missing?.metal).toBe(1000);
      expect(result.message).toContain('metal');
    });

    it('should detect multiple missing resources', () => {
      const cost = { metal: 2000, energy: 1000, crystal: 500 };
      const result = buildingSystem.checkResources(playerResources, cost);

      expect(result.hasResources).toBe(false);
      expect(result.missing?.metal).toBeGreaterThan(0);
      expect(result.missing?.energy).toBeGreaterThan(0);
      expect(result.missing?.crystal).toBeGreaterThan(0);
    });

    it('should handle exact resource match', () => {
      const cost = { metal: 1000, energy: 500, crystal: 300 };
      const result = buildingSystem.checkResources(playerResources, cost);

      expect(result.hasResources).toBe(true);
    });
  });

  describe('Building Requirements', () => {
    it('should allow building with no requirements', () => {
      const result = buildingSystem.checkRequirements(
        BuildingType.MetalMine,
        [],
        100
      );

      expect(result.met).toBe(true);
    });

    it('should enforce population requirements', () => {
      const result = buildingSystem.checkRequirements(
        BuildingType.Shipyard,
        [buildingSystem.createBuilding('command_center' as BuildingType, 2)],
        10 // Less than required 50
      );

      expect(result.met).toBe(false);
      expect(result.message).toContain('population');
    });

    it('should enforce building prerequisites', () => {
      const result = buildingSystem.checkRequirements(
        BuildingType.Shipyard,
        [], // No Command Center
        100
      );

      expect(result.met).toBe(false);
      expect(result.message).toContain('command_center');
    });

    it('should allow building when all requirements met', () => {
      const buildings = [
        buildingSystem.createBuilding('command_center' as BuildingType, 2)
      ];

      const result = buildingSystem.checkRequirements(
        BuildingType.Shipyard,
        buildings,
        100
      );

      expect(result.met).toBe(true);
    });
  });

  describe('Construction Start', () => {
    it('should start construction with sufficient resources', () => {
      const result = buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        playerResources,
        [],
        0,
        100
      );

      expect(result.success).toBe(true);
      expect(result.queuedBuilding).toBeDefined();
      expect(result.completesAt).toBeGreaterThan(Date.now());
    });

    it('should fail with insufficient resources', () => {
      const poorResources = { metal: 10, energy: 5, crystal: 0 };
      
      const result = buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        poorResources,
        [],
        0,
        100
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient');
    });

    it('should fail when requirements not met', () => {
      const result = buildingSystem.startConstruction(
        planetId,
        BuildingType.Shipyard,
        playerResources,
        [], // No Command Center
        0,
        100
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Requirements');
    });

    it('should calculate correct queue position', () => {
      // Add first building
      const result1 = buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        playerResources,
        [],
        0,
        100
      );

      // Add second building
      const result2 = buildingSystem.startConstruction(
        planetId,
        BuildingType.EnergyPlant,
        playerResources,
        [],
        0,
        100
      );

      expect(result1.queuePosition).toBe(0);
      expect(result2.queuePosition).toBe(0); // In queue, not active
    });
  });

  describe('Building Upgrades', () => {
    it('should upgrade existing building', () => {
      const building = buildingSystem.createBuilding(BuildingType.MetalMine, 1);
      
      const result = buildingSystem.startUpgrade(
        planetId,
        building.id,
        1,
        BuildingType.MetalMine,
        playerResources,
        0
      );

      expect(result.success).toBe(true);
      expect(result.queuedBuilding?.targetLevel).toBe(2);
    });

    it('should fail upgrade at max level', () => {
      const building = buildingSystem.createBuilding(BuildingType.MetalMine, 30); // Max level
      
      const result = buildingSystem.startUpgrade(
        planetId,
        building.id,
        30,
        BuildingType.MetalMine,
        playerResources,
        0
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('max level');
    });

    it('should require more resources for higher levels', () => {
      const level1Cost = calculateBuildingCost(BuildingType.MetalMine, 1);
      const level5Cost = calculateBuildingCost(BuildingType.MetalMine, 5);

      expect(level5Cost.metal).toBeGreaterThan(level1Cost.metal);
      expect(level5Cost.energy).toBeGreaterThan(level1Cost.energy);
    });
  });

  describe('Build Time Calculations', () => {
    it('should calculate base build time', () => {
      const time = buildingSystem.calculateBuildTimeWithBonuses(
        BuildingType.MetalMine,
        1,
        []
      );

      expect(time).toBeGreaterThan(0);
    });

    it('should reduce build time with shipyard bonus', () => {
      const noBonus = buildingSystem.calculateBuildTimeWithBonuses(
        BuildingType.Defense,
        1,
        []
      );

      const withBonus = buildingSystem.calculateBuildTimeWithBonuses(
        BuildingType.Defense,
        1,
        [buildingSystem.createBuilding(BuildingType.Shipyard, 10)]
      );

      expect(withBonus).toBeLessThan(noBonus);
    });

    it('should increase build time for higher levels', () => {
      const time1 = calculateBuildTime(BuildingType.MetalMine, 1);
      const time5 = calculateBuildTime(BuildingType.MetalMine, 5);

      expect(time5).toBeGreaterThan(time1);
    });
  });

  describe('Construction Queue', () => {
    beforeEach(() => {
      constructionQueueManager.initializeQueue(planetId, 0);
    });

    it('should initialize with default queue size', () => {
      const stats = constructionQueueManager.getQueueStats(planetId);

      expect(stats?.maxQueueSize).toBe(BASE_QUEUE_SIZE);
    });

    it('should add buildings to queue', () => {
      buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        playerResources,
        [],
        0,
        100
      );

      const constructions = constructionQueueManager.getAllConstructions(planetId);
      expect(constructions.length).toBe(1);
    });

    it('should respect queue size limit', () => {
      // Fill queue
      for (let i = 0; i < BASE_QUEUE_SIZE + 1; i++) {
        buildingSystem.startConstruction(
          planetId,
          BuildingType.MetalMine,
          playerResources,
          [],
          0,
          100
        );
      }

      const result = buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        playerResources,
        [],
        0,
        100
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('full');
    });

    it('should remove building from queue', () => {
      const result = buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        playerResources,
        [],
        0,
        100
      );

      const removed = constructionQueueManager.removeFromQueue(
        planetId,
        result.queuedBuilding!.id
      );

      expect(removed).toBe(true);

      const constructions = constructionQueueManager.getAllConstructions(planetId);
      expect(constructions.length).toBe(0);
    });

    it('should complete constructions', () => {
      const result = buildingSystem.startConstruction(
        planetId,
        BuildingType.MetalMine,
        playerResources,
        [],
        0,
        100
      );

      // Manually set completion time to past
      const queue = constructionQueueManager.getQueue(planetId);
      if (queue?.activeConstruction) {
        queue.activeConstruction.completesAt = Date.now() - 1000;
      }

      const completed = constructionQueueManager.checkCompletions(planetId);
      expect(completed.length).toBe(1);
    });
  });

  describe('Production Calculations', () => {
    it('should calculate total production from buildings', () => {
      const buildings = [
        buildingSystem.createBuilding(BuildingType.MetalMine, 3),
        buildingSystem.createBuilding(BuildingType.EnergyPlant, 2),
        buildingSystem.createBuilding(BuildingType.Defense, 1)
      ];

      const production = buildingSystem.getTotalProduction(buildings);

      expect(production.metal).toBeGreaterThan(0);
      expect(production.energy).toBeLessThan(0); // Net consumption
      expect(production.defense).toBeGreaterThan(0);
    });

    it('should scale production with level', () => {
      const level1Bonus = calculateProductionBonus(BuildingType.MetalMine, 1);
      const level5Bonus = calculateProductionBonus(BuildingType.MetalMine, 5);

      expect(level5Bonus.metal!).toBeGreaterThan(level1Bonus.metal!);
    });
  });

  describe('Resource Deduction', () => {
    it('should deduct resources correctly', () => {
      const cost = { metal: 100, energy: 50, crystal: 25 };
      const updated = buildingSystem.deductResources(playerResources, cost);

      expect(updated.metal).toBe(900);
      expect(updated.energy).toBe(450);
      expect(updated.crystal).toBe(275);
    });
  });

  describe('Building Demolition', () => {
    it('should demolish building', () => {
      const buildings = [
        buildingSystem.createBuilding(BuildingType.MetalMine, 1)
      ];

      const success = buildingSystem.demolishBuilding(buildings[0].id, buildings);

      expect(success).toBe(true);
      expect(buildings.length).toBe(0);
    });

    it('should fail to demolish non-existent building', () => {
      const buildings: any[] = [];
      const success = buildingSystem.demolishBuilding('fake-id', buildings);

      expect(success).toBe(false);
    });
  });
});
