/**
 * Private Messaging System Types
 * 
 * Type definitions for private messaging between players
 */

/**
 * Message status
 */
export enum MessageStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read',
  Deleted = 'deleted'
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  conversationId: string;
  createdAt: number;
  updatedAt: number;
  readAt?: number;
  deletedAt?: number;
  deletedBy?: string[];  // Array of user IDs who deleted this message
}

/**
 * Conversation metadata
 */
export interface Conversation {
  id: string;
  participants: string[];  // [userId1, userId2]
  lastMessage?: Message;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Blocked user relationship
 */
export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: number;
}

/**
 * Message send request
 */
export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

/**
 * Message query parameters
 */
export interface MessageQueryParams {
  conversationId?: string;
  participantId?: string;
  limit?: number;
  offset?: number;
  before?: number;  // Timestamp
  after?: number;   // Timestamp
  search?: string;
}

/**
 * Conversation list query
 */
export interface ConversationListQuery {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

/**
 * Paginated messages response
 */
export interface PaginatedMessages {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Conversation summary
 */
export interface ConversationSummary {
  conversation: Conversation;
  otherParticipant: {
    id: string;
    username: string;
    isOnline: boolean;
  };
  lastMessage?: Message;
  unreadCount: number;
}

/**
 * Unread counts by conversation
 */
export interface UnreadCounts {
  total: number;
  byConversation: {
    [conversationId: string]: number;
  };
}

/**
 * Message action result
 */
export interface MessageActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Search result
 */
export interface MessageSearchResult {
  messages: Message[];
  total: number;
  query: string;
  conversations: string[];  // Conversation IDs with matches
}

/**
 * Typing indicator
 */
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * Message notification
 */
export interface MessageNotification {
  type: 'new_message' | 'message_read' | 'message_deleted';
  message: Message;
  conversationId: string;
  timestamp: number;
}
