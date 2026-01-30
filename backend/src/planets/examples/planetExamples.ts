/**
 * Planet Class Usage Examples
 * 
 * Demonstrates how to use the Planet class in various scenarios
 */

import { Planet } from '../Planet';
import { BUILDINGS } from '@shared/constants/buildings';
import type { BuildingType } from '@shared/types/buildings';

// ============================================================================
// Example 1: Creating and Initializing Planets
// ============================================================================

/**
 * Create a new unowned planet (neutral)
 */
function createNeutralPlanet() {
  const planet = new Planet({
    name: 'Alpha Centauri',
    position: { x: 1000, y: 2000 },
    size: 3
  });

  console.log(`Created planet: ${planet.name}`);
  console.log(`Max building slots: ${planet.getMaxBuildingSlots()}`);
  console.log(`Starting resources:`, planet.resources);
  
  return planet;
}

/**
 * Create a player-owned planet with custom resources
 */
function createOwnedPlanet(ownerId: string) {
  const planet = new Planet({
    name: 'Home World',
    position: { x: 0, y: 0 },
    size: 5,
    ownerId,
    resources: {
      minerals: 5000,
      energy: 2500,
      credits: 1000,
      population: 500
    }
  });

  return planet;
}

// ============================================================================
// Example 2: Building Construction
// ============================================================================

/**
 * Build initial infrastructure on a new planet
 */
function setupInitialBuildings(planet: Planet) {
  console.log('\n=== Setting up initial buildings ===');

  // Build mines for mineral production
  const mine1 = planet.addBuilding('mine');
  if (mine1) {
    console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Built mine #1');
  }

  // Build another mine
  planet.addBuilding('mine');
  console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Built mine #2');

  // Build factory for credits
  planet.addBuilding('factory');
  console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Built factory');

  // Build habitat for population
  planet.addBuilding('habitat');
  console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Built habitat');

  // Try to build shipyard (will fail - no prerequisite)
  const canBuildShipyard = planet.canBuild('shipyard');
  if (!canBuildShipyard.canBuild) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Cannot build shipyard: ${canBuildShipyard.reason}`);
  }

  console.log(`Buildings: ${planet.buildings.length}/${planet.getMaxBuildingSlots()}`);
}

/**
 * Advanced building with validation
 */
function buildWithValidation(planet: Planet, type: BuildingType) {
  console.log(`\nAttempting to build ${BUILDINGS[type].name}...`);

  // Check if we can build
  const validation = planet.canBuild(type);
  
  if (!validation.canBuild) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${validation.reason}`);
    return null;
  }

  // Get cost information
  const buildingInfo = BUILDINGS[type];
  const cost = buildingInfo.requirements.cost;
  
  console.log('Cost:', cost);
  console.log('Current resources:', {
    minerals: planet.resources.minerals,
    energy: planet.resources.energy,
    credits: planet.resources.credits
  });

  // Build
  const building = planet.addBuilding(type);
  
  if (building) {
    console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Built successfully!');
    console.log('Remaining resources:', {
      minerals: planet.resources.minerals,
      energy: planet.resources.energy,
      credits: planet.resources.credits
    });
  }

  return building;
}

// ============================================================================
// Example 3: Building Upgrades
// ============================================================================

/**
 * Upgrade buildings to increase production
 */
function upgradeBuildings(planet: Planet) {
  console.log('\n=== Upgrading buildings ===');

  for (const building of planet.buildings) {
    const validation = planet.canUpgrade(building.id);
    
    if (validation.canUpgrade) {
      planet.upgradeBuilding(building.id);
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Upgrading ${building.type} to level ${building.level + 1}`);
    } else {
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Cannot upgrade ${building.type}: ${validation.reason}`);
    }
  }
}

/**
 * Monitor and complete building upgrades
 */
function checkUpgradeStatus(planet: Planet) {
  console.log('\n=== Checking upgrade status ===');

  for (const building of planet.buildings) {
    if (building.isUpgrading && building.upgradeCompleteAt) {
      const timeRemaining = building.upgradeCompleteAt - Date.now();
      
      if (timeRemaining > 0) {
        console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ ${building.type} upgrading: ${Math.ceil(timeRemaining / 1000)}s remaining`);
      } else {
        console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${building.type} upgrade ready to complete!`);
      }
    }
  }
}

// ============================================================================
// Example 4: Production and Resource Management
// ============================================================================

/**
 * Display production information
 */
function showProduction(planet: Planet) {
  console.log('\n=== Production Report ===');

  const production = planet.calculateProduction();
  
  console.log('Resources per second:');
  console.log(`  Minerals: ${production.minerals || 0}/s`);
  console.log(`  Energy: ${production.energy || 0}/s`);
  console.log(`  Credits: ${production.credits || 0}/s`);
  console.log(`  Research: ${production.research || 0}/s`);
  
  if (production.defense) {
    console.log(`\nDefense Rating: ${production.defense}`);
  }
  
  if (production.capacity) {
    console.log(`Population Capacity: ${production.capacity}`);
    console.log(`Current Population: ${Math.floor(planet.resources.population)}`);
  }
}

/**
 * Simulate resource accumulation over time
 */
function simulateProduction(planet: Planet, seconds: number) {
  console.log(`\n=== Simulating ${seconds} seconds of production ===`);

  const before = { ...planet.resources };
  
  // Update in 1-second intervals
  for (let i = 0; i < seconds; i++) {
    planet.update(1);
  }

  const after = planet.resources;

  console.log('Resource changes:');
  console.log(`  Minerals: ${before.minerals.toFixed(0)} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ${after.minerals.toFixed(0)} (+${(after.minerals - before.minerals).toFixed(0)})`);
  console.log(`  Energy: ${before.energy.toFixed(0)} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ${after.energy.toFixed(0)} (+${(after.energy - before.energy).toFixed(0)})`);
  console.log(`  Credits: ${before.credits.toFixed(0)} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ${after.credits.toFixed(0)} (+${(after.credits - before.credits).toFixed(0)})`);
  console.log(`  Population: ${before.population.toFixed(0)} ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ${after.population.toFixed(0)} (+${(after.population - before.population).toFixed(0)})`);
}

// ============================================================================
// Example 5: Planet Statistics
// ============================================================================

/**
 * Display comprehensive planet statistics
 */
function displayPlanetStats(planet: Planet) {
  console.log(`\n=== Planet: ${planet.name} ===`);
  
  const stats = planet.getStats();
  
  console.log('\nInfrastructure:');
  console.log(`  Buildings: ${stats.usedSlots}/${stats.buildingSlots}`);
  console.log(`  Available slots: ${planet.getAvailableSlots()}`);
  
  console.log('\nProduction:');
  console.log(`  Minerals/s: ${stats.totalProduction.minerals || 0}`);
  console.log(`  Energy/s: ${stats.totalProduction.energy || 0}`);
  console.log(`  Credits/s: ${stats.totalProduction.credits || 0}`);
  console.log(`  Research/s: ${stats.totalProduction.research || 0}`);
  
  console.log('\nDefense:');
  console.log(`  Defense Rating: ${stats.defenseRating}`);
  
  console.log('\nPopulation:');
  console.log(`  Current: ${Math.floor(planet.resources.population)}`);
  console.log(`  Capacity: ${stats.populationCapacity}`);
  console.log(`  Utilization: ${((planet.resources.population / stats.populationCapacity) * 100).toFixed(1)}%`);
  
  console.log('\nBuilding Breakdown:');
  for (const building of planet.buildings) {
    const status = building.isUpgrading ? 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦';
    console.log(`  ${status} ${BUILDINGS[building.type].name} (Level ${building.level})`);
  }
}

// ============================================================================
// Example 6: Combat and Damage
// ============================================================================

/**
 * Simulate combat damage to planet
 */
function simulateCombatDamage(planet: Planet) {
  console.log('\n=== Simulating combat damage ===');

  if (planet.buildings.length === 0) {
    console.log('No buildings to damage');
    return;
  }

  // Damage random building
  const building = planet.buildings[0];
  console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Attacking ${BUILDINGS[building.type].name}...`);
  
  planet.damageBuilding(building.id, 30);
  console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ Damage: ${building.damage}%`);

  // More damage
  planet.damageBuilding(building.id, 50);
  console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ Damage: ${building.damage}%`);

  // Check if building still exists
  if (planet.getBuilding(building.id)) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Building damaged but still standing`);
  } else {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ Building destroyed!`);
  }
}

/**
 * Repair damaged buildings
 */
function repairBuildings(planet: Planet) {
  console.log('\n=== Repairing damaged buildings ===');

  for (const building of planet.buildings) {
    if (building.damage && building.damage > 0) {
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ Repairing ${BUILDINGS[building.type].name} (${building.damage}% damaged)`);
      planet.repairBuilding(building.id);
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Repaired!`);
    }
  }
}

// ============================================================================
// Example 7: Game Loop Integration
// ============================================================================

/**
 * Game tick update
 */
function gameTick(planet: Planet, deltaTime: number = 1) {
  // Update planet resources and complete upgrades
  planet.update(deltaTime);

  // Check for completed upgrades
  for (const building of planet.buildings) {
    if (!building.isUpgrading && building.level > 1) {
      // Building was just upgraded in this tick
      // Could trigger events, notifications, etc.
    }
  }
}

/**
 * Run game loop
 */
function startGameLoop(planet: Planet) {
  console.log('\n=== Starting game loop ===');
  
  let ticks = 0;
  const interval = setInterval(() => {
    gameTick(planet);
    ticks++;

    if (ticks % 10 === 0) {
      console.log(`Tick ${ticks}: Minerals=${planet.resources.minerals.toFixed(0)}`);
    }

    if (ticks >= 30) {
      clearInterval(interval);
      console.log('=== Game loop stopped ===');
    }
  }, 1000);
}

// ============================================================================
// Example 8: Complete Scenario
// ============================================================================

/**
 * Complete gameplay scenario
 */
function completeScenario() {
  console.log('\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ === COMPLETE PLANET MANAGEMENT SCENARIO === ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸\n');

  // 1. Create planet
  const planet = new Planet({
    name: 'New Terra',
    position: { x: 1500, y: 2500 },
    size: 4,
    ownerId: 'player-123',
    resources: {
      minerals: 2000,
      energy: 1000,
      credits: 500,
      population: 200
    }
  });

  displayPlanetStats(planet);

  // 2. Build infrastructure
  setupInitialBuildings(planet);

  // 3. Show production
  showProduction(planet);

  // 4. Simulate some time
  simulateProduction(planet, 30);

  // 5. Upgrade buildings
  upgradeBuildings(planet);

  // 6. Check upgrade status
  checkUpgradeStatus(planet);

  // 7. Display final stats
  displayPlanetStats(planet);

  return planet;
}

// ============================================================================
// Export Examples
// ============================================================================

export {
  createNeutralPlanet,
  createOwnedPlanet,
  setupInitialBuildings,
  buildWithValidation,
  upgradeBuildings,
  checkUpgradeStatus,
  showProduction,
  simulateProduction,
  displayPlanetStats,
  simulateCombatDamage,
  repairBuildings,
  gameTick,
  startGameLoop,
  completeScenario
};

// Run scenario if executed directly
if (require.main === module) {
  completeScenario();
}
