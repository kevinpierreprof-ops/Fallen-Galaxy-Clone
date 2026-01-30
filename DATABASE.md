# Database Documentation

## Overview

The Space Strategy Game uses **SQLite** with the `better-sqlite3` library for data persistence. SQLite was chosen for its simplicity, zero-configuration setup, and excellent performance for a game server.

## Database Schema

### Tables

#### 1. **users**
Stores user account information.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_admin INTEGER NOT NULL DEFAULT 0
);
```

**Indexes:**
- `idx_users_username` on `username`
- `idx_users_email` on `email`
- `idx_users_created_at` on `created_at`

#### 2. **planets**
Stores planet data including resources and ownership.

```sql
CREATE TABLE planets (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  name TEXT NOT NULL,
  x_position REAL NOT NULL,
  y_position REAL NOT NULL,
  size INTEGER NOT NULL DEFAULT 1,
  population REAL NOT NULL DEFAULT 0,
  max_population INTEGER NOT NULL DEFAULT 1000,
  minerals REAL NOT NULL DEFAULT 0,
  energy REAL NOT NULL DEFAULT 0,
  production_minerals REAL NOT NULL DEFAULT 0,
  production_energy REAL NOT NULL DEFAULT 0,
  production_credits REAL NOT NULL DEFAULT 0,
  buildings_json TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_planets_owner` on `owner_id`
- `idx_planets_position` on `(x_position, y_position)`
- `idx_planets_name` on `name`

#### 3. **ships**
Stores ship data and fleet assignments.

```sql
CREATE TABLE ships (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  type TEXT NOT NULL,
  planet_id TEXT,
  fleet_id TEXT,
  x_position REAL NOT NULL DEFAULT 0,
  y_position REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'idle',
  health REAL NOT NULL,
  max_health REAL NOT NULL,
  speed REAL NOT NULL,
  damage REAL NOT NULL,
  stats_json TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (planet_id) REFERENCES planets(id) ON DELETE SET NULL
);
```

**Indexes:**
- `idx_ships_owner` on `owner_id`
- `idx_ships_planet` on `planet_id`
- `idx_ships_fleet` on `fleet_id`
- `idx_ships_type` on `type`
- `idx_ships_status` on `status`

#### 4. **messages**
Stores player-to-player messages and chat history.

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  channel_id TEXT,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  is_read INTEGER NOT NULL DEFAULT 0,
  message_type TEXT NOT NULL DEFAULT 'private',
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_messages_sender` on `sender_id`
- `idx_messages_receiver` on `receiver_id`
- `idx_messages_channel` on `channel_id`
- `idx_messages_timestamp` on `timestamp`
- `idx_messages_is_read` on `is_read`

#### 5. **alliances**
Stores player alliance/coalition information.

```sql
CREATE TABLE alliances (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  leader_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  members_json TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_alliances_name` on `name`
- `idx_alliances_leader` on `leader_id`
- `idx_alliances_created_at` on `created_at`

#### 6. **fleets**
Stores fleet information for ship grouping.

```sql
CREATE TABLE fleets (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  x_position REAL NOT NULL,
  y_position REAL NOT NULL,
  destination_x REAL,
  destination_y REAL,
  speed REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 7. **game_sessions**
Tracks active player sessions for Socket.io connections.

```sql
CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  socket_id TEXT,
  connected_at TEXT NOT NULL DEFAULT (datetime('now')),
  disconnected_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Migration System

### Running Migrations

Migrations run automatically when the server starts:

```typescript
import { runMigrations } from '@/database/migrations';

runMigrations();
```

### Creating New Migrations

Add migrations to `src/database/migrations.ts`:

```typescript
{
  id: 8,
  name: 'add_new_table',
  up: (db: Database.Database) => {
    db.exec(`CREATE TABLE new_table (...)`);
  },
  down: (db: Database.Database) => {
    db.exec(`DROP TABLE IF EXISTS new_table`);
  }
}
```

### Migration Commands

```typescript
import { runMigrations, rollbackMigration, getMigrationStatus, resetDatabase } from '@/database/migrations';

// Run all pending migrations
runMigrations();

// Rollback last migration
rollbackMigration();

// Get migration status
const status = getMigrationStatus();

// Reset database (WARNING: destroys all data)
resetDatabase();
```

---

## Models (CRUD Operations)

### User Model

```typescript
import { userModel } from '@/database/models/UserModel';

// Create user
const user = await userModel.create({
  username: 'commander',
  email: 'commander@space.com',
  password: 'secure123'
});

// Find user
const user = userModel.findById('user-id');
const user = userModel.findByEmail('email@example.com');
const user = userModel.findByUsername('commander');

// Update user
await userModel.update('user-id', {
  username: 'new-username'
});

// Verify password
const user = await userModel.verifyPassword('email@example.com', 'password');

// Delete user
userModel.delete('user-id');

// Count users
const count = userModel.count();
const activeCount = userModel.countActive();

// Search users
const users = userModel.search('commander');
```

### Planet Model

```typescript
import { planetModel } from '@/database/models/PlanetModel';

// Create planet
const planet = planetModel.create({
  name: 'Alpha-Prime',
  x_position: 100,
  y_position: 200,
  size: 3
});

// Find planets
const planet = planetModel.findById('planet-id');
const planets = planetModel.findByOwner('user-id');
const unowned = planetModel.findUnowned();
const nearby = planetModel.findInArea(x, y, radius);

// Colonize planet
planetModel.colonize('planet-id', 'user-id', 1000);

// Update resources
planetModel.addResources('planet-id', 500, 250);
planetModel.deductResources('planet-id', 100, 50);

// Get totals
const totals = planetModel.getTotalResourcesByOwner('user-id');
const production = planetModel.getTotalProductionByOwner('user-id');

// Bulk create (for initialization)
const planets = planetModel.bulkCreate(planetsData);
```

### Ship Model

```typescript
import { shipModel } from '@/database/models/ShipModel';

// Create ship
const ship = shipModel.create({
  owner_id: 'user-id',
  type: 'fighter',
  health: 100,
  max_health: 100,
  speed: 50,
  damage: 25
});

// Find ships
const ship = shipModel.findById('ship-id');
const ships = shipModel.findByOwner('user-id');
const fleetShips = shipModel.findByFleet('fleet-id');
const planetShips = shipModel.findAtPlanet('planet-id');

// Move ship
shipModel.moveTo('ship-id', x, y);

// Fleet management
shipModel.assignToFleet('ship-id', 'fleet-id');
shipModel.removeFromFleet('ship-id');

// Dock at planet
shipModel.dockAtPlanet('ship-id', 'planet-id');

// Combat
shipModel.damage('ship-id', 25);
shipModel.repair('ship-id', 10);

// Bulk create
const ships = shipModel.bulkCreate(shipsData);
```

### Message Model

```typescript
import { messageModel } from '@/database/models/MessageModel';

// Send message
const message = messageModel.create({
  sender_id: 'user-id-1',
  receiver_id: 'user-id-2',
  content: 'Hello!',
  message_type: 'private'
});

// Get messages
const messages = messageModel.findPrivateMessages('user-1', 'user-2');
const received = messageModel.findReceivedMessages('user-id');
const sent = messageModel.findSentMessages('user-id');
const unread = messageModel.findUnreadMessages('user-id');

// Mark as read
messageModel.markAsRead('message-id');
messageModel.markAllAsRead('user-id');

// Count unread
const count = messageModel.countUnread('user-id');

// Get conversations
const conversations = messageModel.getRecentConversations('user-id');

// Search
const results = messageModel.search('user-id', 'search query');
```

### Alliance Model

```typescript
import { allianceModel } from '@/database/models/AllianceModel';

// Create alliance
const alliance = allianceModel.create({
  name: 'United Federation',
  leader_id: 'user-id',
  description: 'Peace and prosperity'
});

// Find alliances
const alliance = allianceModel.findById('alliance-id');
const alliance = allianceModel.findByName('United Federation');
const alliance = allianceModel.findByMember('user-id');

// Manage members
allianceModel.addMember('alliance-id', 'user-id');
allianceModel.removeMember('alliance-id', 'user-id');
allianceModel.changeLeader('alliance-id', 'new-leader-id');

// Get member info
const members = allianceModel.getMembers('alliance-id');
const count = allianceModel.getMemberCount('alliance-id');
const isMember = allianceModel.isMember('alliance-id', 'user-id');
const isLeader = allianceModel.isLeader('alliance-id', 'user-id');

// Get largest alliances
const largest = allianceModel.getLargestAlliances(10);
```

---

## Database Configuration

### Connection Settings

In `src/database/connection.ts`:

```typescript
// Enable foreign keys
db.pragma('foreign_keys = ON');

// Set WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Optimize performance
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000');
db.pragma('temp_store = MEMORY');
```

### Environment Variables

```env
# Database file path
DATABASE_PATH=./data/space-strategy.db

# For in-memory database (testing)
DATABASE_PATH=:memory:

# Enable verbose SQL logging
DATABASE_VERBOSE=true
```

---

## Seeding Data

### Run Seeders

```typescript
import { seedDatabase, needsSeeding } from '@/database/seed';

// Check if seeding is needed
if (needsSeeding()) {
  await seedDatabase();
}
```

### Available Seeders

- `seedUsers()` - Creates test users
- `seedPlanets()` - Generates 50 planets
- `assignStartingPlanets()` - Assigns planets to users
- `seedShips()` - Creates starter ships
- `seedAlliances()` - Creates example alliances

---

## Backup and Restore

### Backup Database

```typescript
import { backupDatabase } from '@/database';

backupDatabase('/path/to/backup.db');
```

### Database Statistics

```typescript
import { getDatabaseStats } from '@/database';

const stats = getDatabaseStats();
// {
//   tables: { users: 10, planets: 50, ... },
//   totalRecords: 150
// }
```

---

## Performance Considerations

### Indexes

All frequently queried columns have indexes for optimal performance.

### Transactions

Bulk operations use transactions:

```typescript
import { transaction, getDatabase } from '@/database';

transaction((db) => {
  // Multiple operations in single transaction
  const user = userModel.create(userData);
  const planet = planetModel.create(planetData);
  return { user, planet };
});
```

### WAL Mode

Write-Ahead Logging (WAL) is enabled for better concurrency and crash recovery.

---

## Testing

### In-Memory Database

For tests, use in-memory database:

```env
NODE_ENV=test
DATABASE_PATH=:memory:
```

### Reset Database

```typescript
import { resetDatabase } from '@/database/migrations';

resetDatabase(); // Drops all tables
runMigrations(); // Recreate schema
```

---

## Common Queries

### Get player stats
```typescript
const user = userModel.findById(userId);
const planetCount = planetModel.countByOwner(userId);
const shipCount = shipModel.countByOwner(userId);
const resources = planetModel.getTotalResourcesByOwner(userId);
const production = planetModel.getTotalProductionByOwner(userId);
```

### Leaderboard
```typescript
const users = userModel.findAll();
const leaderboard = users.map(user => ({
  ...user,
  score: calculateScore(user)
})).sort((a, b) => b.score - a.score);
```

---

## Maintenance

### Vacuum Database

```typescript
const db = getDatabase();
db.exec('VACUUM');
```

### Analyze Tables

```typescript
const db = getDatabase();
db.exec('ANALYZE');
```

### Check Integrity

```typescript
const db = getDatabase();
const result = db.prepare('PRAGMA integrity_check').all();
```

---

## Security

- Passwords are hashed with bcrypt (10 salt rounds)
- Foreign keys enforce referential integrity
- SQL injection prevented by prepared statements
- All user input is validated before database operations

---

## Troubleshooting

### Database locked error
- Ensure WAL mode is enabled
- Check for long-running transactions
- Reduce concurrent writes

### Performance issues
- Run `ANALYZE` to update query planner statistics
- Consider adding indexes for slow queries
- Use `EXPLAIN QUERY PLAN` to analyze queries

### Migration issues
- Check migration logs in console
- Verify foreign key constraints
- Use `getMigrationStatus()` to see applied migrations

---

For more information, see the source code in `backend/src/database/`.
