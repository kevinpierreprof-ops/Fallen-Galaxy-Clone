import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import GameCanvas from '../components/GameCanvas';
import ResourcePanel from '../components/ResourcePanel';
import ChatPanel from '../components/ChatPanel';
import PlanetList from '../components/PlanetList';
import PlanetDetailsModal from '../components/PlanetDetailsModal';
import type { Planet } from '@shared/types/game';

export default function GamePage() {
  const { connect, disconnect, setSelectedPlanet } = useGameStore();
  const [selectedPlanet, setLocalSelectedPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handlePlanetClick = (planet: Planet) => {
    setLocalSelectedPlanet(planet);
    setSelectedPlanet(planet);
  };

  const handleCloseModal = () => {
    setLocalSelectedPlanet(null);
    setSelectedPlanet(null);
  };

  return (
    <div className="game-page">
      <div className="game-layout">
        <aside className="left-panel">
          <ResourcePanel />
          <PlanetList />
        </aside>

        <main className="game-canvas-container">
          <GameCanvas onPlanetClick={handlePlanetClick} />
        </main>

        <aside className="right-panel">
          <ChatPanel />
        </aside>
      </div>

      <PlanetDetailsModal 
        planet={selectedPlanet} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
