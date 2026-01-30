import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import PlanetDetailsModal from './PlanetDetailsModal';
import type { Planet } from '@shared/types/game';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planets = useGameStore((state) => state.planets);
  const ships = useGameStore((state) => state.ships);
  const colonizePlanet = useGameStore((state) => state.colonizePlanet);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    // Calculate viewport
    const scale = 0.05;
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // Draw planets
    planets.forEach((planet) => {
      const x = planet.position.x * scale + offsetX;
      const y = planet.position.y * scale + offsetY;
      const radius = planet.size * 3;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = planet.ownerId ? '#4ECDC4' : '#888888';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw planet name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, x, y + radius + 15);
    });

    // Draw ships
    ships.forEach((ship) => {
      const x = ship.position.x * scale + offsetX;
      const y = ship.position.y * scale + offsetY;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B6B';
      ctx.fill();
    });
  }, [planets, ships]);

  // Handle canvas clicks for planet selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate viewport
    const scale = 0.05;
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // Check if click is on any planet
    for (const planet of planets) {
      const planetX = planet.position.x * scale + offsetX;
      const planetY = planet.position.y * scale + offsetY;
      const radius = planet.size * 3;

      const dx = clickX - planetX;
      const dy = clickY - planetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        setSelectedPlanet(planet);
        break;
      }
    }
  };

  const handleColonize = (planetId: string) => {
    if (colonizePlanet) {
      colonizePlanet(planetId);
      setSelectedPlanet(null);
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={handleCanvasClick}
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
