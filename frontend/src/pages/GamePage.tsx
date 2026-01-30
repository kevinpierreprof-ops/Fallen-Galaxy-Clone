import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import GameCanvas from '../components/GameCanvas';
import ResourcePanel from '../components/ResourcePanel';
import ChatPanel from '../components/ChatPanel';
import PlanetList from '../components/PlanetList';

export default function GamePage() {
  const { connect, disconnect } = useGameStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className="game-page">
      <div className="game-layout">
        <aside className="left-panel">
          <ResourcePanel />
          <PlanetList />
        </aside>

        <main className="game-canvas-container">
          <GameCanvas />
        </main>

        <aside className="right-panel">
          <ChatPanel />
        </aside>
      </div>
    </div>
  );
}
