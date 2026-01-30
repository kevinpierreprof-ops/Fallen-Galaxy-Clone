# Planet and Buildings System

## Overview

The Planet and Buildings system is the core resource and production management system in the Space Strategy Game. Players colonize planets, construct buildings, and manage resources to grow their empire.

---

## Table of Contents

- [Planet Class](#planet-class)
- [Buildings](#buildings)
- [Resources](#resources)
- [Production](#production)
- [Building Requirements](#building-requirements)
- [Game Loop Integration](#game-loop-integration)
- [API Usage](#api-usage)
- [Examples](#examples)

---

## Planet Class

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique planet identifier (UUID) |
| `ownerId` | `string \| null` | Owner's user ID (null if unowned) |
| `name` | `string` | Planet name |
| `position` | `Position` | Location in space `{x, y}` |
| `size` | `number` | Planet size (1-5, affects building slots) |
| `resources` | `PlanetResources` | Current resources |
| `buildings` | `Building[]` | Array of buildings on planet |

### Creating a Planet

```typescript
import { Planet } from '@/planets/Planet';

// Create a new planet
const planet = new Planet({
  name: 'Alpha Centauri',
  position: { x: 1000, y: 2000 },
  size: 3,
  ownerId: 'user-123',
  resources: {
    minerals: 2000,
    energy: 1000,
    credits: 500,
    population: 200
  }
});
```

### Building Slots

The number of building slots is determined by planet size:

```
buildingSlots = min(20, 5 + (size ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 3))
```

| Size | Slots |
|------|-------|
| 1 | 8 |
| 2 | 11 |
| 3 | 14 |
| 4 | 17 |
| 5 | 20 (max) |

---

## Buildings

### Building Types

| Type | Name | Description | Produces |
|------|------|-------------|----------|
| `mine` | Mineral Mine | Extracts minerals | Minerals |
| `factory` | Manufacturing Factory | Produces goods | Credits |
| `shipyard` | Shipyard | Builds ships | - |
| `defense` | Defense Grid | Planetary defense | Defense |
| `lab` | Research Laboratory | Conducts research | Research |
| `habitat` | Habitat Module | Housing | Population capacity |

### Building Structure

```typescript
interface Building {
  id: string;
  type: BuildingType;
  level: number;
  position: number;
  isUpgrading: boolean;
  upgradeCompleteAt?: number;
  damage?: number;
}
```

### Building Levels

- Each building can be upgraded up to its max level
- Higher levels increase production/effectiveness
- Upgrade costs increase exponentially with level

**Cost Formula:**
```
cost(level) = baseCost ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 1.5^(level-1)
```

**Production Formula:**
```
production(level) = baseProduction ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â (1 + (level-1) ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 0.5)
```

### Building Stats by Type

#### Mineral Mine
- **Max Level:** 20
- **Base Cost:** 100 minerals, 50 energy, 50 credits
- **Build Time:** 60s
- **Production (Level 1):** +20 minerals/s, -5 energy/s
- **Population Required:** 10

#### Manufacturing Factory
- **Max Level:** 20
- **Base Cost:** 150 minerals, 100 energy, 100 credits
- **Build Time:** 90s
- **Production (Level 1):** +15 credits/s, -10 energy/s
- **Population Required:** 20

#### Shipyard
- **Max Level:** 10
- **Base Cost:** 500 minerals, 300 energy, 500 credits
- **Build Time:** 300s
- **Production (Level 1):** -20 energy/s
- **Prerequisite:** Factory level 2
- **Population Required:** 50

#### Defense Grid
- **Max Level:** 15
- **Base Cost:** 200 minerals, 150 energy, 100 credits
- **Build Time:** 120s
- **Production (Level 1):** +50 defense, -5 energy/s
- **Population Required:** 15

#### Research Laboratory
- **Max Level:** 15
- **Base Cost:** 300 minerals, 200 energy, 200 credits
- **Build Time:** 180s
- **Production (Level 1):** +10 research/s, -15 energy/s
- **Prerequisite:** Factory level 1
- **Population Required:** 25

#### Habitat Module
- **Max Level:** 25
- **Base Cost:** 80 minerals, 40 energy, 60 credits
- **Build Time:** 60s
- **Production (Level 1):** +500 capacity, -3 energy/s
- **Population Required:** 0

---

## Resources

### Resource Types

```typescript
interface PlanetResources {
  minerals: number;   // For construction
  energy: number;     // Powers buildings
  credits: number;    // Economy/trade
  population: number; // Workforce
  research?: number;  // Technology
}
```

### Resource Caps

- **Minerals/Energy/Credits:** Unlimited
- **Population:** Limited by capacity (habitats)

### Starting Resources

```typescript
{
  minerals: 1000,
  energy: 500,
  credits: 500,
  population: 100,
  research: 0
}
```

---

## Production

### Calculating Production

```typescript
const production = planet.calculateProduction();

// Returns:
{
  minerals: 40,     // From mines
  energy: -45,      // Net consumption
  credits: 30,      // From factories
  research: 20,     // From labs
  defense: 150,     // From defense grids
  capacity: 2500    // Population capacity
}
```

### Production Rules

1. **Active buildings only** - Upgrading buildings don't produce
2. **Damaged buildings** - Still produce at full capacity (not affected by damage)
3. **Energy consumption** - Most buildings consume energy
4. **Negative resources** - Clamped to 0 (can't go negative)

### Update Cycle

Resources are updated based on production rates:

```typescript
// Called every game tick (typically 1 second)
planet.update(deltaTime);

// Resources change by:
// resource += production ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â deltaTime
```

---

## Building Requirements

### Construction Requirements

To build a structure, all of these must be satisfied:

1. **Planet owned** - Must have an owner
2. **Available slot** - Free building slot
3. **Sufficient resources** - Meet cost requirements
4. **Population** - Enough population
5. **Prerequisites** - Required buildings exist

### Checking Requirements

```typescript
const result = planet.canBuild('shipyard');

if (result.canBuild) {
  planet.addBuilding('shipyard');
} else {
  console.log(result.reason);
  // "Requires Manufacturing Factory level 2"
}
```

### Prerequisite Chain

```
mine ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ (no prerequisite)
factory ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ (no prerequisite)
habitat ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ (no prerequisite)
defense ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ (no prerequisite)
lab ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ factory level 1
shipyard ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ factory level 2
```

---

## Game Loop Integration

### Basic Game Loop

```typescript
// Update every second
setInterval(() => {
  planet.update(1); // 1 second delta
}, 1000);
```

### Advanced Game Loop

```typescript
let lastUpdate = Date.now();

function gameLoop() {
  const now = Date.now();
  const deltaTime = (now - lastUpdate) / 1000; // seconds
  
  // Update planet
  planet.update(deltaTime);
  
  // Check completed upgrades
  for (const building of planet.buildings) {
    if (!building.isUpgrading && building.level > lastKnownLevels[building.id]) {
      onBuildingUpgraded(building);
    }
  }
  
  lastUpdate = now;
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

---

## API Usage

### Building Construction

```typescript
// Check if can build
const validation = planet.canBuild('mine');
if (!validation.canBuild) {
  console.error(validation.reason);
  return;
}

// Build
const building = planet.addBuilding('mine');
if (building) {
  console.log(`Built ${building.type} at position ${building.position}`);
}
```

### Building Upgrades

```typescript
// Check if can upgrade
const validation = planet.canUpgrade(buildingId);
if (!validation.canUpgrade) {
  console.error(validation.reason);
  return;
}

// Upgrade
const success = planet.upgradeBuilding(buildingId);
if (success) {
  const building = planet.getBuilding(buildingId);
  console.log(`Upgrading to level ${building!.level + 1}`);
}
```

### Resource Management

```typescript
// Get current resources
console.log(planet.resources);

// Calculate net production
const production = planet.calculateProduction();
console.log(`Net energy: ${production.energy}/s`);

// Simulate production
planet.update(60); // 60 seconds
```

### Planet Statistics

```typescript
const stats = planet.getStats();

console.log(`Buildings: ${stats.usedSlots}/${stats.buildingSlots}`);
console.log(`Defense: ${stats.defenseRating}`);
console.log(`Population: ${planet.resources.population}/${stats.populationCapacity}`);
```

### Building Management

```typescript
// Get specific building
const building = planet.getBuilding(buildingId);

// Get all mines
const mines = planet.getBuildingsByType('mine');

// Demolish building
planet.demolishBuilding(buildingId);

// Damage building
planet.damageBuilding(buildingId, 50);

// Repair building
planet.repairBuilding(buildingId);
```

---

## Examples

### Example 1: New Colony Setup

```typescript
// Create new colony
const colony = new Planet({
  name: 'New Terra',
  position: { x: 1500, y: 2000 },
  size: 4,
  ownerId: 'player-123'
});

// Build initial infrastructure
colony.addBuilding('mine');     // Mineral production
colony.addBuilding('mine');     // More minerals
colony.addBuilding('factory');  // Credit production
colony.addBuilding('habitat');  // Population capacity
colony.addBuilding('defense');  // Protection

console.log('Colony established!');
showProduction(colony);
```

### Example 2: Resource Management

```typescript
// Check if we have enough energy
const production = planet.calculateProduction();

if (production.energy! < 0) {
  console.warn('Energy deficit!');
  
  // Stop building energy-intensive structures
  // Or build more energy production
}

// Balance production
if (production.minerals! > production.credits!) {
  console.log('Need more factories');
  planet.addBuilding('factory');
}
```

### Example 3: Building Upgrades

```typescript
// Upgrade all mines to level 5
const mines = planet.getBuildingsByType('mine');

for (const mine of mines) {
  while (mine.level < 5) {
    const validation = planet.canUpgrade(mine.id);
    
    if (validation.canUpgrade) {
      planet.upgradeBuilding(mine.id);
      // Wait for upgrade to complete...
      await waitForUpgrade(mine);
    } else {
      console.log(`Cannot upgrade: ${validation.reason}`);
      break;
    }
  }
}
```

### Example 4: Defense Setup

```typescript
// Calculate required defense
const threatLevel = calculateThreatLevel(planet.position);
const targetDefense = threatLevel * 100;

const stats = planet.getStats();

if (stats.defenseRating < targetDefense) {
  const defenseNeeded = targetDefense - stats.defenseRating;
  const gridsNeeded = Math.ceil(defenseNeeded / 50);
  
  console.log(`Need ${gridsNeeded} more defense grids`);
  
  for (let i = 0; i < gridsNeeded; i++) {
    if (planet.canBuild('defense').canBuild) {
      planet.addBuilding('defense');
    }
  }
}
```

### Example 5: Production Optimization

```typescript
// Optimize for maximum mineral production
function optimizeForMinerals(planet: Planet) {
  // Build as many mines as possible
  while (planet.getAvailableSlots() > 0) {
    const result = planet.canBuild('mine');
    
    if (result.canBuild) {
      planet.addBuilding('mine');
    } else {
      break;
    }
  }
  
  // Upgrade all mines to max level
  const mines = planet.getBuildingsByType('mine');
  for (const mine of mines) {
    // Upgrade as high as possible
    while (planet.canUpgrade(mine.id).canUpgrade) {
      planet.upgradeBuilding(mine.id);
    }
  }
  
  const production = planet.calculateProduction();
  console.log(`Optimized: ${production.minerals} minerals/s`);
}
```

---

## Performance Considerations

### Update Frequency

- **Recommended:** 1 update per second
- **Maximum:** 30 updates per second (game tick rate)
- **Minimum:** 0.1 updates per second (every 10 seconds)

### Building Limits

- **Max buildings per planet:** 20
- **Recommended for performance:** < 15 buildings per planet
- **Max planets per player:** Unlimited (recommend < 50)

### Optimization Tips

1. **Batch updates** - Update multiple planets in one tick
2. **Cache production** - Don't recalculate every frame
3. **Lazy evaluation** - Only calculate when needed
4. **Delta time** - Use variable delta time for flexibility

---

## Database Integration

The Planet class integrates with the database via the PlanetModel:

```typescript
import { planetModel } from '@/database/models/PlanetModel';
import { Planet } from '@/planets/Planet';

// Load planet from database
const dbPlanet = planetModel.findById(planetId);
const planet = Planet.fromJSON(dbPlanet);

// Save planet to database
planetModel.update(planet.id, {
  buildings_json: JSON.stringify(planet.buildings),
  minerals: planet.resources.minerals,
  energy: planet.resources.energy,
  // ... other fields
});
```

---

## Testing

Run the comprehensive test suite:

```bash
npm test -- Planet.test.ts
```

Tests cover:
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Planet creation and initialization
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Building construction validation
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Resource management
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Production calculations
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Building upgrades
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Damage and repair
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Serialization
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Edge cases

---

## See Also

- [API Documentation](../API.md) - REST API endpoints
- [Database Schema](../DATABASE.md) - Database structure
- [Game Constants](../../shared/constants/buildings.ts) - Building constants
- [Type Definitions](../../shared/types/buildings.ts) - TypeScript types
