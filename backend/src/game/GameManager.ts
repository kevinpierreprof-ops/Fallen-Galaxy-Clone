import { Game } from './Game';
import { GameState, PlayerAction } from '@shared/types/game';
import { logger } from '@/utils/logger';

export class GameManager {
  private games: Map<string, Game> = new Map();
  private mainGame: Game;

  constructor() {
    // Initialize main game instance
    this.mainGame = new Game('main');
    this.games.set('main', this.mainGame);
    logger.info('GameManager initialized');
  }

  handlePlayerJoin(playerId: string, data: any): void {
    this.mainGame.addPlayer(playerId, data);
    logger.info(`Player ${playerId} joined game`);
  }

  handlePlayerLeave(playerId: string): void {
    this.mainGame.removePlayer(playerId);
    logger.info(`Player ${playerId} left game`);
  }

  handleAction(playerId: string, action: PlayerAction): void {
    const game = this.mainGame;
    if (game) {
      game.processAction(playerId, action);
    }
  }

  update(): void {
    // Update all active games
    this.games.forEach((game) => {
      game.update();
    });
  }

  getGameState(): GameState {
    return this.mainGame.getState();
  }

  getActiveGameCount(): number {
    return this.games.size;
  }

  createGame(gameId: string): Game {
    const game = new Game(gameId);
    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  removeGame(gameId: string): void {
    this.games.delete(gameId);
  }
}
