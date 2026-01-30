export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  resources: {
    minerals: number;
    energy: number;
    credits: number;
  };
  planets: string[];
  ships: string[];
  allianceId: string | null;
  color: string;
}

export interface Planet {
  id: string;
  name: string;
  position: Position;
  size: number;
  ownerId: string | null;
  resources: {
    minerals: number;
    energy: number;
  };
  production: {
    minerals: number;
    energy: number;
    credits: number;
  };
  population: number;
  maxPopulation: number;
  buildings: Building[];
}

export interface Building {
  id: string;
  type: string;
  level: number;
  constructionProgress: number;
}

export interface Ship {
  id: string;
  type: string;
  ownerId: string;
  position: Position;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  fleetId: string | null;
}

export interface Fleet {
  id: string;
  ownerId: string;
  shipIds: string[];
  position: Position;
  destination: Position | null;
  speed: number;
}

export interface Alliance {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  createdAt: number;
  description: string;
}

export interface GameState {
  id: string;
  players: Player[];
  planets: Planet[];
  ships: Ship[];
  alliances: Alliance[];
  timestamp: number;
}

export interface PlayerAction {
  type: string;
  data: any;
}
