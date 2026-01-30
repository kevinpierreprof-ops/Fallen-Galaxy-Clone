# Ship System Documentation

## Overview

The Ship System provides comprehensive spaceship management with multiple ship types, movement mechanics, cargo handling, combat operations, and fleet coordination. Ships are the primary means of exploration, resource gathering, combat, and colonization.

---

## Table of Contents

- [Ship Types](#ship-types)
- [Ship Class](#ship-class)
- [Movement System](#movement-system)
- [Cargo Management](#cargo-management)
- [Combat System](#combat-system)
- [Fleet System](#fleet-system)
- [Build Requirements](#build-requirements)
- [API Reference](#api-reference)
- [Examples](#examples)

---

## Ship Types

### Available Ships

| Type | Speed | Cargo | Attack | Defense | Health | Special Purpose |
|------|-------|-------|--------|---------|--------|-----------------|
| **Explorer** | 150 | 50 | 10 | 10 | 100 | Fast reconnaissance |
| **Miner** | 80 | 500 | 5 | 15 | 150 | Resource gathering |
| **Colony** | 60 | 200 | 0 | 20 | 200 | Colonization |
| **Fighter** | 200 | 20 | 40 | 15 | 80 | Fast attacks |
| **Cruiser** | 120 | 100 | 80 | 50 | 250 | Balanced combat |
| **Battleship** | 80 | 150 | 150 | 100 | 500 | Heavy assault |
| **Carrier** | 100 | 300 | 60 | 80 | 400 | Fleet command |
| **Transport** | 90 | 1000 | 5 | 25 | 180 | Bulk cargo |

### Ship Type Enum

```typescript
enum ShipType {
  Explorer = 'explorer',
  Miner = 'miner',
  Colony = 'colony',
  Fighter = 'fighter',
  Cruiser = 'cruiser',
  Battleship = 'battleship',
  Carrier = 'carrier',
  Transport = 'transport'
}
```

---

## Ship Class

### Creating Ships

```typescript
import { ShipClass } from '@/ships/Ship';
import { ShipType } from '@shared/types/ships';

// Create a new ship
const explorer = new ShipClass(
  ShipType.Explorer,      // Ship type
  'player-1',            // Owner ID
  'planet-home',         // Starting planet ID
  'USS Discovery'        // Name (optional)
);
```

### Ship Properties

```typescript
interface Ship {
  id: string;                    // Unique identifier
  type: ShipType;                // Ship type
  name: string;                  // Ship name
  ownerId: string;               // Owner player ID
  currentPlanetId: string | null; // Current location
  fleetId: string | null;        // Fleet assignment
  stats: ShipStats;              // Speed, attack, defense, health
  cargo: ShipCargo;              // Cargo hold
  movement: ShipMovement | null; // Active movement
  status: ShipStatus;            // Current status
  createdAt: number;             // Creation timestamp
  lastAction?: number;           // Last action timestamp
}
```

### Ship Status

```typescript
enum ShipStatus {
  Idle = 'idle',           // Available for orders
  Moving = 'moving',       // In transit
  Mining = 'mining',       // Mining operation
  Attacking = 'attacking', // In combat
  Repairing = 'repairing', // Under repair
  Destroyed = 'destroyed'  // Destroyed
}
```

---

## Movement System

### Travel Calculation

Ships travel at different speeds based on their type. Travel time is calculated using:

```
travelTime (hours) = distance / speed
travelTime (seconds) = (distance / speed) ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 3600
```

### Moving Ships

```typescript
const origin = { x: 10, y: 10 };
const destination = { x: 50, y: 50 };

// Calculate travel
const travel = ship.calculateTravel(origin, destination);
console.log(`Distance: ${travel.distance}`);
console.log(`Travel Time: ${travel.travelTime}s`);
console.log(`Fuel Cost: ${travel.fuelCost}`);

// Move ship
const result = ship.moveTo('planet-2', destination, origin);
if (result.success) {
  console.log(`ETA: ${result.data.arrivalTime}`);
}
```

### Travel Completion

```typescript
// Update movement (call every game tick)
const arrived = ship.updateMovement();

if (arrived) {
  console.log(`Ship arrived at ${ship.currentPlanetId}`);
}

// Check remaining time
const remaining = ship.getRemainingTravelTime();
console.log(`${remaining} seconds until arrival`);
```

---

## Cargo Management

### Loading Cargo

```typescript
// Load minerals
const success = ship.loadCargo('minerals', 500);

if (success) {
  console.log(`Cargo: ${ship.cargo.current}/${ship.cargo.capacity}`);
}

// Cannot exceed capacity
ship.loadCargo('energy', 10000); // Loads only up to capacity
```

### Unloading Cargo

```typescript
// Unload specific amount
const unloaded = ship.unloadCargo('minerals', 200);

// Unload all of a resource
const allMinerals = ship.unloadCargo('minerals');

console.log(`Unloaded ${unloaded} minerals`);
```

### Cargo Capacity

Cargo capacity varies by ship type:

| Ship Type | Capacity |
|-----------|----------|
| Transport | 1000 |
| Miner | 500 |
| Carrier | 300 |
| Colony | 200 |
| Battleship | 150 |
| Cruiser | 100 |
| Explorer | 50 |
| Fighter | 20 |

---

## Combat System

### Attacking

```typescript
// Initiate attack
const result = ship.attack('target-ship-id');

if (result.success) {
  console.log(`Attack power: ${result.data.attackPower}`);
  console.log(`Range: ${result.data.range}`);
}
```

### Taking Damage

```typescript
// Apply damage
const destroyed = ship.takeDamage(100);

console.log(`HP: ${ship.stats.health}/${ship.stats.maxHealth}`);

if (destroyed) {
  console.log('Ship destroyed!');
}
```

### Damage Calculation

Actual damage is reduced by defense:

```
actualDamage = max(0, attackDamage - targetDefense)
```

**Example:**
- Attacker deals 100 damage
- Defender has 30 defense
- Actual damage: 100 - 30 = 70

### Repairing

```typescript
// Repair damaged ship
const result = ship.repair(100);

if (result.success) {
  console.log(`Repair cost:`, result.data.cost);
  console.log(`Repair time: ${result.data.repairTime}s`);
}

// Full repair
ship.repair(); // Repairs to max health
```

**Repair Cost:**
- 30% of build cost ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â (damage / maxHealth)
- Time: 0.5 seconds per HP

---

## Fleet System

### Creating Fleets

```typescript
import { FleetManager } from '@/ships/FleetManager';

const fleetManager = new FleetManager();

// Register ships
fleetManager.registerShip(ship1);
fleetManager.registerShip(ship2);

// Create fleet
const fleet = fleetManager.createFleet(
  'player-1',
  'Alpha Squadron',
  [ship1.id, ship2.id]
);
```

### Fleet Operations

```typescript
// Add ship to fleet
fleetManager.addShipToFleet(fleetId, shipId);

// Remove ship from fleet
fleetManager.removeShipFromFleet(fleetId, shipId);

// Disband fleet
fleetManager.disbandFleet(fleetId);

// Get fleet statistics
const stats = fleetManager.getFleetStats(fleetId);
console.log(`Total attack: ${stats.totalAttack}`);
```

### Fleet Movement

Fleets move at the speed of the **slowest ship**:

```typescript
const origin = { x: 0, y: 0 };
const destination = { x: 100, y: 100 };

const result = fleetManager.moveFleet(
  fleetId,
  'planet-2',
  destination,
  origin
);

if (result.success) {
  console.log(`Fleet ETA: ${result.data.travel.travelTime}s`);
}
```

### Fleet Limits

- **Maximum fleet size:** 50 ships
- All ships must be at same location
- All ships must belong to same owner
- Fleet uses slowest ship's speed

---

## Build Requirements

### Build Costs

| Ship | Minerals | Energy | Crystal | Build Time |
|------|----------|--------|---------|------------|
| Explorer | 500 | 300 | 100 | 120s (2m) |
| Miner | 800 | 400 | 200 | 180s (3m) |
| Colony | 2000 | 1000 | 500 | 600s (10m) |
| Fighter | 600 | 500 | 300 | 150s (2.5m) |
| Cruiser | 2000 | 1500 | 1000 | 400s (6.7m) |
| Battleship | 5000 | 3000 | 2500 | 900s (15m) |
| Carrier | 4000 | 2500 | 2000 | 720s (12m) |
| Transport | 1200 | 600 | 300 | 240s (4m) |

### Requirements

| Ship | Shipyard | Research Lab | Technology |
|------|----------|--------------|------------|
| Explorer | 1 | - | - |
| Miner | 2 | - | - |
| Fighter | 3 | - | - |
| Transport | 4 | - | - |
| Colony | 5 | 3 | Colonization |
| Cruiser | 6 | 4 | Advanced Weapons |
| Carrier | 9 | 7 | Fleet Command |
| Battleship | 10 | 8 | Capital Ships |

---

## API Reference

### ShipClass Methods

#### `moveTo(destinationPlanetId, destinationPosition, originPosition)`
Move ship to destination planet.

**Returns:** `ShipActionResult`

#### `mine(planetId, resourceType, duration)`
Start mining operation.

**Parameters:**
- `planetId` - Planet to mine at
- `resourceType` - 'minerals' | 'energy' | 'crystal'
- `duration` - Mining duration in seconds

**Returns:** `ShipActionResult`

#### `colonize(targetPlanetId)`
Colonize unclaimed planet (Colony ships only).

**Returns:** `ShipActionResult`

#### `attack(targetId)`
Initiate attack on target.

**Returns:** `ShipActionResult`

#### `takeDamage(damage)`
Apply damage to ship.

**Returns:** `boolean` (true if destroyed)

#### `repair(amount?)`
Repair ship damage.

**Returns:** `ShipActionResult`

#### `loadCargo(resourceType, amount)`
Load cargo into ship.

**Returns:** `boolean`

#### `unloadCargo(resourceType, amount?)`
Unload cargo from ship.

**Returns:** `number` (amount unloaded)

### FleetManager Methods

#### `createFleet(ownerId, name, shipIds)`
Create new fleet with ships.

**Returns:** `Fleet | null`

#### `addShipToFleet(fleetId, shipId)`
Add ship to existing fleet.

**Returns:** `boolean`

#### `removeShipFromFleet(fleetId, shipId)`
Remove ship from fleet.

**Returns:** `boolean`

#### `moveFleet(fleetId, destinationPlanetId, destination, origin)`
Move entire fleet to destination.

**Returns:** `ShipActionResult`

#### `getFleetStats(fleetId)`
Get aggregate fleet statistics.

**Returns:** Fleet stats object

---

## Examples

### Example 1: Basic Ship Operations

```typescript
const miner = new ShipClass(ShipType.Miner, 'player-1', 'planet-1');

// Start mining
miner.mine('planet-1', 'minerals', 3600);

// Wait for completion...
const result = miner.completeMining();
console.log(`Mined ${result.amount} minerals`);

// Move to another planet
const travel = miner.calculateTravel(origin, destination);
miner.moveTo('planet-2', destination, origin);
```

### Example 2: Fleet Combat

```typescript
// Create attack fleet
const fleet = fleetManager.createFleet(
  'player-1',
  'Strike Force',
  [fighter1.id, fighter2.id, cruiser.id]
);

// Move fleet to enemy planet
fleetManager.moveFleet(fleetId, enemyPlanet, destination, origin);

// Calculate fleet combat power
const stats = fleetManager.getFleetStats(fleetId);
console.log(`Total attack: ${stats.totalAttack}`);
console.log(`Total defense: ${stats.totalDefense}`);
```

### Example 3: Colonization Mission

```typescript
const colonyShip = new ShipClass(ShipType.Colony, 'player-1', 'home');

// Load settlers
colonyShip.loadCargo('minerals', 100); // Represents population

// Move to target planet
colonyShip.moveTo('planet-new', destination, origin);

// Wait for arrival...

// Colonize
const result = colonyShip.colonize('planet-new');
// Colony ship is consumed in colonization
```

---

## Testing

Run ship system tests:

```bash
npm test -- ShipSystem.test.ts
```

Tests cover:
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Ship creation and initialization
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Movement and travel calculation
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Mining operations
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Cargo management
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Combat and damage
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Repair mechanics
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Fleet creation and management
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Fleet movement
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Colonization
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Serialization

---

## See Also

- [Planet System](./PLANETS.md) - Planet management
- [Building System](./BUILDING-SYSTEM.md) - Building construction
- [Galaxy Map](./GALAXY-MAP.md) - Galaxy generation
- [API Documentation](./API.md) - REST endpoints
