/**
 * Combat Animation Manager
 * 
 * Manages all combat animations with 60fps rendering
 */

import {
  Animation,
  ProjectileAnimation,
  ExplosionAnimation,
  DamageNumberAnimation,
  ColorFlashAnimation,
  ScreenShakeAnimation,
  BannerAnimation,
  Vector2D
} from './CombatAnimations';

/**
 * Combat event types
 */
export interface CombatEvent {
  type: 'attack' | 'damage' | 'destroy' | 'victory' | 'defeat';
  attackerId?: string;
  targetId?: string;
  damage?: number;
  position?: Vector2D;
  targetPosition?: Vector2D;
}

/**
 * Camera interface
 */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Combat Animation Manager
 */
export class CombatAnimationManager {
  private animations: Animation[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private animationFrameId: number | null = null;

  // Screen shake state
  private shakeOffset: Vector2D = { x: 0, y: 0 };

  // FPS tracking
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private currentFps: number = 0;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.camera = camera;
  }

  /**
   * Start animation loop
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.animate();
  }

  /**
   * Stop animation loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update FPS
    this.updateFps(currentTime);

    // Update animations
    this.update(deltaTime);

    // Render animations
    this.render();

    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Update FPS counter
   */
  private updateFps(currentTime: number): void {
    this.frameCount++;

    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  /**
   * Update all animations
   */
  private update(deltaTime: number): void {
    // Update screen shake
    this.updateScreenShake();

    // Update all animations
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const animation = this.animations[i];
      animation.update(deltaTime);

      // Remove completed animations
      if (animation.isComplete) {
        this.animations.splice(i, 1);
      }
    }
  }

  /**
   * Update screen shake offset
   */
  private updateScreenShake(): void {
    const shakeAnimations = this.animations.filter(
      a => a instanceof ScreenShakeAnimation
    ) as ScreenShakeAnimation[];

    if (shakeAnimations.length > 0) {
      // Combine all shake offsets
      let totalX = 0;
      let totalY = 0;

      for (const shake of shakeAnimations) {
        const offset = shake.getOffset();
        totalX += offset.x;
        totalY += offset.y;
      }

      this.shakeOffset = { x: totalX, y: totalY };
    } else {
      this.shakeOffset = { x: 0, y: 0 };
    }
  }

  /**
   * Render all animations
   */
  private render(): void {
    // Apply screen shake to camera
    const shakenCamera = {
      ...this.camera,
      x: this.camera.x + this.shakeOffset.x,
      y: this.camera.y + this.shakeOffset.y
    };

    // Render all animations
    for (const animation of this.animations) {
      this.ctx.save();
      animation.render(this.ctx, shakenCamera);
      this.ctx.restore();
    }
  }

  /**
   * Add combat event
   */
  public addCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'attack':
        this.addAttackAnimation(event);
        break;
      case 'damage':
        this.addDamageAnimation(event);
        break;
      case 'destroy':
        this.addDestroyAnimation(event);
        break;
      case 'victory':
        this.addVictoryAnimation();
        break;
      case 'defeat':
        this.addDefeatAnimation();
        break;
    }
  }

  /**
   * Add attack animation (projectile + flash)
   */
  private addAttackAnimation(event: CombatEvent): void {
    if (!event.position || !event.targetPosition) return;

    // Projectile
    const projectile = new ProjectileAnimation(
      event.position,
      event.targetPosition,
      '#00ffff',
      500,
      3
    );
    this.animations.push(projectile);

    // Muzzle flash
    const flash = new ColorFlashAnimation(
      event.attackerId || '',
      '#ffffff',
      0.3,
      100
    );
    this.animations.push(flash);
  }

  /**
   * Add damage animation (damage number + flash)
   */
  private addDamageAnimation(event: CombatEvent): void {
    if (!event.targetPosition || !event.damage) return;

    // Damage number
    const damageNumber = new DamageNumberAnimation(
      event.targetPosition,
      event.damage,
      '#ff0000',
      1500
    );
    this.animations.push(damageNumber);

    // Impact flash
    const flash = new ColorFlashAnimation(
      event.targetId || '',
      '#ff0000',
      0.5,
      300
    );
    this.animations.push(flash);
  }

  /**
   * Add destroy animation (explosion + shake)
   */
  private addDestroyAnimation(event: CombatEvent): void {
    if (!event.position) return;

    // Explosion
    const explosion = new ExplosionAnimation(
      event.position,
      50,
      1000
    );
    this.animations.push(explosion);

    // Screen shake
    const shake = new ScreenShakeAnimation(15, 500);
    this.animations.push(shake);
  }

  /**
   * Add victory animation
   */
  private addVictoryAnimation(): void {
    const banner = new BannerAnimation('VICTORY!', 'victory', 3000);
    this.animations.push(banner);
  }

  /**
   * Add defeat animation
   */
  private addDefeatAnimation(): void {
    const banner = new BannerAnimation('DEFEAT', 'defeat', 3000);
    this.animations.push(banner);
  }

  /**
   * Add custom animation
   */
  public addAnimation(animation: Animation): void {
    this.animations.push(animation);
  }

  /**
   * Clear all animations
   */
  public clearAnimations(): void {
    this.animations = [];
  }

  /**
   * Get active animation count
   */
  public getActiveCount(): number {
    return this.animations.length;
  }

  /**
   * Get current FPS
   */
  public getFps(): number {
    return this.currentFps;
  }

  /**
   * Update camera
   */
  public updateCamera(camera: Camera): void {
    this.camera = camera;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stop();
    this.clearAnimations();
  }
}

export default CombatAnimationManager;
