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

/**
 * @route   GET /api/game/planets
 * @desc    Get all planets
 * @access  Public
 */
router.get('/planets', (req: Request, res: Response) => {
  const { gameManager } = req.app.locals;
  
  try {
    const gameState = gameManager.getGameState();
    
    res.json({
      count: gameState.planets.length,
      planets: gameState.planets
    });
  } catch (error) {
    logger.error('Error fetching planets:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch planets'
    });
  }
});

/**
 * @route   GET /api/game/planets/:id
 * @desc    Get planet details
 * @access  Public
 */
router.get('/planets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { gameManager } = req.app.locals;
  
  try {
    const gameState = gameManager.getGameState();
    const planet = gameState.planets.find((p: any) => p.id === id);

    if (!planet) {
      return res.status(404).json({
        error: 'Planet not found'
      });
    }

    res.json(planet);
  } catch (error) {
    logger.error('Error fetching planet:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch planet'
    });
  }
});

/**
 * @route   POST /api/game/planets/:id/colonize
 * @desc    Colonize a planet
 * @access  Private (requires authentication or player session)
 */
router.post('/planets/:id/colonize', (req: Request, res: Response) => {
  const { id: planetId } = req.params;
  const { gameManager, playerManager, io } = req.app.locals;
  
  try {
    // Get player ID from authenticated request or session
    // For now, using a header or body parameter
    const playerId = (req as any).userId || req.body.playerId || req.headers['x-player-id'];
    
    if (!playerId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Player ID required'
      });
    }
    
    const player = playerManager.getPlayer(playerId);
    
    if (!player) {
      return res.status(404).json({
        error: 'Player not found'
      });
    }

    // Get planet from game state
    const gameState = gameManager.getGameState();
    const planet = gameState.planets.find((p: any) => p.id === planetId);

    if (!planet) {
      return res.status(404).json({
        error: 'Planet not found'
      });
    }

    if (planet.ownerId) {
      return res.status(400).json({
        error: 'Planet already colonized',
        ownerId: planet.ownerId
      });
    }

    // Check resources (cost: 500 minerals, 300 energy, 1000 credits)
    if (
      player.resources.minerals < 500 ||
      player.resources.energy < 300 ||
      player.resources.credits < 1000
    ) {
      return res.status(400).json({
        error: 'Insufficient resources',
        required: {
          minerals: 500,
          energy: 300,
          credits: 1000
        },
        current: player.resources
      });
    }

    // Colonize planet
    planet.ownerId = playerId;
    player.resources.minerals -= 500;
    player.resources.energy -= 300;
    player.resources.credits -= 1000;
    
    if (!player.planets.includes(planetId)) {
      player.planets.push(planetId);
    }

    // Broadcast update
    io.emit('planet:colonized', {
      planetId,
      ownerId: playerId,
      planet,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      planet,
      resources: player.resources,
      message: 'Planet colonized successfully'
    });

    logger.info(`Player ${playerId} colonized planet ${planetId}`);
  } catch (error) {
    logger.error('Error colonizing planet:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to colonize planet'
    });
  }
});

export default router;
