/**
 * Game Routes
 * 
 * Handles game-related API endpoints:
 * - GET /api/game/stats - Get game statistics
 * - GET /api/game/state - Get current game state
 * - GET /api/game/players - Get list of active players
 * - GET /api/game/leaderboard - Get player leaderboard
 */

import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { authenticateToken } from '@/middleware/auth';
import type { AuthRequest } from '@/types/auth';

const router = Router();

/**
 * @route   GET /api/game/stats
 * @desc    Get overall game statistics
 * @access  Public
 */
router.get('/stats', (req: Request, res: Response) => {
  const { gameManager, playerManager } = req.app.locals;
  
  const stats = {
    activePlayers: playerManager.getActivePlayerCount(),
    activeGames: gameManager.getActiveGameCount(),
    timestamp: new Date().toISOString()
  };

  res.json(stats);
});

/**
 * @route   GET /api/game/state
 * @desc    Get current game state
 * @access  Private
 */
router.get('/state', authenticateToken, (req: AuthRequest, res: Response) => {
  const { gameManager } = req.app.locals;
  
  try {
    const gameState = gameManager.getGameState();
    
    res.json({
      success: true,
      state: gameState
    });
  } catch (error) {
    logger.error('Error fetching game state:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch game state'
    });
  }
});

/**
 * @route   GET /api/game/players
 * @desc    Get list of active players
 * @access  Public
 */
router.get('/players', (req: Request, res: Response) => {
  const { playerManager } = req.app.locals;
  
  const players = playerManager.getAllPlayers();
  
  res.json({
    count: players.length,
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      planets: p.planets.length,
      ships: p.ships.length
    }))
  });
});

/**
 * @route   GET /api/game/leaderboard
 * @desc    Get player leaderboard sorted by score
 * @access  Public
 */
router.get('/leaderboard', (req: Request, res: Response) => {
  const { playerManager, gameManager } = req.app.locals;
  
  const players = playerManager.getAllPlayers();
  const gameState = gameManager.getGameState();
  
  // Calculate scores based on resources and assets
  const leaderboard = players.map(player => {
    const score = 
      player.resources.minerals * 0.5 +
      player.resources.energy * 0.3 +
      player.resources.credits * 1.0 +
      player.planets.length * 1000 +
      player.ships.length * 500;
    
    return {
      id: player.id,
      name: player.name,
      score: Math.floor(score),
      planets: player.planets.length,
      ships: player.ships.length,
      resources: player.resources
    };
  }).sort((a, b) => b.score - a.score);
  
  res.json({
    count: leaderboard.length,
    leaderboard
  });
});

export default router;
