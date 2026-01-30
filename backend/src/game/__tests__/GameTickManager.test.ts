/**
 * Game Tick Manager Tests
 */

import { GameTickManager } from '../GameTickManager';
import { Server } from 'socket.io';
import { PlanetManager } from '@/planets/PlanetManager';
import { ShipManager } from '@/ships/ShipManager';
import { BuildingSystem } from '@/buildings/BuildingSystem';
import { ConstructionQueueManager } from '@/buildings/ConstructionQueueManager';
import { ShipMovementManager } from '@/ships/ShipMovementManager';

// Mock Socket.io
jest.mock('socket.io');

// Mock managers
jest.mock('@/planets/PlanetManager');
jest.mock('@/ships/ShipManager');
jest.mock('@/buildings/BuildingSystem');
jest.mock('@/buildings/ConstructionQueueManager');
jest.mock('@/ships/ShipMovementManager');

describe('GameTickManager', () => {
  let tickManager: GameTickManager;
  let mockIo: jest.Mocked<Server>;
  let mockPlanetManager: jest.Mocked<PlanetManager>;
  let mockShipManager: jest.Mocked<ShipManager>;
  let mockBuildingSystem: jest.Mocked<BuildingSystem>;
  let mockQueueManager: jest.Mocked<ConstructionQueueManager>;
  let mockMovementManager: jest.Mocked<ShipMovementManager>;

  beforeEach(() => {
    // Create mocks
    mockIo = new Server() as jest.Mocked<Server>;
    mockPlanetManager = new PlanetManager() as jest.Mocked<PlanetManager>;
    mockShipManager = new ShipManager() as jest.Mocked<ShipManager>;
    mockBuildingSystem = new BuildingSystem() as jest.Mocked<BuildingSystem>;
    mockQueueManager = new ConstructionQueueManager() as jest.Mocked<ConstructionQueueManager>;
    mockMovementManager = new ShipMovementManager() as jest.Mocked<ShipMovementManager>;

    // Setup default mock implementations
    mockPlanetManager.getAllPlanets.mockResolvedValue([]);
    mockShipManager.getAllShips.mockResolvedValue([]);
    mockShipManager.processConstructionQueue.mockResolvedValue([]);
    mockQueueManager.getAllQueues.mockResolvedValue([]);
    mockMovementManager.getMovingShips.mockResolvedValue([]);

    tickManager = new GameTickManager(
      mockIo,
      mockPlanetManager,
      mockShipManager,
      mockBuildingSystem,
      mockQueueManager,
      mockMovementManager,
      { tickInterval: 100 }
    );
  });

  afterEach(async () => {
    if (tickManager.isActive()) {
      await tickManager.stop();
    }
  });

  describe('start/stop', () => {
    it('should start the game loop', () => {
      tickManager.start();
      expect(tickManager.isActive()).toBe(true);
    });

    it('should emit started event', (done) => {
      tickManager.on('started', () => {
        expect(tickManager.isActive()).toBe(true);
        done();
      });

      tickManager.start();
    });

    it('should not start if already running', () => {
      tickManager.start();
      const tickCount1 = tickManager.getTickCount();
      
      tickManager.start(); // Try to start again
      const tickCount2 = tickManager.getTickCount();
      
      expect(tickCount1).toBe(tickCount2);
    });

    it('should stop the game loop', async () => {
      tickManager.start();
      await tickManager.stop();
      expect(tickManager.isActive()).toBe(false);
    });

    it('should emit stopped event', async (done) => {
      tickManager.on('stopped', () => {
        expect(tickManager.isActive()).toBe(false);
        done();
      });

      tickManager.start();
      await tickManager.stop();
    });
  });

  describe('tick processing', () => {
    it('should increment tick count', (done) => {
      tickManager.on('tick', (tickCount) => {
        expect(tickCount).toBeGreaterThan(0);
        tickManager.stop().then(done);
      });

      tickManager.start();
    });

    it('should update planets every tick', (done) => {
      const mockPlanet = {
        id: 'planet-1',
        name: 'Test Planet',
        resources: { minerals: 100, energy: 50, crystal: 0 }
      };

      mockPlanetManager.getAllPlanets.mockResolvedValue([mockPlanet as any]);
      mockPlanetManager.updateResources.mockResolvedValue(mockPlanet as any);

      tickManager.on('tick', async () => {
        expect(mockPlanetManager.getAllPlanets).toHaveBeenCalled();
        await tickManager.stop();
        done();
      });

      tickManager.start();
    });

    it('should process building queues', (done) => {
      const mockQueue = { planetId: 'planet-1', items: [] };
      
      mockQueueManager.getAllQueues.mockResolvedValue([mockQueue as any]);
      mockQueueManager.processQueue.mockResolvedValue([]);

      tickManager.on('tick', async () => {
        expect(mockQueueManager.processQueue).toHaveBeenCalled();
        await tickManager.stop();
        done();
      });

      tickManager.start();
    });

    it('should update ship movements', (done) => {
      const mockShip = {
        id: 'ship-1',
        status: 'moving',
        movement: {
          startTime: Date.now(),
          arrivalTime: Date.now() + 10000
        }
      };

      mockMovementManager.getMovingShips.mockResolvedValue([mockShip as any]);
      mockMovementManager.updateShipPosition.mockResolvedValue(false);

      tickManager.on('tick', async () => {
        expect(mockMovementManager.updateShipPosition).toHaveBeenCalled();
        await tickManager.stop();
        done();
      });

      tickManager.start();
    });
  });

  describe('statistics', () => {
    it('should collect tick statistics', (done) => {
      tickManager.on('stats', (stats) => {
        expect(stats).toHaveProperty('tickNumber');
        expect(stats).toHaveProperty('tickDuration');
        expect(stats).toHaveProperty('memoryUsage');
        tickManager.stop().then(done);
      });

      tickManager.start();
    });

    it('should return current stats', async () => {
      tickManager.start();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const stats = tickManager.getStats();
      expect(stats).not.toBeNull();
      expect(stats?.tickNumber).toBeGreaterThan(0);
      
      await tickManager.stop();
    });

    it('should return recent stats', async () => {
      tickManager.start();
      
      await new Promise(resolve => setTimeout(resolve, 250));
      
      const recentStats = tickManager.getRecentStats(5);
      expect(recentStats.length).toBeGreaterThan(0);
      
      await tickManager.stop();
    });
  });

  describe('error handling', () => {
    it('should emit error event on tick error', (done) => {
      mockPlanetManager.getAllPlanets.mockRejectedValue(new Error('Test error'));

      tickManager.on('tickError', (error) => {
        expect(error).toBeInstanceOf(Error);
        tickManager.stop().then(done);
      });

      tickManager.start();
    });

    it('should continue running after tick error', async () => {
      mockPlanetManager.getAllPlanets.mockRejectedValueOnce(new Error('Test error'));

      tickManager.start();
      
      await new Promise(resolve => setTimeout(resolve, 250));
      
      expect(tickManager.isActive()).toBe(true);
      expect(tickManager.getTickCount()).toBeGreaterThan(0);
      
      await tickManager.stop();
    });
  });
});
