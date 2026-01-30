/**
 * Private Messaging Manager
 * 
 * Handles all private messaging operations between players
 */

import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { db } from '@/database/connection';
import {
  PrivateMessageModel,
  ConversationModel,
  BlockedUserModel
} from '@/database/models/PrivateMessageModel';
import type {
  Message,
  Conversation,
  SendMessageRequest,
  MessageQueryParams,
  PaginatedMessages,
  ConversationSummary,
  UnreadCounts,
  MessageActionResult,
  MessageSearchResult,
  TypingIndicator
} from '@shared/types/privateMessaging';

/**
 * Private Messaging Manager
 */
export class PrivateMessagingManager {
  private messageModel: PrivateMessageModel;
  private conversationModel: ConversationModel;
  private blockedUserModel: BlockedUserModel;
  private io: SocketIOServer | null = null;
  private typingIndicators: Map<string, TypingIndicator>;

  constructor() {
    this.messageModel = new PrivateMessageModel(db);
    this.conversationModel = new ConversationModel(db);
    this.blockedUserModel = new BlockedUserModel(db);
    this.typingIndicators = new Map();
  }

  /**
   * Initialize with Socket.IO server
   */
  public initialize(io: SocketIOServer): void {
    this.io = io;
    logger.info('Private Messaging Manager initialized');
  }

  /**
   * Send a message
   */
  public async sendMessage(
    senderId: string,
    request: SendMessageRequest
  ): Promise<MessageActionResult> {
    const { receiverId, content } = request;

    // Validation
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: 'Message content cannot be empty'
      };
    }

    if (content.length > 5000) {
      return {
        success: false,
        message: 'Message too long (max 5000 characters)'
      };
    }

    if (senderId === receiverId) {
      return {
        success: false,
        message: 'Cannot send message to yourself'
      };
    }

    // Check if either user has blocked the other
    const isBlocked = this.blockedUserModel.hasBlockedEachOther(senderId, receiverId);
    if (isBlocked) {
      return {
        success: false,
        message: 'Cannot send message to this user'
      };
    }

    try {
      // Get or create conversation
      const conversation = this.conversationModel.getOrCreate(senderId, receiverId);

      // Create message
      const message = this.messageModel.create({
        senderId,
        receiverId,
        content: content.trim(),
        conversationId: conversation.id
      });

      // Update conversation timestamp
      this.conversationModel.touch(conversation.id);

      // Emit real-time event to receiver
      this.emitNewMessage(message);

      logger.info(`Message sent from ${senderId} to ${receiverId}`);

      return {
        success: true,
        message: 'Message sent successfully',
        data: message
      };
    } catch (error) {
      logger.error('Error sending message:', error);
      return {
        success: false,
        message: 'Failed to send message'
      };
    }
  }

  /**
   * Get conversation messages
   */
  public getConversation(
    userId: string,
    otherUserId: string,
    limit = 50,
    offset = 0
  ): PaginatedMessages {
    // Get conversation
    const conversation = this.conversationModel.getOrCreate(userId, otherUserId);

    // Get messages
    return this.messageModel.findMessages({
      conversationId: conversation.id,
      limit,
      offset
    });
  }

  /**
   * Get all conversations for a user
   */
  public async getConversations(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ConversationSummary[]> {
    const conversations = this.conversationModel.findByUser(userId, limit, offset);

    const summaries: ConversationSummary[] = [];

    for (const conv of conversations) {
      // Get other participant
      const otherUserId = conv.participants.find(p => p !== userId);
      if (!otherUserId) continue;

      // Get last message
      const messages = this.messageModel.findMessages({
        conversationId: conv.id,
        limit: 1,
        offset: 0
      });

      const lastMessage = messages.messages[0];

      // Get unread count
      const unreadCount = this.messageModel.getUnreadCount(userId, conv.id);

      // TODO: Get user info (username, online status)
      const otherUser = {
        id: otherUserId,
        username: `User ${otherUserId.substring(0, 8)}`,
        isOnline: false
      };

      summaries.push({
        conversation: conv,
        otherParticipant: otherUser,
        lastMessage,
        unreadCount
      });
    }

    return summaries;
  }

  /**
   * Mark message as read
   */
  public markAsRead(userId: string, messageId: string): MessageActionResult {
    const success = this.messageModel.markAsRead(messageId, userId);

    if (success) {
      const message = this.messageModel.findById(messageId);
      if (message) {
        this.emitMessageRead(message);
      }

      return {
        success: true,
        message: 'Message marked as read'
      };
    }

    return {
      success: false,
      message: 'Failed to mark message as read'
    };
  }

  /**
   * Mark all messages in conversation as read
   */
  public markConversationAsRead(
    userId: string,
    conversationId: string
  ): MessageActionResult {
    const count = this.messageModel.markConversationAsRead(conversationId, userId);

    if (count > 0) {
      // Emit event
      this.emitConversationRead(conversationId, userId);
    }

    return {
      success: true,
      message: `${count} messages marked as read`,
      data: { count }
    };
  }

  /**
   * Delete message
   */
  public deleteMessage(userId: string, messageId: string): MessageActionResult {
    const success = this.messageModel.deleteMessage(messageId, userId);

    if (success) {
      const message = this.messageModel.findById(messageId);
      if (message) {
        this.emitMessageDeleted(message, userId);
      }

      return {
        success: true,
        message: 'Message deleted'
      };
    }

    return {
      success: false,
      message: 'Failed to delete message'
    };
  }

  /**
   * Get unread counts for user
   */
  public getUnreadCounts(userId: string): UnreadCounts {
    const conversations = this.conversationModel.findByUser(userId);
    
    const byConversation: { [key: string]: number } = {};
    let total = 0;

    for (const conv of conversations) {
      const count = this.messageModel.getUnreadCount(userId, conv.id);
      byConversation[conv.id] = count;
      total += count;
    }

    return {
      total,
      byConversation
    };
  }

  /**
   * Search messages
   */
  public searchMessages(
    userId: string,
    query: string,
    limit = 50
  ): MessageSearchResult {
    if (!query || query.trim().length === 0) {
      return {
        messages: [],
        total: 0,
        query: '',
        conversations: []
      };
    }

    const messages = this.messageModel.search(userId, query.trim(), limit);
    const conversationIds = [...new Set(messages.map(m => m.conversationId))];

    return {
      messages,
      total: messages.length,
      query: query.trim(),
      conversations: conversationIds
    };
  }

  /**
   * Block user
   */
  public blockUser(blockerId: string, blockedUserId: string): MessageActionResult {
    if (blockerId === blockedUserId) {
      return {
        success: false,
        message: 'Cannot block yourself'
      };
    }

    try {
      this.blockedUserModel.block(blockerId, blockedUserId);

      logger.info(`User ${blockerId} blocked ${blockedUserId}`);

      return {
        success: true,
        message: 'User blocked successfully'
      };
    } catch (error) {
      logger.error('Error blocking user:', error);
      return {
        success: false,
        message: 'Failed to block user'
      };
    }
  }

  /**
   * Unblock user
   */
  public unblockUser(blockerId: string, blockedUserId: string): MessageActionResult {
    const success = this.blockedUserModel.unblock(blockerId, blockedUserId);

    if (success) {
      logger.info(`User ${blockerId} unblocked ${blockedUserId}`);

      return {
        success: true,
        message: 'User unblocked successfully'
      };
    }

    return {
      success: false,
      message: 'User was not blocked'
    };
  }

  /**
   * Get blocked users
   */
  public getBlockedUsers(userId: string): string[] {
    return this.blockedUserModel.getBlockedUsers(userId);
  }

  /**
   * Check if user is blocked
   */
  public isBlocked(userId1: string, userId2: string): boolean {
    return this.blockedUserModel.hasBlockedEachOther(userId1, userId2);
  }

  /**
   * Set typing indicator
   */
  public setTypingIndicator(
    userId: string,
    conversationId: string,
    isTyping: boolean
  ): void {
    const indicator: TypingIndicator = {
      conversationId,
      userId,
      isTyping,
      timestamp: Date.now()
    };

    const key = `${conversationId}_${userId}`;
    
    if (isTyping) {
      this.typingIndicators.set(key, indicator);
    } else {
      this.typingIndicators.delete(key);
    }

    // Emit to other participant
    this.emitTypingIndicator(indicator);

    // Auto-clear after 5 seconds
    if (isTyping) {
      setTimeout(() => {
        this.typingIndicators.delete(key);
        this.emitTypingIndicator({
          ...indicator,
          isTyping: false
        });
      }, 5000);
    }
  }

  /**
   * Emit new message event
   */
  private emitNewMessage(message: Message): void {
    if (!this.io) return;

    // Send to receiver
    this.io.to(`user:${message.receiverId}`).emit('message:new', {
      type: 'new_message',
      message,
      conversationId: message.conversationId,
      timestamp: Date.now()
    });

    // Send confirmation to sender
    this.io.to(`user:${message.senderId}`).emit('message:sent', {
      messageId: message.id,
      conversationId: message.conversationId,
      timestamp: message.createdAt
    });

    logger.debug(`Message emitted: ${message.id}`);
  }

  /**
   * Emit message read event
   */
  private emitMessageRead(message: Message): void {
    if (!this.io) return;

    this.io.to(`user:${message.senderId}`).emit('message:read', {
      type: 'message_read',
      messageId: message.id,
      conversationId: message.conversationId,
      readAt: message.readAt,
      timestamp: Date.now()
    });
  }

  /**
   * Emit conversation read event
   */
  private emitConversationRead(conversationId: string, userId: string): void {
    if (!this.io) return;

    const conversation = this.conversationModel.findById(conversationId);
    if (!conversation) return;

    const otherUserId = conversation.participants.find(p => p !== userId);
    if (!otherUserId) return;

    this.io.to(`user:${otherUserId}`).emit('conversation:read', {
      conversationId,
      userId,
      timestamp: Date.now()
    });
  }

  /**
   * Emit message deleted event
   */
  private emitMessageDeleted(message: Message, deletedBy: string): void {
    if (!this.io) return;

    // Emit to both participants
    message.deletedBy?.forEach(userId => {
      this.io!.to(`user:${userId}`).emit('message:deleted', {
        type: 'message_deleted',
        messageId: message.id,
        conversationId: message.conversationId,
        deletedBy,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Emit typing indicator
   */
  private emitTypingIndicator(indicator: TypingIndicator): void {
    if (!this.io) return;

    const conversation = this.conversationModel.findById(indicator.conversationId);
    if (!conversation) return;

    const otherUserId = conversation.participants.find(p => p !== indicator.userId);
    if (!otherUserId) return;

    this.io.to(`user:${otherUserId}`).emit('typing:indicator', indicator);
  }
}

// Export singleton instance
export const privateMessagingManager = new PrivateMessagingManager();
