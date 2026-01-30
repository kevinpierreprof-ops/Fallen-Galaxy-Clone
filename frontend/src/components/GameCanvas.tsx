import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Planet } from '@shared/types/game';

interface GameCanvasProps {
  onPlanetClick?: (planet: Planet) => void;
}

export default function GameCanvas({ onPlanetClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planets = useGameStore((state) => state.planets);
  const ships = useGameStore((state) => state.ships);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPlanetClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calculate viewport transformations (same as render logic)
    const scale = 0.05;
    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;

    // Find clicked planet
    for (const planet of planets) {
      const planetScreenX = planet.position.x * scale + offsetX;
      const planetScreenY = planet.position.y * scale + offsetY;
      const radius = planet.size * 3;

      // Check if click is within planet radius
      const distance = Math.sqrt(
        Math.pow(clickX - planetScreenX, 2) + 
        Math.pow(clickY - planetScreenY, 2)
      );

      if (distance <= radius) {
        onPlanetClick(planet);
        return;
      }
    }
  };

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

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      onClick={handleCanvasClick}
    />
  );
}
