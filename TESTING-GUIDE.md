# Ã°Å¸Â§Âª GUIDE DES TESTS AUTOMATISÃƒâ€°S

Ce guide explique comment exÃƒÂ©cuter tous les tests automatisÃƒÂ©s du Space Strategy Game.

---

## Ã°Å¸â€œÅ  TYPES DE TESTS

### 1Ã¯Â¸ÂÃ¢Æ’Â£ Tests Backend (Jest)
- **Tests unitaires** : Logique mÃƒÂ©tier isolÃƒÂ©e
- **Tests d'intÃƒÂ©gration** : API endpoints
- **Tests WebSocket** : Communication temps rÃƒÂ©el

### 2Ã¯Â¸ÂÃ¢Æ’Â£ Tests Frontend (Vitest)
- **Tests de composants** : React components
- **Tests d'interaction** : User events
- **Tests de store** : Zustand state management

### 3Ã¯Â¸ÂÃ¢Æ’Â£ Tests E2E (Playwright)
- **Tests de workflow** : Parcours utilisateur complets
- **Tests multi-navigateurs** : Chrome, Firefox, Safari
- **Tests multi-joueurs** : Plusieurs onglets simultanÃƒÂ©s

---

## Ã°Å¸Å¡â‚¬ EXÃƒâ€°CUTION DES TESTS

### Ã¢Å¡Â¡ Lancer TOUS les tests

```bash
# Via script bash (recommandÃƒÂ©)
./run-tests.sh

# Ou via Make
make test

# Ou via npm
npm test
```

### Ã°Å¸Å½Â¯ Tests spÃƒÂ©cifiques

#### Backend seulement
```bash
./run-tests.sh backend

# Ou
cd backend
npm test
```

#### Frontend seulement
```bash
./run-tests.sh frontend

# Ou
cd frontend
npm test
```

#### API Integration
```bash
./run-tests.sh api

# Ou
cd backend
npm run test:integration
```

#### WebSocket
```bash
./run-tests.sh websocket

# Ou
cd backend
npm run test:websocket
```

#### E2E (Playwright)
```bash
./run-tests.sh e2e

# Ou
npx playwright test
```

#### Database
```bash
./run-tests.sh database
```

#### Linting
```bash
./run-tests.sh lint
```

---

## Ã°Å¸â€œË† COVERAGE (Couverture de Code)

### GÃƒÂ©nÃƒÂ©rer un rapport de coverage

```bash
# Tous les tests avec coverage
./run-tests.sh all true

# Backend seulement
cd backend
npm run test:coverage

# Frontend seulement
cd frontend
npm run test:coverage
```

### Voir le rapport

```bash
# Ouvrir le rapport HTML dans le navigateur
open backend/coverage/lcov-report/index.html   # macOS
xdg-open backend/coverage/lcov-report/index.html   # Linux
start backend/coverage/lcov-report/index.html   # Windows
```

---

## Ã°Å¸â€Â§ CONFIGURATION

### Backend Tests (Jest)

**Configuration :** `backend/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ]
};
```

### Frontend Tests (Vitest)

**Configuration :** `frontend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  }
});
```

### E2E Tests (Playwright)

**Configuration :** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

---

## Ã°Å¸â€œÂ Ãƒâ€°CRIRE DES TESTS

### Exemple : Test Backend (Jest)

```typescript
// backend/src/__tests__/MyFeature.test.ts

import { describe, test, expect } from '@jest/globals';
import { myFunction } from '../MyFeature';

describe('MyFeature', () => {
  test('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Exemple : Test Frontend (Vitest)

```typescript
// frontend/src/__tests__/MyComponent.test.tsx

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeDefined();
  });
});
```

### Exemple : Test E2E (Playwright)

```typescript
// e2e/myfeature.spec.ts

import { test, expect } from '@playwright/test';

test('user can do something', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('button:has-text("Click Me")');
  await expect(page.locator('.result')).toContainText('Success');
});
```

---

## Ã°Å¸Ââ€º DEBUGGING DES TESTS

### Tests Backend

```bash
# Mode debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Voir logs dÃƒÂ©taillÃƒÂ©s
DEBUG=* npm test
```

### Tests Frontend

```bash
# Mode UI
npm run test:ui

# Mode watch
npm run test:watch
```

### Tests E2E

```bash
# Mode UI interactif
npx playwright test --ui

# Mode debug
npx playwright test --debug

# Voir le rapport
npx playwright show-report
```

---

## Ã¢Å“â€¦ CHECKLIST AVANT COMMIT

Avant de commiter, assurez-vous que :

- [ ] Tous les tests passent : `./run-tests.sh`
- [ ] Pas d'erreurs de linting : `./run-tests.sh lint`
- [ ] Coverage > 70% : `./run-tests.sh all true`
- [ ] Tests E2E passent : `./run-tests.sh e2e`
- [ ] Pas de tests ignorÃƒÂ©s (`test.skip`, `it.skip`)

---

## Ã°Å¸â€â€ž CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml

name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: ./run-tests.sh all true true  # CI mode
      - uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: |
            backend/coverage
            frontend/coverage
```

---

## Ã°Å¸â€œÅ  MÃƒâ€°TRIQUES DE TESTS

### Objectifs de QualitÃƒÂ©

| MÃƒÂ©trique | Objectif | Actuel |
|----------|----------|--------|
| **Coverage Backend** | > 80% | Ãƒâ‚¬ mesurer |
| **Coverage Frontend** | > 70% | Ãƒâ‚¬ mesurer |
| **Tests E2E** | 100% workflows critiques | Ãƒâ‚¬ dÃƒÂ©velopper |
| **Temps d'exÃƒÂ©cution** | < 5 minutes | Ãƒâ‚¬ optimiser |

### Tests par CatÃƒÂ©gorie

| CatÃƒÂ©gorie | Nombre de Tests | Status |
|-----------|----------------|--------|
| **Backend Unit** | ~50 | Ã¢Å“â€¦ CrÃƒÂ©ÃƒÂ©s |
| **Backend Integration** | ~30 | Ã¢Å“â€¦ CrÃƒÂ©ÃƒÂ©s |
| **Frontend Component** | ~20 | Ã¢Å“â€¦ CrÃƒÂ©ÃƒÂ©s |
| **WebSocket** | ~15 | Ã¢Å“â€¦ CrÃƒÂ©ÃƒÂ©s |
| **E2E** | ~25 | Ã¢Å“â€¦ CrÃƒÂ©ÃƒÂ©s |
| **Total** | **~140 tests** | **Ã¢Å“â€¦ PrÃƒÂªt** |

---

## Ã°Å¸Å¡Â¨ RÃƒâ€°SOLUTION DES PROBLÃƒË†MES

### "Tests ÃƒÂ©chouent mais le jeu fonctionne"

- VÃƒÂ©rifiez que les conteneurs Docker sont dÃƒÂ©marrÃƒÂ©s
- Attendez que le backend soit complÃƒÂ¨tement initialisÃƒÂ©
- VÃƒÂ©rifiez les variables d'environnement

### "WebSocket tests timeout"

```bash
# Augmenter le timeout dans le test
jest.setTimeout(10000);  // 10 secondes
```

### "E2E tests ne trouvent pas les ÃƒÂ©lÃƒÂ©ments"

- Utilisez `await page.waitForSelector()`
- Augmentez les timeouts
- VÃƒÂ©rifiez que le frontend est dÃƒÂ©marrÃƒÂ©

### "Coverage trop faible"

- Ajoutez des tests pour les fonctions non couvertes
- VÃƒÂ©rifiez `collectCoverageFrom` dans `jest.config.js`
- ExÃƒÂ©cutez `npm run test:coverage` pour voir les dÃƒÂ©tails

---

## Ã°Å¸â€œÅ¡ RESSOURCES

### Documentation

- **Jest** : https://jestjs.io/docs/getting-started
- **Vitest** : https://vitest.dev/guide/
- **Playwright** : https://playwright.dev/docs/intro
- **Testing Library** : https://testing-library.com/docs/react-testing-library/intro/

### Exemples de Tests

Consultez les fichiers crÃƒÂ©ÃƒÂ©s :
- `backend/src/__tests__/api.integration.test.ts`
- `backend/src/__tests__/websocket.test.ts`
- `frontend/src/__tests__/frontend.test.tsx`
- `e2e/game.spec.ts`

---

## Ã°Å¸Å½Â¯ BONNES PRATIQUES

### Ã¢Å“â€¦ Ãƒâ‚¬ FAIRE

- Ã¢Å“â€¦ Tester les cas normaux ET les cas d'erreur
- Ã¢Å“â€¦ Utiliser des noms de test descriptifs
- Ã¢Å“â€¦ Isoler les tests (pas de dÃƒÂ©pendances entre eux)
- Ã¢Å“â€¦ Mocker les dÃƒÂ©pendances externes
- Ã¢Å“â€¦ Nettoyer aprÃƒÂ¨s chaque test (`afterEach`)
- Ã¢Å“â€¦ Tester le comportement, pas l'implÃƒÂ©mentation

### Ã¢ÂÅ’ Ãƒâ‚¬ Ãƒâ€°VITER

- Ã¢ÂÅ’ Tests qui dÃƒÂ©pendent de l'ordre d'exÃƒÂ©cution
- Ã¢ÂÅ’ Tests qui modifient l'ÃƒÂ©tat global
- Ã¢ÂÅ’ Tests trop longs (> 5 secondes)
- Ã¢ÂÅ’ Tester des dÃƒÂ©tails d'implÃƒÂ©mentation
- Ã¢ÂÅ’ Ignorer des tests (`test.skip`)

---

## Ã°Å¸Ââ€  COMMANDES RAPIDES

```bash
# DÃƒÂ©veloppement quotidien
npm test                 # Tests rapides
npm run test:watch       # Mode watch

# Avant commit
./run-tests.sh           # Tous les tests
./run-tests.sh lint      # VÃƒÂ©rification code

# Debug
npm run test:debug       # Debug backend
npx playwright test --ui # Debug E2E

# CI/CD
./run-tests.sh all true true  # Coverage + CI mode
```

---

**DerniÃƒÂ¨re mise ÃƒÂ  jour :** 30 Janvier 2026  
**Version :** 1.0.0  
**Status :** Ã¢Å“â€¦ Tests automatisÃƒÂ©s opÃƒÂ©rationnels
