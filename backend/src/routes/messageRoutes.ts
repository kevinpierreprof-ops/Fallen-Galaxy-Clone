/**
 * Private Messaging Routes
 * 
 * REST API endpoints for private messaging
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { privateMessagingManager } from '@/messaging/PrivateMessagingManager';
import { logger } from '@/utils/logger';
import type { AuthRequest } from '@/types/auth';

const router = Router();

/**
 * POST /api/messages/send
 * Send a private message
 */
router.post('/send', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const senderId = req.user!.userId;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and content are required'
      });
    }

    const result = await privateMessagingManager.sendMessage(senderId, {
      receiverId,
      content
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in POST /messages/send:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

/**
 * GET /api/messages/conversation/:userId
 * Get conversation with another user
 */
router.get('/conversation/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const otherUserId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = privateMessagingManager.getConversation(
      userId,
      otherUserId,
      limit,
      offset
    );

    res.json({
      success: true,
      ...messages
    });
  } catch (error) {
    logger.error('Error in GET /messages/conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
});

/**
 * GET /api/messages/conversations
 * Get all conversations for current user
 */
router.get('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const conversations = await privateMessagingManager.getConversations(
      userId,
      limit,
      offset
    );

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    logger.error('Error in GET /messages/conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
});

/**
 * PUT /api/messages/:messageId/read
 * Mark message as read
 */
router.put('/:messageId/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const messageId = req.params.messageId;

    const result = privateMessagingManager.markAsRead(userId, messageId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in PUT /messages/:messageId/read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

/**
 * PUT /api/messages/conversation/:conversationId/read
 * Mark all messages in conversation as read
 */
router.put(
  '/conversation/:conversationId/read',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const conversationId = req.params.conversationId;

      const result = privateMessagingManager.markConversationAsRead(
        userId,
        conversationId
      );

      res.json(result);
    } catch (error) {
      logger.error('Error in PUT /messages/conversation/read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark conversation as read'
      });
    }
  }
);

/**
 * DELETE /api/messages/:messageId
 * Delete a message
 */
router.delete('/:messageId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const messageId = req.params.messageId;

    const result = privateMessagingManager.deleteMessage(userId, messageId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in DELETE /messages/:messageId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

/**
 * GET /api/messages/unread
 * Get unread message counts
 */
router.get('/unread', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const counts = privateMessagingManager.getUnreadCounts(userId);

    res.json({
      success: true,
      ...counts
    });
  } catch (error) {
    logger.error('Error in GET /messages/unread:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread counts'
    });
  }
});

/**
 * GET /api/messages/search
 * Search messages
 */
router.get('/search', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const results = privateMessagingManager.searchMessages(userId, query, limit);

    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    logger.error('Error in GET /messages/search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
});

/**
 * POST /api/messages/block/:userId
 * Block a user
 */
router.post('/block/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const blockerId = req.user!.userId;
    const blockedUserId = req.params.userId;

    const result = privateMessagingManager.blockUser(blockerId, blockedUserId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in POST /messages/block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user'
    });
  }
});

/**
 * DELETE /api/messages/block/:userId
 * Unblock a user
 */
router.delete('/block/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const blockerId = req.user!.userId;
    const blockedUserId = req.params.userId;

    const result = privateMessagingManager.unblockUser(blockerId, blockedUserId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in DELETE /messages/block:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user'
    });
  }
});

/**
 * GET /api/messages/blocked
 * Get blocked users list
 */
router.get('/blocked', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const blockedUsers = privateMessagingManager.getBlockedUsers(userId);

    res.json({
      success: true,
      blockedUsers
    });
  } catch (error) {
    logger.error('Error in GET /messages/blocked:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked users'
    });
  }
});

export default router;
