# Path Aliases Guide Ã°Å¸â€â€”

## Overview

This project uses TypeScript path aliases to avoid messy relative imports and improve code maintainability.

## Ã¢ÂÅ’ DON'T USE (Relative Paths)

```typescript
// BAD - Relative imports
import { Ship } from '../../shared/types/game';
import { logger } from '../utils/logger';
import { SHIP_TYPES } from '../../shared/constants/ships';
```

## Ã¢Å“â€¦ DO USE (Path Aliases)

```typescript
// GOOD - Path aliases
import { Ship } from '@shared/types/game';
import { logger } from '@/utils/logger';
import { SHIP_TYPES } from '@shared/constants/ships';
```

## Backend Path Aliases

Defined in `backend/tsconfig.json`:

| Alias | Maps To | Example |
|-------|---------|---------|
| `@/*` | `src/*` | `@/game/GameManager` |
| `@/game/*` | `src/game/*` | `@/game/Game` |
| `@/players/*` | `src/players/*` | `@/players/PlayerManager` |
| `@/planets/*` | `src/planets/*` | `@/planets/PlanetManager` |
| `@/ships/*` | `src/ships/*` | `@/ships/ShipManager` |
| `@/alliances/*` | `src/alliances/*` | `@/alliances/AllianceManager` |
| `@/messaging/*` | `src/messaging/*` | `@/messaging/MessagingManager` |
| `@/utils/*` | `src/utils/*` | `@/utils/logger` |
| `@shared/*` | `../shared/*` | `@shared/types/game` |
| `@shared/types/*` | `../shared/types/*` | `@shared/types/messaging` |
| `@shared/constants/*` | `../shared/constants/*` | `@shared/constants/ships` |

## Frontend Path Aliases

Defined in `frontend/tsconfig.json`:

| Alias | Maps To | Example |
|-------|---------|---------|
| `@/*` | `src/*` | `@/components/GameCanvas` |
| `@/components/*` | `src/components/*` | `@/components/PlanetList` |
| `@/services/*` | `src/services/*` | `@/services/api` |
| `@/store/*` | `src/store/*` | `@/store/gameStore` |
| `@/utils/*` | `src/utils/*` | `@/utils/helpers` |
| `@shared/*` | `../shared/*` | `@shared/types/game` |

## Usage Examples

### Backend Examples

```typescript
// Game logic
import { GameManager } from '@/game/GameManager';
import { PlayerManager } from '@/players/PlayerManager';
import { Ship, Fleet } from '@shared/types/game';
import { SHIP_TYPES } from '@shared/constants/ships';

// Utilities
import { logger } from '@/utils/logger';
import { validateRequest } from '@/middleware/auth';

// Database
import { UserModel } from '@/database/models/UserModel';
```

### Frontend Examples

```typescript
// Components
import { GameCanvas } from '@/components/GameCanvas';
import { PlanetList } from '@/components/PlanetList';

// Services and Store
import { api } from '@/services/api';
import { useGameStore } from '@/store/gameStore';

// Shared types
import { Planet, Ship } from '@shared/types/game';
import { GAME_CONFIG } from '@shared/constants/game';
```

## Benefits

Ã¢Å“â€¦ **Cleaner imports** - No more `../../../../../../`  
Ã¢Å“â€¦ **Easier refactoring** - Move files without updating all imports  
Ã¢Å“â€¦ **Better IDE support** - IntelliSense works better with absolute paths  
Ã¢Å“â€¦ **Consistent code** - Same import style across the project  
Ã¢Å“â€¦ **Type safety** - TypeScript resolves paths correctly

## Docker Considerations

Path aliases work in Docker because:

1. The `shared` folder is copied/mounted at `/app/shared`
2. The backend is at `/app/backend`
3. Path aliases like `@shared/*` resolve to `../shared/*` relative to backend

**Volume mounts in `docker-compose.dev.yml`:**
```yaml
backend:
  volumes:
    - ./backend/src:/app/backend/src
    - ./shared:/app/shared  # Ã¢Å“â€¦ Shared is mounted correctly
```

## Troubleshooting

### Error: "Cannot find module '@shared/...'"

**Solutions:**

1. **Check tsconfig.json** - Ensure path aliases are defined
2. **Restart TypeScript server** - In VS Code: `Ctrl+Shift+P` Ã¢â€ â€™ "TypeScript: Restart TS Server"
3. **Rebuild Docker** - `make rebuild-backend`
4. **Check file exists** - Verify the file exists in the `shared` folder

### Error: "Cannot find module '../../shared/...'"

**You're using relative imports instead of path aliases!**

Fix:
```typescript
// Change this:
import { Ship } from '../../shared/types/game';

// To this:
import { Ship } from '@shared/types/game';
```

### Path aliases not working in Docker

**Check:**
1. `tsconfig-paths` is installed: `npm install tsconfig-paths`
2. `ts-node` command includes `-r tsconfig-paths/register`
3. Volumes are mounted correctly in `docker-compose.dev.yml`

## Configuration Files

### Backend tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### Frontend tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### Frontend vite.config.ts
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  }
});
```

## Quick Reference

| Old (Relative) | New (Alias) |
|----------------|-------------|
| `'../../shared/types/game'` | `'@shared/types/game'` |
| `'../../shared/constants/ships'` | `'@shared/constants/ships'` |
| `'../utils/logger'` | `'@/utils/logger'` |
| `'../game/GameManager'` | `'@/game/GameManager'` |
| `'./Ship'` | Keep as-is (same directory) |

## Migration Checklist

When adding new files:

- [ ] Use `@/` for internal modules
- [ ] Use `@shared/` for shared types/constants
- [ ] Never use `../../shared/`
- [ ] Test imports work in development
- [ ] Verify Docker build succeeds

---

**Remember:** Always use path aliases for cleaner, more maintainable code! Ã¢Å“Â¨
