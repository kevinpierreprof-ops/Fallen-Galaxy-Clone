/**
 * Construction Queue Manager
 * 
 * Manages building construction queues for planets.
 * Handles queue operations, construction completion, and validation.
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import type {
  ConstructionQueue,
  QueuedBuilding,
  BuildingType,
  BuildResult
} from '@shared/types/buildingSystem';
import {
  calculateBuildTime,
  calculateMaxQueueSize,
  getBuildingStats
} from '@shared/constants/buildingSystem';

/**
 * Construction Queue Manager Class
 * 
 * Manages construction queues for individual planets.
 */
export class ConstructionQueueManager {
  private queues: Map<string, ConstructionQueue>;

  constructor() {
    this.queues = new Map();
  }

  /**
   * Initialize queue for a planet
   * 
   * @param planetId - Planet ID
   * @param commandCenterLevel - Command Center level
   */
  public initializeQueue(planetId: string, commandCenterLevel: number = 0): void {
    if (!this.queues.has(planetId)) {
      this.queues.set(planetId, {
        planetId,
        queue: [],
        maxQueueSize: calculateMaxQueueSize(commandCenterLevel),
        activeConstruction: undefined
      });
    }
  }

  /**
   * Get queue for a planet
   * 
   * @param planetId - Planet ID
   * @returns Construction queue or undefined
   */
  public getQueue(planetId: string): ConstructionQueue | undefined {
    return this.queues.get(planetId);
  }

  /**
   * Add building to construction queue
   * 
   * @param planetId - Planet ID
   * @param buildingType - Type of building
   * @param targetLevel - Target level
   * @param cost - Build cost
   * @param shipyardLevel - Shipyard level for time calculation
   * @param existingBuildingId - ID of existing building (for upgrades)
   * @returns Build result
   */
  public addToQueue(
    planetId: string,
    buildingType: BuildingType,
    targetLevel: number,
    cost: { metal: number; energy: number; crystal: number },
    shipyardLevel: number = 0,
    existingBuildingId?: string
  ): BuildResult {
    const queue = this.queues.get(planetId);

    if (!queue) {
      return {
        success: false,
        message: 'Construction queue not initialized for this planet'
      };
    }

    // Check queue capacity
    if (queue.queue.length >= queue.maxQueueSize) {
      return {
        success: false,
        message: `Construction queue is full (max ${queue.maxQueueSize} items)`
      };
    }

    // Calculate build time
    const buildTime = calculateBuildTime(buildingType, targetLevel, shipyardLevel);
    const now = Date.now();

    // Determine start time (after last queued item or now)
    let startTime = now;
    if (queue.queue.length > 0) {
      const lastItem = queue.queue[queue.queue.length - 1];
      startTime = lastItem.completesAt;
    } else if (queue.activeConstruction) {
      startTime = queue.activeConstruction.completesAt;
    }

    const queuedBuilding: QueuedBuilding = {
      id: uuidv4(),
      buildingId: existingBuildingId,
      type: buildingType,
      targetLevel,
      cost,
      buildTime,
      startedAt: startTime,
      completesAt: startTime + (buildTime * 1000),
      position: queue.queue.length,
      planetId
    };

    queue.queue.push(queuedBuilding);

    logger.info(`Added ${buildingType} (level ${targetLevel}) to queue for planet ${planetId}`);

    return {
      success: true,
      message: 'Building added to construction queue',
      queuedBuilding,
      completesAt: queuedBuilding.completesAt,
      queuePosition: queuedBuilding.position
    };
  }

  /**
   * Remove building from queue
   * 
   * @param planetId - Planet ID
   * @param queuedBuildingId - Queued building ID
   * @returns True if removed successfully
   */
  public removeFromQueue(planetId: string, queuedBuildingId: string): boolean {
    const queue = this.queues.get(planetId);

    if (!queue) {
      return false;
    }

    const index = queue.queue.findIndex(q => q.id === queuedBuildingId);

    if (index === -1) {
      return false;
    }

    // Remove from queue
    queue.queue.splice(index, 1);

    // Recalculate positions and times
    this.recalculateQueue(planetId);

    logger.info(`Removed building from queue: ${queuedBuildingId}`);
    return true;
  }

  /**
   * Cancel active construction
   * 
   * @param planetId - Planet ID
   * @returns Cancelled building or undefined
   */
  public cancelActiveConstruction(planetId: string): QueuedBuilding | undefined {
    const queue = this.queues.get(planetId);

    if (!queue || !queue.activeConstruction) {
      return undefined;
    }

    const cancelled = queue.activeConstruction;
    queue.activeConstruction = undefined;

    // Start next item in queue if available
    this.startNextConstruction(planetId);

    logger.info(`Cancelled active construction on planet ${planetId}`);
    return cancelled;
  }

  /**
   * Check and complete finished constructions
   * 
   * @param planetId - Planet ID
   * @returns Array of completed buildings
   */
  public checkCompletions(planetId: string): QueuedBuilding[] {
    const queue = this.queues.get(planetId);
    const completed: QueuedBuilding[] = [];

    if (!queue) {
      return completed;
    }

    const now = Date.now();

    // Check active construction
    if (queue.activeConstruction && now >= queue.activeConstruction.completesAt) {
      completed.push(queue.activeConstruction);
      queue.activeConstruction = undefined;

      // Start next construction
      this.startNextConstruction(planetId);
    }

    return completed;
  }

  /**
   * Start next construction from queue
   * 
   * @param planetId - Planet ID
   */
  private startNextConstruction(planetId: string): void {
    const queue = this.queues.get(planetId);

    if (!queue || queue.queue.length === 0) {
      return;
    }

    // Remove first item from queue and set as active
    const next = queue.queue.shift();
    
    if (next) {
      // Update start time to now
      const now = Date.now();
      next.startedAt = now;
      next.completesAt = now + (next.buildTime * 1000);
      
      queue.activeConstruction = next;

      // Recalculate remaining queue
      this.recalculateQueue(planetId);

      logger.info(`Started construction: ${next.type} on planet ${planetId}`);
    }
  }

  /**
   * Recalculate queue positions and completion times
   * 
   * @param planetId - Planet ID
   */
  private recalculateQueue(planetId: string): void {
    const queue = this.queues.get(planetId);

    if (!queue) {
      return;
    }

    let previousEnd = queue.activeConstruction 
      ? queue.activeConstruction.completesAt 
      : Date.now();

    queue.queue.forEach((item, index) => {
      item.position = index;
      item.startedAt = previousEnd;
      item.completesAt = previousEnd + (item.buildTime * 1000);
      previousEnd = item.completesAt;
    });
  }

  /**
   * Get all queued and active constructions for a planet
   * 
   * @param planetId - Planet ID
   * @returns Array of all constructions
   */
  public getAllConstructions(planetId: string): QueuedBuilding[] {
    const queue = this.queues.get(planetId);

    if (!queue) {
      return [];
    }

    const constructions: QueuedBuilding[] = [];

    if (queue.activeConstruction) {
      constructions.push(queue.activeConstruction);
    }

    constructions.push(...queue.queue);

    return constructions;
  }

  /**
   * Update queue max size (when Command Center is upgraded)
   * 
   * @param planetId - Planet ID
   * @param commandCenterLevel - New Command Center level
   */
  public updateMaxQueueSize(planetId: string, commandCenterLevel: number): void {
    const queue = this.queues.get(planetId);

    if (queue) {
      queue.maxQueueSize = calculateMaxQueueSize(commandCenterLevel);
    }
  }

  /**
   * Get queue statistics
   * 
   * @param planetId - Planet ID
   * @returns Queue statistics
   */
  public getQueueStats(planetId: string): {
    activeConstruction: QueuedBuilding | undefined;
    queuedCount: number;
    maxQueueSize: number;
    availableSlots: number;
  } | null {
    const queue = this.queues.get(planetId);

    if (!queue) {
      return null;
    }

    return {
      activeConstruction: queue.activeConstruction,
      queuedCount: queue.queue.length,
      maxQueueSize: queue.maxQueueSize,
      availableSlots: queue.maxQueueSize - queue.queue.length
    };
  }

  /**
   * Clear all queues (for testing or reset)
   */
  public clearAll(): void {
    this.queues.clear();
  }

  /**
   * Serialize queue to JSON
   * 
   * @param planetId - Planet ID
   * @returns JSON representation
   */
  public toJSON(planetId: string): any {
    const queue = this.queues.get(planetId);
    return queue || null;
  }

  /**
   * Restore queue from JSON
   * 
   * @param data - Queue data
   */
  public fromJSON(data: ConstructionQueue): void {
    this.queues.set(data.planetId, data);
  }
}

// Export singleton instance
export const constructionQueueManager = new ConstructionQueueManager();
