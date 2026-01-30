/**
 * Minimap Component
 * 
 * Small overview map showing planets and current position
 */

import React, { useRef, useEffect } from 'react';
import type { Planet } from '@shared/types/galaxyMap';
import './Minimap.css';

/**
 * Minimap Props
 */
interface MinimapProps {
  planets: Planet[];
  currentPlanetId?: string;
  onPlanetSelect?: (planetId: string) => void;
  width?: number;
  height?: number;
}

/**
 * Minimap Component
 */
export const Minimap: React.FC<MinimapProps> = ({
  planets,
  currentPlanetId,
  onPlanetSelect,
  width = 200,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Render minimap
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Calculate bounds
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    planets.forEach(planet => {
      minX = Math.min(minX, planet.position.x);
      maxX = Math.max(maxX, planet.position.x);
      minY = Math.min(minY, planet.position.y);
      maxY = Math.max(maxY, planet.position.y);
    });

    const worldWidth = maxX - minX || 1000;
    const worldHeight = maxY - minY || 1000;

    // Add padding
    const padding = 10;
    const scaleX = (width - padding * 2) / worldWidth;
    const scaleY = (height - padding * 2) / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    // Draw grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = padding + (width - padding * 2) * (i / 5);
      const y = padding + (height - padding * 2) * (i / 5);

      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw planets
    planets.forEach(planet => {
      const x = padding + (planet.position.x - minX) * scale;
      const y = padding + (planet.position.y - minY) * scale;

      // Determine color based on ownership
      let color = '#6b7280'; // Neutral
      if (planet.ownerId) {
        color = '#3b82f6'; // Player (simplified, would check actual ownership)
      }

      // Highlight current planet
      if (planet.id === currentPlanetId) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw planet
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);
  }, [planets, currentPlanetId, width, height]);

  /**
   * Handle click on minimap
   */
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPlanetSelect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate bounds (same as render)
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    planets.forEach(planet => {
      minX = Math.min(minX, planet.position.x);
      maxX = Math.max(maxX, planet.position.x);
      minY = Math.min(minY, planet.position.y);
      maxY = Math.max(maxY, planet.position.y);
    });

    const worldWidth = maxX - minX || 1000;
    const worldHeight = maxY - minY || 1000;

    const padding = 10;
    const scaleX = (width - padding * 2) / worldWidth;
    const scaleY = (height - padding * 2) / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    // Find closest planet
    let closestPlanet: Planet | null = null;
    let closestDistance = Infinity;

    planets.forEach(planet => {
      const px = padding + (planet.position.x - minX) * scale;
      const py = padding + (planet.position.y - minY) * scale;

      const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);

      if (distance < 10 && distance < closestDistance) {
        closestDistance = distance;
        closestPlanet = planet;
      }
    });

    if (closestPlanet) {
      onPlanetSelect(closestPlanet.id);
    }
  };

  return (
    <div className="minimap-container">
      <div className="minimap-header">
        <span className="minimap-title">Galaxy Map</span>
        <span className="minimap-planet-count">{planets.length} planets</span>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="minimap-canvas"
        onClick={handleClick}
      />
    </div>
  );
};

export default Minimap;
