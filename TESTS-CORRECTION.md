# Ã°Å¸â€Â§ GUIDE DE CORRECTION DES TESTS

## Ã¢ÂÅ’ PROBLÃƒË†ME IDENTIFIÃƒâ€°

Les tests d'intÃƒÂ©gration (`api.integration.test.ts` et `websocket.test.ts`) essaient de :
1. Importer le serveur depuis `../server`
2. DÃƒÂ©marrer le serveur
3. Tester les routes

**Mais :** Le serveur est **dÃƒÂ©jÃƒÂ  running dans Docker** ! Cela crÃƒÂ©e un conflit de ports et des erreurs.

---

## Ã¢Å“â€¦ SOLUTION

Nous avons 3 types de tests diffÃƒÂ©rents :

### 1Ã¯Â¸ÂÃ¢Æ’Â£ Tests Unitaires (Sans Serveur)
**Fichiers :**
- `src/planets/__tests__/Planet.test.ts`
- `src/buildings/__tests__/BuildingSystem.test.ts`
- `src/galaxy/__tests__/GalaxyMapGenerator.test.ts`
- `src/__tests__/simple.test.ts` (nouveau)

**Ces tests fonctionnent Ã¢Å“â€¦**

### 2Ã¯Â¸ÂÃ¢Æ’Â£ Tests d'IntÃƒÂ©gration API (Avec Supertest)
**Fichiers :**
- `src/__tests__/api.integration.test.ts`

**ProblÃƒÂ¨me :** Essaie de dÃƒÂ©marrer le serveur alors qu'il tourne dÃƒÂ©jÃƒÂ 

**Solution :** Utiliser un environnement de test sÃƒÂ©parÃƒÂ© OU tester contre le serveur running

### 3Ã¯Â¸ÂÃ¢Æ’Â£ Tests WebSocket (Avec Socket.io-client)
**Fichiers :**
- `src/__tests__/websocket.test.ts`

**ProblÃƒÂ¨me :** MÃƒÂªme chose, conflit avec le serveur Docker

---

## Ã°Å¸Å½Â¯ COMMANDES POUR VOUS

### Option A : Tests Unitaires Seulement (RecommandÃƒÂ©)

```bash
# Dans WSL
cd /mnt/c/Fallen\ Galaxy\ clone/space-strategy-game

# Lancer seulement les tests unitaires
docker-compose -f docker-compose.dev.yml exec backend npx jest src/planets/__tests__/Planet.test.ts
docker-compose -f docker-compose.dev.yml exec backend npx jest src/buildings/__tests__/BuildingSystem.test.ts
docker-compose -f docker-compose.dev.yml exec backend npx jest src/__tests__/simple.test.ts

# OU tous les tests unitaires d'un coup
docker-compose -f docker-compose.dev.yml exec backend npx jest --testPathIgnorePatterns="integration|websocket"
```

### Option B : Tests d'IntÃƒÂ©gration (Contre Serveur Running)

**CrÃƒÂ©er un nouveau fichier de test :**
`backend/src/__tests__/api.live.test.ts`

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3000';

describe('Live API Tests', () => {
  test('GET /health should return ok', async () => {
    const response = await axios.get(`${API_URL}/health`);
    expect(response.data.status).toBe('ok');
  });
  
  test('GET /api/game/stats should return stats', async () => {
    const response = await axios.get(`${API_URL}/api/game/stats`);
    expect(response.data).toHaveProperty('activePlayers');
  });
});
```

**Lancer :**
```bash
docker-compose -f docker-compose.dev.yml exec backend npx jest api.live.test.ts
```

### Option C : Tout Corriger Automatiquement

```bash
# Lancer le script de correction
bash fix-tests.sh
```

---

## Ã°Å¸â€œÅ  RÃƒâ€°SUMÃƒâ€° DES TESTS DISPONIBLES

| Type | Fichiers | Fonctionnent ? | Comment Lancer |
|------|----------|----------------|----------------|
| **Unitaires** | Planet, BuildingSystem, Galaxy | Ã¢Å“â€¦ OUI | `npx jest src/planets` |
| **IntÃƒÂ©gration** | api.integration.test.ts | Ã¢ÂÅ’ Conflit | NÃƒÂ©cessite refactoring |
| **WebSocket** | websocket.test.ts | Ã¢ÂÅ’ Conflit | NÃƒÂ©cessite refactoring |
| **Simple** | simple.test.ts | Ã¢Å“â€¦ OUI | `npm test` |

---

## Ã°Å¸â€Â§ CORRECTION DÃƒâ€°FINITIVE

### 1. SÃƒÂ©parer les Tests

**backend/jest.config.unit.js** (nouveau) :
```javascript
module.exports = {
  ...require('./jest.config'),
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '!**/__tests__/**/*.integration.test.ts',
    '!**/__tests__/**/websocket.test.ts'
  ]
};
```

**backend/jest.config.integration.js** (nouveau) :
```javascript
module.exports = {
  ...require('./jest.config'),
  testMatch: [
    '**/__tests__/**/*.integration.test.ts',
    '**/__tests__/**/websocket.test.ts'
  ],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.integration.js']
};
```

### 2. Modifier package.json

```json
{
  "scripts": {
    "test": "jest --config=jest.config.unit.js",
    "test:unit": "jest --config=jest.config.unit.js",
    "test:integration": "jest --config=jest.config.integration.js",
    "test:all": "npm run test:unit && npm run test:integration"
  }
}
```

### 3. Tests d'IntÃƒÂ©gration SÃƒÂ©parÃƒÂ©s

Les tests d'intÃƒÂ©gration doivent :
- Soit utiliser un serveur de test sÃƒÂ©parÃƒÂ© (port diffÃƒÂ©rent)
- Soit tester contre le serveur Docker running

---

## Ã¢Å¡Â¡ COMMANDE RAPIDE MAINTENANT

**Pour voir si les tests unitaires fonctionnent :**

```bash
cd /mnt/c/Fallen\ Galaxy\ clone/space-strategy-game
docker-compose -f docker-compose.dev.yml exec backend npx jest src/__tests__/simple.test.ts --verbose
```

**Devrait afficher :**
```
PASS  src/__tests__/simple.test.ts
  Ã¢Å“â€œ Environment > Should have NODE_ENV defined
  Ã¢Å“â€œ Basic Math > Should add numbers correctly
  Ã¢Å“â€œ TypeScript > Should support async/await

Tests: 3 passed, 3 total
```

---

## Ã°Å¸â€œÅ¡ PROCHAINES Ãƒâ€°TAPES

1. Ã¢Å“â€¦ **Tester les tests unitaires** (simple.test.ts)
2. Ã¢Å“â€¦ **Tester Planet.test.ts**
3. Ã¢Å“â€¦ **Tester BuildingSystem.test.ts**
4. Ã¢Å¡Â Ã¯Â¸Â **Refactorer les tests d'intÃƒÂ©gration** (optionnel)
5. Ã¢Å¡Â Ã¯Â¸Â **Refactorer les tests WebSocket** (optionnel)

---

**Lancez cette commande pour vÃƒÂ©rifier que Jest fonctionne :**

```bash
docker-compose -f docker-compose.dev.yml exec backend npx jest src/__tests__/simple.test.ts
```

**Puis copiez-moi le rÃƒÂ©sultat !** Ã°Å¸Å¡â‚¬
