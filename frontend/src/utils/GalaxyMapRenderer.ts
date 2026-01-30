/**
 * Galaxy Map Renderer Helper
 * 
 * Utilities for rendering galaxy maps on HTML5 Canvas
 */

import type { GalaxyMap, PlanetPlacement, Position } from '@shared/types/galaxyMap';

/**
 * Render configuration
 */
export interface RenderConfig {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  planetColors: {
    poor: string;
    normal: string;
    rich: string;
    abundant: string;
    starting: string;
  };
  showNames: boolean;
  showGrid: boolean;
  gridSize: number;
}

/**
 * Default render configuration
 */
const DEFAULT_RENDER_CONFIG: RenderConfig = {
  canvasWidth: 800,
  canvasHeight: 800,
  backgroundColor: '#0a0a1a',
  planetColors: {
    poor: '#8b8b8b',
    normal: '#4a9eff',
    rich: '#ffd700',
    abundant: '#ff1493',
    starting: '#00ff00'
  },
  showNames: true,
  showGrid: true,
  gridSize: 10
};

/**
 * Galaxy Map Renderer Class
 */
export class GalaxyMapRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;
  private galaxyMap: GalaxyMap;
  private scaleX: number;
  private scaleY: number;

  /**
   * Create a new galaxy map renderer
   * 
   * @param canvas - HTML5 Canvas element
   * @param galaxyMap - Galaxy map to render
   * @param config - Render configuration
   */
  constructor(
    canvas: HTMLCanvasElement,
    galaxyMap: GalaxyMap,
    config: Partial<RenderConfig> = {}
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }

    this.ctx = ctx;
    this.config = { ...DEFAULT_RENDER_CONFIG, ...config };
    this.galaxyMap = galaxyMap;

    // Set canvas size
    canvas.width = this.config.canvasWidth;
    canvas.height = this.config.canvasHeight;

    // Calculate scaling factors
    this.scaleX = this.config.canvasWidth / galaxyMap.dimensions.width;
    this.scaleY = this.config.canvasHeight / galaxyMap.dimensions.height;
  }

  /**
   * Convert galaxy coordinates to canvas coordinates
   * 
   * @param pos - Galaxy position
   * @returns Canvas position
   */
  private toCanvasCoords(pos: Position): Position {
    return {
      x: pos.x * this.scaleX,
      y: pos.y * this.scaleY
    };
  }

  /**
   * Draw background
   */
  private drawBackground(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Draw stars
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * this.config.canvasWidth;
      const y = Math.random() * this.config.canvasHeight;
      const size = Math.random() * 2;
      const alpha = Math.random() * 0.8 + 0.2;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(x, y, size, size);
    }
  }

  /**
   * Draw grid
   */
  private drawGrid(): void {
    if (!this.config.showGrid) return;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    const gridSize = this.config.gridSize;
    const cols = Math.ceil(this.galaxyMap.dimensions.width / gridSize);
    const rows = Math.ceil(this.galaxyMap.dimensions.height / gridSize);

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = i * gridSize * this.scaleX;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.config.canvasHeight);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = i * gridSize * this.scaleY;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.config.canvasWidth, y);
      this.ctx.stroke();
    }
  }

  /**
   * Get planet color
   * 
   * @param planet - Planet to get color for
   * @returns Color string
   */
  private getPlanetColor(planet: PlanetPlacement): string {
    if (planet.isStartingPlanet) {
      return this.config.planetColors.starting;
    }
    return this.config.planetColors[planet.resourceLevel];
  }

  /**
   * Draw planet
   * 
   * @param planet - Planet to draw
   */
  private drawPlanet(planet: PlanetPlacement): void {
    const pos = this.toCanvasCoords(planet.position);
    const radius = planet.size * 2 + 2;

    // Draw planet glow
    const gradient = this.ctx.createRadialGradient(
      pos.x, pos.y, 0,
      pos.x, pos.y, radius * 2
    );
    gradient.addColorStop(0, `${this.getPlanetColor(planet)}40`);
    gradient.addColorStop(1, 'transparent');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw planet
    this.ctx.fillStyle = this.getPlanetColor(planet);
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw border for starting planets
    if (planet.isStartingPlanet) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius + 2, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Draw planet name
    if (this.config.showNames) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(planet.name, pos.x, pos.y + radius + 12);
    }
  }

  /**
   * Draw legend
   */
  private drawLegend(): void {
    const legendX = 10;
    const legendY = 10;
    const lineHeight = 20;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(legendX, legendY, 200, 140);

    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';

    const items = [
      { label: 'Starting Planet', color: this.config.planetColors.starting },
      { label: 'Poor Resources', color: this.config.planetColors.poor },
      { label: 'Normal Resources', color: this.config.planetColors.normal },
      { label: 'Rich Resources', color: this.config.planetColors.rich },
      { label: 'Abundant Resources', color: this.config.planetColors.abundant }
    ];

    items.forEach((item, index) => {
      const y = legendY + 20 + (index * lineHeight);

      // Draw color box
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(legendX + 10, y - 8, 12, 12);

      // Draw label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(item.label, legendX + 30, y + 2);
    });
  }

  /**
   * Render the galaxy map
   */
  public render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

    // Draw layers
    this.drawBackground();
    this.drawGrid();

    // Draw planets
    this.galaxyMap.planets.forEach(planet => {
      this.drawPlanet(planet);
    });

    // Draw legend
    this.drawLegend();
  }

  /**
   * Highlight nearest planet to a position
   * 
   * @param position - Canvas position
   */
  public highlightNearest(position: Position): void {
    // Convert canvas coords to galaxy coords
    const galaxyPos = {
      x: position.x / this.scaleX,
      y: position.y / this.scaleY
    };

    // Find nearest planet
    let nearest: PlanetPlacement | null = null;
    let minDist = Infinity;

    this.galaxyMap.planets.forEach(planet => {
      const dx = planet.position.x - galaxyPos.x;
      const dy = planet.position.y - galaxyPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = planet;
      }
    });

    if (nearest) {
      const pos = this.toCanvasCoords(nearest.position);
      const radius = nearest.size * 2 + 2;

      // Draw highlight circle
      this.ctx.strokeStyle = '#ffff00';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();

      return nearest;
    }

    return null;
  }
}

/**
 * Create and render galaxy map
 * 
 * @param canvasId - Canvas element ID
 * @param galaxyMap - Galaxy map data
 * @param config - Render configuration
 * @returns Renderer instance
 */
export function renderGalaxyMap(
  canvasId: string,
  galaxyMap: GalaxyMap,
  config?: Partial<RenderConfig>
): GalaxyMapRenderer {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    throw new Error(`Canvas element with id "${canvasId}" not found`);
  }

  const renderer = new GalaxyMapRenderer(canvas, galaxyMap, config);
  renderer.render();

  return renderer;
}
