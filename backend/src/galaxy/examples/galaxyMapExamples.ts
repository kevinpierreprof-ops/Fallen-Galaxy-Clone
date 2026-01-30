/**
 * Galaxy Map Generator Examples
 * 
 * Demonstrates various usage scenarios for galaxy map generation
 */

import { GalaxyMapGenerator } from '../GalaxyMapGenerator';
import type { GalaxyMapConfig } from '@shared/types/galaxyMap';
import { writeFileSync } from 'fs';
import path from 'path';

// ============================================================================
// Example 1: Basic Galaxy Generation
// ============================================================================

/**
 * Generate a basic galaxy map
 */
function generateBasicGalaxy() {
  console.log('\n=== Example 1: Basic Galaxy Generation ===\n');

  const playerIds = ['player-1', 'player-2', 'player-3', 'player-4'];

  const generator = new GalaxyMapGenerator({
    width: 100,
    height: 100,
    numPlayers: 4,
    neutralPlanets: 30,
    seed: 'basic-galaxy-001'
  });

  const galaxyMap = generator.generate(playerIds);

  console.log(`Galaxy ID: ${galaxyMap.id}`);
  console.log(`Seed: ${galaxyMap.seed}`);
  console.log(`Dimensions: ${galaxyMap.dimensions.width}x${galaxyMap.dimensions.height}`);
  console.log(`Total Planets: ${galaxyMap.planets.length}`);

  // Show starting planets
  const startingPlanets = galaxyMap.planets.filter(p => p.isStartingPlanet);
  console.log(`\nStarting Planets:`);
  startingPlanets.forEach(p => {
    console.log(`  - ${p.name} owned by ${p.ownerId} at (${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)})`);
  });

  return galaxyMap;
}

// ============================================================================
// Example 2: Custom Resource Distribution
// ============================================================================

/**
 * Generate galaxy with custom resource distribution
 */
function generateCustomResourceGalaxy() {
  console.log('\n=== Example 2: Custom Resource Distribution ===\n');

  const config: GalaxyMapConfig = {
    width: 150,
    height: 150,
    numPlayers: 2,
    neutralPlanets: 50,
    seed: 'resource-rich-galaxy',
    minPlanetDistance: 8,
    minPlayerDistance: 40,
    resourceDistribution: {
      poor: 10,      // Only 10% poor planets
      normal: 30,
      rich: 40,      // 40% rich
      abundant: 20   // 20% abundant
    }
  };

  const generator = new GalaxyMapGenerator(config);
  const galaxyMap = generator.generate(['player-1', 'player-2']);

  // Analyze resource distribution
  const resourceCounts = {
    poor: 0,
    normal: 0,
    rich: 0,
    abundant: 0
  };

  galaxyMap.planets.forEach(p => {
    if (!p.isStartingPlanet) {
      resourceCounts[p.resourceLevel]++;
    }
  });

  console.log('Resource Distribution:');
  console.log(`  Poor: ${resourceCounts.poor} (${(resourceCounts.poor / 50 * 100).toFixed(1)}%)`);
  console.log(`  Normal: ${resourceCounts.normal} (${(resourceCounts.normal / 50 * 100).toFixed(1)}%)`);
  console.log(`  Rich: ${resourceCounts.rich} (${(resourceCounts.rich / 50 * 100).toFixed(1)}%)`);
  console.log(`  Abundant: ${resourceCounts.abundant} (${(resourceCounts.abundant / 50 * 100).toFixed(1)}%)`);

  return galaxyMap;
}

// ============================================================================
// Example 3: Large Multiplayer Galaxy
// ============================================================================

/**
 * Generate large galaxy for many players
 */
function generateLargeMultiplayerGalaxy() {
  console.log('\n=== Example 3: Large Multiplayer Galaxy ===\n');

  const numPlayers = 8;
  const playerIds = Array.from({ length: numPlayers }, (_, i) => `player-${i + 1}`);

  const config: GalaxyMapConfig = {
    width: 200,
    height: 200,
    numPlayers,
    neutralPlanets: 100,
    seed: 'large-multiplayer-001',
    minPlanetDistance: 6,
    minPlayerDistance: 50,
    resourceDistribution: {
      poor: 30,
      normal: 40,
      rich: 20,
      abundant: 10
    }
  };

  const generator = new GalaxyMapGenerator(config);
  const galaxyMap = generator.generate(playerIds);

  const stats = generator.getStats();

  console.log('Galaxy Statistics:');
  console.log(`  Total Planets: ${stats.totalPlanets}`);
  console.log(`  Starting Planets: ${stats.startingPlanets}`);
  console.log(`  Neutral Planets: ${stats.neutralPlanets}`);
  console.log(`  Average Planet Distance: ${stats.averagePlanetDistance.toFixed(2)}`);
  console.log(`  Minimum Player Distance: ${stats.minPlayerDistance.toFixed(2)}`);

  return galaxyMap;
}

// ============================================================================
// Example 4: Reproducible Map Generation
// ============================================================================

/**
 * Demonstrate seed-based reproducibility
 */
function demonstrateReproducibility() {
  console.log('\n=== Example 4: Reproducible Map Generation ===\n');

  const seed = 'reproducible-seed-12345';
  const playerIds = ['player-1', 'player-2'];

  // Generate first map
  const gen1 = new GalaxyMapGenerator({ seed, numPlayers: 2, neutralPlanets: 10 });
  const map1 = gen1.generate(playerIds);

  // Generate second map with same seed
  const gen2 = new GalaxyMapGenerator({ seed, numPlayers: 2, neutralPlanets: 10 });
  const map2 = gen2.generate(playerIds);

  console.log('Comparing two maps generated with same seed:');
  console.log(`  Map 1 planet count: ${map1.planets.length}`);
  console.log(`  Map 2 planet count: ${map2.planets.length}`);

  // Check if planets match
  let allMatch = true;
  for (let i = 0; i < map1.planets.length; i++) {
    const p1 = map1.planets[i];
    const p2 = map2.planets[i];

    if (p1.position.x !== p2.position.x || p1.position.y !== p2.position.y) {
      allMatch = false;
      break;
    }
  }

  console.log(`  All planets match: ${allMatch ? 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Yes' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ No'}`);
}

// ============================================================================
// Example 5: Finding Nearest Planets
// ============================================================================

/**
 * Find nearest unoccupied planets
 */
function findNearestPlanets() {
  console.log('\n=== Example 5: Finding Nearest Planets ===\n');

  const generator = new GalaxyMapGenerator({
    width: 100,
    height: 100,
    numPlayers: 2,
    neutralPlanets: 20,
    seed: 'nearest-search'
  });

  const galaxyMap = generator.generate(['player-1', 'player-2']);

  // Find nearest unoccupied planet from center
  const centerPos = { x: 50, y: 50 };
  const result = generator.findNearestUnoccupiedPlanet(centerPos);

  if (result.planet) {
    console.log(`Nearest planet from center (50, 50):`);
    console.log(`  Name: ${result.planet.name}`);
    console.log(`  Position: (${result.planet.position.x.toFixed(1)}, ${result.planet.position.y.toFixed(1)})`);
    console.log(`  Distance: ${result.distance.toFixed(2)}`);
    console.log(`  Resource Level: ${result.planet.resourceLevel}`);
  }

  // Find nearest planets for each player
  const startingPlanets = galaxyMap.planets.filter(p => p.isStartingPlanet);
  console.log(`\nNearest unoccupied planet for each player:`);
  
  startingPlanets.forEach(sp => {
    const nearest = generator.findNearestUnoccupiedPlanet(sp.position);
    if (nearest.planet) {
      console.log(`  ${sp.ownerId}: ${nearest.planet.name} (${nearest.distance.toFixed(2)} units away)`);
    }
  });
}

// ============================================================================
// Example 6: Exporting to JSON
// ============================================================================

/**
 * Export galaxy map to JSON file
 */
function exportToJSON() {
  console.log('\n=== Example 6: Exporting to JSON ===\n');

  const generator = new GalaxyMapGenerator({
    width: 100,
    height: 100,
    numPlayers: 3,
    neutralPlanets: 25,
    seed: 'export-example'
  });

  const galaxyMap = generator.generate(['player-1', 'player-2', 'player-3']);

  // Export to JSON
  const json = GalaxyMapGenerator.exportToJSON(galaxyMap);

  console.log('Exported galaxy map to JSON');
  console.log(`JSON size: ${json.length} characters`);

  // Save to file (optional)
  const outputPath = path.join(process.cwd(), 'galaxy-map.json');
  try {
    writeFileSync(outputPath, json, 'utf-8');
    console.log(`Saved to: ${outputPath}`);
  } catch (error) {
    console.log('(File save skipped in example)');
  }

  // Import it back
  const imported = GalaxyMapGenerator.importFromJSON(json);
  console.log(`\nImported galaxy map:`);
  console.log(`  ID: ${imported.id}`);
  console.log(`  Planets: ${imported.planets.length}`);
  console.log(`  Seed: ${imported.seed}`);

  return json;
}

// ============================================================================
// Example 7: Map Regeneration
// ============================================================================

/**
 * Regenerate galaxy from existing map data
 */
function regenerateMap() {
  console.log('\n=== Example 7: Map Regeneration ===\n');

  // Generate original map
  const generator = new GalaxyMapGenerator({
    width: 100,
    height: 100,
    numPlayers: 2,
    neutralPlanets: 15,
    seed: 'regen-test'
  });

  const originalMap = generator.generate(['player-1', 'player-2']);
  console.log('Original map generated');
  console.log(`  Seed: ${originalMap.seed}`);

  // Regenerate from map data
  const regenerated = GalaxyMapGenerator.regenerate(
    originalMap,
    ['player-1', 'player-2']
  );

  console.log('\nRegenerated map');
  console.log(`  Seed: ${regenerated.seed}`);
  console.log(`  Planets match: ${originalMap.planets.length === regenerated.planets.length}`);
}

// ============================================================================
// Example 8: Different Map Sizes
// ============================================================================

/**
 * Compare different map sizes
 */
function compareSizes() {
  console.log('\n=== Example 8: Different Map Sizes ===\n');

  const sizes = [
    { name: 'Small', width: 50, height: 50, neutralPlanets: 10 },
    { name: 'Medium', width: 100, height: 100, neutralPlanets: 30 },
    { name: 'Large', width: 200, height: 200, neutralPlanets: 80 },
    { name: 'Huge', width: 300, height: 300, neutralPlanets: 150 }
  ];

  const playerIds = ['player-1', 'player-2', 'player-3', 'player-4'];

  sizes.forEach(size => {
    const generator = new GalaxyMapGenerator({
      width: size.width,
      height: size.height,
      numPlayers: 4,
      neutralPlanets: size.neutralPlanets,
      seed: `${size.name.toLowerCase()}-map`
    });

    const map = generator.generate(playerIds);
    const stats = generator.getStats();

    console.log(`${size.name} Map (${size.width}x${size.height}):`);
    console.log(`  Total Planets: ${stats.totalPlanets}`);
    console.log(`  Avg Distance: ${stats.averagePlanetDistance.toFixed(2)}`);
    console.log(`  Min Player Distance: ${stats.minPlayerDistance.toFixed(2)}`);
    console.log('');
  });
}

// ============================================================================
// Run Examples
// ============================================================================

if (require.main === module) {
  console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Galaxy Map Generator Examples\n');

  generateBasicGalaxy();
  generateCustomResourceGalaxy();
  generateLargeMultiplayerGalaxy();
  demonstrateReproducibility();
  findNearestPlanets();
  exportToJSON();
  regenerateMap();
  compareSizes();

  console.log('\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ All examples completed!');
}

export {
  generateBasicGalaxy,
  generateCustomResourceGalaxy,
  generateLargeMultiplayerGalaxy,
  demonstrateReproducibility,
  findNearestPlanets,
  exportToJSON,
  regenerateMap,
  compareSizes
};
