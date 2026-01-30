/**
 * Private Messaging Client
 * 
 * Client-side service for private messaging with Socket.IO
 */

import { io, Socket } from 'socket.io-client';
import type {
  Message,
  ConversationSummary,
  SendMessageRequest,
  PaginatedMessages,
  UnreadCounts,
  MessageSearchResult,
  TypingIndicator
} from '@shared/types/privateMessaging';

/**
 * Message event handlers
 */
interface MessageEventHandlers {
  onNewMessage?: (message: Message) => void;
  onMessageRead?: (data: { messageId: string; conversationId: string }) => void;
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void;
  onConversationRead?: (data: { conversationId: string; userId: string }) => void;
  onTypingIndicator?: (indicator: TypingIndicator) => void;
}

/**
 * Private Messaging Client
 */
export class PrivateMessagingClient {
  private socket: Socket;
  private handlers: MessageEventHandlers;

  constructor(socket: Socket, handlers: MessageEventHandlers = {}) {
    this.socket = socket;
    this.handlers = handlers;
    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    // New message received
    this.socket.on('message:new', (data) => {
      console.log('New message:', data);
      if (this.handlers.onNewMessage) {
        this.handlers.onNewMessage(data.message);
      }
    });

    // Message marked as read
    this.socket.on('message:read', (data) => {
      console.log('Message read:', data);
      if (this.handlers.onMessageRead) {
        this.handlers.onMessageRead(data);
      }
    });

    // Message deleted
    this.socket.on('message:deleted', (data) => {
      console.log('Message deleted:', data);
      if (this.handlers.onMessageDeleted) {
        this.handlers.onMessageDeleted(data);
      }
    });

    // Conversation read
    this.socket.on('conversation:read', (data) => {
      console.log('Conversation read:', data);
      if (this.handlers.onConversationRead) {
        this.handlers.onConversationRead(data);
      }
    });

    // Typing indicator
    this.socket.on('typing:indicator', (data) => {
      if (this.handlers.onTypingIndicator) {
        this.handlers.onTypingIndicator(data);
      }
    });

    // Message sent confirmation
    this.socket.on('message:sent', (data) => {
      console.log('Message sent confirmation:', data);
    });
  }

  /**
   * Send a message
   */
  public async sendMessage(
    receiverId: string,
    content: string
  ): Promise<Message> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:send',
        { receiverId, content } as SendMessageRequest,
        (response: any) => {
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Get conversation messages
   */
  public async getConversation(
    otherUserId: string,
    limit = 50,
    offset = 0
  ): Promise<PaginatedMessages> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:get_conversation',
        { otherUserId, limit, offset },
        (response: any) => {
          if (response.success) {
            resolve({
              messages: response.messages,
              total: response.total,
              limit: response.limit,
              offset: response.offset,
              hasMore: response.hasMore
            });
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Get all conversations
   */
  public async getConversations(
    limit = 50,
    offset = 0
  ): Promise<ConversationSummary[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:get_conversations',
        { limit, offset },
        (response: any) => {
          if (response.success) {
            resolve(response.conversations);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Mark message as read
   */
  public async markAsRead(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:mark_read', { messageId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Mark conversation as read
   */
  public async markConversationAsRead(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'message:mark_conversation_read',
        { conversationId },
        (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Delete message
   */
  public async deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:delete', { messageId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Get unread counts
   */
  public async getUnreadCounts(): Promise<UnreadCounts> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:get_unread_counts', (response: any) => {
        if (response.success) {
          resolve({
            total: response.total,
            byConversation: response.byConversation
          });
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Search messages
   */
  public async searchMessages(
    query: string,
    limit = 50
  ): Promise<MessageSearchResult> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:search', { query, limit }, (response: any) => {
        if (response.success) {
          resolve({
            messages: response.messages,
            total: response.total,
            query: response.query,
            conversations: response.conversations
          });
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Send typing indicator
   */
  public sendTypingIndicator(
    conversationId: string,
    isTyping: boolean
  ): void {
    this.socket.emit('message:typing', { conversationId, isTyping });
  }

  /**
   * Block user
   */
  public async blockUser(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:block_user', { userId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Unblock user
   */
  public async unblockUser(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:unblock_user', { userId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Get blocked users
   */
  public async getBlockedUsers(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('message:get_blocked_users', (response: any) => {
        if (response.success) {
          resolve(response.blockedUsers);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Cleanup listeners
   */
  public destroy(): void {
    this.socket.off('message:new');
    this.socket.off('message:read');
    this.socket.off('message:deleted');
    this.socket.off('conversation:read');
    this.socket.off('typing:indicator');
    this.socket.off('message:sent');
  }
}

/**
 * React hook for private messaging
 */
export function usePrivateMessaging() {
  const socket = io('http://localhost:3000', {
    auth: { token: localStorage.getItem('token') }
  });

  const messaging = new PrivateMessagingClient(socket, {
    onNewMessage: (message) => {
      console.log('New message received:', message);
      // Update state
      // Show notification
    },

    onMessageRead: (data) => {
      console.log('Message read:', data);
      // Update message status in UI
    },

    onTypingIndicator: (indicator) => {
      console.log('Typing indicator:', indicator);
      // Show/hide typing indicator in UI
    }
  });

  return messaging;
}
