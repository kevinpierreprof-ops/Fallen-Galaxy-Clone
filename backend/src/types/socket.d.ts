// Type definitions for Socket.io events

import type { Socket } from 'socket.io';
import type { PlayerAction, GameState } from '@shared/types/game';

export interface ServerToClientEvents {
  'player:joined': (data: { success: boolean; playerId: string }) => void;
  'game:update': (state: GameState) => void;
  'chat:message': (data: { playerId: string; message: string; timestamp: number }) => void;
  'error': (error: { message: string; code: string }) => void;
}

export interface ClientToServerEvents {
  'player:join': (data: { name: string }) => void;
  'game:action': (action: PlayerAction) => void;
  'chat:message': (message: { text: string; channelId?: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId: string;
  playerName: string;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
