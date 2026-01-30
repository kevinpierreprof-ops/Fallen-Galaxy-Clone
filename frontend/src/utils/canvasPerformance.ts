/**
 * Canvas Performance Utilities
 * 
 * Performance optimization helpers for canvas rendering
 */

/**
 * Spatial hash grid for efficient collision detection
 */
export class SpatialHashGrid {
  private grid: Map<string, Set<string>>;
  private cellSize: number;

  constructor(cellSize: number = 100) {
    this.grid = new Map();
    this.cellSize = cellSize;
  }

  /**
   * Get grid key for position
   */
  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Add object to grid
   */
  public add(id: string, x: number, y: number): void {
    const key = this.getKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(id);
  }

  /**
   * Remove object from grid
   */
  public remove(id: string, x: number, y: number): void {
    const key = this.getKey(x, y);
    this.grid.get(key)?.delete(id);
  }

  /**
   * Get nearby objects
   */
  public getNearby(x: number, y: number, radius: number): Set<string> {
    const nearby = new Set<string>();
    const cells = Math.ceil(radius / this.cellSize);

    const centerX = Math.floor(x / this.cellSize);
    const centerY = Math.floor(y / this.cellSize);

    for (let dx = -cells; dx <= cells; dx++) {
      for (let dy = -cells; dy <= cells; dy++) {
        const key = `${centerX + dx},${centerY + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          cell.forEach(id => nearby.add(id));
        }
      }
    }

    return nearby;
  }

  /**
   * Clear grid
   */
  public clear(): void {
    this.grid.clear();
  }
}

/**
 * Frustum culling helper
 */
export class FrustumCuller {
  /**
   * Check if circle is in view
   */
  public static isCircleInView(
    x: number,
    y: number,
    radius: number,
    viewLeft: number,
    viewTop: number,
    viewRight: number,
    viewBottom: number
  ): boolean {
    return (
      x + radius >= viewLeft &&
      x - radius <= viewRight &&
      y + radius >= viewTop &&
      y - radius <= viewBottom
    );
  }

  /**
   * Check if point is in view
   */
  public static isPointInView(
    x: number,
    y: number,
    viewLeft: number,
    viewTop: number,
    viewRight: number,
    viewBottom: number
  ): boolean {
    return x >= viewLeft && x <= viewRight && y >= viewTop && y <= viewBottom;
  }

  /**
   * Get visible objects
   */
  public static getVisibleObjects<T extends { position: { x: number; y: number } }>(
    objects: T[],
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number,
    zoom: number,
    margin: number = 100
  ): T[] {
    const halfWidth = viewWidth / 2 / zoom;
    const halfHeight = viewHeight / 2 / zoom;

    const viewLeft = cameraX - halfWidth - margin;
    const viewRight = cameraX + halfWidth + margin;
    const viewTop = cameraY - halfHeight - margin;
    const viewBottom = cameraY + halfHeight + margin;

    return objects.filter(obj =>
      this.isPointInView(
        obj.position.x,
        obj.position.y,
        viewLeft,
        viewTop,
        viewRight,
        viewBottom
      )
    );
  }
}

/**
 * Double buffering helper for smooth rendering
 */
export class DoubleBuffer {
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
  }

  /**
   * Get offscreen context for drawing
   */
  public getContext(): CanvasRenderingContext2D {
    return this.offscreenCtx;
  }

  /**
   * Copy to main canvas
   */
  public copyTo(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  /**
   * Clear offscreen buffer
   */
  public clear(color: string = '#111827'): void {
    this.offscreenCtx.fillStyle = color;
    this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
  }

  /**
   * Resize buffer
   */
  public resize(width: number, height: number): void {
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
  }
}

/**
 * Object pooling for reduced garbage collection
 */
export class ObjectPool<T> {
  private pool: T[];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * Get object from pool
   */
  public get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * Return object to pool
   */
  public release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  /**
   * Get pool size
   */
  public size(): number {
    return this.pool.length;
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameTime: number = 0;

  /**
   * Update monitor (call every frame)
   */
  public update(): void {
    const now = performance.now();

    if (this.lastTime) {
      this.frameTime = now - this.lastTime;
      this.frameCount++;

      // Update FPS every second
      if (this.frameCount >= 60) {
        this.fps = Math.round(1000 / (this.frameTime));
        this.frameCount = 0;
      }
    }

    this.lastTime = now;
  }

  /**
   * Get current FPS
   */
  public getFPS(): number {
    return this.fps;
  }

  /**
   * Get frame time in milliseconds
   */
  public getFrameTime(): number {
    return this.frameTime;
  }

  /**
   * Check if performance is good
   */
  public isPerformanceGood(): boolean {
    return this.fps >= 30;
  }
}

/**
 * Interpolation helper for smooth animations
 */
export class Interpolator {
  /**
   * Linear interpolation
   */
  public static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Smooth step interpolation
   */
  public static smoothStep(start: number, end: number, t: number): number {
    const x = Math.max(0, Math.min(1, (t - start) / (end - start)));
    return x * x * (3 - 2 * x);
  }

  /**
   * Ease in-out interpolation
   */
  public static easeInOut(start: number, end: number, t: number): number {
    t = Math.max(0, Math.min(1, t));
    const x = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return start + (end - start) * x;
  }

  /**
   * Interpolate 2D position
   */
  public static lerpPosition(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    t: number
  ): { x: number; y: number } {
    return {
      x: this.lerp(startX, endX, t),
      y: this.lerp(startY, endY, t)
    };
  }
}

/**
 * Cached rendering helper
 */
export class RenderCache {
  private cache: Map<string, HTMLCanvasElement>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get or create cached canvas
   */
  public getOrCreate(
    key: string,
    width: number,
    height: number,
    renderer: (ctx: CanvasRenderingContext2D) => void
  ): HTMLCanvasElement {
    if (!this.cache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      renderer(ctx);
      this.cache.set(key, canvas);
    }
    return this.cache.get(key)!;
  }

  /**
   * Invalidate cache entry
   */
  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }
}

/**
 * Batch drawing helper
 */
export class BatchDrawer {
  private batches: Map<string, Array<() => void>>;

  constructor() {
    this.batches = new Map();
  }

  /**
   * Add draw call to batch
   */
  public add(batchKey: string, drawCall: () => void): void {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
    }
    this.batches.get(batchKey)!.push(drawCall);
  }

  /**
   * Execute all draw calls in batch
   */
  public executeBatch(batchKey: string): void {
    const batch = this.batches.get(batchKey);
    if (batch) {
      batch.forEach(drawCall => drawCall());
    }
  }

  /**
   * Execute all batches
   */
  public executeAll(): void {
    this.batches.forEach((batch, key) => {
      this.executeBatch(key);
    });
  }

  /**
   * Clear batch
   */
  public clearBatch(batchKey: string): void {
    this.batches.delete(batchKey);
  }

  /**
   * Clear all batches
   */
  public clearAll(): void {
    this.batches.clear();
  }
}
