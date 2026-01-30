export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  channelId?: string;
  content: string;
  timestamp: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  isPublic: boolean;
  memberIds: string[];
  messages: string[];
}
