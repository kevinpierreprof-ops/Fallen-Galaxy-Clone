# Galaxy Map Generator Documentation

## Overview

The Galaxy Map Generator creates procedural 2D galaxy maps with configurable parameters and seed-based generation for reproducible results. It handles planet placement, resource distribution, and ensures proper spacing between planets and players.

---

## Table of Contents

- [Features](#features)
- [Core Concepts](#core-concepts)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Algorithms](#algorithms)
- [Usage Examples](#usage-examples)
- [Integration](#integration)

---

## Features

ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Configurable galaxy size** (e.g., 100x100, 200x200)  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Seed-based generation** for reproducible maps  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Player starting planet placement** with minimum distance  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Random neutral planet generation** with varying resources  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Resource level distribution** (poor, normal, rich, abundant)  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Collision detection** ensures no planet overlaps  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Nearest planet search** algorithm  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **JSON export/import** for client-side rendering  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Map regeneration** from seed  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Generation statistics**  

---

## Core Concepts

### Galaxy Dimensions

The galaxy is represented as a 2D grid with configurable width and height:

```typescript
interface GalaxyDimensions {
  width: number;   // e.g., 100
  height: number;  // e.g., 100
}
```

### Planet Placement

Each planet has:
- **Position**: (x, y) coordinates in the galaxy
- **Owner**: Player ID or null for neutral planets
- **Size**: 1-5 (affects building slots)
- **Resources**: minerals, energy, credits, population
- **Resource Level**: poor, normal, rich, abundant

### Seeded Generation

Uses a seeded random number generator (RNG) for deterministic results:
- Same seed = same galaxy layout
- Different seed = different layout
- Supports both string and numeric seeds

---

## Configuration

### GalaxyMapConfig

```typescript
interface GalaxyMapConfig {
  width: number;              // Galaxy width
  height: number;             // Galaxy height
  numPlayers: number;         // Number of players
  neutralPlanets: number;     // Number of neutral planets
  seed?: string | number;     // RNG seed (optional)
  minPlanetDistance: number;  // Minimum distance between planets
  minPlayerDistance: number;  // Minimum distance between starting planets
  resourceDistribution: {
    poor: number;             // Percentage (0-100)
    normal: number;
    rich: number;
    abundant: number;
  };
}
```

### Default Configuration

```typescript
{
  width: 100,
  height: 100,
  numPlayers: 4,
  neutralPlanets: 50,
  minPlanetDistance: 5,
  minPlayerDistance: 30,
  resourceDistribution: {
    poor: 30,
    normal: 40,
    rich: 20,
    abundant: 10
  }
}
```

---

## API Reference

### GalaxyMapGenerator Class

#### Constructor

```typescript
new GalaxyMapGenerator(config?: Partial<GalaxyMapConfig>)
```

Create a new galaxy map generator with optional configuration.

**Example:**
```typescript
const generator = new GalaxyMapGenerator({
  width: 150,
  height: 150,
  numPlayers: 4,
  seed: 'my-custom-seed'
});
```

#### generate(playerIds: string[]): GalaxyMap

Generate a new galaxy map.

**Parameters:**
- `playerIds` - Array of player IDs (must match numPlayers)

**Returns:** `GalaxyMap` object

**Example:**
```typescript
const galaxyMap = generator.generate(['player-1', 'player-2', 'player-3']);
```

#### findNearestUnoccupiedPlanet(position: Position): NearestPlanetResult

Find the nearest neutral planet to a given position.

**Parameters:**
- `position` - Reference position {x, y}

**Returns:** Object with `planet` and `distance`

**Example:**
```typescript
const result = generator.findNearestUnoccupiedPlanet({ x: 50, y: 50 });
console.log(`Nearest planet: ${result.planet?.name} (${result.distance} units away)`);
```

#### getStats(): GenerationStats

Get statistics about the generated galaxy.

**Returns:** `GenerationStats` object

**Example:**
```typescript
const stats = generator.getStats();
console.log(`Total planets: ${stats.totalPlanets}`);
console.log(`Avg distance: ${stats.averagePlanetDistance}`);
```

### Static Methods

#### calculateDistance(p1: Position, p2: Position): DistanceResult

Calculate Euclidean distance between two positions.

**Example:**
```typescript
const dist = GalaxyMapGenerator.calculateDistance(
  { x: 0, y: 0 },
  { x: 3, y: 4 }
);
console.log(dist.distance); // 5
```

#### exportToJSON(galaxyMap: GalaxyMap): string

Export galaxy map to JSON string.

**Example:**
```typescript
const json = GalaxyMapGenerator.exportToJSON(galaxyMap);
```

#### importFromJSON(json: string): GalaxyMap

Import galaxy map from JSON string.

**Example:**
```typescript
const galaxyMap = GalaxyMapGenerator.importFromJSON(json);
```

#### regenerate(galaxyMap: GalaxyMap, playerIds: string[]): GalaxyMap

Regenerate galaxy using the same seed from an existing map.

**Example:**
```typescript
const newMap = GalaxyMapGenerator.regenerate(oldMap, playerIds);
```

---

## Algorithms

### Starting Planet Placement

Starting planets are placed using a **grid-based distribution** algorithm:

1. Divide galaxy into grid cells (ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡numPlayers ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡numPlayers)
2. Place one starting planet per cell
3. Add random offset within cell for variation
4. Ensures even distribution and minimum distance

**Example for 4 players in 100x100 galaxy:**
```
Grid: 2x2 (50x50 cells)
Player 1: Cell (0,0) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ~(25, 25) with offset
Player 2: Cell (1,0) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ~(75, 25) with offset
Player 3: Cell (0,1) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ~(25, 75) with offset
Player 4: Cell (1,1) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ ~(75, 75) with offset
```

### Neutral Planet Placement

Neutral planets use **rejection sampling**:

1. Generate random position
2. Check if position is valid:
   - Within galaxy bounds
   - Minimum distance from all existing planets
3. If valid, place planet; otherwise retry
4. Maximum attempts: neutralPlanets ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 10

### Resource Level Assignment

Resource levels are assigned using **weighted random selection**:

```typescript
// Example: 30% poor, 40% normal, 20% rich, 10% abundant
const roll = random(0, 100);
if (roll < 30) return 'poor';
if (roll < 70) return 'normal';  // 30 + 40
if (roll < 90) return 'rich';     // 70 + 20
return 'abundant';                // 90 + 10
```

### Nearest Planet Search

Uses **linear search** with distance calculation:

```typescript
for each neutral planet:
  calculate distance to reference point
  if distance < minDistance:
    minDistance = distance
    nearest = planet
```

**Time Complexity:** O(n) where n = number of neutral planets

---

## Usage Examples

### Example 1: Basic Generation

```typescript
import { GalaxyMapGenerator } from '@/galaxy/GalaxyMapGenerator';

const generator = new GalaxyMapGenerator({
  width: 100,
  height: 100,
  numPlayers: 4,
  neutralPlanets: 30,
  seed: 'game-12345'
});

const playerIds = ['player-1', 'player-2', 'player-3', 'player-4'];
const galaxyMap = generator.generate(playerIds);

console.log(`Generated ${galaxyMap.planets.length} planets`);
```

### Example 2: Custom Resource Distribution

```typescript
const generator = new GalaxyMapGenerator({
  width: 150,
  height: 150,
  numPlayers: 2,
  neutralPlanets: 50,
  resourceDistribution: {
    poor: 10,      // More valuable resources
    normal: 30,
    rich: 40,
    abundant: 20
  }
});
```

### Example 3: Reproducible Maps

```typescript
const seed = 'tournament-map-001';

// Game 1
const gen1 = new GalaxyMapGenerator({ seed });
const map1 = gen1.generate(playerIds);

// Game 2 (same layout)
const gen2 = new GalaxyMapGenerator({ seed });
const map2 = gen2.generate(playerIds);

// map1 and map2 have identical planet positions
```

### Example 4: Finding Nearest Planets

```typescript
const generator = new GalaxyMapGenerator({ neutralPlanets: 20 });
const galaxyMap = generator.generate(playerIds);

// Find nearest planet from center
const result = generator.findNearestUnoccupiedPlanet({ x: 50, y: 50 });

if (result.planet) {
  console.log(`Nearest: ${result.planet.name}`);
  console.log(`Distance: ${result.distance.toFixed(2)}`);
}
```

### Example 5: JSON Export for Client

```typescript
const generator = new GalaxyMapGenerator();
const galaxyMap = generator.generate(playerIds);

// Export to JSON for client-side rendering
const json = GalaxyMapGenerator.exportToJSON(galaxyMap);

// Send to client
res.json(JSON.parse(json));
```

### Example 6: Different Map Sizes

```typescript
// Small (2-4 players)
const small = new GalaxyMapGenerator({
  width: 50,
  height: 50,
  numPlayers: 2,
  neutralPlanets: 10
});

// Medium (4-6 players)
const medium = new GalaxyMapGenerator({
  width: 100,
  height: 100,
  numPlayers: 4,
  neutralPlanets: 30
});

// Large (6-8 players)
const large = new GalaxyMapGenerator({
  width: 200,
  height: 200,
  numPlayers: 8,
  neutralPlanets: 80
});
```

---

## Integration

### With Game System

```typescript
import { GalaxyMapGenerator } from '@/galaxy/GalaxyMapGenerator';
import { GameManager } from '@/game/GameManager';

// Create new game with galaxy
const generator = new GalaxyMapGenerator({
  seed: gameId,
  numPlayers: playerIds.length
});

const galaxyMap = generator.generate(playerIds);

// Initialize game with planets
gameManager.initializeGalaxy(galaxyMap);
```

### With Database

```typescript
import { galaxyMapModel } from '@/database/models/GalaxyMapModel';

// Save to database
const json = GalaxyMapGenerator.exportToJSON(galaxyMap);
galaxyMapModel.create({
  gameId,
  seed: galaxyMap.seed,
  data: json
});

// Load from database
const saved = galaxyMapModel.findByGameId(gameId);
const galaxyMap = GalaxyMapGenerator.importFromJSON(saved.data);
```

### With Frontend

```typescript
// Backend endpoint
app.get('/api/games/:id/galaxy', (req, res) => {
  const game = gameManager.getGame(req.params.id);
  const galaxyMap = game.getGalaxyMap();
  res.json(galaxyMap);
});

// Frontend usage
const response = await fetch(`/api/games/${gameId}/galaxy`);
const galaxyMap = await response.json();

// Render on canvas
renderGalaxy(galaxyMap.planets, galaxyMap.dimensions);
```

---

## Resource Multipliers

| Level | Multiplier | Description |
|-------|------------|-------------|
| Poor | 0.5ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | 50% of base resources |
| Normal | 1.0ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | 100% of base resources |
| Rich | 1.5ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | 150% of base resources |
| Abundant | 2.5ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â | 250% of base resources |

### Base Resources

**Starting Planets:**
- Minerals: 2,000
- Energy: 1,000
- Credits: 500
- Population: 500

**Neutral Planets:**
- Minerals: 1,000
- Energy: 500
- Credits: 0
- Population: 0

---

## Performance Considerations

### Generation Time

- **Small (50ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â50, 20 planets):** < 10ms
- **Medium (100ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â100, 50 planets):** < 50ms
- **Large (200ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â200, 100 planets):** < 100ms
- **Huge (300ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â300, 200 planets):** < 200ms

### Optimization Tips

1. **Adjust minPlanetDistance** - Lower values allow denser placement
2. **Pre-generate maps** - Generate maps during server startup
3. **Cache results** - Store generated maps in database
4. **Limit retries** - Default max attempts = neutralPlanets ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 10

---

## Testing

Run the test suite:

```bash
npm test -- GalaxyMapGenerator.test.ts
```

Tests cover:
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Seeded random number generation
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Distance calculations
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Reproducible map generation
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Planet placement validation
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Resource distribution
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Minimum distance enforcement
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Boundary checking
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Nearest planet search
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ JSON export/import
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Statistics calculation

---

## Troubleshooting

### Problem: Not enough neutral planets placed

**Solution:** Reduce `minPlanetDistance` or increase galaxy size

### Problem: Players too close together

**Solution:** Increase `minPlayerDistance`

### Problem: Generation takes too long

**Solution:** Reduce `neutralPlanets` or increase galaxy size

### Problem: Maps not reproducible

**Solution:** Ensure same seed and configuration

---

## See Also

- [Planet System](./PLANETS.md) - Planet management
- [Building System](./BUILDING-SYSTEM.md) - Building construction
- [Database Schema](./DATABASE.md) - Data persistence
- [API Documentation](./API.md) - REST endpoints
