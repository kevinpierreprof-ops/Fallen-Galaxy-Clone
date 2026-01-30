/**
 * Alliance Socket Handlers
 * 
 * Real-time socket handlers for alliance system
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { allianceSystemManager } from '@/alliances/AllianceSystemManager';
import type {
  CreateAllianceRequest,
  InviteToAllianceRequest
} from '@shared/types/alliance';

/**
 * Setup alliance socket handlers
 * 
 * @param io - Socket.IO server
 * @param socket - Client socket
 */
export function setupAllianceHandlers(io: SocketIOServer, socket: Socket): void {
  const userId = (socket as any).userId; // Set by auth middleware

  /**
   * Join alliance room
   */
  socket.on('alliance:join_room', (data: { allianceId: string }) => {
    try {
      const { allianceId } = data;

      // Verify user is member
      const alliance = allianceSystemManager.getAlliance(allianceId);
      if (alliance && alliance.members.some(m => m.userId === userId)) {
        socket.join(`alliance:${allianceId}`);
        logger.debug(`User ${userId} joined alliance room ${allianceId}`);
      }
    } catch (error) {
      logger.error('Error in alliance:join_room handler:', error);
    }
  });

  /**
   * Leave alliance room
   */
  socket.on('alliance:leave_room', (data: { allianceId: string }) => {
    try {
      const { allianceId } = data;
      socket.leave(`alliance:${allianceId}`);
      logger.debug(`User ${userId} left alliance room ${allianceId}`);
    } catch (error) {
      logger.error('Error in alliance:leave_room handler:', error);
    }
  });

  /**
   * Create alliance
   */
  socket.on(
    'alliance:create',
    (data: CreateAllianceRequest, callback) => {
      try {
        const result = allianceSystemManager.createAlliance(userId, data);

        callback({
          success: result.success,
          message: result.message,
          data: result.data
        });

        if (result.success) {
          // Auto-join alliance room
          socket.join(`alliance:${result.data.id}`);
        }
      } catch (error) {
        logger.error('Error in alliance:create handler:', error);
        callback({
          success: false,
          message: 'Failed to create alliance'
        });
      }
    }
  );

  /**
   * Invite player
   */
  socket.on(
    'alliance:invite',
    (data: InviteToAllianceRequest, callback) => {
      try {
        const result = allianceSystemManager.invitePlayer(userId, data);

        callback({
          success: result.success,
          message: result.message,
          data: result.data
        });
      } catch (error) {
        logger.error('Error in alliance:invite handler:', error);
        callback({
          success: false,
          message: 'Failed to send invitation'
        });
      }
    }
  );

  /**
   * Accept invitation
   */
  socket.on(
    'alliance:accept_invitation',
    (data: { invitationId: string }, callback) => {
      try {
        const { invitationId } = data;

        const result = allianceSystemManager.acceptInvitation(userId, invitationId);

        callback({
          success: result.success,
          message: result.message,
          data: result.data
        });

        if (result.success && result.data) {
          // Auto-join alliance room
          socket.join(`alliance:${result.data.id}`);
        }
      } catch (error) {
        logger.error('Error in alliance:accept_invitation handler:', error);
        callback({
          success: false,
          message: 'Failed to accept invitation'
        });
      }
    }
  );

  /**
   * Decline invitation
   */
  socket.on(
    'alliance:decline_invitation',
    (data: { invitationId: string }, callback) => {
      try {
        const { invitationId } = data;

        const result = allianceSystemManager.declineInvitation(
          userId,
          invitationId
        );

        callback({
          success: result.success,
          message: result.message
        });
      } catch (error) {
        logger.error('Error in alliance:decline_invitation handler:', error);
        callback({
          success: false,
          message: 'Failed to decline invitation'
        });
      }
    }
  );

  /**
   * Leave alliance
   */
  socket.on('alliance:leave', (callback) => {
    try {
      // Get current alliance
      const alliance = allianceSystemManager.getUserAlliance(userId);

      const result = allianceSystemManager.leaveAlliance(userId);

      callback({
        success: result.success,
        message: result.message
      });

      if (result.success && alliance) {
        // Leave alliance room
        socket.leave(`alliance:${alliance.id}`);
      }
    } catch (error) {
      logger.error('Error in alliance:leave handler:', error);
      callback({
        success: false,
        message: 'Failed to leave alliance'
      });
    }
  });

  /**
   * Kick member
   */
  socket.on(
    'alliance:kick',
    (data: { allianceId: string; memberId: string }, callback) => {
      try {
        const { allianceId, memberId } = data;

        const result = allianceSystemManager.kickMember(
          userId,
          allianceId,
          memberId
        );

        callback({
          success: result.success,
          message: result.message
        });

        if (result.success) {
          // Remove kicked member from room
          const memberSocket = io.sockets.sockets.get(`user:${memberId}`);
          memberSocket?.leave(`alliance:${allianceId}`);
        }
      } catch (error) {
        logger.error('Error in alliance:kick handler:', error);
        callback({
          success: false,
          message: 'Failed to kick member'
        });
      }
    }
  );

  /**
   * Promote to leader
   */
  socket.on(
    'alliance:promote_leader',
    (data: { allianceId: string; memberId: string }, callback) => {
      try {
        const { allianceId, memberId } = data;

        const result = allianceSystemManager.promoteToLeader(
          userId,
          allianceId,
          memberId
        );

        callback({
          success: result.success,
          message: result.message
        });
      } catch (error) {
        logger.error('Error in alliance:promote_leader handler:', error);
        callback({
          success: false,
          message: 'Failed to promote member'
        });
      }
    }
  );

  /**
   * Promote to officer
   */
  socket.on(
    'alliance:promote_officer',
    (data: { allianceId: string; memberId: string }, callback) => {
      try {
        const { allianceId, memberId } = data;

        const result = allianceSystemManager.promoteToOfficer(
          userId,
          allianceId,
          memberId
        );

        callback({
          success: result.success,
          message: result.message
        });
      } catch (error) {
        logger.error('Error in alliance:promote_officer handler:', error);
        callback({
          success: false,
          message: 'Failed to promote member'
        });
      }
    }
  );

  /**
   * Send alliance chat message
   */
  socket.on(
    'alliance:chat_send',
    (data: { allianceId: string; content: string }, callback) => {
      try {
        const { allianceId, content } = data;

        const result = allianceSystemManager.sendChatMessage(
          userId,
          allianceId,
          content
        );

        callback({
          success: result.success,
          message: result.message,
          data: result.data
        });
      } catch (error) {
        logger.error('Error in alliance:chat_send handler:', error);
        callback({
          success: false,
          message: 'Failed to send message'
        });
      }
    }
  );

  /**
   * Get alliance chat messages
   */
  socket.on(
    'alliance:chat_get',
    (
      data: { allianceId: string; limit?: number; offset?: number },
      callback
    ) => {
      try {
        const { allianceId, limit = 50, offset = 0 } = data;

        const messages = allianceSystemManager.getChatMessages(
          userId,
          allianceId,
          limit,
          offset
        );

        callback({
          success: true,
          messages
        });
      } catch (error) {
        logger.error('Error in alliance:chat_get handler:', error);
        callback({
          success: false,
          message: 'Failed to get messages'
        });
      }
    }
  );

  /**
   * Get pending invitations
   */
  socket.on('alliance:get_invitations', (callback) => {
    try {
      const invitations = allianceSystemManager.getPendingInvitations(userId);

      callback({
        success: true,
        invitations
      });
    } catch (error) {
      logger.error('Error in alliance:get_invitations handler:', error);
      callback({
        success: false,
        message: 'Failed to get invitations'
      });
    }
  });

  /**
   * Get user's alliance
   */
  socket.on('alliance:get_my_alliance', (callback) => {
    try {
      const alliance = allianceSystemManager.getUserAlliance(userId);

      callback({
        success: true,
        alliance
      });
    } catch (error) {
      logger.error('Error in alliance:get_my_alliance handler:', error);
      callback({
        success: false,
        message: 'Failed to get alliance'
      });
    }
  });

  /**
   * Get shared vision data
   */
  socket.on('alliance:get_vision', (callback) => {
    try {
      const visionData = allianceSystemManager.getSharedVisionData(userId);

      callback({
        success: true,
        visionData
      });
    } catch (error) {
      logger.error('Error in alliance:get_vision handler:', error);
      callback({
        success: false,
        message: 'Failed to get vision data'
      });
    }
  });

  logger.debug(`Alliance handlers registered for user ${userId}`);
}

/**
 * Initialize alliance system with Socket.IO
 * 
 * @param io - Socket.IO server
 */
export function initializeAllianceSystem(io: SocketIOServer): void {
  // Initialize alliance manager
  allianceSystemManager.initialize(io);

  // Setup connection handler
  io.on('connection', (socket) => {
    // Setup handlers for this connection
    setupAllianceHandlers(io, socket);

    // Auto-join user's alliance room
    const userId = (socket as any).userId;
    if (userId) {
      const alliance = allianceSystemManager.getUserAlliance(userId);
      if (alliance) {
        socket.join(`alliance:${alliance.id}`);
        logger.debug(`User ${userId} auto-joined alliance room ${alliance.id}`);
      }
    }

    socket.on('disconnect', () => {
      // Leave all alliance rooms
      // Socket.IO automatically handles this
    });
  });

  logger.info('Alliance system initialized');
}
