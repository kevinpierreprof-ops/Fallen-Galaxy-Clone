/**
 * Alliance Routes
 * 
 * REST API endpoints for alliance management
 */

import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { allianceSystemManager } from '@/alliances/AllianceSystemManager';
import { logger } from '@/utils/logger';
import type { AuthRequest } from '@/types/auth';

const router = Router();

/**
 * POST /api/alliances/create
 * Create a new alliance
 */
router.post('/create', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { name, tag, description, settings } = req.body;

    if (!name || !tag) {
      return res.status(400).json({
        success: false,
        message: 'Name and tag are required'
      });
    }

    const result = allianceSystemManager.createAlliance(userId, {
      name,
      tag,
      description,
      settings
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in POST /alliances/create:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alliance'
    });
  }
});

/**
 * POST /api/alliances/invite
 * Invite a player to alliance
 */
router.post('/invite', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const inviterId = req.user!.userId;
    const { allianceId, inviteeId, message } = req.body;

    if (!allianceId || !inviteeId) {
      return res.status(400).json({
        success: false,
        message: 'allianceId and inviteeId are required'
      });
    }

    const result = allianceSystemManager.invitePlayer(inviterId, {
      allianceId,
      inviteeId,
      message
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in POST /alliances/invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
});

/**
 * POST /api/alliances/invitations/:invitationId/accept
 * Accept an alliance invitation
 */
router.post(
  '/invitations/:invitationId/accept',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const invitationId = req.params.invitationId;

      const result = allianceSystemManager.acceptInvitation(userId, invitationId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Error in POST /alliances/invitations/accept:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to accept invitation'
      });
    }
  }
);

/**
 * POST /api/alliances/invitations/:invitationId/decline
 * Decline an alliance invitation
 */
router.post(
  '/invitations/:invitationId/decline',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const invitationId = req.params.invitationId;

      const result = allianceSystemManager.declineInvitation(userId, invitationId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Error in POST /alliances/invitations/decline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to decline invitation'
      });
    }
  }
);

/**
 * GET /api/alliances/invitations
 * Get pending invitations for current user
 */
router.get('/invitations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const invitations = allianceSystemManager.getPendingInvitations(userId);

    res.json({
      success: true,
      invitations
    });
  } catch (error) {
    logger.error('Error in GET /alliances/invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invitations'
    });
  }
});

/**
 * POST /api/alliances/leave
 * Leave current alliance
 */
router.post('/leave', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const result = allianceSystemManager.leaveAlliance(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in POST /alliances/leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave alliance'
    });
  }
});

/**
 * POST /api/alliances/:allianceId/kick/:memberId
 * Kick a member from alliance (leader only)
 */
router.post(
  '/:allianceId/kick/:memberId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const kickerId = req.user!.userId;
      const { allianceId, memberId } = req.params;

      const result = allianceSystemManager.kickMember(
        kickerId,
        allianceId,
        memberId
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Error in POST /alliances/kick:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to kick member'
      });
    }
  }
);

/**
 * POST /api/alliances/:allianceId/promote/:memberId
 * Promote member to leader (leader only)
 */
router.post(
  '/:allianceId/promote/:memberId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const leaderId = req.user!.userId;
      const { allianceId, memberId } = req.params;

      const result = allianceSystemManager.promoteToLeader(
        leaderId,
        allianceId,
        memberId
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Error in POST /alliances/promote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to promote member'
      });
    }
  }
);

/**
 * POST /api/alliances/:allianceId/promote-officer/:memberId
 * Promote member to officer (leader only)
 */
router.post(
  '/:allianceId/promote-officer/:memberId',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const leaderId = req.user!.userId;
      const { allianceId, memberId } = req.params;

      const result = allianceSystemManager.promoteToOfficer(
        leaderId,
        allianceId,
        memberId
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Error in POST /alliances/promote-officer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to promote member'
      });
    }
  }
);

/**
 * POST /api/alliances/:allianceId/chat
 * Send alliance chat message
 */
router.post('/:allianceId/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const senderId = req.user!.userId;
    const allianceId = req.params.allianceId;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const result = allianceSystemManager.sendChatMessage(
      senderId,
      allianceId,
      content
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in POST /alliances/chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

/**
 * GET /api/alliances/:allianceId/chat
 * Get alliance chat messages
 */
router.get('/:allianceId/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const allianceId = req.params.allianceId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = allianceSystemManager.getChatMessages(
      userId,
      allianceId,
      limit,
      offset
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    logger.error('Error in GET /alliances/chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

/**
 * GET /api/alliances
 * Get list of all alliances
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = req.query.search as string;

    const alliances = allianceSystemManager.getAlliances({
      limit,
      offset,
      search
    });

    res.json({
      success: true,
      alliances
    });
  } catch (error) {
    logger.error('Error in GET /alliances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alliances'
    });
  }
});

/**
 * GET /api/alliances/:allianceId
 * Get alliance details
 */
router.get('/:allianceId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const allianceId = req.params.allianceId;

    const alliance = allianceSystemManager.getAlliance(allianceId);

    if (alliance) {
      res.json({
        success: true,
        alliance
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Alliance not found'
      });
    }
  } catch (error) {
    logger.error('Error in GET /alliances/:allianceId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alliance'
    });
  }
});

/**
 * GET /api/alliances/my/alliance
 * Get current user's alliance
 */
router.get('/my/alliance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const alliance = allianceSystemManager.getUserAlliance(userId);

    if (alliance) {
      res.json({
        success: true,
        alliance
      });
    } else {
      res.json({
        success: true,
        alliance: null
      });
    }
  } catch (error) {
    logger.error('Error in GET /alliances/my/alliance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alliance'
    });
  }
});

/**
 * GET /api/alliances/my/vision
 * Get shared vision data
 */
router.get('/my/vision', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const visionData = allianceSystemManager.getSharedVisionData(userId);

    res.json({
      success: true,
      visionData
    });
  } catch (error) {
    logger.error('Error in GET /alliances/my/vision:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shared vision'
    });
  }
});

export default router;
