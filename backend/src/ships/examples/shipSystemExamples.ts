/**
 * Ship System Usage Examples
 * 
 * Demonstrates various ship operations and fleet management
 */

import { ShipClass } from '../Ship';
import { FleetManager } from '../FleetManager';
import { ShipType, ShipStatus } from '@shared/types/ships';
import { 
  SHIP_DISPLAY_NAMES, 
  SHIP_COSTS,
  SHIP_DESCRIPTIONS 
} from '@shared/constants/shipSystem';

// ============================================================================
// Example 1: Creating and Managing Ships
// ============================================================================

/**
 * Create different types of ships
 */
function createShips() {
  console.log('\n=== Example 1: Creating Ships ===\n');

  const ownerId = 'player-1';
  const planetId = 'planet-home';

  // Create explorer
  const explorer = new ShipClass(ShipType.Explorer, ownerId, planetId, 'USS Discovery');
  console.log(`Created: ${explorer.name} (${SHIP_DISPLAY_NAMES[explorer.type]})`);
  console.log(`Stats: Speed=${explorer.stats.speed}, Attack=${explorer.stats.attack}`);

  // Create miner
  const miner = new ShipClass(ShipType.Miner, ownerId, planetId);
  console.log(`\nCreated: ${miner.name}`);
  console.log(`Cargo Capacity: ${miner.cargo.capacity}`);

  // Create battleship
  const battleship = new ShipClass(ShipType.Battleship, ownerId, planetId);
  console.log(`\nCreated: ${battleship.name}`);
  console.log(`Combat Power: ${battleship.stats.attack} attack, ${battleship.stats.defense} defense`);

  return { explorer, miner, battleship };
}

// ============================================================================
// Example 2: Ship Movement
// ============================================================================

/**
 * Move ship between planets
 */
function shipMovement() {
  console.log('\n=== Example 2: Ship Movement ===\n');

  const ship = new ShipClass(ShipType.Fighter, 'player-1', 'planet-1');

  const origin = { x: 10, y: 10 };
  const destination = { x: 50, y: 50 };

  // Calculate travel
  const travel = ship.calculateTravel(origin, destination);
  console.log(`Distance: ${travel.distance.toFixed(2)} units`);
  console.log(`Travel Time: ${travel.travelTime} seconds`);
  console.log(`Fuel Cost: ${travel.fuelCost.toFixed(2)}`);

  // Move ship
  const result = ship.moveTo('planet-2', destination, origin);
  if (result.success) {
    console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${result.message}`);
    console.log(`Status: ${ship.status}`);
    console.log(`ETA: ${new Date(result.data.arrivalTime).toLocaleTimeString()}`);
  }

  // Check remaining time
  const remaining = ship.getRemainingTravelTime();
  console.log(`\nTime remaining: ${remaining}s`);
}

// ============================================================================
// Example 3: Mining Operations
// ============================================================================

/**
 * Mining resources with a miner ship
 */
function miningOperations() {
  console.log('\n=== Example 3: Mining Operations ===\n');

  const miner = new ShipClass(ShipType.Miner, 'player-1', 'planet-resource');

  console.log(`Ship: ${miner.name}`);
  console.log(`Cargo Capacity: ${miner.cargo.capacity}`);

  // Start mining
  const mineResult = miner.mine('planet-resource', 'minerals', 3600);

  if (mineResult.success) {
    console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${mineResult.message}`);
    console.log(`Mining ${mineResult.data.amount} minerals`);
    console.log(`Duration: ${(mineResult.data.endTime - mineResult.data.startTime) / 1000}s`);
  }

  // Simulate time passing and completion
  console.log('\n--- After mining completes ---');
  
  // Force completion for demo
  (miner as any).miningOperation.endTime = Date.now() - 1000;
  
  const completed = miner.completeMining();
  if (completed) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Mined ${completed.amount} ${completed.resourceType}`);
    console.log(`Cargo: ${miner.cargo.minerals} minerals`);
    console.log(`Cargo Usage: ${miner.cargo.current}/${miner.cargo.capacity}`);
  }
}

// ============================================================================
// Example 4: Cargo Management
// ============================================================================

/**
 * Loading and unloading cargo
 */
function cargoManagement() {
  console.log('\n=== Example 4: Cargo Management ===\n');

  const transport = new ShipClass(ShipType.Transport, 'player-1', 'planet-1');

  console.log(`Transport: ${transport.name}`);
  console.log(`Cargo Capacity: ${transport.cargo.capacity}`);

  // Load minerals
  transport.loadCargo('minerals', 500);
  console.log(`\nLoaded 500 minerals`);
  console.log(`Cargo: ${transport.cargo.current}/${transport.cargo.capacity}`);

  // Load energy
  transport.loadCargo('energy', 300);
  console.log(`\nLoaded 300 energy`);
  console.log(`Current cargo breakdown:`);
  console.log(`  Minerals: ${transport.cargo.minerals}`);
  console.log(`  Energy: ${transport.cargo.energy}`);
  console.log(`  Total: ${transport.cargo.current}/${transport.cargo.capacity}`);

  // Unload some cargo
  const unloaded = transport.unloadCargo('minerals', 200);
  console.log(`\nUnloaded ${unloaded} minerals`);
  console.log(`Remaining minerals: ${transport.cargo.minerals}`);
}

// ============================================================================
// Example 5: Combat Operations
// ============================================================================

/**
 * Ship combat
 */
function combatOperations() {
  console.log('\n=== Example 5: Combat Operations ===\n');

  const attacker = new ShipClass(ShipType.Cruiser, 'player-1', 'planet-battle');
  const defender = new ShipClass(ShipType.Fighter, 'player-2', 'planet-battle');

  console.log(`Attacker: ${attacker.name}`);
  console.log(`  HP: ${attacker.stats.health}/${attacker.stats.maxHealth}`);
  console.log(`  Attack: ${attacker.stats.attack}`);
  console.log(`  Defense: ${attacker.stats.defense}`);

  console.log(`\nDefender: ${defender.name}`);
  console.log(`  HP: ${defender.stats.health}/${defender.stats.maxHealth}`);
  console.log(`  Attack: ${defender.stats.attack}`);
  console.log(`  Defense: ${defender.stats.defense}`);

  // Initiate attack
  const attackResult = attacker.attack(defender.id);
  console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ${attackResult.message}`);

  // Defender takes damage
  console.log(`\n--- Combat Round 1 ---`);
  const destroyed = defender.takeDamage(attacker.stats.attack);
  console.log(`Defender took ${attacker.stats.attack} damage`);
  console.log(`Defender HP: ${defender.stats.health}/${defender.stats.maxHealth}`);
  console.log(`Destroyed: ${destroyed ? 'Yes' : 'No'}`);

  // Counter attack
  attacker.takeDamage(defender.stats.attack);
  console.log(`\nAttacker took ${defender.stats.attack} damage`);
  console.log(`Attacker HP: ${attacker.stats.health}/${attacker.stats.maxHealth}`);
}

// ============================================================================
// Example 6: Ship Repair
// ============================================================================

/**
 * Repairing damaged ships
 */
function shipRepair() {
  console.log('\n=== Example 6: Ship Repair ===\n');

  const ship = new ShipClass(ShipType.Battleship, 'player-1', 'planet-shipyard');

  // Damage the ship
  ship.takeDamage(200);
  console.log(`Ship damaged: ${ship.stats.health}/${ship.stats.maxHealth} HP`);

  // Repair
  const repairResult = ship.repair(100);
  
  if (repairResult.success) {
    console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ ${repairResult.message}`);
    console.log(`Repair Cost:`);
    console.log(`  Minerals: ${repairResult.data.cost.minerals}`);
    console.log(`  Energy: ${repairResult.data.cost.energy}`);
    console.log(`  Crystal: ${repairResult.data.cost.crystal}`);
    console.log(`Repair Time: ${repairResult.data.repairTime}s`);
    console.log(`\nShip HP after repair: ${ship.stats.health}/${ship.stats.maxHealth}`);
  }
}

// ============================================================================
// Example 7: Fleet Management
// ============================================================================

/**
 * Creating and managing fleets
 */
function fleetManagement() {
  console.log('\n=== Example 7: Fleet Management ===\n');

  const fleetManager = new FleetManager();
  const ownerId = 'player-1';
  const planetId = 'planet-home';

  // Create ships
  const fighter1 = new ShipClass(ShipType.Fighter, ownerId, planetId);
  const fighter2 = new ShipClass(ShipType.Fighter, ownerId, planetId);
  const cruiser = new ShipClass(ShipType.Cruiser, ownerId, planetId);

  // Register ships
  fleetManager.registerShip(fighter1);
  fleetManager.registerShip(fighter2);
  fleetManager.registerShip(cruiser);

  // Create fleet
  const fleet = fleetManager.createFleet(
    ownerId,
    'Alpha Squadron',
    [fighter1.id, fighter2.id, cruiser.id]
  );

  if (fleet) {
    console.log(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Fleet created: ${fleet.name}`);
    console.log(`Ships: ${fleet.ships.length}`);

    // Get fleet stats
    const stats = fleetManager.getFleetStats(fleet.id);
    console.log(`\nFleet Statistics:`);
    console.log(`  Total Attack: ${stats.totalAttack}`);
    console.log(`  Total Defense: ${stats.totalDefense}`);
    console.log(`  Total Health: ${stats.totalHealth}`);
    console.log(`  Average Speed: ${stats.avgSpeed.toFixed(2)}`);
  }
}

// ============================================================================
// Example 8: Fleet Movement
// ============================================================================

/**
 * Moving fleets together
 */
function fleetMovement() {
  console.log('\n=== Example 8: Fleet Movement ===\n');

  const fleetManager = new FleetManager();
  const ownerId = 'player-1';
  const planetId = 'planet-1';

  // Create fleet with different speed ships
  const fighter = new ShipClass(ShipType.Fighter, ownerId, planetId); // Fast
  const battleship = new ShipClass(ShipType.Battleship, ownerId, planetId); // Slow

  fleetManager.registerShip(fighter);
  fleetManager.registerShip(battleship);

  const fleet = fleetManager.createFleet(
    ownerId,
    'Strike Force',
    [fighter.id, battleship.id]
  );

  console.log(`Fleet: ${fleet?.name}`);
  console.log(`Fighter speed: ${fighter.stats.speed}`);
  console.log(`Battleship speed: ${battleship.stats.speed}`);

  // Move fleet
  const origin = { x: 0, y: 0 };
  const destination = { x: 100, y: 100 };

  const moveResult = fleetManager.moveFleet(
    fleet!.id,
    'planet-2',
    destination,
    origin
  );

  if (moveResult.success) {
    console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${moveResult.message}`);
    console.log(`Fleet moves at slowest ship speed`);
    console.log(`Travel time: ${moveResult.data.travel.travelTime}s`);
  }
}

// ============================================================================
// Example 9: Colonization
// ============================================================================

/**
 * Colonizing new planets
 */
function colonization() {
  console.log('\n=== Example 9: Colonization ===\n');

  const colonyShip = new ShipClass(ShipType.Colony, 'player-1', 'planet-target');

  console.log(`Colony Ship: ${colonyShip.name}`);
  console.log(`Description: ${SHIP_DESCRIPTIONS[ShipType.Colony]}`);

  // Load settlers
  colonyShip.loadCargo('minerals', 100); // Represents settlers

  console.log(`\nSettlers loaded: ${colonyShip.cargo.current}`);

  // Colonize planet
  const result = colonyShip.colonize('planet-target');

  if (result.success) {
    console.log(`\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${result.message}`);
    console.log(`Planet: ${result.data.planetId}`);
    console.log(`Settlers: ${result.data.settlers}`);
    console.log(`Build time: ${result.data.buildTime}s`);
    console.log(`\nColony ship status: ${colonyShip.status}`);
  }
}

// ============================================================================
// Example 10: Ship Build Costs
// ============================================================================

/**
 * Display build costs for all ships
 */
function displayBuildCosts() {
  console.log('\n=== Example 10: Ship Build Costs ===\n');

  Object.values(ShipType).forEach(type => {
    const cost = SHIP_COSTS[type];
    const name = SHIP_DISPLAY_NAMES[type];

    console.log(`${name}:`);
    console.log(`  Minerals: ${cost.minerals}`);
    console.log(`  Energy: ${cost.energy}`);
    console.log(`  Crystal: ${cost.crystal}`);
    console.log(`  Build Time: ${cost.buildTime}s`);
    console.log('');
  });
}

// ============================================================================
// Run Examples
// ============================================================================

if (require.main === module) {
  console.log('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ Ship System Examples\n');

  createShips();
  shipMovement();
  miningOperations();
  cargoManagement();
  combatOperations();
  shipRepair();
  fleetManagement();
  fleetMovement();
  colonization();
  displayBuildCosts();

  console.log('\nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ All examples completed!');
}

export {
  createShips,
  shipMovement,
  miningOperations,
  cargoManagement,
  combatOperations,
  shipRepair,
  fleetManagement,
  fleetMovement,
  colonization,
  displayBuildCosts
};
