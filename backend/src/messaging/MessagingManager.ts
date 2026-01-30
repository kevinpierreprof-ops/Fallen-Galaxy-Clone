import { Message, ChatChannel } from '@shared/types/messaging';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export class MessagingManager {
  private messages: Map<string, Message> = new Map();
  private channels: Map<string, ChatChannel> = new Map();
  private maxMessagesPerChannel = 1000;

  constructor() {
    // Create global channel
    this.createChannel('global', 'Global Chat', true);
  }

  createChannel(id: string, name: string, isPublic: boolean = false): ChatChannel {
    const channel: ChatChannel = {
      id,
      name,
      isPublic,
      memberIds: [],
      messages: []
    };

    this.channels.set(id, channel);
    logger.info(`Chat channel created: ${name}`);
    return channel;
  }

  sendMessage(
    senderId: string,
    channelId: string,
    content: string,
    recipientId?: string
  ): Message | null {
    const channel = this.channels.get(channelId);
    
    if (!channel && !recipientId) {
      logger.warn(`Channel ${channelId} not found`);
      return null;
    }

    const message: Message = {
      id: uuidv4(),
      senderId,
      recipientId,
      channelId,
      content,
      timestamp: Date.now()
    };

    this.messages.set(message.id, message);

    // Add to channel if it exists
    if (channel) {
      channel.messages.push(message.id);
      
      // Limit messages per channel
      if (channel.messages.length > this.maxMessagesPerChannel) {
        const removedId = channel.messages.shift();
        if (removedId) {
          this.messages.delete(removedId);
        }
      }
    }

    logger.debug(`Message sent from ${senderId} to ${channelId || recipientId}`);
    return message;
  }

  getChannelMessages(channelId: string, limit: number = 100): Message[] {
    const channel = this.channels.get(channelId);
    if (!channel) return [];

    const messageIds = channel.messages.slice(-limit);
    return messageIds
      .map(id => this.messages.get(id))
      .filter(msg => msg !== undefined) as Message[];
  }

  getPrivateMessages(playerId1: string, playerId2: string, limit: number = 100): Message[] {
    const messages = Array.from(this.messages.values())
      .filter(msg => 
        (msg.senderId === playerId1 && msg.recipientId === playerId2) ||
        (msg.senderId === playerId2 && msg.recipientId === playerId1)
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return messages;
  }

  addPlayerToChannel(playerId: string, channelId: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    if (!channel.memberIds.includes(playerId)) {
      channel.memberIds.push(playerId);
      logger.info(`Player ${playerId} added to channel ${channel.name}`);
    }
    return true;
  }

  removePlayerFromChannel(playerId: string, channelId: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    channel.memberIds = channel.memberIds.filter(id => id !== playerId);
    logger.info(`Player ${playerId} removed from channel ${channel.name}`);
    return true;
  }

  getPlayerChannels(playerId: string): ChatChannel[] {
    return Array.from(this.channels.values()).filter(
      channel => channel.isPublic || channel.memberIds.includes(playerId)
    );
  }

  deleteMessage(messageId: string): boolean {
    return this.messages.delete(messageId);
  }

  createAllianceChannel(allianceId: string, allianceName: string): ChatChannel {
    return this.createChannel(`alliance-${allianceId}`, `${allianceName} Alliance`, false);
  }
}
