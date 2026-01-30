/**
 * Planet Routes
 * 
 * Handles planet-related API endpoints:
 * - GET /api/game/planets - Get all planets
 * - GET /api/game/planets/:id - Get planet details
 * - POST /api/game/planets/:id/colonize - Colonize a planet
 */

import { Router, Request, Response } from 'express';
import { logger } from '@/utils/logger';
import { authenticateToken } from '@/middleware/auth';
import { planetModel } from '@/database/models/PlanetModel';
import { userModel } from '@/database/models/UserModel';
import type { AuthRequest } from '@/types/auth';
import type { Planet as DBPlanet } from '@/database/models/PlanetModel';

const router = Router();

// Colonization costs
const COLONIZATION_COST = {
  minerals: 500,
  energy: 300,
  credits: 1000
};

/**
 * Helper function to transform database planet to API format
 */
function transformPlanet(dbPlanet: DBPlanet) {
  return {
    id: dbPlanet.id,
    name: dbPlanet.name,
    x: dbPlanet.x_position,
    y: dbPlanet.y_position,
    size: dbPlanet.size,
    ownerId: dbPlanet.owner_id,
    population: dbPlanet.population,
    resources: {
      minerals: dbPlanet.minerals,
      energy: dbPlanet.energy,
      credits: 0 // Credits are stored at player level
    },
    production: {
      minerals: dbPlanet.production_minerals,
      energy: dbPlanet.production_energy,
      credits: dbPlanet.production_credits
    },
    maxPopulation: dbPlanet.max_population,
    buildings: dbPlanet.buildings_json ? JSON.parse(dbPlanet.buildings_json) : []
  };
}

/**
 * @route   GET /api/game/planets
 * @desc    Get all planets in the galaxy
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const dbPlanets = planetModel.findAll();
    const planets = dbPlanets.map(transformPlanet);
    
    res.json({
      success: true,
      planets
    });
  } catch (error) {
    logger.error('Error fetching planets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch planets'
    });
  }
});

/**
 * @route   GET /api/game/planets/:id
 * @desc    Get detailed information about a specific planet
 * @access  Public
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dbPlanet = planetModel.findById(id);
    
    if (!dbPlanet) {
      return res.status(404).json({
        success: false,
        error: 'Planet not found'
      });
    }
    
    const planet = transformPlanet(dbPlanet);
    
    res.json({
      success: true,
      planet
    });
  } catch (error) {
    logger.error('Error fetching planet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch planet'
    });
  }
});

/**
 * @route   POST /api/game/planets/:id/colonize
 * @desc    Colonize a neutral planet
 * @access  Private
 */
router.post('/:id/colonize', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: planetId } = req.params;
    const playerId = req.user!.userId;
    
    // Get planet
    const dbPlanet = planetModel.findById(planetId);
    
    if (!dbPlanet) {
      return res.status(404).json({
        success: false,
        error: 'Planet not found'
      });
    }
    
    // Check if planet is already owned
    if (dbPlanet.owner_id) {
      return res.status(400).json({
        success: false,
        error: 'Planet is already colonized'
      });
    }
    
    // Get player
    const user = userModel.findById(playerId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }
    
    // For now, we'll use a simple resource tracking in the GameManager
    // In a real implementation, you'd have a PlayerModel with resources
    const { playerManager } = req.app.locals;
    const player = playerManager.getPlayer(playerId);
    
    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not connected to game'
      });
    }
    
    // Check if player has sufficient resources
    if (player.resources.minerals < COLONIZATION_COST.minerals) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient minerals',
        required: COLONIZATION_COST.minerals,
        current: player.resources.minerals
      });
    }
    
    if (player.resources.energy < COLONIZATION_COST.energy) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient energy',
        required: COLONIZATION_COST.energy,
        current: player.resources.energy
      });
    }
    
    if (player.resources.credits < COLONIZATION_COST.credits) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient credits',
        required: COLONIZATION_COST.credits,
        current: player.resources.credits
      });
    }
    
    // Deduct resources from player
    player.resources.minerals -= COLONIZATION_COST.minerals;
    player.resources.energy -= COLONIZATION_COST.energy;
    player.resources.credits -= COLONIZATION_COST.credits;
    
    // Colonize planet
    const updatedDbPlanet = planetModel.colonize(planetId, playerId, 100);
    
    if (!updatedDbPlanet) {
      return res.status(500).json({
        success: false,
        error: 'Failed to colonize planet'
      });
    }
    
    // Add planet to player's planets list
    if (!player.planets.includes(planetId)) {
      player.planets.push(planetId);
    }
    
    const planet = transformPlanet(updatedDbPlanet);
    
    // Broadcast colonization event to all clients
    const { io } = req.app.locals;
    io.emit('planet:colonized', {
      planet,
      playerId
    });
    
    logger.info(`Planet ${planet.name} colonized by player ${playerId}`);
    
    res.json({
      success: true,
      planet,
      player: {
        id: player.id,
        resources: player.resources,
        planets: player.planets
      }
    });
  } catch (error) {
    logger.error('Error colonizing planet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to colonize planet'
    });
  }
});

export default router;
