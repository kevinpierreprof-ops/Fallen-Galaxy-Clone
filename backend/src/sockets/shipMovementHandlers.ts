/**
 * Ship Movement Socket Handlers
 * 
 * Real-time socket handlers for ship movement operations
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { shipMovementManager } from '@/ships/ShipMovementManager';

/**
 * Move ship request
 */
interface MoveShipRequest {
  shipId: string;
  destinationPlanetId: string;
  allowCombat?: boolean;
}

/**
 * Cancel movement request
 */
interface CancelMovementRequest {
  shipId: string;
}

/**
 * Setup ship movement socket handlers
 * 
 * @param io - Socket.IO server
 * @param socket - Client socket
 */
export function setupShipMovementHandlers(io: SocketIOServer, socket: Socket): void {
  const userId = (socket as any).userId; // Set by auth middleware

  /**
   * Move ship to destination
   */
  socket.on('ship:move', async (data: MoveShipRequest, callback) => {
    try {
      const { shipId, destinationPlanetId, allowCombat = false } = data;

      logger.info(`Player ${userId} moving ship ${shipId} to ${destinationPlanetId}`);

      // TODO: Verify ship ownership
      // const ship = await shipModel.findById(shipId);
      // if (!ship || ship.ownerId !== userId) {
      //   return callback({ success: false, message: 'Ship not found or not owned' });
      // }

      // Move ship
      const result = shipMovementManager.moveShip(
        shipId,
        destinationPlanetId,
        allowCombat
      );

      if (result.success) {
        // Movement successful
        callback({ 
          success: true, 
          message: result.message,
          data: result.data 
        });

        // Log movement
        logger.info(
          `Ship ${shipId} moving to ${destinationPlanetId}. ` +
          `ETA: ${result.data?.travelTime}s`
        );
      } else {
        // Movement failed
        callback({ 
          success: false, 
          message: result.message,
          data: result.data
        });

        // If combat required, notify player
        if (result.data?.requiresCombat) {
          socket.emit('ship:combat_required', {
            shipId,
            enemyPlanetId: result.data.enemyPlanetId,
            message: 'Destination occupied by enemy. Initiate combat?'
          });
        }
      }
    } catch (error) {
      logger.error('Error in ship:move handler:', error);
      callback({ 
        success: false, 
        message: 'Failed to move ship' 
      });
    }
  });

  /**
   * Cancel ship movement
   */
  socket.on('ship:cancel_movement', async (data: CancelMovementRequest, callback) => {
    try {
      const { shipId } = data;

      logger.info(`Player ${userId} cancelling movement for ship ${shipId}`);

      // TODO: Verify ship ownership

      // Cancel movement
      const result = shipMovementManager.cancelMovement(shipId);

      callback({ 
        success: result.success, 
        message: result.message 
      });

      if (result.success) {
        logger.info(`Ship ${shipId} movement cancelled`);
      }
    } catch (error) {
      logger.error('Error in ship:cancel_movement handler:', error);
      callback({ 
        success: false, 
        message: 'Failed to cancel movement' 
      });
    }
  });

  /**
   * Get active movements for player
   */
  socket.on('ship:get_movements', (callback) => {
    try {
      const movements = shipMovementManager.getPlayerMovements(userId);

      // Format movements for client
      const formatted = movements.map(m => ({
        shipId: m.shipId,
        origin: m.movement.origin,
        destination: m.movement.destination,
        startTime: m.movement.startTime,
        arrivalTime: m.movement.arrivalTime,
        distance: m.movement.distance,
        travelTime: m.movement.travelTime,
        remainingTime: shipMovementManager.getRemainingTime(m.shipId)
      }));

      callback({ 
        success: true, 
        movements: formatted 
      });
    } catch (error) {
      logger.error('Error in ship:get_movements handler:', error);
      callback({ 
        success: false, 
        message: 'Failed to get movements' 
      });
    }
  });

  /**
   * Get arrival time for ship
   */
  socket.on('ship:get_arrival_time', (data: { shipId: string }, callback) => {
    try {
      const { shipId } = data;
      const arrivalTime = shipMovementManager.getArrivalTime(shipId);
      const remainingTime = shipMovementManager.getRemainingTime(shipId);

      callback({ 
        success: true, 
        arrivalTime,
        remainingTime
      });
    } catch (error) {
      logger.error('Error in ship:get_arrival_time handler:', error);
      callback({ 
        success: false, 
        message: 'Failed to get arrival time' 
      });
    }
  });

  /**
   * Check for collision at destination
   */
  socket.on('ship:check_collision', (data: { planetId: string }, callback) => {
    try {
      const { planetId } = data;
      const collision = shipMovementManager.checkCollision(planetId, userId);

      callback({ 
        success: true, 
        collision,
        message: collision ? 'Planet occupied by enemy' : 'Planet available'
      });
    } catch (error) {
      logger.error('Error in ship:check_collision handler:', error);
      callback({ 
        success: false, 
        message: 'Failed to check collision' 
      });
    }
  });

  /**
   * Get ships at planet
   */
  socket.on('ship:get_at_planet', (data: { planetId: string }, callback) => {
    try {
      const { planetId } = data;
      const shipIds = shipMovementManager.getShipsAtPlanet(planetId);

      callback({ 
        success: true, 
        shipIds 
      });
    } catch (error) {
      logger.error('Error in ship:get_at_planet handler:', error);
      callback({ 
        success: false, 
        message: 'Failed to get ships' 
      });
    }
  });

  /**
   * Subscribe to ship movement updates
   */
  socket.on('ship:subscribe_movements', () => {
    socket.join('ship-movements');
    logger.debug(`Player ${userId} subscribed to ship movements`);
  });

  /**
   * Unsubscribe from ship movement updates
   */
  socket.on('ship:unsubscribe_movements', () => {
    socket.leave('ship-movements');
    logger.debug(`Player ${userId} unsubscribed from ship movements`);
  });

  logger.debug(`Ship movement handlers registered for user ${userId}`);
}

/**
 * Initialize ship movement system with Socket.IO
 * 
 * @param io - Socket.IO server
 */
export function initializeShipMovementSystem(io: SocketIOServer): void {
  // Initialize movement manager
  shipMovementManager.initialize(io);

  // Setup connection handler
  io.on('connection', (socket) => {
    // Setup handlers for this connection
    setupShipMovementHandlers(io, socket);

    // Auto-subscribe to movement updates
    socket.join('ship-movements');

    socket.on('disconnect', () => {
      socket.leave('ship-movements');
    });
  });

  logger.info('Ship movement system initialized');
}
