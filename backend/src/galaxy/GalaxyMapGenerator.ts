/**
 * Galaxy Map Generator
 * 
 * Generates procedural galaxy maps with configurable parameters.
 * Supports seeded generation for reproducible maps.
 */

import { v4 as uuidv4 } from 'uuid';
import { SeededRandom } from '@/utils/SeededRandom';
import { logger } from '@/utils/logger';
import type {
  GalaxyMap,
  GalaxyMapConfig,
  PlanetPlacement,
  Position,
  DistanceResult,
  NearestPlanetResult,
  GenerationStats
} from '@shared/types/galaxyMap';

/**
 * Default galaxy map configuration
 */
const DEFAULT_CONFIG: GalaxyMapConfig = {
  width: 100,
  height: 100,
  numPlayers: 4,
  neutralPlanets: 50,
  minPlanetDistance: 5,
  minPlayerDistance: 30,
  resourceDistribution: {
    poor: 30,
    normal: 40,
    rich: 20,
    abundant: 10
  }
};

/**
 * Resource level multipliers
 */
const RESOURCE_MULTIPLIERS = {
  poor: 0.5,
  normal: 1.0,
  rich: 1.5,
  abundant: 2.5
};

/**
 * Base starting resources
 */
const BASE_STARTING_RESOURCES = {
  minerals: 2000,
  energy: 1000,
  credits: 500,
  population: 500
};

/**
 * Base neutral planet resources
 */
const BASE_NEUTRAL_RESOURCES = {
  minerals: 1000,
  energy: 500,
  credits: 0,
  population: 0
};

/**
 * Galaxy Map Generator Class
 * 
 * Generates galaxy maps with planets, ensuring proper spacing and resource distribution.
 */
export class GalaxyMapGenerator {
  private config: GalaxyMapConfig;
  private rng: SeededRandom;
  private planets: PlanetPlacement[] = [];

  /**
   * Create a new galaxy map generator
   * 
   * @param config - Galaxy map configuration
   */
  constructor(config: Partial<GalaxyMapConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    const seed = this.config.seed || Date.now().toString();
    this.rng = new SeededRandom(seed);
    this.config.seed = seed.toString();
  }

  /**
   * Calculate Euclidean distance between two points
   * 
   * @param p1 - First position
   * @param p2 - Second position
   * @returns Distance calculation result
   */
  public static calculateDistance(p1: Position, p2: Position): DistanceResult {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return { distance, dx, dy };
  }

  /**
   * Check if position is valid (not too close to existing planets)
   * 
   * @param position - Position to check
   * @param minDistance - Minimum required distance
   * @returns True if position is valid
   */
  private isValidPosition(position: Position, minDistance: number): boolean {
    // Check bounds
    if (
      position.x < 0 || 
      position.x >= this.config.width || 
      position.y < 0 || 
      position.y >= this.config.height
    ) {
      return false;
    }

    // Check distance from all existing planets
    for (const planet of this.planets) {
      const dist = GalaxyMapGenerator.calculateDistance(position, planet.position);
      if (dist.distance < minDistance) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find a valid random position
   * 
   * @param minDistance - Minimum distance from other planets
   * @param maxAttempts - Maximum placement attempts
   * @returns Valid position or null
   */
  private findValidPosition(
    minDistance: number,
    maxAttempts: number = 1000
  ): Position | null {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const position: Position = {
        x: this.rng.randomFloat(0, this.config.width),
        y: this.rng.randomFloat(0, this.config.height)
      };

      if (this.isValidPosition(position, minDistance)) {
        return position;
      }
    }

    return null;
  }

  /**
   * Generate resource level based on distribution
   * 
   * @returns Resource level
   */
  private generateResourceLevel(): 'poor' | 'normal' | 'rich' | 'abundant' {
    const roll = this.rng.random() * 100;
    const dist = this.config.resourceDistribution;

    let cumulative = 0;
    if (roll < (cumulative += dist.poor)) return 'poor';
    if (roll < (cumulative += dist.normal)) return 'normal';
    if (roll < (cumulative += dist.rich)) return 'rich';
    return 'abundant';
  }

  /**
   * Calculate resources based on level
   * 
   * @param baseResources - Base resource values
   * @param level - Resource level
   * @returns Calculated resources
   */
  private calculateResources(
    baseResources: typeof BASE_NEUTRAL_RESOURCES,
    level: 'poor' | 'normal' | 'rich' | 'abundant'
  ) {
    const multiplier = RESOURCE_MULTIPLIERS[level];
    
    return {
      minerals: Math.floor(baseResources.minerals * multiplier),
      energy: Math.floor(baseResources.energy * multiplier),
      credits: baseResources.credits,
      population: baseResources.population
    };
  }

  /**
   * Generate planet name
   * 
   * @param index - Planet index
   * @param isStarting - Is starting planet
   * @returns Planet name
   */
  private generatePlanetName(index: number, isStarting: boolean = false): string {
    const prefixes = [
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
      'Nova', 'Nebula', 'Stellar', 'Cosmic', 'Void', 'Quantum', 'Celestial',
      'Astral', 'Galactic', 'Orbit', 'Eclipse', 'Corona'
    ];

    const suffixes = [
      'Prime', 'Secundus', 'Tertius', 'Major', 'Minor', 'Nexus', 'Haven',
      'Reach', 'Station', 'Colony', 'Outpost', 'Base', 'Citadel', 'Fortress'
    ];

    if (isStarting) {
      return `${this.rng.pick(prefixes)}-${this.rng.pick(suffixes)}-${index + 1}`;
    }

    const useComplex = this.rng.randomBool(0.7);
    if (useComplex) {
      return `${this.rng.pick(prefixes)}-${this.rng.randomInt(100, 999)}`;
    } else {
      return `${this.rng.pick(prefixes)}-${this.rng.pick(suffixes)}`;
    }
  }

  /**
   * Place starting planets for players
   * 
   * @param playerIds - Array of player IDs
   */
  private placeStartingPlanets(playerIds: string[]): void {
    logger.info(`Placing ${playerIds.length} starting planets...`);

    // Use grid-based placement for better distribution
    const gridSize = Math.ceil(Math.sqrt(playerIds.length));
    const cellWidth = this.config.width / gridSize;
    const cellHeight = this.config.height / gridSize;

    const positions: Position[] = [];

    // Generate positions in grid cells
    for (let i = 0; i < playerIds.length; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      // Add random offset within cell
      const cellCenterX = (col + 0.5) * cellWidth;
      const cellCenterY = (row + 0.5) * cellHeight;

      const offsetX = this.rng.randomFloat(-cellWidth * 0.3, cellWidth * 0.3);
      const offsetY = this.rng.randomFloat(-cellHeight * 0.3, cellHeight * 0.3);

      positions.push({
        x: Math.max(0, Math.min(this.config.width, cellCenterX + offsetX)),
        y: Math.max(0, Math.min(this.config.height, cellCenterY + offsetY))
      });
    }

    // Create starting planets
    for (let i = 0; i < playerIds.length; i++) {
      const planet: PlanetPlacement = {
        id: uuidv4(),
        name: this.generatePlanetName(i, true),
        position: positions[i],
        ownerId: playerIds[i],
        size: this.rng.randomInt(3, 5), // Larger starting planets
        resources: { ...BASE_STARTING_RESOURCES },
        isStartingPlanet: true,
        resourceLevel: 'abundant'
      };

      this.planets.push(planet);
    }

    logger.info(`Placed ${playerIds.length} starting planets`);
  }

  /**
   * Place neutral planets
   */
  private placeNeutralPlanets(): void {
    logger.info(`Placing ${this.config.neutralPlanets} neutral planets...`);

    let placed = 0;
    const maxAttempts = this.config.neutralPlanets * 10;
    let attempts = 0;

    while (placed < this.config.neutralPlanets && attempts < maxAttempts) {
      attempts++;

      const position = this.findValidPosition(this.config.minPlanetDistance);

      if (!position) {
        continue;
      }

      const resourceLevel = this.generateResourceLevel();
      const resources = this.calculateResources(BASE_NEUTRAL_RESOURCES, resourceLevel);

      const planet: PlanetPlacement = {
        id: uuidv4(),
        name: this.generatePlanetName(placed),
        position,
        ownerId: null,
        size: this.rng.randomInt(1, 4),
        resources,
        isStartingPlanet: false,
        resourceLevel
      };

      this.planets.push(planet);
      placed++;
    }

    logger.info(`Placed ${placed} neutral planets (${attempts} attempts)`);
  }

  /**
   * Find nearest unoccupied planet to a position
   * 
   * @param position - Reference position
   * @returns Nearest planet result
   */
  public findNearestUnoccupiedPlanet(position: Position): NearestPlanetResult {
    let nearest: PlanetPlacement | null = null;
    let minDistance = Infinity;

    for (const planet of this.planets) {
      if (planet.ownerId === null) {
        const dist = GalaxyMapGenerator.calculateDistance(position, planet.position);
        if (dist.distance < minDistance) {
          minDistance = dist.distance;
          nearest = planet;
        }
      }
    }

    return {
      planet: nearest,
      distance: minDistance
    };
  }

  /**
   * Generate galaxy map
   * 
   * @param playerIds - Array of player IDs
   * @returns Generated galaxy map
   */
  public generate(playerIds: string[]): GalaxyMap {
    logger.info('Generating galaxy map...', this.config);

    // Reset planets
    this.planets = [];

    // Validate player count
    if (playerIds.length !== this.config.numPlayers) {
      throw new Error(
        `Player count mismatch: expected ${this.config.numPlayers}, got ${playerIds.length}`
      );
    }

    // Place starting planets
    this.placeStartingPlanets(playerIds);

    // Place neutral planets
    this.placeNeutralPlanets();

    // Create galaxy map object
    const galaxyMap: GalaxyMap = {
      id: uuidv4(),
      name: `Galaxy-${this.config.seed}`,
      dimensions: {
        width: this.config.width,
        height: this.config.height
      },
      seed: this.config.seed!.toString(),
      planets: this.planets,
      createdAt: Date.now(),
      config: this.config
    };

    logger.info(`Galaxy map generated with ${this.planets.length} planets`);

    return galaxyMap;
  }

  /**
   * Get generation statistics
   * 
   * @returns Generation stats
   */
  public getStats(): GenerationStats {
    const resourceCounts = {
      poor: 0,
      normal: 0,
      rich: 0,
      abundant: 0
    };

    let totalDistance = 0;
    let distanceCount = 0;

    // Count resources
    for (const planet of this.planets) {
      resourceCounts[planet.resourceLevel]++;
    }

    // Calculate average distance
    for (let i = 0; i < this.planets.length; i++) {
      for (let j = i + 1; j < this.planets.length; j++) {
        const dist = GalaxyMapGenerator.calculateDistance(
          this.planets[i].position,
          this.planets[j].position
        );
        totalDistance += dist.distance;
        distanceCount++;
      }
    }

    // Find minimum player distance
    let minPlayerDist = Infinity;
    const startingPlanets = this.planets.filter(p => p.isStartingPlanet);
    
    for (let i = 0; i < startingPlanets.length; i++) {
      for (let j = i + 1; j < startingPlanets.length; j++) {
        const dist = GalaxyMapGenerator.calculateDistance(
          startingPlanets[i].position,
          startingPlanets[j].position
        );
        minPlayerDist = Math.min(minPlayerDist, dist.distance);
      }
    }

    return {
      totalPlanets: this.planets.length,
      startingPlanets: this.planets.filter(p => p.isStartingPlanet).length,
      neutralPlanets: this.planets.filter(p => !p.isStartingPlanet).length,
      resourceDistribution: resourceCounts,
      averagePlanetDistance: distanceCount > 0 ? totalDistance / distanceCount : 0,
      minPlayerDistance: minPlayerDist !== Infinity ? minPlayerDist : 0
    };
  }

  /**
   * Export galaxy map to JSON
   * 
   * @param galaxyMap - Galaxy map to export
   * @returns JSON string
   */
  public static exportToJSON(galaxyMap: GalaxyMap): string {
    return JSON.stringify(galaxyMap, null, 2);
  }

  /**
   * Import galaxy map from JSON
   * 
   * @param json - JSON string
   * @returns Galaxy map
   */
  public static importFromJSON(json: string): GalaxyMap {
    return JSON.parse(json) as GalaxyMap;
  }

  /**
   * Regenerate galaxy with same seed
   * 
   * @param galaxyMap - Previous galaxy map
   * @param playerIds - Player IDs
   * @returns Regenerated galaxy map
   */
  public static regenerate(galaxyMap: GalaxyMap, playerIds: string[]): GalaxyMap {
    const generator = new GalaxyMapGenerator({
      ...galaxyMap.config,
      seed: galaxyMap.seed
    });

    return generator.generate(playerIds);
  }
}
