/**
 * useSocket Hook - Usage Examples
 * 
 * Examples of how to use the useSocket hook in components
 */

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { ConnectionIndicator } from '@/components/ConnectionIndicator';
import type { PlanetUpdatedEvent, MessageReceivedEvent } from '@/types/socket';

/**
 * Example 1: Basic Usage
 */
export const BasicSocketExample: React.FC = () => {
  const { isConnected, connectionStatus, error } = useSocket();

  return (
    <div>
      <h2>Socket Connection Status</h2>
      <ConnectionIndicator status={connectionStatus} error={error} />
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>
  );
};

/**
 * Example 2: Listening to Events
 */
export const EventListenerExample: React.FC = () => {
  const { on, off, isConnected } = useSocket();
  const [planets, setPlanets] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    // Listen for planet updates
    const handlePlanetUpdate = (data: PlanetUpdatedEvent) => {
      console.log('Planet updated:', data);
      setPlanets(prev => {
        const index = prev.findIndex(p => p.id === data.planet.id);
        if (index >= 0) {
          const newPlanets = [...prev];
          newPlanets[index] = data.planet;
          return newPlanets;
        }
        return [...prev, data.planet];
      });
    };

    // Listen for messages
    const handleMessage = (data: MessageReceivedEvent) => {
      console.log('Message received:', data);
      setMessages(prev => [...prev, data.message]);
    };

    on('planetUpdated', handlePlanetUpdate);
    on('messageReceived', handleMessage);

    // Cleanup
    return () => {
      off('planetUpdated', handlePlanetUpdate);
      off('messageReceived', handleMessage);
    };
  }, [isConnected, on, off]);

  return (
    <div>
      <h2>Game Updates</h2>
      <div>
        <h3>Planets: {planets.length}</h3>
        <h3>Messages: {messages.length}</h3>
      </div>
    </div>
  );
};

/**
 * Example 3: Emitting Events
 */
export const EventEmitterExample: React.FC = () => {
  const { buildBuilding, buildShip, sendShip, sendMessage, isConnected } = useSocket();
  const [result, setResult] = useState<string>('');

  const handleBuildBuilding = () => {
    buildBuilding(
      {
        planetId: 'planet-1',
        buildingType: 'mine'
      },
      (response) => {
        if (response.success) {
          setResult('Building queued successfully!');
        } else {
          setResult(`Error: ${response.message}`);
        }
      }
    );
  };

  const handleBuildShip = () => {
    buildShip(
      {
        planetId: 'planet-1',
        shipType: 'fighter',
        quantity: 5
      },
      (response) => {
        if (response.success) {
          setResult('Ships queued successfully!');
        } else {
          setResult(`Error: ${response.message}`);
        }
      }
    );
  };

  const handleSendShip = () => {
    sendShip(
      {
        shipId: 'ship-1',
        destinationPlanetId: 'planet-2',
        cargo: {
          minerals: 100,
          energy: 50
        }
      },
      (response) => {
        if (response.success) {
          setResult('Ship sent successfully!');
        } else {
          setResult(`Error: ${response.message}`);
        }
      }
    );
  };

  const handleSendMessage = () => {
    sendMessage(
      {
        recipientId: 'user-2',
        content: 'Hello from socket!'
      },
      (response) => {
        if (response.success) {
          setResult('Message sent successfully!');
        } else {
          setResult(`Error: ${response.message}`);
        }
      }
    );
  };

  return (
    <div>
      <h2>Socket Actions</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleBuildBuilding} disabled={!isConnected}>
          Build Building
        </button>
        <button onClick={handleBuildShip} disabled={!isConnected}>
          Build Ship
        </button>
        <button onClick={handleSendShip} disabled={!isConnected}>
          Send Ship
        </button>
        <button onClick={handleSendMessage} disabled={!isConnected}>
          Send Message
        </button>
      </div>

      {result && <p>{result}</p>}
    </div>
  );
};

/**
 * Example 4: Manual Connection Control
 */
export const ManualConnectionExample: React.FC = () => {
  const { connect, disconnect, isConnected, connectionStatus } = useSocket({
    autoConnect: false
  });

  return (
    <div>
      <h2>Manual Connection Control</h2>
      <ConnectionIndicator status={connectionStatus} />
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={connect} disabled={isConnected}>
          Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected}>
          Disconnect
        </button>
      </div>
    </div>
  );
};

/**
 * Example 5: Complete Game Component
 */
export const GameWithSocket: React.FC = () => {
  const {
    isConnected,
    connectionStatus,
    error,
    on,
    off,
    buildBuilding,
    buildShip,
    sendShip,
    requestGameState
  } = useSocket();

  const [gameState, setGameState] = useState<any>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Request initial game state
  useEffect(() => {
    if (isConnected) {
      requestGameState((response) => {
        if (response.success) {
          setGameState(response.data);
        }
      });
    }
  }, [isConnected, requestGameState]);

  // Listen for all events
  useEffect(() => {
    if (!isConnected) return;

    const handlePlayerJoined = (data: any) => {
      setNotifications(prev => [...prev, `${data.username} joined the game`]);
    };

    const handlePlayerLeft = (data: any) => {
      setNotifications(prev => [...prev, `${data.username} left the game`]);
    };

    const handlePlanetUpdated = (data: PlanetUpdatedEvent) => {
      setGameState((prev: any) => {
        if (!prev) return prev;
        
        const newPlanets = prev.planets.map((p: any) =>
          p.id === data.planet.id ? data.planet : p
        );
        
        return { ...prev, planets: newPlanets };
      });
    };

    const handleShipMoved = (data: any) => {
      setNotifications(prev => [...prev, `Ship ${data.shipId} moved`]);
    };

    const handleMessageReceived = (data: MessageReceivedEvent) => {
      setNotifications(prev => [...prev, `New message from ${data.message.senderId}`]);
    };

    on('playerJoined', handlePlayerJoined);
    on('playerLeft', handlePlayerLeft);
    on('planetUpdated', handlePlanetUpdated);
    on('shipMoved', handleShipMoved);
    on('messageReceived', handleMessageReceived);

    return () => {
      off('playerJoined', handlePlayerJoined);
      off('playerLeft', handlePlayerLeft);
      off('planetUpdated', handlePlanetUpdated);
      off('shipMoved', handleShipMoved);
      off('messageReceived', handleMessageReceived);
    };
  }, [isConnected, on, off]);

  return (
    <div>
      <header>
        <h1>Space Strategy Game</h1>
        <ConnectionIndicator status={connectionStatus} error={error} />
      </header>

      {!isConnected && (
        <div className="connecting-overlay">
          <p>Connecting to game server...</p>
        </div>
      )}

      {isConnected && gameState && (
        <div>
          <div className="game-stats">
            <p>Planets: {gameState.planets?.length || 0}</p>
            <p>Ships: {gameState.ships?.length || 0}</p>
          </div>

          <div className="notifications">
            <h3>Notifications</h3>
            {notifications.slice(-5).map((notif, i) => (
              <p key={i}>{notif}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameWithSocket;
