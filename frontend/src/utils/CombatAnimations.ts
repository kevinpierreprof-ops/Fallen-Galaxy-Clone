/**
 * Combat Animation Classes
 * 
 * Individual animation types for combat effects
 */

import { Easing, EasingFunction } from './Easing';

/**
 * Vector2D for position and velocity
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Base Animation class
 */
export abstract class Animation {
  public isComplete: boolean = false;
  protected startTime: number;
  protected duration: number;

  constructor(duration: number) {
    this.duration = duration;
    this.startTime = Date.now();
  }

  /**
   * Get animation progress (0-1)
   */
  protected getProgress(): number {
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);
    
    if (progress >= 1) {
      this.isComplete = true;
    }
    
    return progress;
  }

  /**
   * Update animation
   */
  abstract update(deltaTime: number): void;

  /**
   * Render animation
   */
  abstract render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void;
}

/**
 * Projectile Animation
 */
export class ProjectileAnimation extends Animation {
  private start: Vector2D;
  private end: Vector2D;
  private current: Vector2D;
  private color: string;
  private width: number;
  private easing: EasingFunction;
  private trailPositions: Vector2D[] = [];

  constructor(
    start: Vector2D,
    end: Vector2D,
    color: string = '#00ffff',
    duration: number = 500,
    width: number = 3
  ) {
    super(duration);
    this.start = { ...start };
    this.end = { ...end };
    this.current = { ...start };
    this.color = color;
    this.width = width;
    this.easing = Easing.easeOutQuad;
  }

  update(deltaTime: number): void {
    const progress = this.easing(this.getProgress());

    this.current.x = this.start.x + (this.end.x - this.start.x) * progress;
    this.current.y = this.start.y + (this.end.y - this.start.y) * progress;

    // Add to trail
    this.trailPositions.push({ ...this.current });
    if (this.trailPositions.length > 5) {
      this.trailPositions.shift();
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void {
    const worldToScreen = (pos: Vector2D) => ({
      x: (pos.x - camera.x) * camera.zoom,
      y: (pos.y - camera.y) * camera.zoom
    });

    // Draw trail
    if (this.trailPositions.length > 1) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width * camera.zoom;
      ctx.lineCap = 'round';

      for (let i = 0; i < this.trailPositions.length - 1; i++) {
        const alpha = (i + 1) / this.trailPositions.length;
        ctx.globalAlpha = alpha * 0.5;

        const screenPos1 = worldToScreen(this.trailPositions[i]);
        const screenPos2 = worldToScreen(this.trailPositions[i + 1]);

        ctx.beginPath();
        ctx.moveTo(screenPos1.x, screenPos1.y);
        ctx.lineTo(screenPos2.x, screenPos2.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // Draw projectile head
    const screenPos = worldToScreen(this.current);
    
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10 * camera.zoom;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.width * camera.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/**
 * Explosion Particle
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

/**
 * Explosion Animation
 */
export class ExplosionAnimation extends Animation {
  private position: Vector2D;
  private particles: Particle[] = [];
  private radius: number;
  private flash: boolean = true;

  constructor(position: Vector2D, radius: number = 50, duration: number = 1000) {
    super(duration);
    this.position = { ...position };
    this.radius = radius;
    this.createParticles();
  }

  private createParticles(): void {
    const particleCount = 30;
    const colors = ['#ff6600', '#ff9900', '#ffcc00', '#ff3300', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 50 + Math.random() * 100;

      this.particles.push({
        x: this.position.x,
        y: this.position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      particle.life = 1 - this.getProgress();
    }

    if (this.getProgress() > 0.2) {
      this.flash = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void {
    // Flash effect
    if (this.flash) {
      const screenPos = {
        x: (this.position.x - camera.x) * camera.zoom,
        y: (this.position.y - camera.y) * camera.zoom
      };

      const gradient = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, this.radius * camera.zoom
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Particles
    for (const particle of this.particles) {
      const screenPos = {
        x: (particle.x - camera.x) * camera.zoom,
        y: (particle.y - camera.y) * camera.zoom
      };

      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 5 * camera.zoom;
      ctx.shadowColor = particle.color;
      
      ctx.beginPath();
      ctx.arc(
        screenPos.x,
        screenPos.y,
        particle.size * camera.zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

/**
 * Damage Number Animation
 */
export class DamageNumberAnimation extends Animation {
  private position: Vector2D;
  private damage: number;
  private color: string;
  private velocity: Vector2D;
  private easing: EasingFunction;

  constructor(
    position: Vector2D,
    damage: number,
    color: string = '#ff0000',
    duration: number = 1500
  ) {
    super(duration);
    this.position = { ...position };
    this.damage = damage;
    this.color = color;
    this.velocity = { x: (Math.random() - 0.5) * 20, y: -50 };
    this.easing = Easing.easeOutCubic;
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.velocity.y += 98 * dt; // Gravity
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void {
    const progress = this.getProgress();
    const alpha = 1 - this.easing(progress);

    const screenPos = {
      x: (this.position.x - camera.x) * camera.zoom,
      y: (this.position.y - camera.y) * camera.zoom
    };

    ctx.globalAlpha = alpha;
    ctx.font = `bold ${20 * camera.zoom}px Arial`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outline
    ctx.strokeText(`-${this.damage}`, screenPos.x, screenPos.y);
    // Fill
    ctx.fillText(`-${this.damage}`, screenPos.x, screenPos.y);

    ctx.globalAlpha = 1;
  }
}

/**
 * Color Flash Animation
 */
export class ColorFlashAnimation extends Animation {
  private targetId: string;
  private color: string;
  private intensity: number;
  private easing: EasingFunction;

  constructor(
    targetId: string,
    color: string = '#ff0000',
    intensity: number = 0.5,
    duration: number = 300
  ) {
    super(duration);
    this.targetId = targetId;
    this.color = color;
    this.intensity = intensity;
    this.easing = Easing.easeOutQuad;
  }

  update(deltaTime: number): void {
    // Progress is tracked in base class
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void {
    // This is handled by the renderer overlaying the flash
  }

  getFlashAlpha(): number {
    const progress = this.getProgress();
    return this.intensity * (1 - this.easing(progress));
  }

  getTargetId(): string {
    return this.targetId;
  }

  getColor(): string {
    return this.color;
  }
}

/**
 * Screen Shake Animation
 */
export class ScreenShakeAnimation extends Animation {
  private intensity: number;
  private easing: EasingFunction;

  constructor(intensity: number = 10, duration: number = 500) {
    super(duration);
    this.intensity = intensity;
    this.easing = Easing.easeOutQuad;
  }

  update(deltaTime: number): void {
    // Progress is tracked in base class
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void {
    // This is handled by the camera offset
  }

  getOffset(): Vector2D {
    const progress = this.getProgress();
    const currentIntensity = this.intensity * (1 - this.easing(progress));

    return {
      x: (Math.random() - 0.5) * currentIntensity * 2,
      y: (Math.random() - 0.5) * currentIntensity * 2
    };
  }
}

/**
 * Banner Animation
 */
export class BannerAnimation extends Animation {
  private text: string;
  private type: 'victory' | 'defeat';
  private easing: EasingFunction;

  constructor(text: string, type: 'victory' | 'defeat', duration: number = 3000) {
    super(duration);
    this.text = text;
    this.type = type;
    this.easing = Easing.easeOutBack;
  }

  update(deltaTime: number): void {
    // Progress is tracked in base class
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number; zoom: number }): void {
    const progress = this.getProgress();
    const slideProgress = progress < 0.3 ? this.easing(progress / 0.3) : 1;
    const fadeProgress = progress > 0.7 ? (progress - 0.7) / 0.3 : 0;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Calculate position
    const y = canvasHeight * 0.3;
    const x = canvasWidth * 0.5;
    const slideOffset = (1 - slideProgress) * canvasWidth;

    ctx.globalAlpha = 1 - fadeProgress;

    // Background banner
    const bannerHeight = 120;
    const gradient = ctx.createLinearGradient(0, y - bannerHeight / 2, 0, y + bannerHeight / 2);
    
    if (this.type === 'victory') {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0)');
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.8)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.8)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(-slideOffset, y - bannerHeight / 2, canvasWidth, bannerHeight);

    // Text
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.type === 'victory' ? '#22c55e' : '#ef4444';

    ctx.strokeText(this.text, x - slideOffset, y);
    ctx.fillText(this.text, x - slideOffset, y);

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}

export default {
  ProjectileAnimation,
  ExplosionAnimation,
  DamageNumberAnimation,
  ColorFlashAnimation,
  ScreenShakeAnimation,
  BannerAnimation
};
