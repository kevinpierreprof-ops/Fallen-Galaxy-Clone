# Socket.io Client Integration Documentation

## Overview

The `useSocket` hook provides a comprehensive Socket.io client integration for React applications with automatic reconnection, authentication, TypeScript types, and error handling.

---

## Features

ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Automatic Connection** - Connects on mount with auto-reconnection  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **JWT Authentication** - Authenticates with token from localStorage  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Event Listeners** - Type-safe event subscriptions  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Event Emitters** - Type-safe event emissions with callbacks  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Reconnection Logic** - Configurable automatic reconnection  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **TypeScript Support** - Full type safety for all events  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Connection Status** - Real-time connection state tracking  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Error Handling** - Comprehensive error handling and reporting  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **React Context** - Optional context provider for global access  

---

## Installation

```bash
npm install socket.io-client
```

---

## Files Created

1. **`types/socket.ts`** - TypeScript types for all socket events
2. **`hooks/useSocket.ts`** - Main socket hook
3. **`components/ConnectionIndicator.tsx`** - Connection status indicator
4. **`context/SocketContext.tsx`** - React context provider
5. **`examples/SocketExamples.tsx`** - Usage examples
6. **`SOCKET-CLIENT.md`** - This documentation

---

## Quick Start

### Basic Usage

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const { isConnected, connectionStatus, error } = useSocket();

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### With Event Listeners

```typescript
import { useSocket } from '@/hooks/useSocket';
import type { PlanetUpdatedEvent } from '@/types/socket';

function GameComponent() {
  const { on, off, isConnected } = useSocket();
  const [planets, setPlanets] = useState([]);

  useEffect(() => {
    if (!isConnected) return;

    const handlePlanetUpdate = (data: PlanetUpdatedEvent) => {
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

    on('planetUpdated', handlePlanetUpdate);

    return () => {
      off('planetUpdated', handlePlanetUpdate);
    };
  }, [isConnected, on, off]);

  return <div>Planets: {planets.length}</div>;
}
```

### Emitting Events

```typescript
import { useSocket } from '@/hooks/useSocket';

function BuildingPanel() {
  const { buildBuilding, isConnected } = useSocket();

  const handleBuild = () => {
    buildBuilding(
      {
        planetId: 'planet-1',
        buildingType: 'mine'
      },
      (response) => {
        if (response.success) {
          console.log('Building queued!');
        } else {
          console.error('Error:', response.message);
        }
      }
    );
  };

  return (
    <button onClick={handleBuild} disabled={!isConnected}>
      Build Mine
    </button>
  );
}
```

---

## API Reference

### useSocket Hook

```typescript
function useSocket(options?: UseSocketOptions): UseSocketReturn
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `process.env.VITE_WS_URL` | WebSocket server URL |
| `autoConnect` | `boolean` | `true` | Auto-connect on mount |
| `reconnectionAttempts` | `number` | `5` | Max reconnection attempts |
| `reconnectionDelay` | `number` | `1000` | Delay between attempts (ms) |

**Returns:**

```typescript
interface UseSocketReturn {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  error: Error | null;
  
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  
  // Event methods
  on: (event, callback) => void;
  off: (event, callback?) => void;
  emit: (event, ...args) => void;
  
  // Convenience methods
  buildBuilding: (data, callback?) => void;
  buildShip: (data, callback?) => void;
  sendShip: (data, callback?) => void;
  sendMessage: (data, callback?) => void;
  requestGameState: (callback?) => void;
}
```

---

## Event Types

### Server to Client Events

```typescript
interface ServerToClientEvents {
  // Connection
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  
  // Players
  playerJoined: (data: PlayerJoinedEvent) => void;
  playerLeft: (data: PlayerLeftEvent) => void;
  
  // Game state
  planetUpdated: (data: PlanetUpdatedEvent) => void;
  shipMoved: (data: ShipMovedEvent) => void;
  resourceUpdate: (data: ResourceUpdateEvent) => void;
  
  // Communication
  messageReceived: (data: MessageReceivedEvent) => void;
  allianceUpdate: (data: AllianceUpdateEvent) => void;
  
  // Construction
  buildingCompleted: (data: BuildingCompletedEvent) => void;
  shipCompleted: (data: ShipCompletedEvent) => void;
  
  // Errors
  error: (error: { message: string; code?: string }) => void;
}
```

### Client to Server Events

```typescript
interface ClientToServerEvents {
  authenticate: (token, callback) => void;
  buildBuilding: (data: BuildBuildingRequest, callback) => void;
  buildShip: (data: BuildShipRequest, callback) => void;
  sendShip: (data: SendShipRequest, callback) => void;
  sendMessage: (data: SendMessageRequest, callback) => void;
  requestGameState: (callback) => void;
}
```

---

## Connection Status

```typescript
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
```

**States:**
- **disconnected** - Not connected to server
- **connecting** - Connection in progress
- **connected** - Successfully connected and authenticated
- **error** - Connection error occurred

---

## Authentication

The hook automatically authenticates using JWT token from localStorage:

```typescript
// Token is retrieved from localStorage
const token = localStorage.getItem('token');

// Sent to server on connection
socket.emit('authenticate', token, (response) => {
  if (response.success) {
    // Authenticated
  } else {
    // Authentication failed
  }
});
```

---

## Reconnection Logic

Automatic reconnection with exponential backoff:

```typescript
// Default configuration
{
  reconnectionAttempts: 5,
  reconnectionDelay: 1000  // 1 second
}

// Reconnection attempt sequence:
// Attempt 1: after 1s
// Attempt 2: after 1s
// Attempt 3: after 1s
// ...
// After 5 failed attempts: gives up
```

**Manual reconnection:**

```typescript
const { connect, disconnect } = useSocket({ autoConnect: false });

// Connect manually
connect();

// Disconnect
disconnect();
```

---

## Error Handling

### Connection Errors

```typescript
const { error, connectionStatus } = useSocket();

if (connectionStatus === 'error' && error) {
  console.error('Connection error:', error.message);
}
```

### Event Errors

```typescript
const { on } = useSocket();

useEffect(() => {
  on('error', (err) => {
    console.error('Socket error:', err.message);
    // Handle error (show notification, etc.)
  });
}, [on]);
```

### Emit Errors

```typescript
buildBuilding(data, (response) => {
  if (!response.success) {
    console.error('Build failed:', response.message);
  }
});
```

---

## Context Provider

Share socket instance across your app:

```typescript
// App.tsx
import { SocketProvider } from '@/context/SocketContext';

function App() {
  return (
    <SocketProvider url="http://localhost:3000">
      <YourApp />
    </SocketProvider>
  );
}
```

```typescript
// Any child component
import { useSocketContext } from '@/context/SocketContext';

function ChildComponent() {
  const { isConnected, buildBuilding } = useSocketContext();
  
  // Use socket methods
}
```

---

## Connection Indicator

Visual component for connection status:

```typescript
import { ConnectionIndicator } from '@/components/ConnectionIndicator';

function Header() {
  const { connectionStatus, error } = useSocket();

  return (
    <header>
      <h1>Game</h1>
      <ConnectionIndicator status={connectionStatus} error={error} />
    </header>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `ConnectionStatus` | required | Current connection status |
| `error` | `Error \| null` | `null` | Connection error |
| `showLabel` | `boolean` | `true` | Show status text label |
| `className` | `string` | `''` | Additional CSS classes |

---

## Examples

### Complete Game Component

```typescript
function Game() {
  const {
    isConnected,
    connectionStatus,
    on,
    off,
    buildBuilding,
    sendShip,
    requestGameState
  } = useSocket();

  const [gameState, setGameState] = useState(null);

  // Load initial state
  useEffect(() => {
    if (isConnected) {
      requestGameState((response) => {
        if (response.success) {
          setGameState(response.data);
        }
      });
    }
  }, [isConnected, requestGameState]);

  // Listen for updates
  useEffect(() => {
    if (!isConnected) return;

    const handlePlanetUpdate = (data) => {
      setGameState(prev => ({
        ...prev,
        planets: prev.planets.map(p =>
          p.id === data.planet.id ? data.planet : p
        )
      }));
    };

    on('planetUpdated', handlePlanetUpdate);

    return () => {
      off('planetUpdated', handlePlanetUpdate);
    };
  }, [isConnected, on, off]);

  if (!isConnected) {
    return <div>Connecting...</div>;
  }

  return (
    <div>
      <ConnectionIndicator status={connectionStatus} />
      {/* Game UI */}
    </div>
  );
}
```

---

## Best Practices

### 1. Cleanup Event Listeners

Always remove event listeners in cleanup:

```typescript
useEffect(() => {
  if (!isConnected) return;

  const handler = (data) => {
    // Handle event
  };

  on('event', handler);

  return () => {
    off('event', handler);
  };
}, [isConnected, on, off]);
```

### 2. Check Connection Before Emitting

```typescript
const handleAction = () => {
  if (!isConnected) {
    alert('Not connected to server');
    return;
  }

  buildBuilding(data, callback);
};
```

### 3. Handle Reconnection

```typescript
useEffect(() => {
  if (isConnected) {
    // Reload game state after reconnection
    requestGameState();
  }
}, [isConnected, requestGameState]);
```

### 4. Use Context for Global Access

```typescript
// Wrap your app once
<SocketProvider>
  <App />
</SocketProvider>

// Use anywhere
const { isConnected } = useSocketContext();
```

---

## Troubleshooting

### Not Connecting

- Check server URL in `.env`
- Verify server is running
- Check network/firewall
- Verify CORS settings on server

### Authentication Failed

- Check JWT token exists in localStorage
- Verify token is valid
- Check token format

### Events Not Firing

- Verify socket is connected (`isConnected === true`)
- Check event name spelling
- Verify event handler is registered
- Check server is emitting events

### Reconnection Not Working

- Check `reconnectionAttempts` setting
- Verify disconnect reason
- Check console for errors
- Try manual reconnection

---

## Performance

### Optimization Tips

1. **Memoize Event Handlers**
   ```typescript
   const handleUpdate = useCallback((data) => {
     // Handle
   }, []);
   ```

2. **Debounce Frequent Events**
   ```typescript
   const debouncedHandler = useMemo(
     () => debounce(handleUpdate, 100),
     [handleUpdate]
   );
   ```

3. **Unsubscribe Unused Events**
   ```typescript
   useEffect(() => {
     // Only subscribe when needed
     if (showPanel) {
       on('event', handler);
       return () => off('event', handler);
     }
   }, [showPanel]);
   ```

---

## Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useSocket } from '@/hooks/useSocket';

test('socket connects on mount', async () => {
  const { result, waitFor } = renderHook(() =>
    useSocket({ autoConnect: true })
  );

  await waitFor(() => result.current.isConnected);

  expect(result.current.isConnected).toBe(true);
});
```

---

## See Also

- [API Documentation](./API.md)
- [Socket.io Client Docs](https://socket.io/docs/v4/client-api/)
- [Authentication](./AUTHENTICATION.md)
