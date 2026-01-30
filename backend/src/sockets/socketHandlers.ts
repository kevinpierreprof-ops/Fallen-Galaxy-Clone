/**
 * Socket.io Event Handlers
 * 
 * Handles all Socket.io events for real-time game communication.
 * Manages player connections, game actions, chat messages, and more.
 */

import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { GameManager } from '@/game/GameManager';
import { PlayerManager } from '@/players/PlayerManager';
import type { TypedSocket } from '@/types/socket';
import type { PlayerAction } from '@shared/types/game';

/**
 * Setup all Socket.io event handlers for a connected client
 * 
 * @param socket - Connected socket instance
 * @param io - Socket.io server instance
 * @param gameManager - Game manager instance
 * @param playerManager - Player manager instance
 */
export const setupSocketHandlers = (
  socket: TypedSocket,
  io: SocketIOServer,
  gameManager: GameManager,
  playerManager: PlayerManager
): void => {
  
  // ========================================================================
  // AUTHENTICATION
  // ========================================================================

  /**
   * Authenticate socket connection with JWT token
   * Should be called immediately after connection
   */
  socket.on('auth:authenticate', (data: { token: string }) => {
    try {
      const { token } = data;
      
      if (!token) {
        socket.emit('error', {
          message: 'Authentication token required',
          code: 'AUTH_TOKEN_REQUIRED'
        });
        return;
      }

      // Verify JWT token
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret) as { userId: string; email: string };
      
      // Store authenticated user data in socket
      socket.data.playerId = decoded.userId;
      socket.data.playerName = decoded.email.split('@')[0];
      
      socket.emit('auth:success', {
        playerId: decoded.userId,
        playerName: socket.data.playerName
      });
      
      logger.info(`Socket authenticated: ${socket.id} as ${decoded.email}`);
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      socket.emit('error', {
        message: 'Invalid authentication token',
        code: 'AUTH_INVALID_TOKEN'
      });
    }
  });

  // ========================================================================
  // PLAYER JOIN/LEAVE
  // ========================================================================

  /**
   * Handle player joining the game
   */
  socket.on('player:join', (data: { name: string }) => {
    try {
      const playerName = data.name || socket.data.playerName || `Player_${socket.id.substring(0, 6)}`;
      
      // Add player to managers
      playerManager.addPlayer(socket.id, { name: playerName });
      gameManager.handlePlayerJoin(socket.id, { name: playerName });
      
      // Get player data
      const player = playerManager.getPlayer(socket.id);
      
      // Notify the player they joined successfully
      socket.emit('player:joined', {
        success: true,
        playerId: socket.id,
        player: player
      });
      
      // Notify all other players about the new player
      socket.broadcast.emit('player:new', {
        playerId: socket.id,
        playerName: playerName,
        timestamp: Date.now()
      });
      
      logger.info(`Player joined game: ${playerName} (${socket.id})`);
    } catch (error) {
      logger.error('Error handling player join:', error);
      socket.emit('error', {
        message: 'Failed to join game',
        code: 'JOIN_FAILED'
      });
    }
  });

  // ========================================================================
  // GAME ACTIONS
  // ========================================================================

  /**
   * Handle game actions from players
   * (colonize planet, build ship, move fleet, etc.)
   */
  socket.on('game:action', (action: PlayerAction) => {
    try {
      logger.debug(`Game action from ${socket.id}:`, action);
      
      // Validate action
      if (!action || !action.type) {
        socket.emit('error', {
          message: 'Invalid action format',
          code: 'INVALID_ACTION'
        });
        return;
      }
      
      // Process action through game manager
      gameManager.handleAction(socket.id, action);
      
      // Acknowledge action
      socket.emit('game:action:success', {
        actionType: action.type,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Error processing game action:', error);
      socket.emit('error', {
        message: 'Failed to process action',
        code: 'ACTION_FAILED'
      });
    }
  });

  // ========================================================================
  // PLANET COLONIZATION
  // ========================================================================

  /**
   * Handle planet colonization via WebSocket
   */
  socket.on('planet:colonize', async (data: { planetId: string }) => {
    try {
      const playerId = socket.data.playerId || socket.id;
      const { planetId } = data;

      if (!planetId) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Planet ID is required'
        });
        return;
      }

      // Import planet model
      const { planetModel } = await import('@/database/models/PlanetModel');
      
      // Get planet
      const dbPlanet = planetModel.findById(planetId);
      
      if (!dbPlanet) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Planet not found'
        });
        return;
      }
      
      // Check if planet is already owned
      if (dbPlanet.owner_id) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Planet is already colonized'
        });
        return;
      }
      
      // Get player
      const player = playerManager.getPlayer(playerId);
      
      if (!player) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Player not found'
        });
        return;
      }
      
      // Colonization costs
      const COLONIZATION_COST = {
        minerals: 500,
        energy: 300,
        credits: 1000
      };
      
      // Check if player has sufficient resources
      if (player.resources.minerals < COLONIZATION_COST.minerals) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Insufficient minerals',
          required: COLONIZATION_COST.minerals,
          current: player.resources.minerals
        });
        return;
      }
      
      if (player.resources.energy < COLONIZATION_COST.energy) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Insufficient energy',
          required: COLONIZATION_COST.energy,
          current: player.resources.energy
        });
        return;
      }
      
      if (player.resources.credits < COLONIZATION_COST.credits) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Insufficient credits',
          required: COLONIZATION_COST.credits,
          current: player.resources.credits
        });
        return;
      }
      
      // Deduct resources from player
      player.resources.minerals -= COLONIZATION_COST.minerals;
      player.resources.energy -= COLONIZATION_COST.energy;
      player.resources.credits -= COLONIZATION_COST.credits;
      
      // Colonize planet
      const updatedDbPlanet = planetModel.colonize(planetId, playerId, 100);
      
      if (!updatedDbPlanet) {
        socket.emit('colonize:error', {
          success: false,
          error: 'Failed to colonize planet'
        });
        return;
      }
      
      // Add planet to player's planets list
      if (!player.planets.includes(planetId)) {
        player.planets.push(planetId);
      }
      
      // Transform planet to API format
      const planet = {
        id: updatedDbPlanet.id,
        name: updatedDbPlanet.name,
        position: {
          x: updatedDbPlanet.x_position,
          y: updatedDbPlanet.y_position
        },
        size: updatedDbPlanet.size,
        ownerId: updatedDbPlanet.owner_id,
        population: updatedDbPlanet.population,
        resources: {
          minerals: updatedDbPlanet.minerals,
          energy: updatedDbPlanet.energy,
          credits: 0
        },
        production: {
          minerals: updatedDbPlanet.production_minerals,
          energy: updatedDbPlanet.production_energy,
          credits: updatedDbPlanet.production_credits
        },
        maxPopulation: updatedDbPlanet.max_population,
        buildings: updatedDbPlanet.buildings_json ? JSON.parse(updatedDbPlanet.buildings_json) : []
      };
      
      // Emit success to client
      socket.emit('colonize:success', {
        success: true,
        planet,
        player: {
          id: player.id,
          resources: player.resources,
          planets: player.planets
        }
      });
      
      // Broadcast colonization event to all clients
      io.emit('planet:colonized', {
        planet,
        playerId
      });
      
      logger.info(`Planet ${planet.name} colonized by player ${playerId} via WebSocket`);
    } catch (error) {
      logger.error('Error handling planet colonization:', error);
      socket.emit('colonize:error', {
        success: false,
        error: 'Failed to colonize planet'
      });
    }
  });

  // ========================================================================
  // CHAT SYSTEM
  // ========================================================================

  /**
   * Handle chat messages
   */
  socket.on('chat:message', (message: { text: string; channelId?: string }) => {
    try {
      const player = playerManager.getPlayer(socket.id);
      
      if (!player) {
        socket.emit('error', {
          message: 'Player not found',
          code: 'PLAYER_NOT_FOUND'
        });
        return;
      }
      
      // Validate message
      if (!message.text || message.text.trim().length === 0) {
        return;
      }
      
      // Sanitize message (prevent XSS)
      const sanitizedText = message.text
        .substring(0, 500) // Max 500 characters
        .replace(/[<>]/g, ''); // Remove < and >
      
      // Log the message
      playerManager.handleMessage(socket.id, { text: sanitizedText });
      
      // Broadcast message to all players
      io.emit('chat:message', {
        playerId: socket.id,
        playerName: player.name,
        message: sanitizedText,
        timestamp: Date.now(),
        channelId: message.channelId || 'global'
      });
      
      logger.debug(`Chat message from ${player.name}: ${sanitizedText}`);
    } catch (error) {
      logger.error('Error handling chat message:', error);
    }
  });

  /**
   * Handle private messages
   */
  socket.on('chat:private', (data: { recipientId: string; text: string }) => {
    try {
      const sender = playerManager.getPlayer(socket.id);
      
      if (!sender) return;
      
      // Validate message
      if (!data.text || data.text.trim().length === 0) return;
      
      const sanitizedText = data.text.substring(0, 500).replace(/[<>]/g, '');
      
      // Send to recipient
      io.to(data.recipientId).emit('chat:private', {
        senderId: socket.id,
        senderName: sender.name,
        message: sanitizedText,
        timestamp: Date.now()
      });
      
      // Confirm to sender
      socket.emit('chat:private:sent', {
        recipientId: data.recipientId,
        timestamp: Date.now()
      });
      
      logger.debug(`Private message from ${sender.name} to ${data.recipientId}`);
    } catch (error) {
      logger.error('Error handling private message:', error);
    }
  });

  // ========================================================================
  // ALLIANCE SYSTEM
  // ========================================================================

  /**
   * Handle alliance creation
   */
  socket.on('alliance:create', (data: { name: string }) => {
    try {
      // Create alliance action
      gameManager.handleAction(socket.id, {
        type: 'create_alliance',
        data: { name: data.name }
      });
      
      socket.emit('alliance:created', {
        success: true,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Error creating alliance:', error);
      socket.emit('error', {
        message: 'Failed to create alliance',
        code: 'ALLIANCE_CREATE_FAILED'
      });
    }
  });

  /**
   * Handle alliance join request
   */
  socket.on('alliance:join', (data: { allianceId: string }) => {
    try {
      gameManager.handleAction(socket.id, {
        type: 'join_alliance',
        data: { allianceId: data.allianceId }
      });
      
      socket.emit('alliance:joined', {
        success: true,
        allianceId: data.allianceId,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Error joining alliance:', error);
      socket.emit('error', {
        message: 'Failed to join alliance',
        code: 'ALLIANCE_JOIN_FAILED'
      });
    }
  });

  // ========================================================================
  // PING/PONG FOR CONNECTION HEALTH
  // ========================================================================

  /**
   * Respond to ping messages to keep connection alive
   */
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // ========================================================================
  // PLAYER STATUS
  // ========================================================================

  /**
   * Handle player status updates (online, away, busy)
   */
  socket.on('player:status', (data: { status: string }) => {
    try {
      const player = playerManager.getPlayer(socket.id);
      if (player) {
        // Broadcast status change to other players
        socket.broadcast.emit('player:status:changed', {
          playerId: socket.id,
          playerName: player.name,
          status: data.status,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      logger.error('Error handling status update:', error);
    }
  });
};
