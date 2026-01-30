# Ã°Å¸Å½Â¯ PLAN D'ACTION - Rendre le Jeu Jouable

## OBJECTIF
**Passer de 40% de fonctionnalitÃƒÂ©s ÃƒÂ  80% en 2-3 jours de dev**

---

## Ã°Å¸â€Â´ JOUR 1 - Interactions PlanÃƒÂ¨tes (8h)

### TÃƒÂ¢che 1.1 : Modal DÃƒÂ©tails PlanÃƒÂ¨te (3h)

#### Fichier ÃƒÂ  crÃƒÂ©er : `frontend/src/components/PlanetDetailsModal.tsx`

```typescript
import { useState } from 'react';
import type { Planet } from '@shared/types/game';
import './PlanetDetailsModal.css';

interface Props {
  planet: Planet | null;
  onClose: () => void;
  onColonize?: (planetId: string) => void;
  canColonize?: boolean;
}

export default function PlanetDetailsModal({ 
  planet, 
  onClose, 
  onColonize,
  canColonize = false 
}: Props) {
  if (!planet) return null;

  const handleColonize = () => {
    if (onColonize && planet.id) {
      onColonize(planet.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>Ãƒâ€”</button>
        
        <h2>{planet.name}</h2>
        
        <div className="planet-stats">
          <div className="stat">
            <label>Size:</label>
            <span>{planet.size}/5</span>
          </div>
          
          <div className="stat">
            <label>Population:</label>
            <span>{planet.population || 0} / {planet.maxPopulation || 1000}</span>
          </div>
          
          <div className="stat">
            <label>Owner:</label>
            <span>{planet.ownerId || 'None'}</span>
          </div>
        </div>

        <div className="planet-resources">
          <h3>Resources</h3>
          <div className="resource-grid">
            <div>Ã°Å¸â€™Å½ Minerals: {planet.resources?.minerals || 0}</div>
            <div>Ã¢Å¡Â¡ Energy: {planet.resources?.energy || 0}</div>
          </div>
        </div>

        <div className="planet-production">
          <h3>Production</h3>
          <div className="production-grid">
            <div>+{planet.production?.minerals || 0} Minerals/h</div>
            <div>+{planet.production?.energy || 0} Energy/h</div>
            <div>+{planet.production?.credits || 0} Credits/h</div>
          </div>
        </div>

        {canColonize && !planet.ownerId && (
          <button 
            className="btn-colonize" 
            onClick={handleColonize}
          >
            Ã°Å¸ÂªÂ Colonize Planet
          </button>
        )}

        {planet.ownerId && (
          <div className="planet-actions">
            <button className="btn-manage">Ã°Å¸Ââ€”Ã¯Â¸Â Manage Buildings</button>
            <button className="btn-ships">Ã°Å¸Å¡â‚¬ Build Ships</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### Fichier CSS : `frontend/src/components/PlanetDetailsModal.css`

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4ecca3;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 50px rgba(78, 204, 163, 0.3);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #4ecca3;
  font-size: 30px;
  cursor: pointer;
  transition: transform 0.2s;
}

.modal-close:hover {
  transform: rotate(90deg);
  color: #ff6b6b;
}

.modal-content h2 {
  color: #4ecca3;
  margin-bottom: 20px;
  text-align: center;
  font-size: 28px;
}

.planet-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
}

.stat label {
  color: #93a1a1;
  font-weight: 600;
}

.stat span {
  color: #4ecca3;
  font-weight: bold;
}

.planet-resources,
.planet-production {
  margin-bottom: 20px;
}

.planet-resources h3,
.planet-production h3 {
  color: #4ecca3;
  margin-bottom: 10px;
  font-size: 18px;
}

.resource-grid,
.production-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.resource-grid div,
.production-grid div {
  background: rgba(78, 204, 163, 0.1);
  padding: 8px;
  border-radius: 6px;
  color: #e0e0e0;
}

.btn-colonize {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #4ecca3 0%, #3ba887 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
}

.btn-colonize:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(78, 204, 163, 0.5);
}

.planet-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.btn-manage,
.btn-ships {
  padding: 12px;
  background: rgba(78, 204, 163, 0.2);
  color: #4ecca3;
  border: 1px solid #4ecca3;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-manage:hover,
.btn-ships:hover {
  background: rgba(78, 204, 163, 0.3);
  transform: translateY(-2px);
}
```

---

### TÃƒÂ¢che 1.2 : IntÃƒÂ©grer le Modal dans GameCanvas (1h)

#### Modifier : `frontend/src/components/GameCanvas.tsx`

```typescript
import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import PlanetDetailsModal from './PlanetDetailsModal';
import type { Planet } from '@shared/types/game';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState } = useGameStore();
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render galaxy
    renderGalaxy(ctx, gameState, setSelectedPlanet);
  }, [gameState]);

  const handleColonize = (planetId: string) => {
    // TODO: Socket emit colonize
    console.log('Colonizing planet:', planetId);
    setSelectedPlanet(null);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="game-canvas"
      />
      
      <PlanetDetailsModal
        planet={selectedPlanet}
        onClose={() => setSelectedPlanet(null)}
        onColonize={handleColonize}
        canColonize={true}
      />
    </>
  );
}

// Helper function to render galaxy (simplified)
function renderGalaxy(
  ctx: CanvasRenderingContext2D,
  gameState: any,
  setSelectedPlanet: (planet: Planet) => void
) {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw planets
  gameState?.planets?.forEach((planet: Planet) => {
    ctx.beginPath();
    ctx.arc(planet.position.x, planet.position.y, planet.size * 5, 0, Math.PI * 2);
    ctx.fillStyle = planet.ownerId ? '#4ecca3' : '#888';
    ctx.fill();

    // Planet name
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(planet.name, planet.position.x - 30, planet.position.y - 20);
  });

  // Click detection (add to canvas event listener)
  ctx.canvas.onclick = (e) => {
    const rect = ctx.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gameState?.planets?.forEach((planet: Planet) => {
      const dx = x - planet.position.x;
      const dy = y - planet.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < planet.size * 5) {
        setSelectedPlanet(planet);
      }
    });
  };
}
```

---

### TÃƒÂ¢che 1.3 : Route API Colonisation (2h)

#### Modifier : `backend/src/routes/gameRoutes.ts`

Ajouter aprÃƒÂ¨s les routes existantes :

```typescript
/**
 * @route   POST /api/game/planets/:id/colonize
 * @desc    Colonize a planet
 * @access  Private
 */
router.post('/planets/:id/colonize', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id: planetId } = req.params;
  const userId = req.userId;

  try {
    const { gameManager, playerManager } = req.app.locals;
    const player = playerManager.getPlayer(userId);

    if (!player) {
      return res.status(404).json({
        error: 'Player not found'
      });
    }

    // Get planet from game state
    const gameState = gameManager.getGameState();
    const planet = gameState.planets.find((p: any) => p.id === planetId);

    if (!planet) {
      return res.status(404).json({
        error: 'Planet not found'
      });
    }

    if (planet.ownerId) {
      return res.status(400).json({
        error: 'Planet already colonized'
      });
    }

    // Check resources (cost: 500 minerals, 300 energy, 1000 credits)
    if (
      player.resources.minerals < 500 ||
      player.resources.energy < 300 ||
      player.resources.credits < 1000
    ) {
      return res.status(400).json({
        error: 'Insufficient resources',
        required: {
          minerals: 500,
          energy: 300,
          credits: 1000
        },
        current: player.resources
      });
    }

    // Colonize planet
    planet.ownerId = userId;
    player.resources.minerals -= 500;
    player.resources.energy -= 300;
    player.resources.credits -= 1000;
    player.planets.push(planetId);

    // Broadcast update
    req.app.locals.io.emit('planet:colonized', {
      planetId,
      ownerId: userId,
      timestamp: Date.now()
    });

    res.json({
      success: true,
      planet,
      resources: player.resources
    });

    logger.info(`Player ${userId} colonized planet ${planetId}`);
  } catch (error) {
    logger.error('Error colonizing planet:', error);
    res.status(500).json({
      error: 'Failed to colonize planet'
    });
  }
});

/**
 * @route   GET /api/game/planets
 * @desc    Get all planets
 * @access  Public
 */
router.get('/planets', (req: Request, res: Response) => {
  const { gameManager } = req.app.locals;
  const gameState = gameManager.getGameState();

  res.json({
    count: gameState.planets.length,
    planets: gameState.planets
  });
});

/**
 * @route   GET /api/game/planets/:id
 * @desc    Get planet details
 * @access  Public
 */
router.get('/planets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { gameManager } = req.app.locals;
  const gameState = gameManager.getGameState();

  const planet = gameState.planets.find((p: any) => p.id === id);

  if (!planet) {
    return res.status(404).json({
      error: 'Planet not found'
    });
  }

  res.json(planet);
});
```

---

### TÃƒÂ¢che 1.4 : Socket Event Colonisation (30min)

#### Modifier : `backend/src/sockets/socketHandlers.ts`

Ajouter aprÃƒÂ¨s les events existants :

```typescript
/**
 * Colonize planet
 */
socket.on('planet:colonize', async (data: { planetId: string }) => {
  try {
    const { planetId } = data;
    const playerId = socket.data.playerId || socket.id;

    // Use same logic as API route
    const player = playerManager.getPlayer(playerId);
    if (!player) {
      socket.emit('error', { message: 'Player not found' });
      return;
    }

    const gameState = gameManager.getGameState();
    const planet = gameState.planets.find((p: any) => p.id === planetId);

    if (!planet) {
      socket.emit('error', { message: 'Planet not found' });
      return;
    }

    if (planet.ownerId) {
      socket.emit('error', { message: 'Planet already colonized' });
      return;
    }

    // Check resources
    if (
      player.resources.minerals < 500 ||
      player.resources.energy < 300 ||
      player.resources.credits < 1000
    ) {
      socket.emit('error', {
        message: 'Insufficient resources',
        required: { minerals: 500, energy: 300, credits: 1000 }
      });
      return;
    }

    // Colonize
    planet.ownerId = playerId;
    player.resources.minerals -= 500;
    player.resources.energy -= 300;
    player.resources.credits -= 1000;
    player.planets.push(planetId);

    // Broadcast
    io.emit('planet:colonized', {
      planetId,
      ownerId: playerId,
      planet,
      timestamp: Date.now()
    });

    socket.emit('colonize:success', {
      planet,
      resources: player.resources
    });

    logger.info(`Player ${playerId} colonized planet ${planetId}`);
  } catch (error) {
    logger.error('Error colonizing planet:', error);
    socket.emit('error', { message: 'Failed to colonize planet' });
  }
});
```

---

### TÃƒÂ¢che 1.5 : Mise ÃƒÂ  jour du Store (1h)

#### Modifier : `frontend/src/store/gameStore.ts`

Ajouter :

```typescript
interface GameStore {
  // ... existing
  selectedPlanet: Planet | null;
  setSelectedPlanet: (planet: Planet | null) => void;
  colonizePlanet: (planetId: string) => void;
}

// Dans la crÃƒÂ©ation du store
create<GameStore>((set, get) => ({
  // ... existing

  selectedPlanet: null,

  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),

  colonizePlanet: (planetId) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit('planet:colonize', { planetId });

    socket.once('colonize:success', (data) => {
      console.log('Planet colonized!', data);
      set({ selectedPlanet: null });
    });

    socket.once('error', (error) => {
      console.error('Colonization failed:', error);
      alert(error.message);
    });
  },
}));
```

---

## Ã°Å¸Å¸Â  JOUR 2 - Construction et BÃƒÂ¢timents (8h)

### TÃƒÂ¢che 2.1 : Panel Construction BÃƒÂ¢timents (4h)

CrÃƒÂ©er `frontend/src/components/BuildingConstructionPanel.tsx` avec :
- Liste des bÃƒÂ¢timents disponibles
- Affichage coÃƒÂ»ts et bÃƒÂ©nÃƒÂ©fices
- Bouton "Build"
- Queue de construction

### TÃƒÂ¢che 2.2 : Routes API BÃƒÂ¢timents (2h)

- `GET /api/planets/:id/buildings`
- `POST /api/planets/:id/buildings`
- Socket events `building:construct`

### TÃƒÂ¢che 2.3 : IntÃƒÂ©gration dans PlanetDetailsModal (2h)

Ajouter un onglet "Buildings" dans le modal

---

## Ã°Å¸Å¸Â¡ JOUR 3 - Vaisseaux et Polish (8h)

### TÃƒÂ¢che 3.1 : Panel Construction Vaisseaux (3h)

CrÃƒÂ©er `frontend/src/components/ShipConstructionPanel.tsx`

### TÃƒÂ¢che 3.2 : Affichage Flottes sur Carte (3h)

Modifier GameCanvas pour afficher les vaisseaux

### TÃƒÂ¢che 3.3 : Page Login/Register (2h)

CrÃƒÂ©er formulaires d'authentification

---

## Ã¢Å“â€¦ CHECKLIST COMPLÃƒË†TE

### Jour 1
- [ ] PlanetDetailsModal.tsx crÃƒÂ©ÃƒÂ©
- [ ] PlanetDetailsModal.css crÃƒÂ©ÃƒÂ©
- [ ] IntÃƒÂ©gration dans GameCanvas
- [ ] Route POST /api/game/planets/:id/colonize
- [ ] Routes GET /api/game/planets
- [ ] Socket event planet:colonize
- [ ] Mise ÃƒÂ  jour gameStore
- [ ] Test colonisation fonctionnelle

### Jour 2
- [ ] BuildingConstructionPanel.tsx crÃƒÂ©ÃƒÂ©
- [ ] Routes API buildings
- [ ] Socket events buildings
- [ ] IntÃƒÂ©gration dans modal
- [ ] Test construction fonctionnelle

### Jour 3
- [ ] ShipConstructionPanel.tsx crÃƒÂ©ÃƒÂ©
- [ ] Affichage flottes
- [ ] LoginPage.tsx
- [ ] RegisterPage.tsx
- [ ] Tests end-to-end

---

## Ã°Å¸Å¡â‚¬ COMMANDES DE DÃƒâ€°MARRAGE

```bash
# CrÃƒÂ©er les fichiers
cd frontend/src/components
touch PlanetDetailsModal.tsx PlanetDetailsModal.css
touch BuildingConstructionPanel.tsx BuildingConstructionPanel.css
touch ShipConstructionPanel.tsx ShipConstructionPanel.css

# Modifier les routes backend
code ../../../backend/src/routes/gameRoutes.ts

# Tester aprÃƒÂ¨s chaque changement
make restart
```

---

**Avec ce plan, votre jeu sera 80% fonctionnel en 3 jours !** Ã°Å¸Å½Â¯Ã°Å¸Å¡â‚¬
