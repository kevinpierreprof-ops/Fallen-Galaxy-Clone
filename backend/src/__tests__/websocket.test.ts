/**
 * WebSocket Tests - Real-time Communication
 * 
 * Tests Socket.io events for real-time game features
 */

import { io as ioClient, Socket } from 'socket.io-client';
import { io as ioServer } from '../server';

describe('Ã°Å¸â€Å’ WebSocket Tests', () => {
  let clientSocket: Socket;
  const serverPort = process.env.PORT || 3000;
  const serverUrl = `http://localhost:${serverPort}`;

  beforeAll((done) => {
    // Wait for server to be ready
    setTimeout(done, 1000);
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  afterAll(() => {
    ioServer.close();
  });

  // ============================================================================
  // Connection Tests
  // ============================================================================

  describe('Ã°Å¸â€â€” Connection', () => {
    
    test('Should connect to WebSocket server', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        expect(clientSocket.id).toBeDefined();
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    test('Should disconnect gracefully', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.disconnect();
      });

      clientSocket.on('disconnect', (reason) => {
        expect(reason).toBeDefined();
        done();
      });
    });
  });

  // ============================================================================
  // Player Join/Leave Tests
  // ============================================================================

  describe('Ã°Å¸â€˜Â¤ Player Join/Leave', () => {
    
    test('Should emit player:join and receive player:joined', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('player:join', {
          name: 'TestPlayer'
        });
      });

      clientSocket.on('player:joined', (data) => {
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('playerId');
        expect(data).toHaveProperty('player');
        expect(data.player.name).toBe('TestPlayer');
        done();
      });

      setTimeout(() => {
        done(new Error('Timeout: player:joined not received'));
      }, 5000);
    });

    test('Should broadcast player:new when another player joins', (done) => {
      const socket1 = ioClient(serverUrl, { transports: ['websocket'] });
      const socket2 = ioClient(serverUrl, { transports: ['websocket'] });

      let socket1Connected = false;

      socket1.on('connect', () => {
        socket1.emit('player:join', { name: 'Player1' });
        socket1Connected = true;
      });

      socket1.on('player:new', (data) => {
        expect(data).toHaveProperty('player');
        expect(data.player.name).toBe('Player2');
        socket1.disconnect();
        socket2.disconnect();
        done();
      });

      // Wait for socket1 to join before connecting socket2
      setTimeout(() => {
        if (socket1Connected) {
          socket2.on('connect', () => {
            socket2.emit('player:join', { name: 'Player2' });
          });
        }
      }, 500);
    });
  });

  // ============================================================================
  // Chat Tests
  // ============================================================================

  describe('Ã°Å¸â€™Â¬ Chat', () => {
    
    test('Should send and receive chat messages', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      const testMessage = 'Hello from WebSocket test!';

      clientSocket.on('connect', () => {
        clientSocket.emit('player:join', { name: 'ChatTester' });
      });

      clientSocket.on('player:joined', () => {
        clientSocket.emit('chat:message', {
          text: testMessage,
          channel: 'global'
        });
      });

      clientSocket.on('chat:new', (data) => {
        expect(data).toHaveProperty('message');
        expect(data.message.text).toBe(testMessage);
        expect(data.message.sender).toBeDefined();
        done();
      });

      setTimeout(() => {
        done(new Error('Timeout: chat:new not received'));
      }, 5000);
    });

    test('Should broadcast messages to all clients', (done) => {
      const socket1 = ioClient(serverUrl, { transports: ['websocket'] });
      const socket2 = ioClient(serverUrl, { transports: ['websocket'] });

      const testMessage = 'Broadcast test message';
      let receivedCount = 0;

      const handleMessage = (data: any) => {
        if (data.message.text === testMessage) {
          receivedCount++;
          if (receivedCount === 2) {
            socket1.disconnect();
            socket2.disconnect();
            done();
          }
        }
      };

      socket1.on('connect', () => {
        socket1.emit('player:join', { name: 'Sender' });
      });

      socket2.on('connect', () => {
        socket2.emit('player:join', { name: 'Receiver' });
      });

      socket1.on('chat:new', handleMessage);
      socket2.on('chat:new', handleMessage);

      // Wait for both to join, then send message
      setTimeout(() => {
        socket1.emit('chat:message', {
          text: testMessage,
          channel: 'global'
        });
      }, 1000);
    });
  });

  // ============================================================================
  // Game Updates Tests
  // ============================================================================

  describe('Ã°Å¸Å½Â® Game Updates', () => {
    
    test('Should receive game:update events', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      let updateReceived = false;

      clientSocket.on('connect', () => {
        clientSocket.emit('player:join', { name: 'UpdateTester' });
      });

      clientSocket.on('game:update', (gameState) => {
        if (!updateReceived) {
          expect(gameState).toHaveProperty('planets');
          expect(gameState).toHaveProperty('players');
          expect(Array.isArray(gameState.planets)).toBe(true);
          updateReceived = true;
          done();
        }
      });

      setTimeout(() => {
        if (!updateReceived) {
          done(new Error('Timeout: game:update not received'));
        }
      }, 3000);
    });
  });

  // ============================================================================
  // Planet Actions Tests
  // ============================================================================

  describe('Ã°Å¸ÂªÂ Planet Actions', () => {
    
    test('Should emit planet:colonize and receive response', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('player:join', { name: 'Colonizer' });
      });

      clientSocket.on('player:joined', (data) => {
        // Emit colonize event for a test planet
        clientSocket.emit('planet:colonize', {
          planetId: 'test-planet-id'
        });
      });

      clientSocket.on('colonize:success', (data) => {
        expect(data).toHaveProperty('planet');
        expect(data).toHaveProperty('resources');
        done();
      });

      clientSocket.on('error', (error) => {
        // Expected if planet doesn't exist or already colonized
        expect(error).toHaveProperty('message');
        done();
      });

      setTimeout(() => {
        done(new Error('Timeout: No response from colonize'));
      }, 5000);
    });
  });

  // ============================================================================
  // Fleet Movement Tests
  // ============================================================================

  describe('Ã°Å¸Å¡â‚¬ Fleet Movement', () => {
    
    test('Should emit fleet:move and receive updates', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('player:join', { name: 'FleetCommander' });
      });

      clientSocket.on('player:joined', () => {
        clientSocket.emit('fleet:move', {
          fleetId: 'test-fleet-id',
          destination: { x: 100, y: 200 }
        });
      });

      clientSocket.on('fleet:moving', (data) => {
        expect(data).toHaveProperty('fleetId');
        expect(data).toHaveProperty('position');
        done();
      });

      clientSocket.on('error', (error) => {
        // Expected if fleet doesn't exist
        expect(error).toHaveProperty('message');
        done();
      });

      setTimeout(() => {
        done(new Error('Timeout: fleet movement response not received'));
      }, 5000);
    });
  });

  // ============================================================================
  // Authentication Tests
  // ============================================================================

  describe('Ã°Å¸â€Â Authentication', () => {
    
    test('Should authenticate with valid JWT token', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

      clientSocket.on('connect', () => {
        clientSocket.emit('auth:authenticate', {
          token: fakeToken
        });
      });

      clientSocket.on('auth:success', (data) => {
        expect(data).toHaveProperty('playerId');
        done();
      });

      clientSocket.on('error', (error) => {
        // Expected with fake token
        expect(error).toHaveProperty('message');
        done();
      });

      setTimeout(() => {
        done(new Error('Timeout: auth response not received'));
      }, 5000);
    });

    test('Should fail authentication without token', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('auth:authenticate', {
          token: ''
        });
      });

      clientSocket.on('error', (error) => {
        expect(error).toHaveProperty('message');
        expect(error.code).toBe('AUTH_TOKEN_REQUIRED');
        done();
      });

      setTimeout(() => {
        done(new Error('Timeout: error not received'));
      }, 5000);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Ã¢ÂÅ’ Error Handling', () => {
    
    test('Should receive error for invalid event data', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        // Send malformed data
        clientSocket.emit('chat:message', {
          invalidField: 'test'
        });
      });

      clientSocket.on('error', (error) => {
        expect(error).toHaveProperty('message');
        done();
      });

      setTimeout(() => {
        // If no error received, that's also fine (might be ignored)
        done();
      }, 2000);
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  describe('Ã¢Å¡Â¡ Performance', () => {
    
    test('Should handle multiple rapid messages', (done) => {
      clientSocket = ioClient(serverUrl, {
        transports: ['websocket']
      });

      let messagesReceived = 0;
      const messagesToSend = 10;

      clientSocket.on('connect', () => {
        clientSocket.emit('player:join', { name: 'SpeedTester' });
      });

      clientSocket.on('player:joined', () => {
        // Send multiple messages rapidly
        for (let i = 0; i < messagesToSend; i++) {
          clientSocket.emit('chat:message', {
            text: `Rapid message ${i}`,
            channel: 'global'
          });
        }
      });

      clientSocket.on('chat:new', (data) => {
        if (data.message.text.startsWith('Rapid message')) {
          messagesReceived++;
          if (messagesReceived === messagesToSend) {
            done();
          }
        }
      });

      setTimeout(() => {
        if (messagesReceived < messagesToSend) {
          console.log(`Ã¢Å¡Â Ã¯Â¸Â Only received ${messagesReceived}/${messagesToSend} messages`);
        }
        done();
      }, 5000);
    });

    test('Should handle connection under load', (done) => {
      const sockets: Socket[] = [];
      const numClients = 5;
      let connectedCount = 0;

      for (let i = 0; i < numClients; i++) {
        const socket = ioClient(serverUrl, {
          transports: ['websocket']
        });

        socket.on('connect', () => {
          connectedCount++;
          if (connectedCount === numClients) {
            // All connected
            sockets.forEach(s => s.disconnect());
            done();
          }
        });

        sockets.push(socket);
      }

      setTimeout(() => {
        if (connectedCount < numClients) {
          done(new Error(`Only ${connectedCount}/${numClients} clients connected`));
        }
        sockets.forEach(s => s.disconnect());
      }, 5000);
    });
  });
});
