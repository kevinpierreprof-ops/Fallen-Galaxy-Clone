/**
 * Galaxy Map Generator Tests
 * 
 * Comprehensive tests for galaxy map generation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { GalaxyMapGenerator } from '../GalaxyMapGenerator';
import { SeededRandom } from '@/utils/SeededRandom';
import type { GalaxyMapConfig } from '@shared/types/galaxyMap';

describe('Galaxy Map Generator', () => {
  describe('SeededRandom', () => {
    it('should generate same sequence with same seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const sequence1 = Array.from({ length: 10 }, () => rng1.random());
      const sequence2 = Array.from({ length: 10 }, () => rng2.random());

      expect(sequence1).toEqual(sequence2);
    });

    it('should generate different sequences with different seeds', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(67890);

      const sequence1 = Array.from({ length: 10 }, () => rng1.random());
      const sequence2 = Array.from({ length: 10 }, () => rng2.random());

      expect(sequence1).not.toEqual(sequence2);
    });

    it('should support string seeds', () => {
      const rng1 = new SeededRandom('test-seed');
      const rng2 = new SeededRandom('test-seed');

      const val1 = rng1.random();
      const val2 = rng2.random();

      expect(val1).toBe(val2);
    });

    it('should generate integers in range', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.randomInt(1, 10);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    it('should generate floats in range', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.randomFloat(0, 100);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(100);
      }
    });

    it('should shuffle array deterministically', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const arr1 = rng1.shuffle([1, 2, 3, 4, 5]);
      const arr2 = rng2.shuffle([1, 2, 3, 4, 5]);

      expect(arr1).toEqual(arr2);
    });
  });

  describe('Distance Calculation', () => {
    it('should calculate correct distance', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };

      const result = GalaxyMapGenerator.calculateDistance(p1, p2);

      expect(result.distance).toBe(5); // 3-4-5 triangle
      expect(result.dx).toBe(3);
      expect(result.dy).toBe(4);
    });

    it('should calculate zero distance for same point', () => {
      const p = { x: 10, y: 20 };

      const result = GalaxyMapGenerator.calculateDistance(p, p);

      expect(result.distance).toBe(0);
    });
  });

  describe('Map Generation', () => {
    const config: GalaxyMapConfig = {
      width: 100,
      height: 100,
      numPlayers: 4,
      neutralPlanets: 20,
      seed: 'test-seed',
      minPlanetDistance: 5,
      minPlayerDistance: 30,
      resourceDistribution: {
        poor: 25,
        normal: 50,
        rich: 20,
        abundant: 5
      }
    };

    it('should generate reproducible maps with same seed', () => {
      const playerIds = ['player1', 'player2', 'player3', 'player4'];

      const gen1 = new GalaxyMapGenerator(config);
      const map1 = gen1.generate(playerIds);

      const gen2 = new GalaxyMapGenerator(config);
      const map2 = gen2.generate(playerIds);

      // Should have same number of planets
      expect(map1.planets.length).toBe(map2.planets.length);

      // Planets should be in same positions
      for (let i = 0; i < map1.planets.length; i++) {
        expect(map1.planets[i].position).toEqual(map2.planets[i].position);
        expect(map1.planets[i].resourceLevel).toBe(map2.planets[i].resourceLevel);
      }
    });

    it('should generate correct number of planets', () => {
      const playerIds = ['player1', 'player2', 'player3', 'player4'];
      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(playerIds);

      expect(map.planets.length).toBe(config.numPlayers + config.neutralPlanets);
    });

    it('should assign starting planets to players', () => {
      const playerIds = ['player1', 'player2', 'player3', 'player4'];
      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(playerIds);

      const startingPlanets = map.planets.filter(p => p.isStartingPlanet);
      expect(startingPlanets.length).toBe(playerIds.length);

      // Each player should have exactly one starting planet
      for (const playerId of playerIds) {
        const playerPlanets = startingPlanets.filter(p => p.ownerId === playerId);
        expect(playerPlanets.length).toBe(1);
      }
    });

    it('should create neutral planets without owners', () => {
      const playerIds = ['player1', 'player2'];
      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(playerIds);

      const neutralPlanets = map.planets.filter(p => !p.isStartingPlanet);
      
      for (const planet of neutralPlanets) {
        expect(planet.ownerId).toBeNull();
      }
    });

    it('should maintain minimum distance between planets', () => {
      const playerIds = ['player1', 'player2', 'player3'];
      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(playerIds);

      for (let i = 0; i < map.planets.length; i++) {
        for (let j = i + 1; j < map.planets.length; j++) {
          const dist = GalaxyMapGenerator.calculateDistance(
            map.planets[i].position,
            map.planets[j].position
          );

          expect(dist.distance).toBeGreaterThanOrEqual(config.minPlanetDistance);
        }
      }
    });

    it('should keep planets within map bounds', () => {
      const playerIds = ['player1', 'player2'];
      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(playerIds);

      for (const planet of map.planets) {
        expect(planet.position.x).toBeGreaterThanOrEqual(0);
        expect(planet.position.x).toBeLessThanOrEqual(config.width);
        expect(planet.position.y).toBeGreaterThanOrEqual(0);
        expect(planet.position.y).toBeLessThanOrEqual(config.height);
      }
    });

    it('should distribute resources according to configuration', () => {
      const playerIds = ['player1', 'player2'];
      const gen = new GalaxyMapGenerator({ ...config, neutralPlanets: 100 });
      const map = gen.generate(playerIds);

      const neutralPlanets = map.planets.filter(p => !p.isStartingPlanet);
      const resourceCounts = {
        poor: 0,
        normal: 0,
        rich: 0,
        abundant: 0
      };

      for (const planet of neutralPlanets) {
        resourceCounts[planet.resourceLevel]++;
      }

      // With 100 neutral planets, distribution should be close to config
      const total = neutralPlanets.length;
      expect(resourceCounts.poor / total).toBeCloseTo(0.25, 1);
      expect(resourceCounts.normal / total).toBeCloseTo(0.50, 1);
      expect(resourceCounts.rich / total).toBeCloseTo(0.20, 1);
      expect(resourceCounts.abundant / total).toBeCloseTo(0.05, 1);
    });

    it('should generate unique planet IDs', () => {
      const playerIds = ['player1', 'player2'];
      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(playerIds);

      const ids = new Set(map.planets.map(p => p.id));
      expect(ids.size).toBe(map.planets.length);
    });
  });

  describe('Nearest Planet Search', () => {
    it('should find nearest unoccupied planet', () => {
      const config: GalaxyMapConfig = {
        width: 100,
        height: 100,
        numPlayers: 2,
        neutralPlanets: 5,
        seed: 'test-search',
        minPlanetDistance: 10,
        minPlayerDistance: 30,
        resourceDistribution: {
          poor: 25,
          normal: 50,
          rich: 20,
          abundant: 5
        }
      };

      const gen = new GalaxyMapGenerator(config);
      const map = gen.generate(['player1', 'player2']);

      const searchPos = { x: 50, y: 50 };
      const result = gen.findNearestUnoccupiedPlanet(searchPos);

      expect(result.planet).not.toBeNull();
      expect(result.planet?.ownerId).toBeNull();
      expect(result.distance).toBeGreaterThan(0);
    });

    it('should return null when no unoccupied planets exist', () => {
      const config: GalaxyMapConfig = {
        width: 100,
        height: 100,
        numPlayers: 2,
        neutralPlanets: 0, // No neutral planets
        seed: 'test-no-neutral',
        minPlanetDistance: 10,
        minPlayerDistance: 30,
        resourceDistribution: {
          poor: 25,
          normal: 50,
          rich: 20,
          abundant: 5
        }
      };

      const gen = new GalaxyMapGenerator(config);
      gen.generate(['player1', 'player2']);

      const searchPos = { x: 50, y: 50 };
      const result = gen.findNearestUnoccupiedPlanet(searchPos);

      expect(result.planet).toBeNull();
      expect(result.distance).toBe(Infinity);
    });
  });

  describe('Statistics', () => {
    it('should calculate correct statistics', () => {
      const config: GalaxyMapConfig = {
        width: 100,
        height: 100,
        numPlayers: 3,
        neutralPlanets: 10,
        seed: 'test-stats',
        minPlanetDistance: 5,
        minPlayerDistance: 30,
        resourceDistribution: {
          poor: 25,
          normal: 50,
          rich: 20,
          abundant: 5
        }
      };

      const gen = new GalaxyMapGenerator(config);
      gen.generate(['player1', 'player2', 'player3']);

      const stats = gen.getStats();

      expect(stats.totalPlanets).toBe(13);
      expect(stats.startingPlanets).toBe(3);
      expect(stats.neutralPlanets).toBe(10);
      expect(stats.averagePlanetDistance).toBeGreaterThan(0);
      expect(stats.minPlayerDistance).toBeGreaterThanOrEqual(config.minPlayerDistance);
    });
  });

  describe('JSON Export/Import', () => {
    it('should export and import galaxy map', () => {
      const config: GalaxyMapConfig = {
        width: 100,
        height: 100,
        numPlayers: 2,
        neutralPlanets: 5,
        seed: 'test-export',
        minPlanetDistance: 5,
        minPlayerDistance: 30,
        resourceDistribution: {
          poor: 25,
          normal: 50,
          rich: 20,
          abundant: 5
        }
      };

      const gen = new GalaxyMapGenerator(config);
      const originalMap = gen.generate(['player1', 'player2']);

      const json = GalaxyMapGenerator.exportToJSON(originalMap);
      const importedMap = GalaxyMapGenerator.importFromJSON(json);

      expect(importedMap.id).toBe(originalMap.id);
      expect(importedMap.seed).toBe(originalMap.seed);
      expect(importedMap.planets.length).toBe(originalMap.planets.length);
    });

    it('should regenerate identical map from exported data', () => {
      const config: GalaxyMapConfig = {
        width: 100,
        height: 100,
        numPlayers: 2,
        neutralPlanets: 5,
        seed: 'test-regen',
        minPlanetDistance: 5,
        minPlayerDistance: 30,
        resourceDistribution: {
          poor: 25,
          normal: 50,
          rich: 20,
          abundant: 5
        }
      };

      const gen = new GalaxyMapGenerator(config);
      const originalMap = gen.generate(['player1', 'player2']);

      const regenerated = GalaxyMapGenerator.regenerate(
        originalMap,
        ['player1', 'player2']
      );

      // Should have same planet positions
      for (let i = 0; i < originalMap.planets.length; i++) {
        expect(regenerated.planets[i].position).toEqual(originalMap.planets[i].position);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error when player count does not match config', () => {
      const config: GalaxyMapConfig = {
        width: 100,
        height: 100,
        numPlayers: 4,
        neutralPlanets: 10,
        seed: 'test-error',
        minPlanetDistance: 5,
        minPlayerDistance: 30,
        resourceDistribution: {
          poor: 25,
          normal: 50,
          rich: 20,
          abundant: 5
        }
      };

      const gen = new GalaxyMapGenerator(config);

      expect(() => {
        gen.generate(['player1', 'player2']); // Only 2 players instead of 4
      }).toThrow('Player count mismatch');
    });
  });
});
