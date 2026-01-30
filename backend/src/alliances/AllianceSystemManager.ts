/**
 * Alliance System Manager
 * 
 * Handles all alliance operations and real-time updates
 */

import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { db } from '@/database/connection';
import {
  AllianceModel,
  AllianceInvitationModel,
  AllianceChatModel
} from '@/database/models/AllianceModels';
import type {
  Alliance,
  AllianceInvitation,
  AllianceChatMessage,
  AllianceRole,
  CreateAllianceRequest,
  InviteToAllianceRequest,
  AllianceActionResult,
  AllianceListQuery,
  AllianceSummary,
  AllianceMemberInfo,
  AllianceEventType,
  SharedVisionData
} from '@shared/types/alliance';

/**
 * Alliance System Manager Class
 */
export class AllianceSystemManager {
  private allianceModel: AllianceModel;
  private invitationModel: AllianceInvitationModel;
  private chatModel: AllianceChatModel;
  private io: SocketIOServer | null = null;

  constructor() {
    this.allianceModel = new AllianceModel(db);
    this.invitationModel = new AllianceInvitationModel(db);
    this.chatModel = new AllianceChatModel(db);
  }

  /**
   * Initialize with Socket.IO server
   */
  public initialize(io: SocketIOServer): void {
    this.io = io;
    logger.info('Alliance System Manager initialized');
  }

  /**
   * Create a new alliance
   */
  public createAlliance(
    userId: string,
    request: CreateAllianceRequest
  ): AllianceActionResult {
    const { name, tag, description, settings } = request;

    // Validation
    if (!name || name.trim().length < 3) {
      return {
        success: false,
        message: 'Alliance name must be at least 3 characters'
      };
    }

    if (name.length > 50) {
      return {
        success: false,
        message: 'Alliance name too long (max 50 characters)'
      };
    }

    if (!tag || tag.trim().length < 2 || tag.trim().length > 6) {
      return {
        success: false,
        message: 'Alliance tag must be 2-6 characters'
      };
    }

    // Check if user already in alliance
    const existingAlliance = this.allianceModel.findByUserId(userId);
    if (existingAlliance) {
      return {
        success: false,
        message: 'You are already in an alliance'
      };
    }

    // Check if name/tag already exists
    if (this.allianceModel.findByName(name.trim())) {
      return {
        success: false,
        message: 'Alliance name already taken'
      };
    }

    if (this.allianceModel.findByTag(tag.trim())) {
      return {
        success: false,
        message: 'Alliance tag already taken'
      };
    }

    try {
      const alliance = this.allianceModel.create({
        name: name.trim(),
        tag: tag.trim(),
        leaderId: userId,
        description: description?.trim(),
        settings
      });

      // Broadcast alliance created
      this.broadcastAllianceEvent(alliance.id, 'member_joined', userId);

      logger.info(`Alliance created: ${alliance.name} by ${userId}`);

      return {
        success: true,
        message: 'Alliance created successfully',
        data: alliance
      };
    } catch (error) {
      logger.error('Error creating alliance:', error);
      return {
        success: false,
        message: 'Failed to create alliance'
      };
    }
  }

  /**
   * Invite player to alliance
   */
  public invitePlayer(
    inviterId: string,
    request: InviteToAllianceRequest
  ): AllianceActionResult {
    const { allianceId, inviteeId, message } = request;

    // Get alliance
    const alliance = this.allianceModel.findById(allianceId);
    if (!alliance) {
      return { success: false, message: 'Alliance not found' };
    }

    // Check if inviter is a member
    const inviterMember = alliance.members.find(m => m.userId === inviterId);
    if (!inviterMember) {
      return { success: false, message: 'You are not a member of this alliance' };
    }

    // Check if inviter has permission
    if (
      inviterMember.role === 'member' &&
      !alliance.settings.allowOfficerInvite
    ) {
      return {
        success: false,
        message: 'Only officers and leaders can invite'
      };
    }

    // Check if invitee already in alliance
    const inviteeAlliance = this.allianceModel.findByUserId(inviteeId);
    if (inviteeAlliance) {
      return {
        success: false,
        message: 'Player is already in an alliance'
      };
    }

    // Check if alliance is full
    if (alliance.members.length >= alliance.maxMembers) {
      return {
        success: false,
        message: 'Alliance is full'
      };
    }

    // Check for existing pending invitation
    const pending = this.invitationModel.getPendingForUser(inviteeId);
    const existingInvite = pending.find(inv => inv.allianceId === allianceId);
    if (existingInvite) {
      return {
        success: false,
        message: 'Invitation already sent to this player'
      };
    }

    try {
      const invitation = this.invitationModel.create({
        allianceId,
        inviterId,
        inviteeId,
        message
      });

      // Send invitation notification
      this.sendInvitationNotification(invitation, alliance);

      logger.info(
        `Alliance invitation sent from ${inviterId} to ${inviteeId} for ${alliance.name}`
      );

      return {
        success: true,
        message: 'Invitation sent successfully',
        data: invitation
      };
    } catch (error) {
      logger.error('Error sending invitation:', error);
      return {
        success: false,
        message: 'Failed to send invitation'
      };
    }
  }

  /**
   * Accept alliance invitation
   */
  public acceptInvitation(
    userId: string,
    invitationId: string
  ): AllianceActionResult {
    const invitation = this.invitationModel.findById(invitationId);

    if (!invitation) {
      return { success: false, message: 'Invitation not found' };
    }

    if (invitation.inviteeId !== userId) {
      return { success: false, message: 'This invitation is not for you' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, message: 'Invitation already responded to' };
    }

    if (Date.now() > invitation.expiresAt) {
      this.invitationModel.updateStatus(invitationId, 'expired');
      return { success: false, message: 'Invitation has expired' };
    }

    // Check if user already in alliance
    const existingAlliance = this.allianceModel.findByUserId(userId);
    if (existingAlliance) {
      return {
        success: false,
        message: 'You are already in an alliance'
      };
    }

    // Get alliance
    const alliance = this.allianceModel.findById(invitation.allianceId);
    if (!alliance) {
      return { success: false, message: 'Alliance no longer exists' };
    }

    // Check if alliance is full
    if (alliance.members.length >= alliance.maxMembers) {
      return { success: false, message: 'Alliance is now full' };
    }

    try {
      // Add member
      this.allianceModel.addMember(alliance.id, userId, 'member');

      // Update invitation
      this.invitationModel.updateStatus(invitationId, 'accepted');

      // Broadcast event
      this.broadcastAllianceEvent(alliance.id, 'member_joined', userId);

      logger.info(`User ${userId} joined alliance ${alliance.name}`);

      return {
        success: true,
        message: 'Successfully joined alliance',
        data: alliance
      };
    } catch (error) {
      logger.error('Error accepting invitation:', error);
      return {
        success: false,
        message: 'Failed to join alliance'
      };
    }
  }

  /**
   * Decline alliance invitation
   */
  public declineInvitation(
    userId: string,
    invitationId: string
  ): AllianceActionResult {
    const invitation = this.invitationModel.findById(invitationId);

    if (!invitation) {
      return { success: false, message: 'Invitation not found' };
    }

    if (invitation.inviteeId !== userId) {
      return { success: false, message: 'This invitation is not for you' };
    }

    if (invitation.status !== 'pending') {
      return { success: false, message: 'Invitation already responded to' };
    }

    this.invitationModel.updateStatus(invitationId, 'declined');

    logger.info(`User ${userId} declined alliance invitation`);

    return {
      success: true,
      message: 'Invitation declined'
    };
  }

  /**
   * Leave alliance
   */
  public leaveAlliance(userId: string): AllianceActionResult {
    const alliance = this.allianceModel.findByUserId(userId);

    if (!alliance) {
      return {
        success: false,
        message: 'You are not in an alliance'
      };
    }

    const member = alliance.members.find(m => m.userId === userId);

    // Leader cannot leave if there are other members
    if (member?.role === 'leader' && alliance.members.length > 1) {
      return {
        success: false,
        message: 'Leader must transfer leadership or disband alliance first'
      };
    }

    try {
      // Remove member
      this.allianceModel.removeMember(alliance.id, userId);

      // If leader leaves alone, disband alliance
      if (member?.role === 'leader' && alliance.members.length === 1) {
        this.allianceModel.delete(alliance.id);
        this.broadcastAllianceEvent(alliance.id, 'alliance_disbanded', userId);

        return {
          success: true,
          message: 'Alliance disbanded'
        };
      }

      // Broadcast event
      this.broadcastAllianceEvent(alliance.id, 'member_left', userId);

      logger.info(`User ${userId} left alliance ${alliance.name}`);

      return {
        success: true,
        message: 'Successfully left alliance'
      };
    } catch (error) {
      logger.error('Error leaving alliance:', error);
      return {
        success: false,
        message: 'Failed to leave alliance'
      };
    }
  }

  /**
   * Kick member from alliance
   */
  public kickMember(
    kickerId: string,
    allianceId: string,
    targetId: string
  ): AllianceActionResult {
    const alliance = this.allianceModel.findById(allianceId);

    if (!alliance) {
      return { success: false, message: 'Alliance not found' };
    }

    const kicker = alliance.members.find(m => m.userId === kickerId);
    const target = alliance.members.find(m => m.userId === targetId);

    if (!kicker) {
      return {
        success: false,
        message: 'You are not a member of this alliance'
      };
    }

    if (!target) {
      return {
        success: false,
        message: 'Target is not a member of this alliance'
      };
    }

    // Only leader can kick
    if (kicker.role !== 'leader') {
      return {
        success: false,
        message: 'Only the leader can kick members'
      };
    }

    // Cannot kick yourself
    if (kickerId === targetId) {
      return {
        success: false,
        message: 'Cannot kick yourself'
      };
    }

    try {
      this.allianceModel.removeMember(allianceId, targetId);

      // Notify kicked user
      this.notifyKicked(targetId, alliance);

      // Broadcast event
      this.broadcastAllianceEvent(allianceId, 'member_kicked', kickerId, targetId);

      logger.info(`User ${targetId} kicked from alliance ${alliance.name}`);

      return {
        success: true,
        message: 'Member kicked successfully'
      };
    } catch (error) {
      logger.error('Error kicking member:', error);
      return {
        success: false,
        message: 'Failed to kick member'
      };
    }
  }

  /**
   * Promote member to leader
   */
  public promoteToLeader(
    currentLeaderId: string,
    allianceId: string,
    targetId: string
  ): AllianceActionResult {
    const alliance = this.allianceModel.findById(allianceId);

    if (!alliance) {
      return { success: false, message: 'Alliance not found' };
    }

    if (alliance.leaderId !== currentLeaderId) {
      return {
        success: false,
        message: 'Only the current leader can promote'
      };
    }

    const target = alliance.members.find(m => m.userId === targetId);
    if (!target) {
      return {
        success: false,
        message: 'Target is not a member of this alliance'
      };
    }

    try {
      // Demote current leader to member
      this.allianceModel.updateMemberRole(allianceId, currentLeaderId, 'member');

      // Promote target to leader
      this.allianceModel.updateMemberRole(allianceId, targetId, 'leader');

      // Update alliance leader
      this.allianceModel.update(allianceId, { leaderId: targetId });

      // Broadcast event
      this.broadcastAllianceEvent(
        allianceId,
        'leader_changed',
        currentLeaderId,
        targetId
      );

      logger.info(
        `Leadership transferred from ${currentLeaderId} to ${targetId} in ${alliance.name}`
      );

      return {
        success: true,
        message: 'Leadership transferred successfully'
      };
    } catch (error) {
      logger.error('Error promoting to leader:', error);
      return {
        success: false,
        message: 'Failed to transfer leadership'
      };
    }
  }

  /**
   * Promote member to officer
   */
  public promoteToOfficer(
    leaderId: string,
    allianceId: string,
    targetId: string
  ): AllianceActionResult {
    const alliance = this.allianceModel.findById(allianceId);

    if (!alliance) {
      return { success: false, message: 'Alliance not found' };
    }

    if (alliance.leaderId !== leaderId) {
      return {
        success: false,
        message: 'Only the leader can promote to officer'
      };
    }

    const target = alliance.members.find(m => m.userId === targetId);
    if (!target) {
      return {
        success: false,
        message: 'Target is not a member of this alliance'
      };
    }

    if (target.role !== 'member') {
      return {
        success: false,
        message: 'Target is already an officer or leader'
      };
    }

    try {
      this.allianceModel.updateMemberRole(allianceId, targetId, 'officer');

      this.broadcastAllianceEvent(allianceId, 'member_promoted', leaderId, targetId);

      return {
        success: true,
        message: 'Member promoted to officer'
      };
    } catch (error) {
      logger.error('Error promoting to officer:', error);
      return {
        success: false,
        message: 'Failed to promote member'
      };
    }
  }

  /**
   * Send alliance chat message
   */
  public sendChatMessage(
    senderId: string,
    allianceId: string,
    content: string
  ): AllianceActionResult {
    const alliance = this.allianceModel.findById(allianceId);

    if (!alliance) {
      return { success: false, message: 'Alliance not found' };
    }

    const member = alliance.members.find(m => m.userId === senderId);
    if (!member) {
      return {
        success: false,
        message: 'You are not a member of this alliance'
      };
    }

    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: 'Message cannot be empty'
      };
    }

    if (content.length > 1000) {
      return {
        success: false,
        message: 'Message too long (max 1000 characters)'
      };
    }

    try {
      const message = this.chatModel.create(allianceId, senderId, content.trim());

      // Broadcast message
      this.broadcastChatMessage(message);

      return {
        success: true,
        message: 'Message sent',
        data: message
      };
    } catch (error) {
      logger.error('Error sending chat message:', error);
      return {
        success: false,
        message: 'Failed to send message'
      };
    }
  }

  /**
   * Get alliance chat messages
   */
  public getChatMessages(
    userId: string,
    allianceId: string,
    limit = 50,
    offset = 0
  ): AllianceChatMessage[] {
    const alliance = this.allianceModel.findById(allianceId);

    if (!alliance) {
      return [];
    }

    const member = alliance.members.find(m => m.userId === userId);
    if (!member) {
      return [];
    }

    return this.chatModel.getMessages(allianceId, limit, offset);
  }

  /**
   * Get user's pending invitations
   */
  public getPendingInvitations(userId: string): AllianceInvitation[] {
    return this.invitationModel.getPendingForUser(userId);
  }

  /**
   * Get alliance list
   */
  public getAlliances(query: AllianceListQuery): AllianceSummary[] {
    const { limit = 50, offset = 0, search } = query;

    let alliances: Alliance[];

    if (search) {
      alliances = this.allianceModel.search(search, limit);
    } else {
      alliances = this.allianceModel.findAll(limit, offset);
    }

    return alliances.map(a => this.toSummary(a));
  }

  /**
   * Get alliance by ID
   */
  public getAlliance(allianceId: string): Alliance | null {
    return this.allianceModel.findById(allianceId);
  }

  /**
   * Get user's alliance
   */
  public getUserAlliance(userId: string): Alliance | null {
    return this.allianceModel.findByUserId(userId);
  }

  /**
   * Get shared vision data for alliance members
   */
  public getSharedVisionData(userId: string): SharedVisionData[] {
    const alliance = this.allianceModel.findByUserId(userId);

    if (!alliance || !alliance.settings.sharedVision) {
      return [];
    }

    const visionData: SharedVisionData[] = [];

    // For each ally, get their planets and ships
    alliance.members.forEach(member => {
      if (member.userId === userId) return; // Skip self

      // TODO: Get actual planet and ship data from database
      // This is a placeholder
      visionData.push({
        allyId: member.userId,
        allyName: `Player ${member.userId.substring(0, 8)}`,
        planets: [],
        ships: []
      });
    });

    return visionData;
  }

  /**
   * Broadcast alliance event
   */
  private broadcastAllianceEvent(
    allianceId: string,
    type: AllianceEventType,
    actorId: string,
    targetId?: string
  ): void {
    if (!this.io) return;

    this.io.to(`alliance:${allianceId}`).emit('alliance:event', {
      type,
      allianceId,
      actorId,
      targetId,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast chat message
   */
  private broadcastChatMessage(message: AllianceChatMessage): void {
    if (!this.io) return;

    this.io.to(`alliance:${message.allianceId}`).emit('alliance:chat', message);
  }

  /**
   * Send invitation notification
   */
  private sendInvitationNotification(
    invitation: AllianceInvitation,
    alliance: Alliance
  ): void {
    if (!this.io) return;

    this.io.to(`user:${invitation.inviteeId}`).emit('alliance:invitation', {
      invitation,
      alliance: this.toSummary(alliance)
    });
  }

  /**
   * Notify kicked user
   */
  private notifyKicked(userId: string, alliance: Alliance): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('alliance:kicked', {
      allianceName: alliance.name,
      timestamp: Date.now()
    });
  }

  /**
   * Convert alliance to summary
   */
  private toSummary(alliance: Alliance): AllianceSummary {
    return {
      id: alliance.id,
      name: alliance.name,
      tag: alliance.tag,
      description: alliance.description,
      leaderName: `Leader ${alliance.leaderId.substring(0, 8)}`,
      memberCount: alliance.members.length,
      maxMembers: alliance.maxMembers,
      isPublic: alliance.settings.isPublic,
      createdAt: alliance.createdAt
    };
  }
}

// Export singleton instance
export const allianceSystemManager = new AllianceSystemManager();
