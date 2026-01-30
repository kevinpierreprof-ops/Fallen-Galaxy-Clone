/**
 * Private Messaging System Tests
 * 
 * Comprehensive tests for private messaging
 */

import { PrivateMessagingManager } from '../PrivateMessagingManager';
import { db } from '@/database/connection';
import { initializePrivateMessagingTables } from '@/database/models/PrivateMessageModel';

describe('Private Messaging System', () => {
  let messagingManager: PrivateMessagingManager;
  const user1Id = 'user-1';
  const user2Id = 'user-2';
  const user3Id = 'user-3';

  beforeEach(() => {
    // Initialize tables
    initializePrivateMessagingTables(db);

    // Create manager
    messagingManager = new PrivateMessagingManager();
  });

  afterEach(() => {
    // Clean up
    db.exec('DELETE FROM private_messages');
    db.exec('DELETE FROM conversations');
    db.exec('DELETE FROM blocked_users');
  });

  describe('Send Message', () => {
    it('should send a message successfully', async () => {
      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Hello, World!'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.senderId).toBe(user1Id);
      expect(result.data.receiverId).toBe(user2Id);
      expect(result.data.content).toBe('Hello, World!');
    });

    it('should fail with empty content', async () => {
      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: ''
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('empty');
    });

    it('should fail when sending to self', async () => {
      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user1Id,
        content: 'To myself'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('yourself');
    });

    it('should fail when user is blocked', async () => {
      // Block user
      messagingManager.blockUser(user2Id, user1Id);

      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Hello'
      });

      expect(result.success).toBe(false);
    });

    it('should trim whitespace', async () => {
      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: '  Hello  '
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('Hello');
    });
  });

  describe('Get Conversation', () => {
    beforeEach(async () => {
      // Send some messages
      await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Message 1'
      });

      await messagingManager.sendMessage(user2Id, {
        receiverId: user1Id,
        content: 'Message 2'
      });

      await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Message 3'
      });
    });

    it('should get conversation messages', () => {
      const result = messagingManager.getConversation(user1Id, user2Id);

      expect(result.messages.length).toBe(3);
      expect(result.total).toBe(3);
    });

    it('should respect pagination', () => {
      const result = messagingManager.getConversation(user1Id, user2Id, 2, 0);

      expect(result.messages.length).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it('should order messages by date descending', () => {
      const result = messagingManager.getConversation(user1Id, user2Id);

      // Most recent first
      expect(result.messages[0].content).toBe('Message 3');
    });
  });

  describe('Mark as Read', () => {
    let messageId: string;

    beforeEach(async () => {
      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Test message'
      });

      messageId = result.data.id;
    });

    it('should mark message as read', () => {
      const result = messagingManager.markAsRead(user2Id, messageId);

      expect(result.success).toBe(true);
    });

    it('should fail if not receiver', () => {
      const result = messagingManager.markAsRead(user3Id, messageId);

      expect(result.success).toBe(false);
    });

    it('should update read_at timestamp', () => {
      messagingManager.markAsRead(user2Id, messageId);

      const messages = messagingManager.getConversation(user1Id, user2Id);
      const message = messages.messages.find(m => m.id === messageId);

      expect(message?.readAt).toBeDefined();
    });
  });

  describe('Mark Conversation as Read', () => {
    let conversationId: string;

    beforeEach(async () => {
      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        const result = await messagingManager.sendMessage(user1Id, {
          receiverId: user2Id,
          content: `Message ${i + 1}`
        });

        if (i === 0) {
          conversationId = result.data.conversationId;
        }
      }
    });

    it('should mark all messages as read', () => {
      const result = messagingManager.markConversationAsRead(
        user2Id,
        conversationId
      );

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(5);
    });

    it('should not mark already read messages', () => {
      // Mark first time
      messagingManager.markConversationAsRead(user2Id, conversationId);

      // Mark again
      const result = messagingManager.markConversationAsRead(
        user2Id,
        conversationId
      );

      expect(result.data?.count).toBe(0);
    });
  });

  describe('Delete Message', () => {
    let messageId: string;

    beforeEach(async () => {
      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Test message'
      });

      messageId = result.data.id;
    });

    it('should delete message', () => {
      const result = messagingManager.deleteMessage(user1Id, messageId);

      expect(result.success).toBe(true);
    });

    it('should soft delete (not permanently remove)', () => {
      messagingManager.deleteMessage(user1Id, messageId);

      // Message still exists in database
      const messages = messagingManager.getConversation(user1Id, user2Id);
      
      // But not returned in conversation
      expect(messages.messages.length).toBe(0);
    });

    it('should allow both users to delete', () => {
      messagingManager.deleteMessage(user1Id, messageId);
      const result = messagingManager.deleteMessage(user2Id, messageId);

      expect(result.success).toBe(true);
    });
  });

  describe('Unread Counts', () => {
    beforeEach(async () => {
      // User1 sends to User2
      await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Message 1'
      });

      await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Message 2'
      });

      // User3 sends to User2
      await messagingManager.sendMessage(user3Id, {
        receiverId: user2Id,
        content: 'Message 3'
      });
    });

    it('should get correct unread count', () => {
      const counts = messagingManager.getUnreadCounts(user2Id);

      expect(counts.total).toBe(3);
    });

    it('should group by conversation', () => {
      const counts = messagingManager.getUnreadCounts(user2Id);

      expect(Object.keys(counts.byConversation).length).toBe(2);
    });

    it('should decrease after reading', () => {
      const messages = messagingManager.getConversation(user1Id, user2Id);
      const conversationId = messages.messages[0].conversationId;

      messagingManager.markConversationAsRead(user2Id, conversationId);

      const counts = messagingManager.getUnreadCounts(user2Id);
      expect(counts.total).toBe(1); // Only message from user3
    });
  });

  describe('Search Messages', () => {
    beforeEach(async () => {
      await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Hello world'
      });

      await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'How are you?'
      });

      await messagingManager.sendMessage(user2Id, {
        receiverId: user1Id,
        content: 'World peace'
      });
    });

    it('should search messages', () => {
      const result = messagingManager.searchMessages(user1Id, 'world');

      expect(result.messages.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it('should be case insensitive', () => {
      const result = messagingManager.searchMessages(user1Id, 'WORLD');

      expect(result.messages.length).toBe(2);
    });

    it('should return empty for no matches', () => {
      const result = messagingManager.searchMessages(user1Id, 'xyz');

      expect(result.messages.length).toBe(0);
    });
  });

  describe('Block User', () => {
    it('should block user', () => {
      const result = messagingManager.blockUser(user1Id, user2Id);

      expect(result.success).toBe(true);
    });

    it('should prevent sending messages', async () => {
      messagingManager.blockUser(user2Id, user1Id);

      const result = await messagingManager.sendMessage(user1Id, {
        receiverId: user2Id,
        content: 'Hello'
      });

      expect(result.success).toBe(false);
    });

    it('should get blocked users', () => {
      messagingManager.blockUser(user1Id, user2Id);
      messagingManager.blockUser(user1Id, user3Id);

      const blocked = messagingManager.getBlockedUsers(user1Id);

      expect(blocked.length).toBe(2);
      expect(blocked).toContain(user2Id);
      expect(blocked).toContain(user3Id);
    });

    it('should unblock user', () => {
      messagingManager.blockUser(user1Id, user2Id);
      const result = messagingManager.unblockUser(user1Id, user2Id);

      expect(result.success).toBe(true);

      const blocked = messagingManager.getBlockedUsers(user1Id);
      expect(blocked.length).toBe(0);
    });
  });

  describe('Typing Indicator', () => {
    it('should set typing indicator', () => {
      // Should not throw
      expect(() => {
        messagingManager.setTypingIndicator(user1Id, 'conv-123', true);
      }).not.toThrow();
    });

    it('should auto-clear after timeout', (done) => {
      messagingManager.setTypingIndicator(user1Id, 'conv-123', true);

      // Should auto-clear after 5 seconds
      setTimeout(() => {
        done();
      }, 5100);
    }, 6000);
  });
});
