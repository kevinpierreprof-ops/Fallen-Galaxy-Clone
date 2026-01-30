import { GameState, PlayerAction, Player } from '@shared/types/game';
import { PlanetManager } from '@/planets/PlanetManager';
import { ShipManager } from '@/ships/ShipManager';
import { AllianceManager } from '@/alliances/AllianceManager';
import { logger } from '@/utils/logger';

export class Game {
  private id: string;
  private players: Map<string, Player> = new Map();
  private planetManager: PlanetManager;
  private shipManager: ShipManager;
  private allianceManager: AllianceManager;
  private lastUpdate: number;

  constructor(id: string) {
    this.id = id;
    this.planetManager = new PlanetManager();
    this.shipManager = new ShipManager();
    this.allianceManager = new AllianceManager();
    this.lastUpdate = Date.now();
    this.initialize();
  }

  private initialize(): void {
    // Generate initial planets
    this.planetManager.generatePlanets(50);
    logger.info(`Game ${this.id} initialized with planets`);
  }

  addPlayer(playerId: string, data: any): void {
    const player: Player = {
      id: playerId,
      name: data.name || `Player_${playerId.substring(0, 6)}`,
      resources: {
        minerals: 1000,
        energy: 500,
        credits: 5000
      },
      planets: [],
      ships: [],
      allianceId: null,
      color: this.generatePlayerColor()
    };

    this.players.set(playerId, player);
    
    // Assign starting planet
    const startingPlanet = this.planetManager.assignStartingPlanet(playerId);
    if (startingPlanet) {
      player.planets.push(startingPlanet.id);
    }
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  processAction(playerId: string, action: PlayerAction): void {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (action.type) {
      case 'colonize_planet':
        this.planetManager.colonizePlanet(action.data.planetId, playerId);
        break;
      case 'build_ship':
        this.shipManager.buildShip(playerId, action.data.shipType, action.data.planetId);
        break;
      case 'move_fleet':
        this.shipManager.moveFleet(action.data.fleetId, action.data.destination);
        break;
      case 'create_alliance':
        this.allianceManager.createAlliance(playerId, action.data.name);
        break;
      case 'join_alliance':
        this.allianceManager.joinAlliance(playerId, action.data.allianceId);
        break;
      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  update(): void {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
    
    // Update game systems
    this.planetManager.update(deltaTime);
    this.shipManager.update(deltaTime);
    
    // Update player resources based on planets
    this.players.forEach((player) => {
      const planetProduction = this.planetManager.calculateProduction(player.planets);
      player.resources.minerals += planetProduction.minerals * deltaTime;
      player.resources.energy += planetProduction.energy * deltaTime;
      player.resources.credits += planetProduction.credits * deltaTime;
    });

    this.lastUpdate = now;
  }

  getState(): GameState {
    return {
      id: this.id,
      players: Array.from(this.players.values()),
      planets: this.planetManager.getPlanets(),
      ships: this.shipManager.getShips(),
      alliances: this.allianceManager.getAlliances(),
      timestamp: Date.now()
    };
  }

  private generatePlayerColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[this.players.size % colors.length];
  }
}
