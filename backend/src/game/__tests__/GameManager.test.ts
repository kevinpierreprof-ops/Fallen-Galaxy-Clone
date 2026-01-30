import { GameManager } from '../GameManager';

describe('GameManager', () => {
  let gameManager: GameManager;

  beforeEach(() => {
    gameManager = new GameManager();
  });

  test('should initialize with main game', () => {
    expect(gameManager.getActiveGameCount()).toBe(1);
  });

  test('should handle player join', () => {
    const playerId = 'test-player-1';
    const playerData = { name: 'Test Player' };
    
    gameManager.handlePlayerJoin(playerId, playerData);
    
    const gameState = gameManager.getGameState();
    expect(gameState.players).toHaveLength(1);
    expect(gameState.players[0].id).toBe(playerId);
  });

  test('should handle player leave', () => {
    const playerId = 'test-player-1';
    gameManager.handlePlayerJoin(playerId, { name: 'Test' });
    gameManager.handlePlayerLeave(playerId);
    
    const gameState = gameManager.getGameState();
    expect(gameState.players).toHaveLength(0);
  });

  test('should create new game', () => {
    const newGame = gameManager.createGame('custom-game-1');
    expect(newGame).toBeDefined();
    expect(gameManager.getActiveGameCount()).toBe(2);
  });
});
