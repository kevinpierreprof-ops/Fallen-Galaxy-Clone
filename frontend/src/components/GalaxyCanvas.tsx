/**
 * Galaxy Canvas Component
 * 
 * Interactive HTML5 Canvas component for rendering the galaxy map
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Planet } from '@shared/types/galaxyMap';
import type { Ship } from '@shared/types/ships';

/**
 * Planet ownership types for rendering
 */
export enum PlanetOwnership {
  Player = 'player',
  Allied = 'allied',
  Enemy = 'enemy',
  Neutral = 'neutral'
}

/**
 * Planet render data
 */
export interface PlanetRenderData {
  planet: Planet;
  ownership: PlanetOwnership;
  screenX: number;
  screenY: number;
  radius: number;
}

/**
 * Ship render data
 */
export interface ShipRenderData {
  ship: Ship;
  screenX: number;
  screenY: number;
  rotation: number;
  isMoving: boolean;
}

/**
 * Camera state for pan and zoom
 */
interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Props for GalaxyCanvas
 */
interface GalaxyCanvasProps {
  planets: Planet[];
  ships: Ship[];
  playerAlliance?: string[];
  currentPlayerId: string;
  selectedPlanetId?: string;
  onPlanetSelect?: (planetId: string) => void;
  width?: number;
  height?: number;
}

/**
 * Galaxy Canvas Component
 * 
 * Renders an interactive galaxy map with planets, ships, zoom, pan, and minimap
 */
export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({
  planets,
  ships,
  playerAlliance = [],
  currentPlayerId,
  selectedPlanetId,
  onPlanetSelect,
  width = 1200,
  height = 800
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Camera state
  const [camera, setCamera] = useState<CameraState>({
    x: 0,
    y: 0,
    zoom: 1
  });

  // Mouse/interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // Animation time for smooth ship movements
  const [animationTime, setAnimationTime] = useState(0);

  // Constants
  const GRID_SIZE = 100;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;
  const PLANET_BASE_RADIUS = 8;
  const SHIP_SIZE = 6;
  const MINIMAP_SIZE = 150;
  const MINIMAP_PADDING = 10;

  /**
   * Planet colors by ownership
   */
  const PLANET_COLORS = {
    [PlanetOwnership.Player]: '#3b82f6',    // Blue
    [PlanetOwnership.Allied]: '#22c55e',    // Green
    [PlanetOwnership.Enemy]: '#ef4444',     // Red
    [PlanetOwnership.Neutral]: '#6b7280'    // Gray
  };

  /**
   * Determine planet ownership
   */
  const getPlanetOwnership = useCallback((planet: Planet): PlanetOwnership => {
    if (!planet.ownerId) return PlanetOwnership.Neutral;
    if (planet.ownerId === currentPlayerId) return PlanetOwnership.Player;
    if (playerAlliance.includes(planet.ownerId)) return PlanetOwnership.Allied;
    return PlanetOwnership.Enemy;
  }, [currentPlayerId, playerAlliance]);

  /**
   * Convert world coordinates to screen coordinates
   */
  const worldToScreen = useCallback((worldX: number, worldY: number): { x: number; y: number } => {
    return {
      x: (worldX - camera.x) * camera.zoom + width / 2,
      y: (worldY - camera.y) * camera.zoom + height / 2
    };
  }, [camera, width, height]);

  /**
   * Convert screen coordinates to world coordinates
   */
  const screenToWorld = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    return {
      x: (screenX - width / 2) / camera.zoom + camera.x,
      y: (screenY - height / 2) / camera.zoom + camera.y
    };
  }, [camera, width, height]);

  /**
   * Draw grid background
   */
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;

    const startX = Math.floor((camera.x - width / 2 / camera.zoom) / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor((camera.y - height / 2 / camera.zoom) / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil((camera.x + width / 2 / camera.zoom) / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil((camera.y + height / 2 / camera.zoom) / GRID_SIZE) * GRID_SIZE;

    // Vertical lines
    for (let x = startX; x <= endX; x += GRID_SIZE) {
      const screenPos = worldToScreen(x, startY);
      const screenPosEnd = worldToScreen(x, endY);

      ctx.beginPath();
      ctx.moveTo(screenPos.x, 0);
      ctx.lineTo(screenPos.x, height);
      ctx.stroke();

      // Draw coordinates
      if (camera.zoom > 0.5 && x % (GRID_SIZE * 5) === 0) {
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px monospace';
        ctx.fillText(x.toString(), screenPos.x + 2, 12);
      }
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += GRID_SIZE) {
      const screenPos = worldToScreen(startX, y);
      const screenPosEnd = worldToScreen(endX, y);

      ctx.beginPath();
      ctx.moveTo(0, screenPos.y);
      ctx.lineTo(width, screenPos.y);
      ctx.stroke();

      // Draw coordinates
      if (camera.zoom > 0.5 && y % (GRID_SIZE * 5) === 0) {
        ctx.fillStyle = '#4b5563';
        ctx.font = '10px monospace';
        ctx.fillText(y.toString(), 2, screenPos.y - 2);
      }
    }
  }, [camera, width, height, worldToScreen, GRID_SIZE]);

  /**
   * Draw a planet
   */
  const drawPlanet = useCallback((
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const ownership = getPlanetOwnership(planet);
    const screenPos = worldToScreen(planet.position.x, planet.position.y);
    const radius = PLANET_BASE_RADIUS * camera.zoom;

    // Skip if off-screen
    if (
      screenPos.x < -radius ||
      screenPos.x > width + radius ||
      screenPos.y < -radius ||
      screenPos.y > height + radius
    ) {
      return;
    }

    // Draw selection ring
    if (isSelected) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw hover ring
    if (isHovered) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw planet
    ctx.fillStyle = PLANET_COLORS[ownership];
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw planet name (if zoomed in enough)
    if (camera.zoom > 0.8) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.floor(12 * camera.zoom)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, screenPos.x, screenPos.y + radius + 15);
    }

    // Draw size indicator
    if (camera.zoom > 1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`S:${planet.size}`, screenPos.x, screenPos.y + 4);
    }
  }, [camera, width, height, worldToScreen, getPlanetOwnership, PLANET_COLORS]);

  /**
   * Draw a ship
   */
  const drawShip = useCallback((ctx: CanvasRenderingContext2D, ship: Ship) => {
    let screenX: number, screenY: number;

    // If ship is moving, interpolate position
    if (ship.movement && ship.status === 'moving') {
      const originPlanet = planets.find(p => p.id === ship.movement?.origin);
      const destPlanet = planets.find(p => p.id === ship.movement?.destination);

      if (originPlanet && destPlanet) {
        const progress = Math.min(
          1,
          (Date.now() - ship.movement.startTime) / (ship.movement.travelTime * 1000)
        );

        const currentX = originPlanet.position.x + 
          (destPlanet.position.x - originPlanet.position.x) * progress;
        const currentY = originPlanet.position.y + 
          (destPlanet.position.y - originPlanet.position.y) * progress;

        const screenPos = worldToScreen(currentX, currentY);
        screenX = screenPos.x;
        screenY = screenPos.y;
      } else {
        return;
      }
    } else if (ship.currentPlanetId) {
      // Ship is at planet
      const planet = planets.find(p => p.id === ship.currentPlanetId);
      if (!planet) return;

      const screenPos = worldToScreen(planet.position.x, planet.position.y);
      screenX = screenPos.x;
      screenY = screenPos.y;
    } else {
      return;
    }

    const size = SHIP_SIZE * camera.zoom;

    // Skip if off-screen
    if (
      screenX < -size ||
      screenX > width + size ||
      screenY < -size ||
      screenY > height + size
    ) {
      return;
    }

    // Draw ship as triangle
    ctx.save();
    ctx.translate(screenX, screenY);

    // Rotate towards destination if moving
    if (ship.movement) {
      const originPlanet = planets.find(p => p.id === ship.movement?.origin);
      const destPlanet = planets.find(p => p.id === ship.movement?.destination);

      if (originPlanet && destPlanet) {
        const angle = Math.atan2(
          destPlanet.position.y - originPlanet.position.y,
          destPlanet.position.x - originPlanet.position.x
        );
        ctx.rotate(angle);
      }
    }

    // Draw ship triangle
    ctx.fillStyle = ship.ownerId === currentPlayerId ? '#60a5fa' : '#f87171';
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size, size);
    ctx.lineTo(-size, -size);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }, [camera, width, height, planets, worldToScreen, currentPlayerId]);

  /**
   * Draw minimap
   */
  const drawMinimap = useCallback((ctx: CanvasRenderingContext2D) => {
    const minimapX = width - MINIMAP_SIZE - MINIMAP_PADDING;
    const minimapY = MINIMAP_PADDING;

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
    const scale = Math.min(MINIMAP_SIZE / worldWidth, MINIMAP_SIZE / worldHeight);

    // Draw minimap background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw planets on minimap
    planets.forEach(planet => {
      const ownership = getPlanetOwnership(planet);
      const x = minimapX + (planet.position.x - minX) * scale;
      const y = minimapY + (planet.position.y - minY) * scale;

      ctx.fillStyle = PLANET_COLORS[ownership];
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw viewport indicator
    const viewMinX = camera.x - width / 2 / camera.zoom;
    const viewMaxX = camera.x + width / 2 / camera.zoom;
    const viewMinY = camera.y - height / 2 / camera.zoom;
    const viewMaxY = camera.y + height / 2 / camera.zoom;

    const rectX = minimapX + (viewMinX - minX) * scale;
    const rectY = minimapY + (viewMinY - minY) * scale;
    const rectWidth = (viewMaxX - viewMinX) * scale;
    const rectHeight = (viewMaxY - viewMinY) * scale;

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
  }, [
    camera,
    width,
    height,
    planets,
    getPlanetOwnership,
    PLANET_COLORS,
    MINIMAP_SIZE,
    MINIMAP_PADDING
  ]);

  /**
   * Main render function
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx);

    // Draw planets
    planets.forEach(planet => {
      drawPlanet(
        ctx,
        planet,
        planet.id === selectedPlanetId,
        planet.id === hoveredPlanet
      );
    });

    // Draw ships
    ships.forEach(ship => {
      drawShip(ctx, ship);
    });

    // Draw minimap
    drawMinimap(ctx);

    // Draw zoom level indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`Zoom: ${(camera.zoom * 100).toFixed(0)}%`, 10, height - 10);
  }, [
    width,
    height,
    camera,
    planets,
    ships,
    selectedPlanetId,
    hoveredPlanet,
    drawGrid,
    drawPlanet,
    drawShip,
    drawMinimap
  ]);

  /**
   * Animation loop
   */
  useEffect(() => {
    const animate = () => {
      setAnimationTime(Date.now());
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  /**
   * Handle mouse down - start dragging
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  /**
   * Handle mouse move - pan camera or update hover
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setMousePos({ x: mouseX, y: mouseY });

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setCamera(prev => ({
        ...prev,
        x: prev.x - dx / prev.zoom,
        y: prev.y - dy / prev.zoom
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Check for planet hover
      const worldPos = screenToWorld(mouseX, mouseY);
      let foundPlanet: string | null = null;

      for (const planet of planets) {
        const dx = planet.position.x - worldPos.x;
        const dy = planet.position.y - worldPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < PLANET_BASE_RADIUS) {
          foundPlanet = planet.id;
          break;
        }
      }

      setHoveredPlanet(foundPlanet);
    }
  }, [isDragging, dragStart, planets, screenToWorld]);

  /**
   * Handle mouse up - stop dragging or select planet
   */
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && hoveredPlanet && onPlanetSelect) {
      onPlanetSelect(hoveredPlanet);
    }

    setIsDragging(false);
  }, [isDragging, hoveredPlanet, onPlanetSelect]);

  /**
   * Handle mouse wheel - zoom
   */
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldPosBefore = screenToWorld(mouseX, mouseY);

    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom * zoomDelta));

    setCamera(prev => {
      const updatedCamera = { ...prev, zoom: newZoom };

      // Adjust camera position to zoom towards mouse
      const worldPosAfter = {
        x: (mouseX - width / 2) / newZoom + prev.x,
        y: (mouseY - height / 2) / newZoom + prev.y
      };

      return {
        ...updatedCamera,
        x: prev.x + (worldPosBefore.x - worldPosAfter.x),
        y: prev.y + (worldPosBefore.y - worldPosAfter.y)
      };
    });
  }, [camera, width, height, screenToWorld, MIN_ZOOM, MAX_ZOOM]);

  /**
   * Center camera on a planet
   */
  const centerOnPlanet = useCallback((planetId: string) => {
    const planet = planets.find(p => p.id === planetId);
    if (planet) {
      setCamera(prev => ({
        ...prev,
        x: planet.position.x,
        y: planet.position.y
      }));
    }
  }, [planets]);

  // Center on player's home planet on mount
  useEffect(() => {
    const playerPlanet = planets.find(p => p.ownerId === currentPlayerId);
    if (playerPlanet) {
      centerOnPlanet(playerPlanet.id);
    }
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
        onWheel={handleWheel}
        style={{
          border: '2px solid #374151',
          cursor: isDragging ? 'grabbing' : hoveredPlanet ? 'pointer' : 'grab',
          display: 'block'
        }}
      />

      {/* Tooltip */}
      {hoveredPlanet && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x + 10,
            top: mousePos.y + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {planets.find(p => p.id === hoveredPlanet)?.name}
        </div>
      )}
    </div>
  );
};

export default GalaxyCanvas;
