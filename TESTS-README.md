# Ã°Å¸Â§Âª TESTS AUTOMATISÃƒâ€°S - README

Suite de tests automatisÃƒÂ©s complÃƒÂ¨te pour le Space Strategy Game.

---

## Ã°Å¸Å½Â¯ UTILISATION RAPIDE

```bash
# Rendre le script exÃƒÂ©cutable (Linux/Mac/WSL)
chmod +x run-tests.sh

# ExÃƒÂ©cuter TOUS les tests
./run-tests.sh

# Tests spÃƒÂ©cifiques
./run-tests.sh backend      # Backend seulement
./run-tests.sh frontend     # Frontend seulement
./run-tests.sh api          # API REST
./run-tests.sh websocket    # WebSocket
./run-tests.sh e2e          # End-to-end (Playwright)
./run-tests.sh database     # Database
./run-tests.sh lint         # Code quality

# Avec coverage
./run-tests.sh all true
```

---

## Ã°Å¸â€œÂ FICHIERS CRÃƒâ€°Ãƒâ€°S

### Tests Backend
- `backend/src/__tests__/api.integration.test.ts` - Tests API REST (18 suites de tests)
- `backend/src/__tests__/websocket.test.ts` - Tests WebSocket temps rÃƒÂ©el (10 suites)

### Tests Frontend
- `frontend/src/__tests__/frontend.test.tsx` - Tests composants React (12 suites)

### Tests E2E
- `e2e/game.spec.ts` - Tests end-to-end Playwright (10 suites de tests)

### Configuration
- `playwright.config.ts` - Configuration Playwright
- `run-tests.sh` - Script principal d'exÃƒÂ©cution
- `TESTING-GUIDE.md` - Documentation complÃƒÂ¨te

---

## Ã°Å¸Â§Âª TESTS IMPLÃƒâ€°MENTÃƒâ€°S

### Ã°Å¸â€Â Authentication (7 tests)
- Ã¢Å“â€¦ Register new user
- Ã¢Å“â€¦ Login existing user
- Ã¢Å“â€¦ Get current user profile
- Ã¢Å“â€¦ Fail with wrong password
- Ã¢Å“â€¦ Token verification
- Ã¢Å“â€¦ Logout
- Ã¢Å“â€¦ Token refresh

### Ã°Å¸â€œÅ  Game Stats (2 tests)
- Ã¢Å“â€¦ Get game statistics
- Ã¢Å“â€¦ Get list of players

### Ã°Å¸ÂªÂ Planets (6 tests)
- Ã¢Å“â€¦ Get all planets
- Ã¢Å“â€¦ Get planet details
- Ã¢Å“â€¦ Colonize planet (authenticated)
- Ã¢Å“â€¦ Fail colonization without auth
- Ã¢Å“â€¦ Fail if planet already colonized
- Ã¢Å“â€¦ 404 for invalid planet ID

### Ã°Å¸â€™Å½ Resources (2 tests)
- Ã¢Å“â€¦ Get player resources (authenticated)
- Ã¢Å“â€¦ Fail without auth

### Ã°Å¸Ââ€”Ã¯Â¸Â Buildings (2 tests)
- Ã¢Å“â€¦ Get buildings on planet
- Ã¢Å“â€¦ Construct a building

### Ã°Å¸Å¡â‚¬ Fleets (2 tests)
- Ã¢Å“â€¦ Get player fleets
- Ã¢Å“â€¦ Create a new fleet

### Ã°Å¸â€™Â¬ Chat/Messaging (2 tests)
- Ã¢Å“â€¦ Send a message
- Ã¢Å“â€¦ Get message history

### Ã°Å¸Â¤Â Alliances (2 tests)
- Ã¢Å“â€¦ List all alliances
- Ã¢Å“â€¦ Create a new alliance

### Ã°Å¸ÂÂ¥ Health Checks (2 tests)
- Ã¢Å“â€¦ Simple health check
- Ã¢Å“â€¦ Detailed health check

### Ã¢ÂÅ’ Error Handling (2 tests)
- Ã¢Å“â€¦ 404 for nonexistent routes
- Ã¢Å“â€¦ 400 for invalid JSON

### Ã°Å¸â€Å’ WebSocket (15 tests)
- Ã¢Å“â€¦ Connect/disconnect
- Ã¢Å“â€¦ Player join/leave
- Ã¢Å“â€¦ Chat messages (send/receive/broadcast)
- Ã¢Å“â€¦ Game updates
- Ã¢Å“â€¦ Planet colonization
- Ã¢Å“â€¦ Fleet movement
- Ã¢Å“â€¦ Authentication
- Ã¢Å“â€¦ Error handling
- Ã¢Å“â€¦ Performance (rapid messages, connection under load)

### Ã°Å¸Å½Â¨ Frontend (20 tests)
- Ã¢Å“â€¦ App component rendering
- Ã¢Å“â€¦ HomePage components
- Ã¢Å“â€¦ GamePage layout
- Ã¢Å“â€¦ GameCanvas interactions
- Ã¢Å“â€¦ ResourcePanel display
- Ã¢Å“â€¦ ChatPanel functionality
- Ã¢Å“â€¦ PlanetList display
- Ã¢Å“â€¦ Integration (WebSocket connect/disconnect)
- Ã¢Å“â€¦ Accessibility
- Ã¢Å“â€¦ Performance

### Ã°Å¸Å’Â E2E (25 tests)
- Ã¢Å“â€¦ Homepage navigation
- Ã¢Å“â€¦ Game page loading
- Ã¢Å“â€¦ Galaxy interactions (click, drag, zoom)
- Ã¢Å“â€¦ Chat functionality
- Ã¢Å“â€¦ Resource display
- Ã¢Å“â€¦ Multiplayer (multi-tab)
- Ã¢Å“â€¦ Backend API calls
- Ã¢Å“â€¦ Performance
- Ã¢Å“â€¦ Accessibility

**TOTAL : ~140 tests automatisÃƒÂ©s** Ã¢Å“â€¦

---

## Ã°Å¸â€œÅ  COVERAGE ATTENDU

| Zone | Objectif | PrioritÃƒÂ© |
|------|----------|----------|
| Backend Controllers | > 90% | Ã°Å¸â€Â´ Haute |
| Backend Services | > 80% | Ã°Å¸â€Â´ Haute |
| Frontend Components | > 70% | Ã°Å¸Å¸Â  Moyenne |
| Frontend Utils | > 80% | Ã°Å¸Å¸Â  Moyenne |
| E2E Workflows | 100% critiques | Ã°Å¸â€Â´ Haute |

---

## Ã°Å¸Å¡â‚¬ PRÃƒâ€°REQUIS

### Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Playwright (E2E)
npm install -D @playwright/test
npx playwright install
```

### Docker

Les tests nÃƒÂ©cessitent que Docker soit dÃƒÂ©marrÃƒÂ© :

```bash
# DÃƒÂ©marrer les conteneurs
docker-compose -f docker-compose.dev.yml up -d

# Ou via Make
make start
```

---

## Ã°Å¸Å½Â¯ UTILISATION EN DÃƒâ€°VELOPPEMENT

### Mode Watch (pendant le dev)

```bash
# Backend
cd backend
npm run test:watch

# Frontend
cd frontend
npm run test:watch
```

### Tests rapides (smoke tests)

```bash
# Seulement les tests unitaires
./run-tests.sh backend
./run-tests.sh frontend

# Ignorer E2E (plus lents)
# (exÃƒÂ©cuter manuellement avant commit)
```

### Debug un test spÃƒÂ©cifique

```bash
# Backend
cd backend
npx jest --testNamePattern="Should colonize a planet"

# Frontend
cd frontend
npx vitest --run --reporter=verbose

# E2E
npx playwright test --debug
npx playwright test --ui
```

---

## Ã°Å¸â€â€ž INTÃƒâ€°GRATION CI/CD

### GitHub Actions (exemple)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: testpassword
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: ./run-tests.sh all true true
        env:
          CI: true
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info
```

---

## Ã°Å¸Ââ€º DÃƒâ€°PANNAGE

### "Cannot find module '@shared/...'"

```bash
# VÃƒÂ©rifier les path aliases dans tsconfig.json
# Rebuilder les conteneurs Docker
docker-compose -f docker-compose.dev.yml build --no-cache
```

### "WebSocket connection failed in tests"

```bash
# S'assurer que le backend est dÃƒÂ©marrÃƒÂ©
docker-compose -f docker-compose.dev.yml up -d backend

# Attendre qu'il soit prÃƒÂªt
sleep 5
```

### "E2E tests timeout"

```bash
# Augmenter le timeout dans playwright.config.ts
timeout: 60000,  // 60 secondes

# Ou dÃƒÂ©sactiver headless mode
npx playwright test --headed
```

### "Tests passent localement mais ÃƒÂ©chouent en CI"

- VÃƒÂ©rifier les variables d'environnement
- VÃƒÂ©rifier les timeouts (plus longs en CI)
- VÃƒÂ©rifier les dÃƒÂ©pendances de services (DB, etc.)
- Utiliser `--reporter=verbose` pour plus de logs

---

## Ã°Å¸â€œÅ¡ DOCUMENTATION

- **Guide complet** : `TESTING-GUIDE.md`
- **Tests API** : `backend/src/__tests__/api.integration.test.ts`
- **Tests WebSocket** : `backend/src/__tests__/websocket.test.ts`
- **Tests Frontend** : `frontend/src/__tests__/frontend.test.tsx`
- **Tests E2E** : `e2e/game.spec.ts`

---

## Ã°Å¸Å½â€° RÃƒâ€°SULTAT ATTENDU

Lorsque tous les tests passent :

```
Ã¢â€¢â€Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢â€”
Ã¢â€¢â€˜ Ã¢Å“â€¦ ALL TESTS PASSED
Ã¢â€¢Å¡Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

Test Summary:
  Ã¢Å“â€œ Backend unit tests
  Ã¢Å“â€œ Frontend component tests
  Ã¢Å“â€œ API integration tests
  Ã¢Å“â€œ WebSocket tests
  Ã¢Å“â€œ E2E browser tests
  Ã¢Å“â€œ Database tests
  Ã¢Å“â€œ Code quality checks

Ã°Å¸Å½â€° All systems operational!
```

---

**CrÃƒÂ©ÃƒÂ© le :** 30 Janvier 2026  
**Version :** 1.0.0  
**Status :** Ã¢Å“â€¦ OpÃƒÂ©rationnel

**Pour exÃƒÂ©cuter :**
```bash
./run-tests.sh
```
