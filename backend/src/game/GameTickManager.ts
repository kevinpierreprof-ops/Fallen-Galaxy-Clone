/**
 * Game Tick Manager
 * 
 * Main server-side game loop that runs every second
 */

import { EventEmitter } from 'events';
import type { Server } from 'socket.io';
import { logger } from '@/utils/logger';
import { PlanetManager } from '@/planets/PlanetManager';
import { ShipManager } from '@/ships/ShipManager';
import { BuildingSystem } from '@/buildings/BuildingSystem';
import { ConstructionQueueManager } from '@/buildings/ConstructionQueueManager';
import { ShipMovementManager } from '@/ships/ShipMovementManager';
import { db } from '@/database';
import type { Planet } from '@shared/types/galaxyMap';
import type { Ship } from '@shared/types/ships';
import type { Building } from '@shared/types/buildings';

/**
 * Tick statistics
 */
export interface TickStats {
  tickNumber: number;
  tickDuration: number;
  planetsUpdated: number;
  buildingsCompleted: number;
  shipsCompleted: number;
  shipsArrived: number;
  playersNotified: number;
  lastSaveTime: number;
  averageTickDuration: number;
  memoryUsage: number;
}

/**
 * State change tracking
 */
interface StateChanges {
  planets: Map<string, Planet>;
  ships: Map<string, Ship>;
  buildings: Map<string, Building>;
  completedBuildings: Building[];
  completedShips: Ship[];
  arrivedShips: Ship[];
}

/**
 * Game Tick Manager Options
 */
export interface GameTickManagerOptions {
  tickInterval: number;        // Tick interval in ms (default: 1000)
  saveInterval: number;         // Save interval in ticks (default: 60)
  broadcastInterval: number;    // Broadcast interval in ticks (default: 1)
  enablePerformanceMonitoring: boolean;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: GameTickManagerOptions = {
  tickInterval: 1000,
  saveInterval: 60,
  broadcastInterval: 1,
  enablePerformanceMonitoring: true
};

/**
 * Game Tick Manager
 * 
 * Manages the main game loop with resource generation, construction, and movement
 */
export class GameTickManager extends EventEmitter {
  private io: Server;
  private planetManager: PlanetManager;
  private shipManager: ShipManager;
  private buildingSystem: BuildingSystem;
  private queueManager: ConstructionQueueManager;
  private movementManager: ShipMovementManager;
  
  private options: GameTickManagerOptions;
  private tickInterval: NodeJS.Timer | null = null;
  private isRunning: boolean = false;
  private tickCount: number = 0;
  private lastSaveTick: number = 0;
  
  private tickStats: TickStats[] = [];
  private stateChanges: StateChanges;

  constructor(
    io: Server,
    planetManager: PlanetManager,
    shipManager: ShipManager,
    buildingSystem: BuildingSystem,
    queueManager: ConstructionQueueManager,
    movementManager: ShipMovementManager,
    options: Partial<GameTickManagerOptions> = {}
  ) {
    super();
    
    this.io = io;
    this.planetManager = planetManager;
    this.shipManager = shipManager;
    this.buildingSystem = buildingSystem;
    this.queueManager = queueManager;
    this.movementManager = movementManager;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    this.stateChanges = this.createEmptyStateChanges();
  }

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.isRunning) {
      logger.warn('Game tick manager already running');
      return;
    }

    logger.info('Starting game tick manager...', {
      tickInterval: this.options.tickInterval,
      saveInterval: this.options.saveInterval
    });

    this.isRunning = true;
    this.tickInterval = setInterval(() => {
      this.tick().catch(error => {
        logger.error('Error in game tick:', error);
        this.emit('error', error);
      });
    }, this.options.tickInterval);

    this.emit('started');
    logger.info('Game tick manager started');
  }

  /**
   * Stop the game loop
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Game tick manager not running');
      return;
    }

    logger.info('Stopping game tick manager...');
    this.isRunning = false;

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    // Final save before shutdown
    await this.saveGameState();

    this.emit('stopped');
    logger.info('Game tick manager stopped');
  }

  /**
   * Main tick function
   */
  private async tick(): Promise<void> {
    const startTime = Date.now();
    this.tickCount++;

    try {
      // Reset state changes
      this.stateChanges = this.createEmptyStateChanges();

      // 1. Update planets (generate resources)
      await this.updatePlanets();

      // 2. Process building construction queues
      await this.processBuildingQueues();

      // 3. Process ship construction queues
      await this.processShipQueues();

      // 4. Update ship movements
      await this.updateShipMovements();

      // 5. Broadcast state changes to players
      if (this.tickCount % this.options.broadcastInterval === 0) {
        await this.broadcastStateChanges();
      }

      // 6. Save game state periodically
      if (this.tickCount - this.lastSaveTick >= this.options.saveInterval) {
        await this.saveGameState();
        this.lastSaveTick = this.tickCount;
      }

      // 7. Collect performance statistics
      if (this.options.enablePerformanceMonitoring) {
        await this.collectStats(startTime);
      }

      this.emit('tick', this.tickCount);
    } catch (error) {
      logger.error('Error in game tick:', error);
      this.emit('tickError', error);
      throw error;
    }
  }

  /**
   * Update all planets - generate resources
   */
  private async updatePlanets(): Promise<void> {
    const planets = await this.planetManager.getAllPlanets();
    let updatedCount = 0;

    for (const planet of planets) {
      try {
        // Calculate resource generation from buildings
        const resourceGeneration = this.buildingSystem.calculateProduction(planet);

        // Update planet resources (per second)
        const updated = await this.planetManager.updateResources(planet.id, {
          minerals: planet.resources.minerals + resourceGeneration.minerals / 3600,
          energy: planet.resources.energy + resourceGeneration.energy / 3600,
          crystal: planet.resources.crystal + (resourceGeneration.crystal || 0) / 3600
        });

        if (updated) {
          this.stateChanges.planets.set(planet.id, updated);
          updatedCount++;
        }
      } catch (error) {
        logger.error(`Error updating planet ${planet.id}:`, error);
      }
    }

    logger.debug(`Updated ${updatedCount} planets`);
  }

  /**
   * Process building construction queues
   */
  private async processBuildingQueues(): Promise<void> {
    const completedBuildings: Building[] = [];

    try {
      // Get all active queues
      const queues = await this.queueManager.getAllQueues();

      for (const queue of queues) {
        const completed = await this.queueManager.processQueue(queue.planetId);
        
        if (completed.length > 0) {
          completedBuildings.push(...completed);
          
          // Update planet with new buildings
          const planet = await this.planetManager.getPlanet(queue.planetId);
          if (planet) {
            this.stateChanges.planets.set(planet.id, planet);
            this.stateChanges.completedBuildings.push(...completed);
          }
        }
      }

      logger.debug(`Completed ${completedBuildings.length} buildings`);
    } catch (error) {
      logger.error('Error processing building queues:', error);
    }
  }

  /**
   * Process ship construction queues
   */
  private async processShipQueues(): Promise<void> {
    const completedShips: Ship[] = [];

    try {
      // Similar to building queues but for ships
      const planets = await this.planetManager.getAllPlanets();

      for (const planet of planets) {
        // Process ship construction queue for each planet
        const completed = await this.shipManager.processConstructionQueue(planet.id);
        
        if (completed.length > 0) {
          completedShips.push(...completed);
          this.stateChanges.completedShips.push(...completed);
          
          for (const ship of completed) {
            this.stateChanges.ships.set(ship.id, ship);
          }
        }
      }

      logger.debug(`Completed ${completedShips.length} ships`);
    } catch (error) {
      logger.error('Error processing ship queues:', error);
    }
  }

  /**
   * Update ship movements
   */
  private async updateShipMovements(): Promise<void> {
    try {
      const movingShips = await this.movementManager.getMovingShips();
      const arrivedShips: Ship[] = [];

      for (const ship of movingShips) {
        const arrived = await this.movementManager.updateShipPosition(ship.id);
        
        if (arrived) {
          arrivedShips.push(ship);
          this.stateChanges.arrivedShips.push(ship);
          this.stateChanges.ships.set(ship.id, ship);
        } else {
          // Ship is still moving, update its position
          this.stateChanges.ships.set(ship.id, ship);
        }
      }

      logger.debug(`${arrivedShips.length} ships arrived, ${movingShips.length - arrivedShips.length} still moving`);
    } catch (error) {
      logger.error('Error updating ship movements:', error);
    }
  }

  /**
   * Broadcast state changes to connected players
   */
  private async broadcastStateChanges(): Promise<void> {
    try {
      let notifiedPlayers = 0;

      // Get all connected players
      const sockets = await this.io.fetchSockets();

      for (const socket of sockets) {
        const userId = (socket as any).userId;
        if (!userId) continue;

        // Filter state changes relevant to this player
        const playerChanges = this.filterPlayerChanges(userId);

        if (this.hasChanges(playerChanges)) {
          // Emit planet updates
          for (const planet of playerChanges.planets.values()) {
            socket.emit('planetUpdated', {
              planet,
              changes: {
                resources: true,
                buildings: playerChanges.completedBuildings.some(b => b.planetId === planet.id)
              },
              timestamp: Date.now()
            });
          }

          // Emit ship updates
          for (const ship of playerChanges.ships.values()) {
            socket.emit('shipMoved', {
              shipId: ship.id,
              ship,
              origin: ship.movement?.origin,
              destination: ship.movement?.destination,
              progress: this.calculateShipProgress(ship),
              timestamp: Date.now()
            });
          }

          // Emit completed buildings
          for (const building of playerChanges.completedBuildings) {
            socket.emit('buildingCompleted', {
              planetId: building.planetId,
              building,
              timestamp: Date.now()
            });
          }

          // Emit completed ships
          for (const ship of playerChanges.completedShips) {
            socket.emit('shipCompleted', {
              planetId: ship.currentPlanetId,
              ship,
              timestamp: Date.now()
            });
          }

          // Emit arrived ships
          for (const ship of playerChanges.arrivedShips) {
            socket.emit('shipArrived', {
              shipId: ship.id,
              ship,
              planetId: ship.currentPlanetId,
              timestamp: Date.now()
            });
          }

          notifiedPlayers++;
        }
      }

      logger.debug(`Notified ${notifiedPlayers} players of state changes`);
    } catch (error) {
      logger.error('Error broadcasting state changes:', error);
    }
  }

  /**
   * Save game state to database
   */
  private async saveGameState(): Promise<void> {
    const startTime = Date.now();

    try {
      logger.info('Saving game state to database...');

      // Save all planets
      const planets = await this.planetManager.getAllPlanets();
      for (const planet of planets) {
        await db.planet.update(planet.id, planet);
      }

      // Save all ships
      const ships = await this.shipManager.getAllShips();
      for (const ship of ships) {
        await db.ship.update(ship.id, ship);
      }

      const duration = Date.now() - startTime;
      logger.info(`Game state saved in ${duration}ms`, {
        planets: planets.length,
        ships: ships.length
      });

      this.emit('stateSaved', { duration, planets: planets.length, ships: ships.length });
    } catch (error) {
      logger.error('Error saving game state:', error);
      this.emit('saveError', error);
      throw error;
    }
  }

  /**
   * Collect performance statistics
   */
  private async collectStats(startTime: number): Promise<void> {
    const tickDuration = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    const stats: TickStats = {
      tickNumber: this.tickCount,
      tickDuration,
      planetsUpdated: this.stateChanges.planets.size,
      buildingsCompleted: this.stateChanges.completedBuildings.length,
      shipsCompleted: this.stateChanges.completedShips.length,
      shipsArrived: this.stateChanges.arrivedShips.length,
      playersNotified: 0, // Updated during broadcast
      lastSaveTime: this.lastSaveTick,
      averageTickDuration: this.calculateAverageTickDuration(),
      memoryUsage
    };

    this.tickStats.push(stats);

    // Keep only last 100 stats
    if (this.tickStats.length > 100) {
      this.tickStats.shift();
    }

    // Log performance warnings
    if (tickDuration > 500) {
      logger.warn('Slow tick detected', { tickDuration, tickNumber: this.tickCount });
    }

    if (memoryUsage > 500) {
      logger.warn('High memory usage detected', { memoryUsage: `${memoryUsage.toFixed(2)}MB` });
    }

    this.emit('stats', stats);
  }

  /**
   * Filter state changes relevant to a specific player
   */
  private filterPlayerChanges(userId: string): StateChanges {
    const filtered = this.createEmptyStateChanges();

    // Filter planets owned by player
    for (const [id, planet] of this.stateChanges.planets) {
      if (planet.ownerId === userId) {
        filtered.planets.set(id, planet);
      }
    }

    // Filter ships owned by player
    for (const [id, ship] of this.stateChanges.ships) {
      if (ship.ownerId === userId) {
        filtered.ships.set(id, ship);
      }
    }

    // Filter buildings
    filtered.completedBuildings = this.stateChanges.completedBuildings.filter(b => {
      const planet = this.stateChanges.planets.get(b.planetId);
      return planet?.ownerId === userId;
    });

    // Filter ships
    filtered.completedShips = this.stateChanges.completedShips.filter(s => 
      s.ownerId === userId
    );

    filtered.arrivedShips = this.stateChanges.arrivedShips.filter(s => 
      s.ownerId === userId
    );

    return filtered;
  }

  /**
   * Check if state changes has any changes
   */
  private hasChanges(changes: StateChanges): boolean {
    return changes.planets.size > 0 ||
           changes.ships.size > 0 ||
           changes.completedBuildings.length > 0 ||
           changes.completedShips.length > 0 ||
           changes.arrivedShips.length > 0;
  }

  /**
   * Calculate ship movement progress
   */
  private calculateShipProgress(ship: Ship): number {
    if (!ship.movement || ship.status !== 'moving') {
      return 0;
    }

    const elapsed = Date.now() - ship.movement.startTime;
    const total = ship.movement.arrivalTime - ship.movement.startTime;
    return Math.min(100, (elapsed / total) * 100);
  }

  /**
   * Calculate average tick duration
   */
  private calculateAverageTickDuration(): number {
    if (this.tickStats.length === 0) return 0;
    
    const total = this.tickStats.reduce((sum, stat) => sum + stat.tickDuration, 0);
    return total / this.tickStats.length;
  }

  /**
   * Create empty state changes object
   */
  private createEmptyStateChanges(): StateChanges {
    return {
      planets: new Map(),
      ships: new Map(),
      buildings: new Map(),
      completedBuildings: [],
      completedShips: [],
      arrivedShips: []
    };
  }

  /**
   * Get current statistics
   */
  public getStats(): TickStats | null {
    return this.tickStats[this.tickStats.length - 1] || null;
  }

  /**
   * Get recent statistics
   */
  public getRecentStats(count: number = 10): TickStats[] {
    return this.tickStats.slice(-count);
  }

  /**
   * Is the game loop running
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current tick count
   */
  public getTickCount(): number {
    return this.tickCount;
  }
}

export default GameTickManager;
