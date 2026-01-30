/**
 * Combat Animation Examples
 * 
 * Examples of using the combat animation system
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCombatAnimations } from '@/hooks/useCombatAnimations';
import { ProjectileAnimation, ExplosionAnimation, DamageNumberAnimation } from '@/utils/CombatAnimations';

/**
 * Example 1: Basic Combat Animation
 */
export const BasicCombatExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera] = useState({ x: 0, y: 0, zoom: 1 });
  
  const { addCombatEvent, getFps } = useCombatAnimations(canvasRef, camera);

  const handleAttack = () => {
    addCombatEvent({
      type: 'attack',
      attackerId: 'ship1',
      targetId: 'ship2',
      position: { x: 100, y: 100 },
      targetPosition: { x: 300, y: 200 }
    });

    // Add damage after projectile hits
    setTimeout(() => {
      addCombatEvent({
        type: 'damage',
        targetId: 'ship2',
        targetPosition: { x: 300, y: 200 },
        damage: 25
      });
    }, 500);
  };

  const handleDestroy = () => {
    addCombatEvent({
      type: 'destroy',
      position: { x: 300, y: 200 }
    });
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
      <div>
        <button onClick={handleAttack}>Fire Laser</button>
        <button onClick={handleDestroy}>Explode</button>
        <p>FPS: {getFps()}</p>
      </div>
    </div>
  );
};

/**
 * Example 2: Combat Sequence
 */
export const CombatSequenceExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera] = useState({ x: 0, y: 0, zoom: 1 });
  
  const { addCombatEvent } = useCombatAnimations(canvasRef, camera);

  const runCombatSequence = async () => {
    // Ship 1 attacks Ship 2
    addCombatEvent({
      type: 'attack',
      position: { x: 100, y: 300 },
      targetPosition: { x: 700, y: 300 }
    });

    await delay(500);

    // Hit and damage
    addCombatEvent({
      type: 'damage',
      targetPosition: { x: 700, y: 300 },
      damage: 30
    });

    await delay(1000);

    // Ship 2 retaliates
    addCombatEvent({
      type: 'attack',
      position: { x: 700, y: 300 },
      targetPosition: { x: 100, y: 300 }
    });

    await delay(500);

    addCombatEvent({
      type: 'damage',
      targetPosition: { x: 100, y: 300 },
      damage: 25
    });

    await delay(1000);

    // Ship 2 destroyed
    addCombatEvent({
      type: 'destroy',
      position: { x: 700, y: 300 }
    });

    await delay(1500);

    // Victory
    addCombatEvent({
      type: 'victory'
    });
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #ccc' }} />
      <div>
        <button onClick={runCombatSequence}>Run Combat Sequence</button>
      </div>
    </div>
  );
};

/**
 * Example 3: Custom Animations
 */
export const CustomAnimationsExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera] = useState({ x: 0, y: 0, zoom: 1 });
  
  const { addAnimation } = useCombatAnimations(canvasRef, camera);

  const addCustomProjectile = () => {
    const projectile = new ProjectileAnimation(
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      '#ff00ff', // Purple
      1000,
      5
    );
    addAnimation(projectile);
  };

  const addCustomExplosion = () => {
    const explosion = new ExplosionAnimation(
      { x: 400, y: 300 },
      80,
      1500
    );
    addAnimation(explosion);
  };

  const addCustomDamage = () => {
    const damage = new DamageNumberAnimation(
      { x: 400, y: 300 },
      9999,
      '#00ff00',
      2000
    );
    addAnimation(damage);
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #ccc' }} />
      <div>
        <button onClick={addCustomProjectile}>Custom Projectile</button>
        <button onClick={addCustomExplosion}>Custom Explosion</button>
        <button onClick={addCustomDamage}>Custom Damage</button>
      </div>
    </div>
  );
};

/**
 * Example 4: Galaxy Canvas Integration
 */
export const GalaxyCombatExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  
  const { addCombatEvent, getActiveCount, getFps, updateCamera } = useCombatAnimations(
    canvasRef,
    camera
  );

  // Simulate ship positions
  const [ships] = useState([
    { id: 'ship1', x: 200, y: 300, hp: 100 },
    { id: 'ship2', x: 600, y: 300, hp: 100 }
  ]);

  useEffect(() => {
    // Draw ships on canvas
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 800, 600);

      // Draw ships
      for (const ship of ships) {
        const screenX = (ship.x - camera.x) * camera.zoom;
        const screenY = (ship.y - camera.y) * camera.zoom;

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 10 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();

        // HP bar
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(screenX - 20, screenY - 25, (ship.hp / 100) * 40, 4);
      }
    };

    const interval = setInterval(draw, 16);
    return () => clearInterval(interval);
  }, [camera, ships]);

  const handleCombat = () => {
    // Ship 1 attacks Ship 2
    addCombatEvent({
      type: 'attack',
      attackerId: ships[0].id,
      targetId: ships[1].id,
      position: { x: ships[0].x, y: ships[0].y },
      targetPosition: { x: ships[1].x, y: ships[1].y }
    });

    setTimeout(() => {
      addCombatEvent({
        type: 'damage',
        targetId: ships[1].id,
        targetPosition: { x: ships[1].x, y: ships[1].y },
        damage: 35
      });

      ships[1].hp -= 35;

      if (ships[1].hp <= 0) {
        setTimeout(() => {
          addCombatEvent({
            type: 'destroy',
            position: { x: ships[1].x, y: ships[1].y }
          });
        }, 300);
      }
    }, 500);
  };

  const handleZoom = (delta: number) => {
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(2, prev.zoom + delta))
    }));
    updateCamera(camera);
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #333' }} />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleCombat}>Start Combat</button>
        <button onClick={() => handleZoom(0.1)}>Zoom In</button>
        <button onClick={() => handleZoom(-0.1)}>Zoom Out</button>
        <p>Active Animations: {getActiveCount()}</p>
        <p>FPS: {getFps()}</p>
      </div>
    </div>
  );
};

/**
 * Example 5: Multi-Ship Battle
 */
export const MultiShipBattleExample: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera] = useState({ x: 0, y: 0, zoom: 1 });
  
  const { addCombatEvent } = useCombatAnimations(canvasRef, camera);

  const startBattle = async () => {
    const team1 = [
      { x: 100, y: 200 },
      { x: 150, y: 300 },
      { x: 100, y: 400 }
    ];

    const team2 = [
      { x: 700, y: 200 },
      { x: 650, y: 300 },
      { x: 700, y: 400 }
    ];

    // Barrage of attacks
    for (let i = 0; i < 10; i++) {
      const from = team1[Math.floor(Math.random() * team1.length)];
      const to = team2[Math.floor(Math.random() * team2.length)];

      addCombatEvent({
        type: 'attack',
        position: from,
        targetPosition: to
      });

      await delay(200);

      addCombatEvent({
        type: 'damage',
        targetPosition: to,
        damage: Math.floor(Math.random() * 30) + 10
      });

      if (Math.random() > 0.7) {
        await delay(300);
        addCombatEvent({
          type: 'destroy',
          position: to
        });
      }
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #333' }} />
      <div>
        <button onClick={startBattle}>Start Multi-Ship Battle</button>
      </div>
    </div>
  );
};

// Helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default BasicCombatExample;
