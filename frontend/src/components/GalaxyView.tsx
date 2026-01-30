/**
 * Galaxy View Component
 * 
 * Example integration of GalaxyCanvas with game state
 */

import React, { useState, useEffect } from 'react';
import { GalaxyCanvas } from './GalaxyCanvas';
import type { Planet } from '@shared/types/galaxyMap';
import type { Ship } from '@shared/types/ships';

/**
 * Planet details panel
 */
interface PlanetDetailsPanelProps {
  planet: Planet;
  onClose: () => void;
}

const PlanetDetailsPanel: React.FC<PlanetDetailsPanelProps> = ({ planet, onClose }) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 20,
        top: 20,
        width: 300,
        backgroundColor: '#1f2937',
        border: '2px solid #374151',
        borderRadius: '8px',
        padding: '20px',
        color: 'white'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{planet.name}</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: 20
          }}
        >
          ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â
        </button>
      </div>

      <div style={{ fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Position:</strong> ({planet.position.x}, {planet.position.y})
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Size:</strong> {planet.size}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Type:</strong> {planet.type}
        </div>
        {planet.ownerId && (
          <div style={{ marginBottom: 8 }}>
            <strong>Owner:</strong> {planet.ownerId}
          </div>
        )}

        {planet.resources && (
          <div style={{ marginTop: 16 }}>
            <strong>Resources:</strong>
            <div style={{ marginLeft: 16, marginTop: 8 }}>
              <div>Minerals: {planet.resources.minerals}</div>
              <div>Energy: {planet.resources.energy}</div>
              <div>Crystal: {planet.resources.crystal}</div>
            </div>
          </div>
        )}

        {planet.buildings && planet.buildings.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Buildings:</strong>
            <div style={{ marginLeft: 16, marginTop: 8 }}>
              {planet.buildings.map((building, idx) => (
                <div key={idx}>
                  {building.type} (Level {building.level})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main Galaxy View Component
 */
export const GalaxyView: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>();
  const [currentPlayerId] = useState('player-1'); // Replace with actual auth
  const [playerAlliance] = useState<string[]>(['ally-1', 'ally-2']); // Replace with actual data

  // Load initial data
  useEffect(() => {
    // TODO: Fetch from API
    // Example data:
    const examplePlanets: Planet[] = [
      {
        id: 'planet-1',
        name: 'Home World',
        position: { x: 0, y: 0 },
        size: 10,
        type: 'terran',
        ownerId: 'player-1',
        resources: { minerals: 1000, energy: 500, crystal: 200 },
        buildings: []
      },
      {
        id: 'planet-2',
        name: 'Alpha Centauri',
        position: { x: 200, y: 150 },
        size: 8,
        type: 'desert',
        ownerId: 'ally-1',
        resources: { minerals: 800, energy: 600, crystal: 100 },
        buildings: []
      },
      {
        id: 'planet-3',
        name: 'Enemy Base',
        position: { x: -150, y: 200 },
        size: 12,
        type: 'volcanic',
        ownerId: 'enemy-1',
        resources: { minerals: 1200, energy: 400, crystal: 300 },
        buildings: []
      },
      {
        id: 'planet-4',
        name: 'Neutral Zone',
        position: { x: 100, y: -100 },
        size: 6,
        type: 'ice',
        ownerId: null,
        resources: { minerals: 500, energy: 300, crystal: 150 },
        buildings: []
      }
    ];

    setPlanets(examplePlanets);

    // Example ship moving between planets
    const exampleShips: Ship[] = [
      {
        id: 'ship-1',
        type: 'fighter',
        name: 'Fighter 1',
        ownerId: 'player-1',
        currentPlanetId: null,
        fleetId: null,
        stats: {
          speed: 200,
          cargo: 20,
          attack: 40,
          defense: 15,
          health: 80,
          maxHealth: 80
        },
        cargo: {
          minerals: 0,
          energy: 0,
          crystal: 0,
          current: 0,
          capacity: 20
        },
        movement: {
          isMoving: true,
          origin: 'planet-1',
          destination: 'planet-2',
          startTime: Date.now(),
          arrivalTime: Date.now() + 30000,
          distance: 250,
          travelTime: 30
        },
        status: 'moving',
        createdAt: Date.now()
      }
    ];

    setShips(exampleShips);
  }, []);

  const handlePlanetSelect = (planetId: string) => {
    setSelectedPlanetId(planetId);
  };

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId);

  return (
    <div style={{ position: 'relative' }}>
      <GalaxyCanvas
        planets={planets}
        ships={ships}
        playerAlliance={playerAlliance}
        currentPlayerId={currentPlayerId}
        selectedPlanetId={selectedPlanetId}
        onPlanetSelect={handlePlanetSelect}
        width={1200}
        height={800}
      />

      {selectedPlanet && (
        <PlanetDetailsPanel
          planet={selectedPlanet}
          onClose={() => setSelectedPlanetId(undefined)}
        />
      )}

      {/* Controls Panel */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          border: '2px solid #374151',
          borderRadius: '8px',
          padding: '16px',
          color: 'white'
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>Controls</h4>
        <div style={{ fontSize: 12 }}>
          <div>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Drag to pan</div>
          <div>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Scroll to zoom</div>
          <div>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Click planet to select</div>
        </div>

        <div style={{ marginTop: 16, fontSize: 12 }}>
          <div><span style={{ color: '#3b82f6' }}>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span> Your Planets</div>
          <div><span style={{ color: '#22c55e' }}>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span> Allied Planets</div>
          <div><span style={{ color: '#ef4444' }}>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span> Enemy Planets</div>
          <div><span style={{ color: '#6b7280' }}>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span> Neutral Planets</div>
        </div>
      </div>

      {/* Stats Panel */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          bottom: 20,
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          border: '2px solid #374151',
          borderRadius: '8px',
          padding: '16px',
          color: 'white'
        }}
      >
        <div style={{ fontSize: 12 }}>
          <div>Planets: {planets.length}</div>
          <div>Ships: {ships.length}</div>
          <div>
            Your Planets: {planets.filter(p => p.ownerId === currentPlayerId).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalaxyView;
