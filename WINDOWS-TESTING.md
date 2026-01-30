# Ã°Å¸ÂªÅ¸ GUIDE WINDOWS - Tests & Build

Guide pour exÃƒÂ©cuter les tests sur Windows (PowerShell).

---

## Ã°Å¸Å¡Â¨ PROBLÃƒË†ME : better-sqlite3 ne compile pas

**Erreur :**
```
gyp ERR! find VS Could not find any Visual Studio installation to use
```

### Ã¢Å“â€¦ SOLUTION 1 : Utiliser Docker (RecommandÃƒÂ©)

**Tous les tests s'exÃƒÂ©cutent dans Docker, pas de problÃƒÂ¨me de build Windows !**

```powershell
# Utiliser le script PowerShell
.\run-tests.ps1 backend

# Ou directement avec Docker
docker-compose -f docker-compose.dev.yml exec backend npm test
```

---

### Ã¢Å“â€¦ SOLUTION 2 : Installer Visual Studio Build Tools

Si vous voulez vraiment compiler en local :

**1. TÃƒÂ©lÃƒÂ©charger Visual Studio Build Tools**
```
https://visualstudio.microsoft.com/downloads/
```

**2. Installer "Desktop development with C++"**
- Cochez "Desktop development with C++"
- Inclut MSVC v143 et Windows SDK

**3. RÃƒÂ©essayer**
```powershell
cd backend
npm install
```

---

### Ã¢Å“â€¦ SOLUTION 3 : Utiliser WSL (Meilleur des deux mondes)

**Installer WSL :**
```powershell
# Dans PowerShell (Administrateur)
wsl --install
```

**Puis exÃƒÂ©cuter les tests dans WSL :**
```bash
# Ouvrir WSL
wsl

# Naviguer vers le projet
cd /mnt/c/Fallen\ Galaxy\ clone/space-strategy-game

# ExÃƒÂ©cuter les tests
chmod +x run-tests.sh
./run-tests.sh backend
```

---

## Ã°Å¸â€œÂ COMMANDES WINDOWS (PowerShell)

### Tests Backend

```powershell
# Via script PowerShell
.\run-tests.ps1 backend

# Via Docker directement
docker-compose -f docker-compose.dev.yml exec backend npm test

# Avec coverage
docker-compose -f docker-compose.dev.yml exec backend npm run test:coverage
```

### Tests Frontend

```powershell
# Via script PowerShell
.\run-tests.ps1 frontend

# Via Docker
docker-compose -f docker-compose.dev.yml exec frontend npm test

# Localement (si dÃƒÂ©pendances installÃƒÂ©es)
cd frontend
npm test
```

### Tests E2E

```powershell
# E2E seulement
.\run-tests.ps1 e2e

# Ou directement
npx playwright test

# Avec UI
npx playwright test --ui
```

### Tous les Tests

```powershell
# Tous les tests
.\run-tests.ps1

# Avec coverage
.\run-tests.ps1 -Coverage

# Test spÃƒÂ©cifique
.\run-tests.ps1 backend
```

### Linting

```powershell
# Lint seulement
.\run-tests.ps1 lint

# Ou via Docker
docker-compose -f docker-compose.dev.yml exec backend npm run lint
docker-compose -f docker-compose.dev.yml exec frontend npm run lint
```

---

## Ã°Å¸Å½Â¯ WORKFLOW RECOMMANDÃƒâ€° (Windows)

### Option A : Tout dans Docker

**Avantages :**
- Ã¢Å“â€¦ Pas de problÃƒÂ¨me de build Windows
- Ã¢Å“â€¦ Environnement identique ÃƒÂ  production
- Ã¢Å“â€¦ Pas besoin de Visual Studio

**Commandes :**
```powershell
# DÃƒÂ©marrer les conteneurs
docker-compose -f docker-compose.dev.yml up -d

# Tests
.\run-tests.ps1 backend
.\run-tests.ps1 frontend

# Ou directement
docker-compose -f docker-compose.dev.yml exec backend npm test
```

### Option B : Frontend local, Backend Docker

**Avantages :**
- Ã¢Å“â€¦ Frontend plus rapide (pas de Docker overhead)
- Ã¢Å“â€¦ Backend ÃƒÂ©vite les problÃƒÂ¨mes de build

**Commandes :**
```powershell
# Backend dans Docker
docker-compose -f docker-compose.dev.yml exec backend npm test

# Frontend local
cd frontend
npm test
```

### Option C : WSL

**Avantages :**
- Ã¢Å“â€¦ Commandes Linux fonctionnent
- Ã¢Å“â€¦ Script bash original fonctionne
- Ã¢Å“â€¦ Meilleure intÃƒÂ©gration avec outils dev

**Commandes :**
```powershell
# Ouvrir WSL
wsl

# Dans WSL
cd /mnt/c/Fallen\ Galaxy\ clone/space-strategy-game
./run-tests.sh backend
```

---

## Ã°Å¸â€œÅ  OUVRIR LES RAPPORTS DE COVERAGE

### Sur Windows

```powershell
# Backend coverage
start backend\coverage\lcov-report\index.html

# Frontend coverage
start frontend\coverage\lcov-report\index.html
```

### Dans WSL

```bash
# Backend coverage
explorer.exe backend/coverage/lcov-report/index.html

# Frontend coverage
explorer.exe frontend/coverage/lcov-report/index.html
```

---

## Ã°Å¸â€Â§ DÃƒâ€°PANNAGE

### "Execution of scripts is disabled"

```powershell
# Autoriser l'exÃƒÂ©cution de scripts
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### "Cannot find module"

```powershell
# RÃƒÂ©installer les dÃƒÂ©pendances dans Docker
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up -d backend
```

### "Docker daemon is not running"

```powershell
# DÃƒÂ©marrer Docker Desktop
# Puis relancer
.\run-tests.ps1
```

### "Tests timeout"

```powershell
# Augmenter la mÃƒÂ©moire Docker
# Docker Desktop Ã¢â€ â€™ Settings Ã¢â€ â€™ Resources Ã¢â€ â€™ Memory (8GB recommandÃƒÂ©)
```

---

## Ã°Å¸Å½Â¯ COMMANDES RAPIDES

```powershell
# Tests quotidiens (Docker)
.\run-tests.ps1 backend
.\run-tests.ps1 frontend

# Tests complets avant commit
.\run-tests.ps1

# Debug un test
docker-compose -f docker-compose.dev.yml exec backend npx jest --testNamePattern="nom du test"

# Mode watch (local)
cd frontend
npm run test:watch

# E2E avec UI
npx playwright test --ui
```

---

## Ã°Å¸â€œÅ¡ COMPARAISON DES APPROCHES

| Approche | Avantages | InconvÃƒÂ©nients |
|----------|-----------|---------------|
| **Docker** | Ã¢Å“â€¦ Pas de build Windows<br>Ã¢Å“â€¦ Identique ÃƒÂ  prod | Ã¢Å¡Â Ã¯Â¸Â Un peu plus lent<br>Ã¢Å¡Â Ã¯Â¸Â NÃƒÂ©cessite Docker |
| **WSL** | Ã¢Å“â€¦ Commandes Linux<br>Ã¢Å“â€¦ Rapide | Ã¢Å¡Â Ã¯Â¸Â NÃƒÂ©cessite WSL<br>Ã¢Å¡Â Ã¯Â¸Â Config supplÃƒÂ©mentaire |
| **Local** | Ã¢Å“â€¦ Plus rapide<br>Ã¢Å“â€¦ Natif Windows | Ã¢ÂÅ’ ProblÃƒÂ¨me better-sqlite3<br>Ã¢ÂÅ’ NÃƒÂ©cessite Visual Studio |

**Recommandation : Docker** pour la simplicitÃƒÂ© et la fiabilitÃƒÂ©.

---

## Ã¢Å“â€¦ CHECKLIST DE SETUP

- [ ] Docker Desktop installÃƒÂ© et dÃƒÂ©marrÃƒÂ©
- [ ] Conteneurs backend/frontend running
- [ ] Script PowerShell exÃƒÂ©cutable (`Set-ExecutionPolicy`)
- [ ] Playwright installÃƒÂ© (`npx playwright install`)
- [ ] Frontend dependencies installÃƒÂ©es

**Commande de vÃƒÂ©rification :**
```powershell
docker ps
.\run-tests.ps1 backend
```

---

**CrÃƒÂ©ÃƒÂ© pour Windows PowerShell**  
**Date :** 30 Janvier 2026  
**Compatible :** Windows 10/11
