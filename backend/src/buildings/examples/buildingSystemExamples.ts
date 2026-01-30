/**
 * Building System Usage Examples
 * 
 * Demonstrates how to use the building system in various scenarios
 */

import { buildingSystem } from '../BuildingSystem';
import { constructionQueueManager } from '../ConstructionQueueManager';
import { BuildingType } from '@shared/types/buildingSystem';
import {
  getBuildingStats,
  getBuildingName,
  getBuildingDescription,
  calculateBuildingCost
} from '@shared/constants/buildingSystem';

// ============================================================================
// Example 1: Starting Construction
// ============================================================================

/**
 * Start building a metal mine
 */
function buildMetalMine() {
  const planetId = 'planet-001';
  const playerResources = {
    metal: 500,
    energy: 300,
    crystal: 100
  };

  const result = buildingSystem.startConstruction(
    planetId,
    BuildingType.MetalMine,
    playerResources,
    [], // No existing buildings
    0,  // No shipyard
    100 // Population
  );

  if (result.success) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Construction started!`);
    console.log(`Completes at: ${new Date(result.completesAt!)}`);
    console.log(`Queue position: ${result.queuePosition}`);
    
    // Deduct resources
    const cost = calculateBuildingCost(BuildingType.MetalMine, 1);
    const newResources = buildingSystem.deductResources(playerResources, cost);
    console.log(`Remaining resources:`, newResources);
  } else {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Construction failed: ${result.message}`);
  }
}

// ============================================================================
// Example 2: Checking Resources Before Building
// ============================================================================

/**
 * Check if player can afford a building
 */
function canAffordBuilding(
  buildingType: BuildingType,
  level: number,
  playerResources: { metal: number; energy: number; crystal: number }
) {
  const cost = calculateBuildingCost(buildingType, level);
  const check = buildingSystem.checkResources(playerResources, cost);

  console.log(`\nBuilding: ${getBuildingName(buildingType)} Level ${level}`);
  console.log(`Cost: ${cost.metal}M, ${cost.energy}E, ${cost.crystal}C`);
  
  if (check.hasResources) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Can afford`);
    return true;
  } else {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${check.message}`);
    console.log(`Missing:`, check.missing);
    return false;
  }
}

// ============================================================================
// Example 3: Building with Prerequisites
// ============================================================================

/**
 * Build a shipyard (requires Command Center level 2)
 */
function buildShipyard() {
  const planetId = 'planet-001';
  const playerResources = {
    metal: 1000,
    energy: 600,
    crystal: 300
  };

  // First, check if we have Command Center
  const existingBuildings = [
    buildingSystem.createBuilding('command_center' as BuildingType, 2)
  ];

  const result = buildingSystem.startConstruction(
    planetId,
    BuildingType.Shipyard,
    playerResources,
    existingBuildings,
    0,
    100 // Requires 50 population
  );

  if (result.success) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Shipyard construction started!`);
  } else {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Cannot build shipyard: ${result.message}`);
  }
}

// ============================================================================
// Example 4: Upgrading Buildings
// ============================================================================

/**
 * Upgrade a building to next level
 */
function upgradeBuilding() {
  const planetId = 'planet-001';
  const building = buildingSystem.createBuilding(BuildingType.MetalMine, 3);
  
  const playerResources = {
    metal: 500,
    energy: 300,
    crystal: 100
  };

  console.log(`\nUpgrading ${getBuildingName(building.type)} from level ${building.level}`);

  const result = buildingSystem.startUpgrade(
    planetId,
    building.id,
    building.level,
    building.type,
    playerResources,
    0 // No shipyard bonus
  );

  if (result.success) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Upgrade queued to level ${result.queuedBuilding?.targetLevel}`);
    console.log(`Build time: ${result.queuedBuilding?.buildTime}s`);
    console.log(`Completes: ${new Date(result.completesAt!)}`);
  } else {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Upgrade failed: ${result.message}`);
  }
}

// ============================================================================
// Example 5: Managing Construction Queue
// ============================================================================

/**
 * Build multiple structures and manage queue
 */
function manageConstructionQueue() {
  const planetId = 'planet-001';
  const playerResources = {
    metal: 2000,
    energy: 1000,
    crystal: 500
  };

  // Initialize queue with Command Center level 2 (increases queue size)
  const buildings = [
    buildingSystem.createBuilding('command_center' as BuildingType, 2)
  ];
  
  constructionQueueManager.initializeQueue(planetId, 2);

  // Queue multiple buildings
  const buildingsToQueue = [
    BuildingType.MetalMine,
    BuildingType.EnergyPlant,
    BuildingType.CrystalMine,
    BuildingType.Storage
  ];

  console.log(`\n=== Construction Queue ===`);
  
  let resources = { ...playerResources };
  
  for (const type of buildingsToQueue) {
    const result = buildingSystem.startConstruction(
      planetId,
      type,
      resources,
      buildings,
      0,
      100
    );

    if (result.success) {
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${getBuildingName(type)} queued`);
      // Deduct resources
      const cost = calculateBuildingCost(type, 1);
      resources = buildingSystem.deductResources(resources, cost);
    } else {
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ ${getBuildingName(type)}: ${result.message}`);
    }
  }

  // Check queue status
  const stats = constructionQueueManager.getQueueStats(planetId);
  console.log(`\nQueue: ${stats?.queuedCount}/${stats?.maxQueueSize}`);
  console.log(`Available slots: ${stats?.availableSlots}`);

  // List all constructions
  const allConstructions = constructionQueueManager.getAllConstructions(planetId);
  console.log(`\nAll constructions:`);
  allConstructions.forEach((c, i) => {
    const timeLeft = Math.ceil((c.completesAt - Date.now()) / 1000);
    console.log(`${i + 1}. ${getBuildingName(c.type as BuildingType)} - ${timeLeft}s remaining`);
  });
}

// ============================================================================
// Example 6: Calculating Production
// ============================================================================

/**
 * Calculate total resource production from buildings
 */
function calculateProduction() {
  const buildings = [
    buildingSystem.createBuilding(BuildingType.MetalMine, 5),
    buildingSystem.createBuilding(BuildingType.MetalMine, 3),
    buildingSystem.createBuilding(BuildingType.EnergyPlant, 4),
    buildingSystem.createBuilding(BuildingType.CrystalMine, 2),
    buildingSystem.createBuilding(BuildingType.ResearchLab, 3)
  ];

  const production = buildingSystem.getTotalProduction(buildings);

  console.log(`\n=== Production Report ===`);
  console.log(`Metal: ${production.metal}/hour`);
  console.log(`Energy: ${production.energy}/hour`);
  console.log(`Crystal: ${production.crystal}/hour`);
  console.log(`Research: ${production.research}/hour`);

  if (production.energy < 0) {
    console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â  Energy deficit: ${Math.abs(production.energy)}/hour`);
    console.log(`Recommendation: Build more Energy Plants`);
  }
}

// ============================================================================
// Example 7: Build Time with Shipyard Bonus
// ============================================================================

/**
 * Show how shipyard reduces build times
 */
function demonstrateShipyardBonus() {
  const buildings = [
    buildingSystem.createBuilding(BuildingType.Shipyard, 1),
    buildingSystem.createBuilding(BuildingType.Shipyard, 5),
    buildingSystem.createBuilding(BuildingType.Shipyard, 10)
  ];

  console.log(`\n=== Shipyard Build Time Bonus ===`);
  console.log(`Building: Defense Grid Level 1`);

  buildings.forEach(shipyard => {
    const time = buildingSystem.calculateBuildTimeWithBonuses(
      BuildingType.Defense,
      1,
      [shipyard]
    );

    const reduction = Math.round((1 - time / 90) * 100); // 90s is base time
    console.log(`Shipyard L${shipyard.level}: ${time}s (-${reduction}%)`);
  });
}

// ============================================================================
// Example 8: Complete Building Workflow
// ============================================================================

/**
 * Complete workflow from planning to completion
 */
async function completeBuildingWorkflow() {
  console.log(`\n=== Complete Building Workflow ===\n`);

  const planetId = 'planet-001';
  let playerResources = {
    metal: 1000,
    energy: 500,
    crystal: 200
  };

  let buildings: any[] = [];

  // Step 1: Plan buildings
  console.log(`Step 1: Planning infrastructure`);
  const buildPlan = [
    { type: BuildingType.MetalMine, priority: 1 },
    { type: BuildingType.EnergyPlant, priority: 1 },
    { type: BuildingType.Storage, priority: 2 }
  ];

  // Step 2: Check costs
  console.log(`\nStep 2: Checking costs`);
  for (const plan of buildPlan) {
    canAffordBuilding(plan.type, 1, playerResources);
  }

  // Step 3: Build in priority order
  console.log(`\nStep 3: Starting construction`);
  constructionQueueManager.initializeQueue(planetId, 0);

  for (const plan of buildPlan) {
    const result = buildingSystem.startConstruction(
      planetId,
      plan.type,
      playerResources,
      buildings,
      0,
      100
    );

    if (result.success) {
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${getBuildingName(plan.type)} queued`);
      const cost = calculateBuildingCost(plan.type, 1);
      playerResources = buildingSystem.deductResources(playerResources, cost);
    }
  }

  // Step 4: Monitor queue
  console.log(`\nStep 4: Monitoring queue`);
  const stats = constructionQueueManager.getQueueStats(planetId);
  console.log(`Queue status: ${stats?.queuedCount} buildings in progress`);

  // Step 5: Simulate completion
  console.log(`\nStep 5: Simulating completion...`);
  setTimeout(() => {
    const completed = constructionQueueManager.checkCompletions(planetId);
    if (completed.length > 0) {
      console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${completed.length} building(s) completed!`);
      completed.forEach(c => {
        const newBuilding = buildingSystem.createBuilding(c.type as BuildingType, c.targetLevel);
        buildings.push(newBuilding);
        console.log(`  - ${getBuildingName(c.type as BuildingType)} level ${c.targetLevel}`);
      });
    }

    // Step 6: Calculate new production
    console.log(`\nStep 6: New production rates`);
    const production = buildingSystem.getTotalProduction(buildings);
    console.log(`Metal: +${production.metal}/hour`);
    console.log(`Energy: ${production.energy}/hour`);
  }, 2000);
}

// ============================================================================
// Example 9: Getting Building Information
// ============================================================================

/**
 * Display building information and stats
 */
function displayBuildingInfo(type: BuildingType, level: number) {
  const stats = getBuildingStats(type, level);

  console.log(`\n=== ${getBuildingName(type)} Level ${level} ===`);
  console.log(getBuildingDescription(type));
  console.log(`\nCost:`);
  console.log(`  Metal: ${stats.cost.metal}`);
  console.log(`  Energy: ${stats.cost.energy}`);
  console.log(`  Crystal: ${stats.cost.crystal}`);
  console.log(`\nBuild Time: ${stats.buildTime}s`);
  console.log(`\nProduction:`);
  
  Object.entries(stats.productionBonus).forEach(([key, value]) => {
    if (value !== 0) {
      const sign = value > 0 ? '+' : '';
      console.log(`  ${key}: ${sign}${value}/hour`);
    }
  });

  console.log(`\nMax Level: ${stats.maxLevel}`);
}

// ============================================================================
// Run Examples
// ============================================================================

if (require.main === module) {
  console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â  Building System Examples\n');
  
  // Run examples
  displayBuildingInfo(BuildingType.MetalMine, 1);
  displayBuildingInfo(BuildingType.Shipyard, 1);
  
  buildMetalMine();
  upgradeBuilding();
  manageConstructionQueue();
  calculateProduction();
  demonstrateShipyardBonus();
  completeBuildingWorkflow();
}

export {
  buildMetalMine,
  canAffordBuilding,
  buildShipyard,
  upgradeBuilding,
  manageConstructionQueue,
  calculateProduction,
  demonstrateShipyardBonus,
  completeBuildingWorkflow,
  displayBuildingInfo
};
