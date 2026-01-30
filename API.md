# Space Strategy Game - API Documentation

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ Overview

This document describes the RESTful API endpoints and Socket.io events for the Space Strategy Game server.

**Base URL:** `http://localhost:3000`  
**WebSocket URL:** `ws://localhost:3000`

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Authentication

The API uses JWT (JSON Web Token) for authentication. After login or registration, include the token in subsequent requests:

```
Authorization: Bearer <your-jwt-token>
```

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ REST API Endpoints

### Health & Status

#### GET /api/health
Check server health status.

**Access:** Public

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

#### GET /
Get API information.

**Access:** Public

**Response:**
```json
{
  "name": "Space Strategy Game API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "game": "/api/game"
  }
}
```

---

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "SecureP@ss123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Validation Rules:**
- `username`: 3-20 alphanumeric characters
- `email`: Valid email format
- `password`: Must meet strength requirements

**Success Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user_1234567890_abc123",
    "username": "player123",
    "email": "player@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "lastLogin": "2024-01-15T10:00:00.000Z",
    "isActive": true,
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Validation Error` - Invalid input data or weak password
- `409 Conflict` - Email or username already exists

---

#### POST /api/auth/login
Login with existing credentials.

**Access:** Public

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_1234567890_abc123",
    "username": "player123",
    "email": "player@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "lastLogin": "2024-01-15T11:30:00.000Z",
    "isActive": true,
    "isAdmin": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Validation Error` - Invalid input data
- `401 Authentication Failed` - Invalid credentials
- `403 Account Disabled` - Account has been disabled

---

#### POST /api/auth/logout
Logout current user and blacklist token.

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Notes:**
- Token will be blacklisted and cannot be used again
- Client should delete stored tokens

---

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Refresh token not provided
- `401 Unauthorized` - Token has been revoked
- `403 Forbidden` - Invalid or expired refresh token

---

#### POST /api/auth/change-password
Change user password.

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldP@ss123",
  "newPassword": "NewSecureP@ss456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Validation Error` - New password doesn't meet requirements or same as current
- `401 Authentication Failed` - Current password is incorrect

---

#### DELETE /api/auth/account
Delete user account.

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `401 Authentication Failed` - Password is incorrect
- `404 Not Found` - User not found

**Notes:**
- This action is irreversible
- All user data will be permanently deleted
- User must provide password for confirmation

---

#### GET /api/auth/me
Get current user profile.

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "user_1234567890_abc123",
    "username": "player123",
    "email": "player@example.com",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "lastLogin": "2024-01-15T11:30:00.000Z"
  }
}
```

---

#### GET /api/auth/verify
Verify JWT token validity.

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "userId": "user_1234567890_abc123",
    "email": "player@example.com"
  }
}
```

---

### Game Endpoints

#### GET /api/game/stats
Get overall game statistics.

**Access:** Public

**Success Response (200):**
```json
{
  "activePlayers": 42,
  "activeGames": 1,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

---

#### GET /api/game/state
Get current game state.

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "state": {
    "id": "main",
    "players": [...],
    "planets": [...],
    "ships": [...],
    "alliances": [...],
    "timestamp": 1705320000000
  }
}
```

---

#### GET /api/game/players
Get list of active players.

**Access:** Public

**Success Response (200):**
```json
{
  "count": 5,
  "players": [
    {
      "id": "socket_abc123",
      "name": "Player_abc123",
      "color": "#FF6B6B",
      "planets": 3,
      "ships": 15
    }
  ]
}
```

---

#### GET /api/game/leaderboard
Get player leaderboard.

**Access:** Public

**Success Response (200):**
```json
{
  "count": 5,
  "leaderboard": [
    {
      "id": "socket_abc123",
      "name": "Player_abc123",
      "score": 15750,
      "planets": 3,
      "ships": 15,
      "resources": {
        "minerals": 5000,
        "energy": 2500,
        "credits": 10000
      }
    }
  ]
}
```

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Socket.io Events

### Connection

Connect to the WebSocket server:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');
```

---

### Client ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Server Events

#### auth:authenticate
Authenticate the socket connection.

**Emit:**
```javascript
socket.emit('auth:authenticate', {
  token: 'your-jwt-token'
});
```

**Response:**
```javascript
socket.on('auth:success', (data) => {
  // { playerId, playerName }
});
```

---

#### player:join
Join the game.

**Emit:**
```javascript
socket.emit('player:join', {
  name: 'PlayerName'
});
```

**Response:**
```javascript
socket.on('player:joined', (data) => {
  // { success: true, playerId, player }
});
```

---

#### game:action
Perform a game action.

**Emit:**
```javascript
socket.emit('game:action', {
  type: 'colonize_planet',
  data: {
    planetId: 'planet_123'
  }
});
```

**Action Types:**
- `colonize_planet`
- `build_ship`
- `move_fleet`
- `create_alliance`
- `join_alliance`
- `leave_alliance`

---

#### chat:message
Send a chat message.

**Emit:**
```javascript
socket.emit('chat:message', {
  text: 'Hello, galaxy!',
  channelId: 'global' // optional
});
```

---

#### chat:private
Send a private message.

**Emit:**
```javascript
socket.emit('chat:private', {
  recipientId: 'socket_xyz789',
  text: 'Secret message'
});
```

---

#### alliance:create
Create a new alliance.

**Emit:**
```javascript
socket.emit('alliance:create', {
  name: 'United Federation'
});
```

---

#### alliance:join
Join an existing alliance.

**Emit:**
```javascript
socket.emit('alliance:join', {
  allianceId: 'alliance_123'
});
```

---

#### ping
Check connection health.

**Emit:**
```javascript
socket.emit('ping');
```

**Response:**
```javascript
socket.on('pong', (data) => {
  // { timestamp }
});
```

---

### Server ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Client Events

#### game:update
Game state update (30 times per second).

**Listen:**
```javascript
socket.on('game:update', (gameState) => {
  // Update your game UI
});
```

---

#### chat:message
Chat message broadcast.

**Listen:**
```javascript
socket.on('chat:message', (data) => {
  // { playerId, playerName, message, timestamp, channelId }
});
```

---

#### player:new
New player joined.

**Listen:**
```javascript
socket.on('player:new', (data) => {
  // { playerId, playerName, timestamp }
});
```

---

#### player:left
Player disconnected.

**Listen:**
```javascript
socket.on('player:left', (data) => {
  // { playerId, timestamp }
});
```

---

#### error
Error occurred.

**Listen:**
```javascript
socket.on('error', (error) => {
  // { message, code }
});
```

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ Security Features

### Rate Limiting
- **100 requests per 15 minutes** per IP address
- Returns `429 Too Many Requests` when exceeded
- Headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### CORS
- Configured for `http://localhost:5173` by default
- Customizable via `CORS_ORIGIN` environment variable

### Password Hashing
- Bcrypt with 10 salt rounds
- Passwords never stored in plaintext

### JWT Tokens
- 7-day expiration by default
- Signed with secure secret key
- Include user ID and email in payload

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_TOKEN_REQUIRED` | 401 | No authentication token provided |
| `AUTH_INVALID_TOKEN` | 403 | Invalid or expired token |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `JOIN_FAILED` | 500 | Failed to join game |
| `INVALID_ACTION` | 400 | Invalid game action format |
| `ACTION_FAILED` | 500 | Failed to process action |
| `PLAYER_NOT_FOUND` | 404 | Player not found |
| `ALLIANCE_CREATE_FAILED` | 500 | Failed to create alliance |
| `ALLIANCE_JOIN_FAILED` | 500 | Failed to join alliance |

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â  Rate Limit Headers

All API requests include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-15T12:15:00.000Z
```

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª Example Usage

### JavaScript/TypeScript Client

```typescript
import axios from 'axios';
import { io } from 'socket.io-client';

// Register user
const { data } = await axios.post('http://localhost:3000/api/auth/register', {
  username: 'commander',
  email: 'commander@galaxy.com',
  password: 'secure123'
});

const token = data.token;

// Connect via Socket.io
const socket = io('http://localhost:3000');

// Authenticate socket
socket.emit('auth:authenticate', { token });

// Join game
socket.on('auth:success', () => {
  socket.emit('player:join', { name: 'Commander' });
});

// Listen for updates
socket.on('game:update', (state) => {
  console.log('Game state:', state);
});

// Send chat message
socket.emit('chat:message', {
  text: 'Hello, universe!'
});
```

---

## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Notes

- All timestamps are in ISO 8601 format
- All coordinates use a cartesian system centered at (0, 0)
- WebSocket connection automatically reconnects on disconnect
- Keep tokens secure and never expose them in client-side code
- Use HTTPS in production for encrypted communication

---

For more information, see the [main documentation](../README.md).
