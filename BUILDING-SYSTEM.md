# Building System Documentation

## Overview

The Building System provides comprehensive functionality for managing building construction, upgrades, and production in the space strategy game. It features a queue system, resource validation, prerequisite checking, and production calculations.

---

## Table of Contents

- [Building Types](#building-types)
- [Core Components](#core-components)
- [Construction System](#construction-system)
- [Queue Management](#queue-management)
- [Resource Management](#resource-management)
- [Production System](#production-system)
- [API Reference](#api-reference)
- [Examples](#examples)

---

## Building Types

### Available Buildings

| Type | Name | Description | Primary Resource |
|------|------|-------------|------------------|
| `MetalMine` | Metal Mine | Extracts metal resources | Metal |
| `EnergyPlant` | Energy Plant | Generates energy | Energy |
| `CrystalMine` | Crystal Mine | Harvests crystals | Crystal |
| `Shipyard` | Shipyard | Builds ships, reduces construction time | - |
| `ResearchLab` | Research Laboratory | Conducts research | Research |
| `Defense` | Defense Grid | Planetary defense | Defense |
| `CommandCenter` | Command Center | Increases queue capacity | - |
| `Storage` | Resource Storage | Increases storage capacity | Storage |

### Building Enum

```typescript
enum BuildingType {
  MetalMine = 'metal_mine',
  EnergyPlant = 'energy_plant',
  CrystalMine = 'crystal_mine',
  Shipyard = 'shipyard',
  ResearchLab = 'research_lab',
  Defense = 'defense',
  CommandCenter = 'command_center',
  Storage = 'storage'
}
```

---

## Core Components

### Building Interface

```typescript
interface Building {
  id: string;                    // Unique identifier
  type: BuildingType;            // Building type
  level: number;                 // Current level (1-max)
  cost: BuildingCost;            // Construction cost
  productionBonus: ProductionBonus; // Production per hour
  buildTime: number;             // Build time in seconds
  position?: number;             // Slot position
  damage?: number;               // Damage percentage (0-100)
}
```

### Building Cost

```typescript
interface BuildingCost {
  metal: number;
  energy: number;
  crystal: number;
}
```

### Production Bonus

```typescript
interface ProductionBonus {
  metal?: number;      // Per hour
  energy?: number;     // Per hour (can be negative)
  crystal?: number;    // Per hour
  research?: number;   // Per hour
  defense?: number;    // Defense rating
  storage?: number;    // Storage capacity
}
```

---

## Construction System

### Starting Construction

```typescript
import { buildingSystem } from '@/buildings/BuildingSystem';
import { BuildingType } from '@shared/types/buildingSystem';

const result = buildingSystem.startConstruction(
  'planet-123',                    // Planet ID
  BuildingType.MetalMine,          // Building type
  { metal: 500, energy: 300, crystal: 100 }, // Player resources
  [],                              // Existing buildings
  0,                               // Shipyard level
  100                              // Population
);

if (result.success) {
  console.log(`Completes at: ${result.completesAt}`);
  console.log(`Queue position: ${result.queuePosition}`);
}
```

### Upgrading Buildings

```typescript
const building = getBuilding('building-id');

const result = buildingSystem.startUpgrade(
  'planet-123',
  building.id,
  building.level,
  building.type,
  playerResources,
  shipyardLevel
);
```

### Prerequisites

Buildings may require other buildings before construction:

```typescript
// Shipyard requires Command Center level 2
{
  buildings: [
    { type: BuildingType.CommandCenter, level: 2 }
  ],
  population: 50
}
```

---

## Queue Management

### Construction Queue

Each planet has a construction queue that handles multiple building projects:

```typescript
import { constructionQueueManager } from '@/buildings/ConstructionQueueManager';

// Initialize queue
constructionQueueManager.initializeQueue('planet-123', commandCenterLevel);

// Get queue status
const stats = constructionQueueManager.getQueueStats('planet-123');
console.log(`Queue: ${stats.queuedCount}/${stats.maxQueueSize}`);

// List all constructions
const constructions = constructionQueueManager.getAllConstructions('planet-123');
```

### Queue Capacity

Base queue size: **3 slots**

Additional slots: **+1 per Command Center level**

```
maxQueueSize = 3 + (commandCenterLevel ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 1)
```

| Command Center | Queue Size |
|----------------|------------|
| 0 | 3 |
| 1 | 4 |
| 2 | 5 |
| 5 | 8 |
| 10 | 13 |

### Queued Building

```typescript
interface QueuedBuilding {
  id: string;
  buildingId?: string;    // For upgrades
  type: BuildingType;
  targetLevel: number;
  cost: BuildingCost;
  buildTime: number;
  startedAt: number;      // Timestamp
  completesAt: number;    // Timestamp
  position: number;       // Queue position
  planetId: string;
}
```

---

## Resource Management

### Checking Resources

```typescript
const check = buildingSystem.checkResources(
  playerResources,
  buildingCost
);

if (check.hasResources) {
  // Can afford
} else {
  console.log(check.message);
  console.log(`Missing:`, check.missing);
}
```

### Deducting Resources

```typescript
const updatedResources = buildingSystem.deductResources(
  playerResources,
  buildingCost
);
```

---

## Production System

### Calculating Production

```typescript
const buildings = [
  { type: BuildingType.MetalMine, level: 5, ... },
  { type: BuildingType.EnergyPlant, level: 3, ... }
];

const production = buildingSystem.getTotalProduction(buildings);

console.log(`Metal: ${production.metal}/hour`);
console.log(`Energy: ${production.energy}/hour`);
```

### Production Formulas

**For positive values (production):**
```
production = baseProduction ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â (1 + (level - 1) ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 0.6)
```

**For negative values (consumption):**
```
consumption = baseConsumption ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â level
```

### Base Production (Level 1)

| Building | Production | Consumption |
|----------|------------|-------------|
| Metal Mine | +30 metal/h | -10 energy/h |
| Energy Plant | +50 energy/h | - |
| Crystal Mine | +20 crystal/h | -15 energy/h |
| Research Lab | +10 research/h | -20 energy/h |
| Defense | +100 defense | -5 energy/h |
| Storage | +10,000 capacity | - |

---

## Cost and Time Scaling

### Cost Formula

```
cost(level) = baseCost ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â (1.5 ^ (level - 1))
```

### Build Time Formula

```
baseTime(level) = baseTime ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â (1.4 ^ (level - 1))
```

### Shipyard Bonus

Shipyard reduces build time for military buildings:

```
reduction = shipyardLevel ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 2%
actualTime = baseTime ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â (1 - min(reduction, 50%))
```

Maximum reduction: **50%**

---

## API Reference

### BuildingSystem Class

#### `checkResources(playerResources, cost)`
Check if player has sufficient resources.

**Returns:** `ResourceCheckResult`

#### `startConstruction(planetId, type, resources, buildings, shipyardLevel, population)`
Start building construction.

**Returns:** `BuildResult`

#### `startUpgrade(planetId, buildingId, currentLevel, type, resources, shipyardLevel)`
Start building upgrade.

**Returns:** `BuildResult`

#### `calculateBuildTimeWithBonuses(type, level, buildings)`
Calculate build time including shipyard bonus.

**Returns:** `number` (seconds)

#### `getTotalProduction(buildings)`
Calculate total production from all buildings.

**Returns:** `ProductionBonus`

#### `createBuilding(type, level, position, shipyardLevel)`
Create a new building instance.

**Returns:** `Building`

### ConstructionQueueManager Class

#### `initializeQueue(planetId, commandCenterLevel)`
Initialize construction queue for a planet.

#### `addToQueue(planetId, type, level, cost, shipyardLevel, buildingId?)`
Add building to construction queue.

**Returns:** `BuildResult`

#### `removeFromQueue(planetId, queuedBuildingId)`
Remove building from queue.

**Returns:** `boolean`

#### `checkCompletions(planetId)`
Check and complete finished constructions.

**Returns:** `QueuedBuilding[]`

#### `getAllConstructions(planetId)`
Get all queued and active constructions.

**Returns:** `QueuedBuilding[]`

#### `getQueueStats(planetId)`
Get queue statistics.

**Returns:** Queue stats object

---

## Examples

### Example 1: Basic Construction

```typescript
import { buildingSystem } from '@/buildings/BuildingSystem';
import { BuildingType } from '@shared/types/buildingSystem';

const result = buildingSystem.startConstruction(
  'planet-001',
  BuildingType.MetalMine,
  { metal: 500, energy: 300, crystal: 100 },
  [],
  0,
  100
);

if (result.success) {
  console.log(`Construction started!`);
  console.log(`Completes: ${new Date(result.completesAt!)}`);
}
```

### Example 2: Multiple Buildings

```typescript
import { constructionQueueManager } from '@/buildings/ConstructionQueueManager';

constructionQueueManager.initializeQueue('planet-001', 2);

const buildingsToQueue = [
  BuildingType.MetalMine,
  BuildingType.EnergyPlant,
  BuildingType.Storage
];

for (const type of buildingsToQueue) {
  buildingSystem.startConstruction(
    'planet-001',
    type,
    playerResources,
    existingBuildings,
    0,
    100
  );
}

const stats = constructionQueueManager.getQueueStats('planet-001');
console.log(`Queued: ${stats.queuedCount}/${stats.maxQueueSize}`);
```

### Example 3: Upgrade Chain

```typescript
// Upgrade metal mine from level 1 to 5
const building = getBuildingByType(BuildingType.MetalMine);

for (let level = building.level; level < 5; level++) {
  const result = buildingSystem.startUpgrade(
    planetId,
    building.id,
    level,
    BuildingType.MetalMine,
    playerResources,
    shipyardLevel
  );
  
  if (!result.success) {
    console.log(`Cannot upgrade: ${result.message}`);
    break;
  }
}
```

### Example 4: Production Monitoring

```typescript
const buildings = getAllPlanetBuildings(planetId);
const production = buildingSystem.getTotalProduction(buildings);

if (production.energy < 0) {
  console.warn(`Energy deficit: ${Math.abs(production.energy)}/h`);
  console.log(`Recommendation: Build Energy Plants`);
}
```

---

## Building Stats Reference

### Metal Mine
- **Max Level:** 30
- **Base Cost:** 60M, 15E, 0C
- **Build Time:** 30s
- **Production (L1):** +30 metal/h, -10 energy/h

### Energy Plant
- **Max Level:** 30
- **Base Cost:** 48M, 0E, 20C
- **Build Time:** 25s
- **Production (L1):** +50 energy/h

### Crystal Mine
- **Max Level:** 30
- **Base Cost:** 48M, 24E, 0C
- **Build Time:** 35s
- **Production (L1):** +20 crystal/h, -15 energy/h

### Shipyard
- **Max Level:** 15
- **Base Cost:** 400M, 200E, 100C
- **Build Time:** 180s
- **Requires:** Command Center L2, 50 population
- **Bonus:** -2% build time per level (military buildings)

### Research Lab
- **Max Level:** 20
- **Base Cost:** 200M, 400E, 200C
- **Build Time:** 120s
- **Requires:** Command Center L1, 30 population
- **Production (L1):** +10 research/h, -20 energy/h

### Defense Grid
- **Max Level:** 25
- **Base Cost:** 150M, 50E, 75C
- **Build Time:** 90s
- **Requires:** 20 population
- **Production (L1):** +100 defense, -5 energy/h

### Command Center
- **Max Level:** 10
- **Base Cost:** 500M, 300E, 200C
- **Build Time:** 300s
- **Bonus:** +1 queue slot per level

### Resource Storage
- **Max Level:** 20
- **Base Cost:** 100M, 50E, 50C
- **Build Time:** 40s
- **Production (L1):** +10,000 storage capacity

---

## Testing

Run the building system tests:

```bash
cd backend
npm test -- BuildingSystem.test.ts
```

Tests cover:
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Resource checking
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Construction validation
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Upgrade mechanics
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Queue management
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Production calculations
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Time calculations with bonuses
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Prerequisites enforcement

---

## Integration

### With Planet System

```typescript
import { Planet } from '@/planets/Planet';
import { buildingSystem } from '@/buildings/BuildingSystem';

// Build on planet
const result = buildingSystem.startConstruction(
  planet.id,
  BuildingType.MetalMine,
  planet.resources,
  planet.buildings,
  getShipyardLevel(planet),
  planet.resources.population
);

if (result.success) {
  // Deduct resources
  const cost = result.queuedBuilding!.cost;
  planet.resources = buildingSystem.deductResources(planet.resources, cost);
}
```

---

## See Also

- [Planet System](./PLANETS.md) - Planet management
- [Database Schema](./DATABASE.md) - Database structure
- [API Documentation](./API.md) - REST API endpoints
