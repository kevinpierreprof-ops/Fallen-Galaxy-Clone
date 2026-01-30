/**
 * Galaxy Map Types
 * 
 * Type definitions for galaxy map generation and management
 */

/**
 * 2D Position interface
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Galaxy dimensions
 */
export interface GalaxyDimensions {
  width: number;
  height: number;
}

/**
 * Planet placement data
 */
export interface PlanetPlacement {
  id: string;
  name: string;
  position: Position;
  ownerId: string | null;
  size: number;
  resources: {
    minerals: number;
    energy: number;
    credits: number;
    population: number;
  };
  isStartingPlanet: boolean;
  resourceLevel: 'poor' | 'normal' | 'rich' | 'abundant';
}

/**
 * Galaxy map configuration
 */
export interface GalaxyMapConfig {
  width: number;
  height: number;
  numPlayers: number;
  neutralPlanets: number;
  seed?: string | number;
  minPlanetDistance: number;
  minPlayerDistance: number;
  resourceDistribution: {
    poor: number;      // percentage
    normal: number;    // percentage
    rich: number;      // percentage
    abundant: number;  // percentage
  };
}

/**
 * Generated galaxy map
 */
export interface GalaxyMap {
  id: string;
  name: string;
  dimensions: GalaxyDimensions;
  seed: string;
  planets: PlanetPlacement[];
  createdAt: number;
  config: GalaxyMapConfig;
}

/**
 * Distance calculation result
 */
export interface DistanceResult {
  distance: number;
  dx: number;
  dy: number;
}

/**
 * Nearest planet search result
 */
export interface NearestPlanetResult {
  planet: PlanetPlacement | null;
  distance: number;
}

/**
 * Planet generation stats
 */
export interface GenerationStats {
  totalPlanets: number;
  startingPlanets: number;
  neutralPlanets: number;
  resourceDistribution: {
    poor: number;
    normal: number;
    rich: number;
    abundant: number;
  };
  averagePlanetDistance: number;
  minPlayerDistance: number;
}
