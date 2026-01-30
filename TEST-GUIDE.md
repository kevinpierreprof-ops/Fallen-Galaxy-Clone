# Ã°Å¸Â§Âª GUIDE DE TEST - Space Strategy Game

Ce guide vous permet de tester toutes les fonctionnalitÃƒÂ©s du jeu ÃƒÂ©tape par ÃƒÂ©tape.

---

## Ã°Å¸Å¡â‚¬ PRÃƒâ€°PARATION

### 1. VÃƒÂ©rifier que tout tourne

```bash
# Dans WSL
make status
```

**Attendu :**
```
Ã¢Å“â€¦ backend - Up
Ã¢Å“â€¦ frontend - Up  
Ã¢Å“â€¦ database - Up
Ã¢Å“â€¦ redis - Up
Ã¢Å“â€¦ pgadmin - Up
```

### 2. Ouvrir les outils de dÃƒÂ©veloppement

**Dans le navigateur (Chrome/Edge) :**
- Appuyez sur `F12` pour ouvrir DevTools
- Onglet `Console` : Voir les logs JavaScript
- Onglet `Network` : Voir les requÃƒÂªtes HTTP/WebSocket
- Onglet `Application` Ã¢â€ â€™ `Local Storage` : Voir les donnÃƒÂ©es sauvegardÃƒÂ©es

---

## Ã¢Å“â€¦ TEST 1 : Backend API Health

### URL ÃƒÂ  tester

```
http://localhost:3000/health
```

### RÃƒÂ©sultat Attendu

```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "uptime": 123.456
}
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 2 : Backend API Root

### URL ÃƒÂ  tester

```
http://localhost:3000/
```

### RÃƒÂ©sultat Attendu

```json
{
  "name": "Space Strategy Game API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "healthDetailed": "/api/health",
    "auth": "/api/auth",
    "game": "/api/game"
  }
}
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 3 : Statistiques du Jeu

### URL ÃƒÂ  tester

```
http://localhost:3000/api/game/stats
```

### RÃƒÂ©sultat Attendu

```json
{
  "activePlayers": 0,
  "activeGames": 1,
  "timestamp": "2026-01-30T..."
}
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 4 : Liste des Joueurs

### URL ÃƒÂ  tester

```
http://localhost:3000/api/game/players
```

### RÃƒÂ©sultat Attendu

```json
{
  "count": 0,
  "players": []
}
```

**Note :** Sera vide car aucun joueur n'est connectÃƒÂ© via WebSocket pour le moment.

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 5 : Frontend Charge

### URL ÃƒÂ  tester

```
http://localhost:5173/
```

### RÃƒÂ©sultat Attendu

- Ã¢Å“â€¦ Page d'accueil s'affiche
- Ã¢Å“â€¦ Titre "Space Strategy Game"
- Ã¢Å“â€¦ Bouton "Start Playing"
- Ã¢Å“â€¦ 4 cards de features :
  - Ã°Å¸ÂªÂ Colonize Planets
  - Ã°Å¸Å¡â‚¬ Build Fleets
  - Ã°Å¸Â¤Â Form Alliances
  - Ã°Å¸â€™Â¬ Real-time Chat

### Console (F12)

**Logs attendus :**
```
Ã¢Å“â€œ Aucune erreur rouge
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 6 : Navigation vers le Jeu

### Action

1. Cliquer sur **"Start Playing"** (ou aller ÃƒÂ  `http://localhost:5173/game`)

### RÃƒÂ©sultat Attendu

- Ã¢Å“â€¦ Redirection vers `/game`
- Ã¢Å“â€¦ Interface de jeu s'affiche :
  - **Panneau gauche** : Ressources + Liste planÃƒÂ¨tes
  - **Centre** : Canvas galaxie avec planÃƒÂ¨tes
  - **Panneau droit** : Chat

### Console (F12)

**Logs attendus :**
```
Connecting to WebSocket...
Socket connected: [socket-id]
```

### Logs Backend (WSL)

**Dans `make backend`, vous devriez voir :**
```
Socket connected: [socket-id] from 172.18.0.1
Socket authenticated: [socket-id] as [username]
Player [socket-id] joined game
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 7 : Affichage Ressources

### Dans l'interface `/game`

**Panneau gauche - Resources**

### RÃƒÂ©sultat Attendu

```
Ã°Å¸â€™Å½ Minerals: 1000-5000
Ã¢Å¡Â¡ Energy: 500-2000
Ã°Å¸â€™Â° Credits: 3000-10000
```

**Les valeurs exactes dÃƒÂ©pendent du joueur seed.**

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 8 : Affichage PlanÃƒÂ¨tes

### Dans l'interface `/game`

**Panneau gauche - My Planets**

### RÃƒÂ©sultat Attendu

- Ã¢Å“â€¦ Au moins 1 planÃƒÂ¨te listÃƒÂ©e
- Ã¢Å“â€¦ Format : `[Nom] - Pop: X/Y`
- Ã¢Å“â€¦ Exemple : `Delta-Minor-254 - Pop: 1000/1000`

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 9 : Canvas Galaxie

### Dans l'interface `/game`

**Canvas central**

### RÃƒÂ©sultat Attendu

- Ã¢Å“â€¦ Fond noir/spatial
- Ã¢Å“â€¦ Environ 50 planÃƒÂ¨tes affichÃƒÂ©es (cercles)
- Ã¢Å“â€¦ Couleurs diffÃƒÂ©rentes selon ownership :
  - **Gris** : PlanÃƒÂ¨te neutre
  - **Bleu/Vert/Rouge/etc.** : PlanÃƒÂ¨te possÃƒÂ©dÃƒÂ©e

### Actions ÃƒÂ  tester

1. **Hover une planÃƒÂ¨te** Ã¢â€ â€™ Nom s'affiche (tooltip ?)
2. **Cliquer une planÃƒÂ¨te** Ã¢â€ â€™ ???
3. **Drag canvas** Ã¢â€ â€™ DÃƒÂ©placer la vue ?
4. **Scroll molette** Ã¢â€ â€™ Zoom ?

### Ã¢Å“â€¦ RÃƒÂ©sultats

- [ ] Hover fonctionne
- [ ] Clic fonctionne
- [ ] Drag fonctionne
- [ ] Zoom fonctionne

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 10 : Chat Temps RÃƒÂ©el

### Dans l'interface `/game`

**Panneau droit - Chat**

### Action

1. Taper un message dans l'input en bas
2. Cliquer **Send** ou appuyer **Enter**

### RÃƒÂ©sultat Attendu

**Frontend :**
- Ã¢Å“â€¦ Message apparaÃƒÂ®t immÃƒÂ©diatement dans le chat
- Ã¢Å“â€¦ Format : `[Votre nom]: [Message]`

**Logs Backend (WSL) :**
```
Message from [Player_XXX]: [Votre message]
```

**Console F12 - Network :**
- Ã¢Å“â€¦ WebSocket frame envoyÃƒÂ© : `chat:message`
- Ã¢Å“â€¦ WebSocket frame reÃƒÂ§u : `chat:new`

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 11 : Multi-Joueur (Chat)

### PrÃƒÂ©paration

1. **Onglet 1** : `http://localhost:5173/game` (joueur 1)
2. **Onglet 2** : `http://localhost:5173/game` (navigation privÃƒÂ©e - joueur 2)

### Action

**Dans onglet 1 :** Envoyer message "Hello from Player 1"  
**Dans onglet 2 :** Envoyer message "Hello from Player 2"

### RÃƒÂ©sultat Attendu

**Onglet 1 :**
```
Player_XXX: Hello from Player 1
Player_YYY: Hello from Player 2
```

**Onglet 2 :**
```
Player_XXX: Hello from Player 1
Player_YYY: Hello from Player 2
```

**Logs Backend :**
```
Socket connected: [socket-id-1]
Player [socket-id-1] joined game
Socket connected: [socket-id-2]
Player [socket-id-2] joined game
Message from Player_XXX: Hello from Player 1
Message from Player_YYY: Hello from Player 2
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢ÂÅ’ TEST 12 : Coloniser une PlanÃƒÂ¨te

### Action

1. Cliquer sur une **planÃƒÂ¨te neutre** (grise)
2. Chercher un bouton **"Colonize"**

### RÃƒÂ©sultat Attendu

**UI Actuelle :**
- Ã¢ÂÅ’ **Aucun modal ne s'ouvre**
- Ã¢ÂÅ’ **Pas de bouton "Colonize"**
- Ã¢ÂÅ’ **Pas de dÃƒÂ©tails affichÃƒÂ©s**

### Ã¢Å“â€¦ Status : Ã¢ÂÅ’ **FAIL - FONCTIONNALITÃƒâ€° MANQUANTE**

**Besoin :**
- CrÃƒÂ©er `PlanetDetailsModal.tsx`
- Afficher au clic
- Ajouter bouton "Colonize"
- ImplÃƒÂ©menter route `POST /api/planets/:id/colonize`

---

## Ã¢ÂÅ’ TEST 13 : Construire un BÃƒÂ¢timent

### Action

1. Cliquer sur **votre planÃƒÂ¨te** (bleue)
2. Chercher un panel **"Buildings"** ou **"Construct"**

### RÃƒÂ©sultat Attendu

**UI Actuelle :**
- Ã¢ÂÅ’ **Aucun panel de construction**
- Ã¢ÂÅ’ **Pas de liste de bÃƒÂ¢timents**
- Ã¢ÂÅ’ **Pas de bouton "Build"**

### Ã¢Å“â€¦ Status : Ã¢ÂÅ’ **FAIL - FONCTIONNALITÃƒâ€° MANQUANTE**

**Besoin :**
- CrÃƒÂ©er `BuildingConstructionPanel.tsx`
- Liste des bÃƒÂ¢timents disponibles
- Affichage coÃƒÂ»ts et temps
- ImplÃƒÂ©menter route `POST /api/planets/:id/buildings`

---

## Ã¢ÂÅ’ TEST 14 : Construire un Vaisseau

### Action

1. Chercher un menu **"Ships"** ou **"Fleet Construction"**

### RÃƒÂ©sultat Attendu

**UI Actuelle :**
- Ã¢ÂÅ’ **Aucun menu vaisseaux**
- Ã¢ÂÅ’ **Pas de bouton "Build Ship"**
- Ã¢ÂÅ’ **Pas de liste des vaisseaux disponibles**

### Ã¢Å“â€¦ Status : Ã¢ÂÅ’ **FAIL - FONCTIONNALITÃƒâ€° MANQUANTE**

**Besoin :**
- CrÃƒÂ©er `ShipConstructionPanel.tsx`
- Liste des types de vaisseaux
- ImplÃƒÂ©menter routes API ships

---

## Ã¢ÂÅ’ TEST 15 : DÃƒÂ©placer une Flotte

### Action

1. Chercher une flotte sur la carte
2. Essayer de la sÃƒÂ©lectionner
3. Essayer de donner un ordre de mouvement

### RÃƒÂ©sultat Attendu

**UI Actuelle :**
- Ã¢ÂÅ’ **Aucune flotte visible sur la carte**
- Ã¢ÂÅ’ **Pas de systÃƒÂ¨me de sÃƒÂ©lection**
- Ã¢ÂÅ’ **Pas d'ordre de mouvement possible**

### Ã¢Å“â€¦ Status : Ã¢ÂÅ’ **FAIL - FONCTIONNALITÃƒâ€° MANQUANTE**

**Besoin :**
- Afficher flottes sur canvas
- `FleetManagementPanel.tsx`
- Socket events `fleet:move`

---

## Ã¢ÂÅ’ TEST 16 : CrÃƒÂ©er une Alliance

### Action

1. Chercher un menu **"Alliances"**
2. Chercher un bouton **"Create Alliance"**

### RÃƒÂ©sultat Attendu

**UI Actuelle :**
- Ã¢ÂÅ’ **Aucun menu alliances**
- Ã¢ÂÅ’ **Pas de bouton create**
- Ã¢ÂÅ’ **Pas de liste des alliances existantes**

### Ã¢Å“â€¦ Status : Ã¢ÂÅ’ **FAIL - FONCTIONNALITÃƒâ€° MANQUANTE**

**Besoin :**
- CrÃƒÂ©er `AlliancePanel.tsx`
- IntÃƒÂ©grer routes `/api/alliances` (dÃƒÂ©jÃƒÂ  implÃƒÂ©mentÃƒÂ©es !)

---

## Ã¢Å“â€¦ TEST 17 : Base de DonnÃƒÂ©es

### Connexion ÃƒÂ  la DB

```bash
# Dans WSL
make shell-db
```

**Ou via PgAdmin :**
```
http://localhost:5050
```

**Login :**
- Email: `admin@spacegame.com`
- Password: `admin`

**Connexion serveur :**
- Host: `database` (pas localhost !)
- Port: `5432`
- Database: `space_strategy_game_dev`
- Username: `gameuser`
- Password: `devpassword`

### RequÃƒÂªtes SQL ÃƒÂ  tester

```sql
-- Voir toutes les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Compter les planÃƒÂ¨tes
SELECT COUNT(*) FROM planets;

-- Voir les utilisateurs
SELECT id, username, email FROM users;

-- Voir les planÃƒÂ¨tes possÃƒÂ©dÃƒÂ©es
SELECT p.name, u.username 
FROM planets p 
LEFT JOIN users u ON p.owner_id = u.id 
WHERE p.owner_id IS NOT NULL;

-- Voir les alliances
SELECT name, leader_id, members_json FROM alliances;
```

### RÃƒÂ©sultat Attendu

```
Tables: users, planets, ships, messages, alliances, fleets, game_sessions, migrations
PlanÃƒÂ¨tes: ~50
Utilisateurs: 4 (admiral, commander, captain, pilot)
PlanÃƒÂ¨tes possÃƒÂ©dÃƒÂ©es: 4
Alliances: 2 (United Federation, Empire Coalition)
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã¢Å“â€¦ TEST 18 : Authentification JWT

### Avec curl (WSL)

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

**Attendu :**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@test.com"
  }
}
```

```bash
# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!@#"
  }'
```

**Attendu :**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

```bash
# 3. Verify Token (remplacer YOUR_TOKEN)
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Attendu :**
```json
{
  "valid": true,
  "userId": "...",
  "email": "test@test.com"
}
```

### Ã¢Å“â€¦ Status : PASS | Ã¢ÂÅ’ FAIL

---

## Ã°Å¸â€œÅ  RÃƒâ€°SUMÃƒâ€° DES TESTS

| Test | FonctionnalitÃƒÂ© | Status |
|------|----------------|--------|
| 1 | Backend Health | Ã¢Å“â€¦ |
| 2 | API Root | Ã¢Å“â€¦ |
| 3 | Game Stats | Ã¢Å“â€¦ |
| 4 | Liste Joueurs | Ã¢Å“â€¦ |
| 5 | Frontend Charge | Ã¢Å“â€¦ |
| 6 | Navigation Jeu | Ã¢Å“â€¦ |
| 7 | Affichage Ressources | Ã¢Å“â€¦ |
| 8 | Affichage PlanÃƒÂ¨tes | Ã¢Å“â€¦ |
| 9 | Canvas Galaxie | Ã¢Å¡Â Ã¯Â¸Â (partiel) |
| 10 | Chat Temps RÃƒÂ©el | Ã¢Å“â€¦ |
| 11 | Multi-Joueur Chat | Ã¢Å“â€¦ |
| 12 | Colonisation | Ã¢ÂÅ’ |
| 13 | Construction BÃƒÂ¢timents | Ã¢ÂÅ’ |
| 14 | Construction Vaisseaux | Ã¢ÂÅ’ |
| 15 | DÃƒÂ©placement Flottes | Ã¢ÂÅ’ |
| 16 | Alliances | Ã¢ÂÅ’ |
| 17 | Base de DonnÃƒÂ©es | Ã¢Å“â€¦ |
| 18 | Authentification JWT | Ã¢Å“â€¦ |

**Score : 11/18 Ã¢Å“â€¦ | 5/18 Ã¢ÂÅ’ | 2/18 Ã¢Å¡Â Ã¯Â¸Â**

---

## Ã°Å¸Å½Â¯ CONCLUSION DES TESTS

### Ã¢Å“â€¦ Ce qui Fonctionne
- Backend API stable
- WebSocket temps rÃƒÂ©el
- Chat multi-joueurs
- Affichage galaxie basique
- Base de donnÃƒÂ©es complÃƒÂ¨te
- Authentification JWT

### Ã¢ÂÅ’ Ce qui Manque
- **Interactions planÃƒÂ¨tes** (70% du gameplay !)
- Construction de bÃƒÂ¢timents
- Construction de vaisseaux
- DÃƒÂ©placement de flottes
- SystÃƒÂ¨me d'alliances UI

### Ã°Å¸Å½Â¯ PrioritÃƒÂ© Absolue
**CrÃƒÂ©er le modal de dÃƒÂ©tails planÃƒÂ¨te en premier !**

Cela permettra de :
1. Ã¢Å“â€¦ Afficher infos planÃƒÂ¨te au clic
2. Ã¢Å“â€¦ Coloniser les planÃƒÂ¨tes neutres
3. Ã¢Å“â€¦ AccÃƒÂ©der ÃƒÂ  la construction depuis lÃƒÂ 

---

## Ã°Å¸Å¡â‚¬ COMMANDES UTILES POUR LE DEV

```bash
# Voir logs en temps rÃƒÂ©el
make backend    # Logs backend
make frontend   # Logs frontend
make logs       # Tous les logs

# RedÃƒÂ©marrer rapidement
make restart

# Tout rÃƒÂ©parer
make fix

# Diagnostic complet
make doctor

# Entrer dans un conteneur
make shell-backend
make shell-db

# Sauvegarder la DB
make db-backup

# RÃƒÂ©initialiser la DB
make db-reset
```

---

**Tests effectuÃƒÂ©s le :** 30 Janvier 2026  
**TestÃƒÂ© par :** [Votre Nom]  
**Version du jeu :** 1.0.0-mvp

---

**Bon courage pour implÃƒÂ©menter les fonctionnalitÃƒÂ©s manquantes ! Ã°Å¸Å¡â‚¬**
