export const SHIP_TYPES: Record<string, {
  name: string;
  cost: { minerals: number; energy: number; credits: number };
  buildTime: number;
  maxHealth: number;
  speed: number;
  damage: number;
  capacity: number;
}> = {
  scout: {
    name: 'Scout',
    cost: { minerals: 100, energy: 50, credits: 200 },
    buildTime: 30,
    maxHealth: 50,
    speed: 150,
    damage: 10,
    capacity: 0
  },
  fighter: {
    name: 'Fighter',
    cost: { minerals: 200, energy: 100, credits: 400 },
    buildTime: 60,
    maxHealth: 100,
    speed: 100,
    damage: 25,
    capacity: 0
  },
  cruiser: {
    name: 'Cruiser',
    cost: { minerals: 500, energy: 250, credits: 1000 },
    buildTime: 120,
    maxHealth: 300,
    speed: 75,
    damage: 50,
    capacity: 0
  },
  battleship: {
    name: 'Battleship',
    cost: { minerals: 1000, energy: 500, credits: 2000 },
    buildTime: 240,
    maxHealth: 600,
    speed: 50,
    damage: 100,
    capacity: 0
  },
  carrier: {
    name: 'Carrier',
    cost: { minerals: 1500, energy: 750, credits: 3000 },
    buildTime: 360,
    maxHealth: 500,
    speed: 40,
    damage: 30,
    capacity: 10
  },
  transport: {
    name: 'Transport',
    cost: { minerals: 300, energy: 150, credits: 600 },
    buildTime: 90,
    maxHealth: 200,
    speed: 60,
    damage: 5,
    capacity: 1000
  }
};
