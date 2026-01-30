/**
 * Example: Using Path Aliases in Frontend
 * 
 * This file demonstrates how to use the configured path aliases
 * for clean and maintainable imports in React components.
 */

import { useState, useEffect } from 'react';

// ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Using path aliases - Clean and organized
import { useGameStore } from '@/store/gameStore';
import { useInterval } from '@/hooks/useInterval';
import { useGameStats } from '@/hooks/useGameStats';
import { gameService } from '@/services/api';
import { calculateDistance, formatNumber, formatTime } from '@/utils/helpers';

// Shared types
import type { Planet, Ship, Player } from '@shared/types/game';
import { SHIP_TYPES } from '@shared/constants/ships';
import { GAME_CONFIG } from '@shared/constants/game';

// ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Without path aliases - Messy relative paths
// import { useGameStore } from '../../../store/gameStore';
// import { useInterval } from '../../../hooks/useInterval';
// import { calculateDistance } from '../../../utils/helpers';

interface ExampleComponentProps {
  playerId: string;
}

export function ExampleComponent({ playerId }: ExampleComponentProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  
  // Type-safe store access
  const { 
    planets, 
    ships, 
    player, 
    connect, 
    disconnect 
  } = useGameStore();

  // Custom hooks with proper typing
  const { stats, loading, error } = useGameStats();

  // Connect to game on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Update every second
  useInterval(() => {
    console.log('Game tick');
  }, 1000);

  // Type-safe planet filtering
  const myPlanets = planets.filter((p) => p.ownerId === playerId);
  const enemyShips = ships.filter((s) => s.ownerId !== playerId);

  // Using shared constants
  const scoutCost = SHIP_TYPES.scout.cost;
  const maxPlayers = GAME_CONFIG.MAX_PLAYERS;

  // Type-safe helper functions
  const getNearestPlanet = (ship: Ship): Planet | null => {
    let nearest: Planet | null = null;
    let minDistance = Infinity;

    planets.forEach((planet) => {
      const distance = calculateDistance(
        ship.position.x,
        ship.position.y,
        planet.position.x,
        planet.position.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = planet;
      }
    });

    return nearest;
  };

  // Render with type safety
  return (
    <div className="example-component">
      <h2>Player Dashboard</h2>
      
      {/* Player Resources */}
      {player && (
        <div className="resources">
          <p>Minerals: {formatNumber(player.resources.minerals)}</p>
          <p>Energy: {formatNumber(player.resources.energy)}</p>
          <p>Credits: {formatNumber(player.resources.credits)}</p>
        </div>
      )}

      {/* Game Stats */}
      {!loading && stats && (
        <div className="stats">
          <p>Active Players: {stats.activePlayers} / {maxPlayers}</p>
          <p>Active Games: {stats.activeGames}</p>
        </div>
      )}

      {/* Planet List */}
      <div className="planets">
        <h3>My Planets ({myPlanets.length})</h3>
        {myPlanets.map((planet) => (
          <div 
            key={planet.id} 
            className="planet-item"
            onClick={() => setSelectedPlanet(planet)}
          >
            <h4>{planet.name}</h4>
            <p>Population: {formatNumber(planet.population)}</p>
            <p>Size: {planet.size}</p>
          </div>
        ))}
      </div>

      {/* Selected Planet Details */}
      {selectedPlanet && (
        <div className="planet-details">
          <h3>{selectedPlanet.name}</h3>
          <p>Production:</p>
          <ul>
            <li>Minerals: {selectedPlanet.production.minerals}/s</li>
            <li>Energy: {selectedPlanet.production.energy}/s</li>
            <li>Credits: {selectedPlanet.production.credits}/s</li>
          </ul>
          <button onClick={() => setSelectedPlanet(null)}>Close</button>
        </div>
      )}

      {/* Ship Types */}
      <div className="ship-types">
        <h3>Available Ships</h3>
        {Object.entries(SHIP_TYPES).map(([key, shipType]) => (
          <div key={key} className="ship-type">
            <h4>{shipType.name}</h4>
            <p>Cost: {formatNumber(shipType.cost.minerals)} minerals</p>
            <p>Build Time: {formatTime(shipType.buildTime)}</p>
            <p>Health: {shipType.maxHealth}</p>
            <p>Damage: {shipType.damage}</p>
          </div>
        ))}
      </div>

      {/* Enemy Ships Warning */}
      {enemyShips.length > 0 && (
        <div className="warning">
          ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â {enemyShips.length} enemy ships detected!
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}
    </div>
  );
}

// Example of a custom hook using path aliases
export function useNearestPlanet(shipId: string): Planet | null {
  const [nearestPlanet, setNearestPlanet] = useState<Planet | null>(null);
  const { ships, planets } = useGameStore();

  useEffect(() => {
    const ship = ships.find((s) => s.id === shipId);
    if (!ship) return;

    let nearest: Planet | null = null;
    let minDistance = Infinity;

    planets.forEach((planet) => {
      const distance = calculateDistance(
        ship.position.x,
        ship.position.y,
        planet.position.x,
        planet.position.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = planet;
      }
    });

    setNearestPlanet(nearest);
  }, [shipId, ships, planets]);

  return nearestPlanet;
}
