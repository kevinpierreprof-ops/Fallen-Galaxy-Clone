/**
 * useSocket Hook
 * 
 * React hook for Socket.io client integration with automatic reconnection
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  PlanetUpdatedEvent,
  ShipMovedEvent,
  MessageReceivedEvent,
  AllianceUpdateEvent,
  BuildBuildingRequest,
  BuildShipRequest,
  SendShipRequest,
  SendMessageRequest,
  SocketEventCallback,
  SocketEmitCallback
} from '@/types/socket';

/**
 * Connection status
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Socket hook options
 */
export interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

/**
 * Socket hook return value
 */
export interface UseSocketReturn {
  // Connection state
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  error: Error | null;
  
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  
  // Event listeners
  on: <K extends keyof ServerToClientEvents>(
    event: K,
    callback: SocketEventCallback<Parameters<ServerToClientEvents[K]>[0]>
  ) => void;
  off: <K extends keyof ServerToClientEvents>(
    event: K,
    callback?: SocketEventCallback<Parameters<ServerToClientEvents[K]>[0]>
  ) => void;
  
  // Event emitters
  emit: <K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) => void;
  
  // Convenience methods
  buildBuilding: (data: BuildBuildingRequest, callback?: SocketEmitCallback) => void;
  buildShip: (data: BuildShipRequest, callback?: SocketEmitCallback) => void;
  sendShip: (data: SendShipRequest, callback?: SocketEmitCallback) => void;
  sendMessage: (data: SendMessageRequest, callback?: SocketEmitCallback) => void;
  requestGameState: (callback?: SocketEmitCallback) => void;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: UseSocketOptions = {
  url: import.meta.env.VITE_WS_URL || 'http://localhost:3000',
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
};

/**
 * useSocket Hook
 * 
 * Manages Socket.io connection with automatic reconnection and authentication
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Get authentication token
   */
  const getToken = useCallback((): string | null => {
    return localStorage.getItem('token');
  }, []);

  /**
   * Authenticate socket connection
   */
  const authenticate = useCallback((socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
    const token = getToken();
    
    if (!token) {
      setError(new Error('No authentication token found'));
      setConnectionStatus('error');
      return;
    }

    socket.emit('authenticate', token, (response) => {
      if (response.success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
        console.log('Socket authenticated successfully');
      } else {
        setError(new Error(response.message || 'Authentication failed'));
        setConnectionStatus('error');
        socket.disconnect();
      }
    });
  }, [getToken]);

  /**
   * Setup event listeners
   */
  const setupListeners = useCallback((socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus('connecting');
      authenticate(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Attempt reconnection if not manually disconnected
      if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < (opts.reconnectionAttempts || 5)) {
        reconnectAttemptsRef.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Reconnection attempt ${reconnectAttemptsRef.current}`);
          socket.connect();
        }, opts.reconnectionDelay);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err);
      setConnectionStatus('error');
    });

    // Error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(new Error(err.message));
    });
  }, [authenticate, opts.reconnectionAttempts, opts.reconnectionDelay]);

  /**
   * Connect to socket
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    const socket = io(opts.url!, {
      autoConnect: false,
      reconnection: false, // We handle reconnection manually
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    setupListeners(socket);
    socketRef.current = socket;
    socket.connect();
  }, [opts.url, setupListeners]);

  /**
   * Disconnect from socket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectAttemptsRef.current = opts.reconnectionAttempts || 5; // Prevent auto-reconnect
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [opts.reconnectionAttempts]);

  /**
   * Add event listener
   */
  const on = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback: SocketEventCallback<Parameters<ServerToClientEvents[K]>[0]>
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback as any);
    }
  }, []);

  /**
   * Remove event listener
   */
  const off = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback?: SocketEventCallback<Parameters<ServerToClientEvents[K]>[0]>
  ) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback as any);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  /**
   * Emit event
   */
  const emit = useCallback(<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args as any);
    } else {
      console.warn(`Cannot emit ${String(event)}: socket not connected`);
    }
  }, []);

  /**
   * Build building
   */
  const buildBuilding = useCallback((
    data: BuildBuildingRequest,
    callback?: SocketEmitCallback
  ) => {
    if (!socketRef.current?.connected) {
      callback?.({ success: false, message: 'Not connected to server' });
      return;
    }

    socketRef.current.emit('buildBuilding', data, (response) => {
      callback?.(response);
    });
  }, []);

  /**
   * Build ship
   */
  const buildShip = useCallback((
    data: BuildShipRequest,
    callback?: SocketEmitCallback
  ) => {
    if (!socketRef.current?.connected) {
      callback?.({ success: false, message: 'Not connected to server' });
      return;
    }

    socketRef.current.emit('buildShip', data, (response) => {
      callback?.(response);
    });
  }, []);

  /**
   * Send ship
   */
  const sendShip = useCallback((
    data: SendShipRequest,
    callback?: SocketEmitCallback
  ) => {
    if (!socketRef.current?.connected) {
      callback?.({ success: false, message: 'Not connected to server' });
      return;
    }

    socketRef.current.emit('sendShip', data, (response) => {
      callback?.(response);
    });
  }, []);

  /**
   * Send message
   */
  const sendMessage = useCallback((
    data: SendMessageRequest,
    callback?: SocketEmitCallback
  ) => {
    if (!socketRef.current?.connected) {
      callback?.({ success: false, message: 'Not connected to server' });
      return;
    }

    socketRef.current.emit('sendMessage', data, (response) => {
      callback?.(response);
    });
  }, []);

  /**
   * Request game state
   */
  const requestGameState = useCallback((callback?: SocketEmitCallback) => {
    if (!socketRef.current?.connected) {
      callback?.({ success: false, message: 'Not connected to server' });
      return;
    }

    socketRef.current.emit('requestGameState', (response) => {
      callback?.(response);
    });
  }, []);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (opts.autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [opts.autoConnect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    error,
    connect,
    disconnect,
    on,
    off,
    emit,
    buildBuilding,
    buildShip,
    sendShip,
    sendMessage,
    requestGameState
  };
}

export default useSocket;
