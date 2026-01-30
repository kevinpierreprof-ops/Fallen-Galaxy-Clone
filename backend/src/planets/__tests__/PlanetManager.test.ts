import { PlanetManager } from '../PlanetManager';

describe('PlanetManager', () => {
  let planetManager: PlanetManager;

  beforeEach(() => {
    planetManager = new PlanetManager();
  });

  test('should generate planets', () => {
    planetManager.generatePlanets(10);
    const planets = planetManager.getPlanets();
    expect(planets).toHaveLength(10);
  });

  test('should assign starting planet to player', () => {
    planetManager.generatePlanets(5);
    const planet = planetManager.assignStartingPlanet('player-1');
    
    expect(planet).toBeDefined();
    expect(planet?.ownerId).toBe('player-1');
    expect(planet?.population).toBeGreaterThan(0);
  });

  test('should colonize unowned planet', () => {
    planetManager.generatePlanets(1);
    const planets = planetManager.getPlanets();
    const planetId = planets[0].id;
    
    const success = planetManager.colonizePlanet(planetId, 'player-1');
    expect(success).toBe(true);
    
    const planet = planetManager.getPlanet(planetId);
    expect(planet?.ownerId).toBe('player-1');
  });

  test('should not colonize owned planet', () => {
    planetManager.generatePlanets(1);
    const planets = planetManager.getPlanets();
    const planetId = planets[0].id;
    
    planetManager.colonizePlanet(planetId, 'player-1');
    const success = planetManager.colonizePlanet(planetId, 'player-2');
    
    expect(success).toBe(false);
  });

  test('should calculate production from multiple planets', () => {
    planetManager.generatePlanets(3);
    const planets = planetManager.getPlanets();
    const planetIds = planets.map(p => p.id);
    
    planets.forEach(p => p.ownerId = 'player-1');
    
    const production = planetManager.calculateProduction(planetIds);
    expect(production.minerals).toBeGreaterThan(0);
    expect(production.energy).toBeGreaterThan(0);
    expect(production.credits).toBeGreaterThan(0);
  });
});
