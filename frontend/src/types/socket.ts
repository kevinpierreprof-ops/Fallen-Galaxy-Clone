/**
 * Socket Event Types
 * 
 * TypeScript types for all Socket.io events
 */

import type { Planet } from '@shared/types/galaxyMap';
import type { Ship } from '@shared/types/ships';
import type { PrivateMessage } from '@shared/types/privateMessaging';
import type { Alliance, AllianceEvent } from '@shared/types/alliance';
import type { Building } from '@shared/types/buildings';
import type { ShipType } from '@shared/types/ships';

/**
 * Player joined event
 */
export interface PlayerJoinedEvent {
  playerId: string;
  username: string;
  timestamp: number;
}

/**
 * Player left event
 */
export interface PlayerLeftEvent {
  playerId: string;
  username: string;
  timestamp: number;
}

/**
 * Planet updated event
 */
export interface PlanetUpdatedEvent {
  planet: Planet;
  changes: {
    resources?: boolean;
    buildings?: boolean;
    owner?: boolean;
  };
  timestamp: number;
}

/**
 * Ship moved event
 */
export interface ShipMovedEvent {
  shipId: string;
  ship: Ship;
  origin: string;
  destination: string;
  progress: number;
  timestamp: number;
}

/**
 * Message received event
 */
export interface MessageReceivedEvent {
  message: PrivateMessage;
  unreadCount: number;
}

/**
 * Alliance update event
 */
export interface AllianceUpdateEvent {
  event: AllianceEvent;
  alliance?: Alliance;
}

/**
 * Resource update event
 */
export interface ResourceUpdateEvent {
  planetId: string;
  resources: {
    minerals: number;
    energy: number;
    crystal: number;
  };
  timestamp: number;
}

/**
 * Building completed event
 */
export interface BuildingCompletedEvent {
  planetId: string;
  building: Building;
  timestamp: number;
}

/**
 * Ship completed event
 */
export interface ShipCompletedEvent {
  planetId: string;
  ship: Ship;
  timestamp: number;
}

/**
 * Server to client events
 */
export interface ServerToClientEvents {
  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  
  // Player events
  playerJoined: (data: PlayerJoinedEvent) => void;
  playerLeft: (data: PlayerLeftEvent) => void;
  
  // Game state events
  planetUpdated: (data: PlanetUpdatedEvent) => void;
  shipMoved: (data: ShipMovedEvent) => void;
  resourceUpdate: (data: ResourceUpdateEvent) => void;
  
  // Communication events
  messageReceived: (data: MessageReceivedEvent) => void;
  allianceUpdate: (data: AllianceUpdateEvent) => void;
  
  // Construction events
  buildingCompleted: (data: BuildingCompletedEvent) => void;
  shipCompleted: (data: ShipCompletedEvent) => void;
  
  // Error events
  error: (error: { message: string; code?: string }) => void;
}

/**
 * Build building request
 */
export interface BuildBuildingRequest {
  planetId: string;
  buildingType: string;
}

/**
 * Build ship request
 */
export interface BuildShipRequest {
  planetId: string;
  shipType: ShipType;
  quantity?: number;
}

/**
 * Send ship request
 */
export interface SendShipRequest {
  shipId: string;
  destinationPlanetId: string;
  cargo?: {
    minerals?: number;
    energy?: number;
    crystal?: number;
  };
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  recipientId: string;
  content: string;
}

/**
 * Client to server events
 */
export interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string, callback: (response: { success: boolean; message?: string }) => void) => void;
  
  // Building actions
  buildBuilding: (data: BuildBuildingRequest, callback: (response: { success: boolean; message?: string }) => void) => void;
  
  // Ship actions
  buildShip: (data: BuildShipRequest, callback: (response: { success: boolean; message?: string }) => void) => void;
  sendShip: (data: SendShipRequest, callback: (response: { success: boolean; message?: string }) => void) => void;
  
  // Communication
  sendMessage: (data: SendMessageRequest, callback: (response: { success: boolean; message?: string }) => void) => void;
  
  // Game state requests
  requestGameState: (callback: (response: { success: boolean; data?: any; message?: string }) => void) => void;
}

/**
 * Socket event callback
 */
export type SocketEventCallback<T = any> = (data: T) => void;

/**
 * Socket emit callback
 */
export type SocketEmitCallback = (response: { success: boolean; message?: string; data?: any }) => void;
