import { Planet, Position } from '@shared/types/game';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export class PlanetManager {
  private planets: Map<string, Planet> = new Map();

  generatePlanets(count: number): void {
    for (let i = 0; i < count; i++) {
      const planet: Planet = {
        id: uuidv4(),
        name: this.generatePlanetName(),
        position: this.generatePosition(),
        size: Math.floor(Math.random() * 5) + 1, // 1-5
        ownerId: null,
        resources: {
          minerals: Math.floor(Math.random() * 1000) + 500,
          energy: Math.floor(Math.random() * 500) + 250
        },
        production: {
          minerals: Math.floor(Math.random() * 50) + 10,
          energy: Math.floor(Math.random() * 30) + 5,
          credits: Math.floor(Math.random() * 20) + 5
        },
        population: 0,
        maxPopulation: (Math.floor(Math.random() * 5) + 1) * 1000,
        buildings: []
      };

      this.planets.set(planet.id, planet);
    }
    logger.info(`Generated ${count} planets`);
  }

  assignStartingPlanet(playerId: string): Planet | null {
    // Find an unowned planet
    const availablePlanets = Array.from(this.planets.values()).filter(p => !p.ownerId);
    
    if (availablePlanets.length === 0) {
      logger.warn('No available starting planets');
      return null;
    }

    const planet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];
    planet.ownerId = playerId;
    planet.population = 1000;
    
    logger.info(`Assigned planet ${planet.name} to player ${playerId}`);
    return planet;
  }

  colonizePlanet(planetId: string, playerId: string): boolean {
    const planet = this.planets.get(planetId);
    
    if (!planet) {
      logger.warn(`Planet ${planetId} not found`);
      return false;
    }

    if (planet.ownerId) {
      logger.warn(`Planet ${planetId} already owned`);
      return false;
    }

    planet.ownerId = playerId;
    planet.population = 100;
    logger.info(`Planet ${planet.name} colonized by ${playerId}`);
    return true;
  }

  update(deltaTime: number): void {
    // Update planet populations and production
    this.planets.forEach((planet) => {
      if (planet.ownerId && planet.population < planet.maxPopulation) {
        const growthRate = 0.01; // 1% per second
        planet.population = Math.min(
          planet.maxPopulation,
          planet.population * (1 + growthRate * deltaTime)
        );
      }
    });
  }

  calculateProduction(planetIds: string[]): { minerals: number; energy: number; credits: number } {
    let totalProduction = { minerals: 0, energy: 0, credits: 0 };

    planetIds.forEach((planetId) => {
      const planet = this.planets.get(planetId);
      if (planet) {
        totalProduction.minerals += planet.production.minerals;
        totalProduction.energy += planet.production.energy;
        totalProduction.credits += planet.production.credits;
      }
    });

    return totalProduction;
  }

  getPlanets(): Planet[] {
    return Array.from(this.planets.values());
  }

  getPlanet(planetId: string): Planet | undefined {
    return this.planets.get(planetId);
  }

  private generatePlanetName(): string {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
    const suffixes = ['Prime', 'Secundus', 'Tertius', 'Major', 'Minor', 'Nova', 'Centauri'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}-${numbers}`;
  }

  private generatePosition(): Position {
    const mapSize = 10000;
    return {
      x: Math.random() * mapSize - mapSize / 2,
      y: Math.random() * mapSize - mapSize / 2
    };
  }
}
