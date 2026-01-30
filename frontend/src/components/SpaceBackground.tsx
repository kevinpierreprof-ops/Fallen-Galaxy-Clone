/**
 * Space Background Component
 * 
 * Animated starfield and nebula background using Canvas
 */

import React, { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Space Background Component
 */
export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const nebulasRef = useRef<Nebula[]>([]);
  const timeRef = useRef(0);

  /**
   * Initialize stars
   */
  const initStars = (width: number, height: number): Star[] => {
    const stars: Star[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.5
      });
    }

    return stars;
  };

  /**
   * Initialize nebulas
   */
  const initNebulas = (width: number, height: number): Nebula[] => {
    const nebulas: Nebula[] = [];
    const colors = [
      'rgba(138, 43, 226, 0.15)',   // Purple
      'rgba(0, 191, 255, 0.15)',     // Deep sky blue
      'rgba(255, 20, 147, 0.15)',    // Deep pink
      'rgba(0, 255, 127, 0.12)',     // Spring green
      'rgba(255, 69, 0, 0.12)'       // Red-orange
    ];

    for (let i = 0; i < 5; i++) {
      nebulas.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 200,
        color: colors[i % colors.length],
        opacity: Math.random() * 0.3 + 0.1,
        offsetX: Math.random() * 2 - 1,
        offsetY: Math.random() * 2 - 1
      });
    }

    return nebulas;
  };

  /**
   * Draw nebula
   */
  const drawNebula = (
    ctx: CanvasRenderingContext2D,
    nebula: Nebula,
    time: number
  ) => {
    const x = nebula.x + Math.sin(time * 0.001 + nebula.offsetX) * 50;
    const y = nebula.y + Math.cos(time * 0.001 + nebula.offsetY) * 30;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.radius);
    gradient.addColorStop(0, nebula.color);
    gradient.addColorStop(0.5, nebula.color.replace(/[\d.]+\)/, '0.05)'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, nebula.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  /**
   * Draw star
   */
  const drawStar = (ctx: CanvasRenderingContext2D, star: Star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.shadowBlur = star.size * 2;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  /**
   * Update stars
   */
  const updateStars = (stars: Star[], width: number, height: number) => {
    stars.forEach(star => {
      star.z -= star.speed;

      if (star.z <= 0) {
        star.z = 1000;
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      }

      // Twinkle effect
      star.opacity = 0.5 + Math.sin(Date.now() * 0.001 + star.x) * 0.3;
    });
  };

  /**
   * Animation loop
   */
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    timeRef.current += 16; // ~60fps

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw nebulas
    nebulasRef.current.forEach(nebula => {
      drawNebula(ctx, nebula, timeRef.current);
    });

    // Update and draw stars
    updateStars(starsRef.current, width, height);
    starsRef.current.forEach(star => {
      drawStar(ctx, star);
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * Setup canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      starsRef.current = initStars(canvas.width, canvas.height);
      nebulasRef.current = initNebulas(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="space-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
};

export default SpaceBackground;
