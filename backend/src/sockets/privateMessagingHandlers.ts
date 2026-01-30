/**
 * Private Messaging Socket Handlers
 * 
 * Real-time socket handlers for private messaging
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { privateMessagingManager } from '@/messaging/PrivateMessagingManager';
import type { SendMessageRequest } from '@shared/types/privateMessaging';

/**
 * Setup private messaging socket handlers
 * 
 * @param io - Socket.IO server
 * @param socket - Client socket
 */
export function setupPrivateMessagingHandlers(
  io: SocketIOServer,
  socket: Socket
): void {
  const userId = (socket as any).userId; // Set by auth middleware

  /**
   * Send private message
   */
  socket.on('message:send', async (data: SendMessageRequest, callback) => {
    try {
      logger.debug(`User ${userId} sending message to ${data.receiverId}`);

      const result = await privateMessagingManager.sendMessage(userId, data);

      callback({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      logger.error('Error in message:send handler:', error);
      callback({
        success: false,
        message: 'Failed to send message'
      });
    }
  });

  /**
   * Get conversation messages
   */
  socket.on(
    'message:get_conversation',
    (
      data: { otherUserId: string; limit?: number; offset?: number },
      callback
    ) => {
      try {
        const { otherUserId, limit = 50, offset = 0 } = data;

        const messages = privateMessagingManager.getConversation(
          userId,
          otherUserId,
          limit,
          offset
        );

        callback({
          success: true,
          ...messages
        });
      } catch (error) {
        logger.error('Error in message:get_conversation handler:', error);
        callback({
          success: false,
          message: 'Failed to get conversation'
        });
      }
    }
  );

  /**
   * Get all conversations
   */
  socket.on(
    'message:get_conversations',
    async (data: { limit?: number; offset?: number }, callback) => {
      try {
        const { limit = 50, offset = 0 } = data;

        const conversations = await privateMessagingManager.getConversations(
          userId,
          limit,
          offset
        );

        callback({
          success: true,
          conversations
        });
      } catch (error) {
        logger.error('Error in message:get_conversations handler:', error);
        callback({
          success: false,
          message: 'Failed to get conversations'
        });
      }
    }
  );

  /**
   * Mark message as read
   */
  socket.on('message:mark_read', (data: { messageId: string }, callback) => {
    try {
      const { messageId } = data;

      const result = privateMessagingManager.markAsRead(userId, messageId);

      callback({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in message:mark_read handler:', error);
      callback({
        success: false,
        message: 'Failed to mark message as read'
      });
    }
  });

  /**
   * Mark conversation as read
   */
  socket.on(
    'message:mark_conversation_read',
    (data: { conversationId: string }, callback) => {
      try {
        const { conversationId } = data;

        const result = privateMessagingManager.markConversationAsRead(
          userId,
          conversationId
        );

        callback({
          success: result.success,
          message: result.message,
          data: result.data
        });
      } catch (error) {
        logger.error('Error in message:mark_conversation_read handler:', error);
        callback({
          success: false,
          message: 'Failed to mark conversation as read'
        });
      }
    }
  );

  /**
   * Delete message
   */
  socket.on('message:delete', (data: { messageId: string }, callback) => {
    try {
      const { messageId } = data;

      const result = privateMessagingManager.deleteMessage(userId, messageId);

      callback({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in message:delete handler:', error);
      callback({
        success: false,
        message: 'Failed to delete message'
      });
    }
  });

  /**
   * Get unread counts
   */
  socket.on('message:get_unread_counts', (callback) => {
    try {
      const counts = privateMessagingManager.getUnreadCounts(userId);

      callback({
        success: true,
        ...counts
      });
    } catch (error) {
      logger.error('Error in message:get_unread_counts handler:', error);
      callback({
        success: false,
        message: 'Failed to get unread counts'
      });
    }
  });

  /**
   * Search messages
   */
  socket.on(
    'message:search',
    (data: { query: string; limit?: number }, callback) => {
      try {
        const { query, limit = 50 } = data;

        const results = privateMessagingManager.searchMessages(
          userId,
          query,
          limit
        );

        callback({
          success: true,
          ...results
        });
      } catch (error) {
        logger.error('Error in message:search handler:', error);
        callback({
          success: false,
          message: 'Failed to search messages'
        });
      }
    }
  );

  /**
   * Typing indicator
   */
  socket.on(
    'message:typing',
    (data: { conversationId: string; isTyping: boolean }) => {
      try {
        const { conversationId, isTyping } = data;

        privateMessagingManager.setTypingIndicator(
          userId,
          conversationId,
          isTyping
        );
      } catch (error) {
        logger.error('Error in message:typing handler:', error);
      }
    }
  );

  /**
   * Block user
   */
  socket.on('message:block_user', (data: { userId: string }, callback) => {
    try {
      const { userId: blockedUserId } = data;

      const result = privateMessagingManager.blockUser(userId, blockedUserId);

      callback({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in message:block_user handler:', error);
      callback({
        success: false,
        message: 'Failed to block user'
      });
    }
  });

  /**
   * Unblock user
   */
  socket.on('message:unblock_user', (data: { userId: string }, callback) => {
    try {
      const { userId: blockedUserId } = data;

      const result = privateMessagingManager.unblockUser(userId, blockedUserId);

      callback({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Error in message:unblock_user handler:', error);
      callback({
        success: false,
        message: 'Failed to unblock user'
      });
    }
  });

  /**
   * Get blocked users
   */
  socket.on('message:get_blocked_users', (callback) => {
    try {
      const blockedUsers = privateMessagingManager.getBlockedUsers(userId);

      callback({
        success: true,
        blockedUsers
      });
    } catch (error) {
      logger.error('Error in message:get_blocked_users handler:', error);
      callback({
        success: false,
        message: 'Failed to get blocked users'
      });
    }
  });

  logger.debug(`Private messaging handlers registered for user ${userId}`);
}

/**
 * Initialize private messaging system with Socket.IO
 * 
 * @param io - Socket.IO server
 */
export function initializePrivateMessaging(io: SocketIOServer): void {
  // Initialize messaging manager
  privateMessagingManager.initialize(io);

  // Setup connection handler
  io.on('connection', (socket) => {
    // Setup handlers for this connection
    setupPrivateMessagingHandlers(io, socket);
  });

  logger.info('Private messaging system initialized');
}
