/**
 * Example: Using Path Aliases in Backend
 * 
 * This file demonstrates how to use the configured path aliases
 * for clean and maintainable imports.
 */

// ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Using path aliases - Clean and maintainable
import { GameManager } from '@/game/GameManager';
import { PlayerManager } from '@/players/PlayerManager';
import { PlanetManager } from '@/planets/PlanetManager';
import { ShipManager } from '@/ships/ShipManager';
import { AllianceManager } from '@/alliances/AllianceManager';
import { MessagingManager } from '@/messaging/MessagingManager';
import { logger } from '@/utils/logger';

// Shared types and constants
import type { GameState, Player, Planet } from '@shared/types/game';
import { SHIP_TYPES } from '@shared/constants/ships';
import { GAME_CONFIG } from '@shared/constants/game';

// ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Without path aliases - Messy and error-prone
// import { GameManager } from '../../../game/GameManager';
// import { PlayerManager } from '../../../players/PlayerManager';
// import { logger } from '../../../utils/logger';

export class ExampleService {
  private gameManager: GameManager;
  private playerManager: PlayerManager;
  private planetManager: PlanetManager;

  constructor() {
    this.gameManager = new GameManager();
    this.playerManager = new PlayerManager();
    this.planetManager = new PlanetManager();

    logger.info('ExampleService initialized');
  }

  async initializeGame(): Promise<GameState> {
    // Generate planets using shared config
    this.planetManager.generatePlanets(GAME_CONFIG.INITIAL_PLANETS);

    // Get initial game state with proper typing
    const gameState = this.gameManager.getGameState();

    // Type-safe ship access
    const scoutStats = SHIP_TYPES.scout;
    logger.debug('Scout ship stats:', scoutStats);

    return gameState;
  }

  addPlayer(playerId: string, name: string): Player | null {
    // Properly typed player object
    const playerData = { name };
    this.playerManager.addPlayer(playerId, playerData);

    // Type-safe player retrieval
    const player = this.playerManager.getPlayer(playerId);
    
    if (!player) {
      logger.warn(`Failed to add player: ${playerId}`);
      return null;
    }

    logger.info(`Player added: ${player.name} (${player.id})`);
    return player;
  }

  assignStartingPlanet(playerId: string): Planet | null {
    const planet = this.planetManager.assignStartingPlanet(playerId);
    
    if (!planet) {
      logger.error(`No available starting planet for player ${playerId}`);
      return null;
    }

    logger.info(`Assigned planet ${planet.name} to player ${playerId}`);
    return planet;
  }
}

// Example usage with full type safety
async function main() {
  const service = new ExampleService();
  
  // Initialize game
  const gameState = await service.initializeGame();
  console.log(`Game initialized with ${gameState.planets.length} planets`);

  // Add players
  const player1 = service.addPlayer('player-1', 'Alice');
  const player2 = service.addPlayer('player-2', 'Bob');

  // Assign starting planets
  if (player1) {
    const planet1 = service.assignStartingPlanet(player1.id);
    console.log(`Player ${player1.name} starts on ${planet1?.name}`);
  }

  if (player2) {
    const planet2 = service.assignStartingPlanet(player2.id);
    console.log(`Player ${player2.name} starts on ${planet2?.name}`);
  }
}

// Only run if executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Failed to run example:', error);
    process.exit(1);
  });
}
