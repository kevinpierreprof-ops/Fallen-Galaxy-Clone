# Combat Animation System Documentation

## Overview

A comprehensive canvas-based combat animation system with 60fps rendering, featuring lasers, explosions, damage numbers, screen shake, and victory/defeat banners using requestAnimationFrame.

---

## Features

ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Projectile Animations** - Lasers/projectiles with trails  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Explosion Particles** - Particle-based explosions  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Damage Numbers** - Floating damage indicators  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Screen Shake** - Camera shake on explosions  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Color Flash** - Flash effects on damage  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Victory/Defeat Banners** - Animated result screens  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **60 FPS Rendering** - Smooth requestAnimationFrame loop  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Easing Functions** - 25+ easing functions  
ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ **Camera Integration** - Works with zoom/pan  

---

## Files Created

1. **`utils/Easing.ts`** - Easing function library
2. **`utils/CombatAnimations.ts`** - Animation classes
3. **`services/CombatAnimationManager.ts`** - Main manager
4. **`hooks/useCombatAnimations.ts`** - React hook
5. **`examples/CombatAnimationExamples.tsx`** - Usage examples
6. **`COMBAT-ANIMATIONS.md`** - This documentation

---

## Quick Start

### 1. Basic Setup

```typescript
import { useCombatAnimations } from '@/hooks/useCombatAnimations';

function CombatScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera] = useState({ x: 0, y: 0, zoom: 1 });
  
  const { addCombatEvent } = useCombatAnimations(canvasRef, camera);

  const handleAttack = () => {
    addCombatEvent({
      type: 'attack',
      position: { x: 100, y: 100 },
      targetPosition: { x: 300, y: 200 }
    });
  };

  return (
    <>
      <canvas ref={canvasRef} width={800} height={600} />
      <button onClick={handleAttack}>Attack</button>
    </>
  );
}
```

### 2. Combat Sequence

```typescript
const runCombat = async () => {
  // Fire projectile
  addCombatEvent({
    type: 'attack',
    position: { x: 100, y: 300 },
    targetPosition: { x: 700, y: 300 }
  });

  await delay(500);

  // Apply damage
  addCombatEvent({
    type: 'damage',
    targetPosition: { x: 700, y: 300 },
    damage: 30
  });

  await delay(1000);

  // Destroy target
  addCombatEvent({
    type: 'destroy',
    position: { x: 700, y: 300 }
  });
};
```

---

## API Reference

### useCombatAnimations Hook

```typescript
const {
  addCombatEvent,
  addAnimation,
  clearAnimations,
  start,
  stop,
  getActiveCount,
  getFps,
  updateCamera
} = useCombatAnimations(canvasRef, camera, options);
```

**Parameters:**
- `canvasRef: React.RefObject<HTMLCanvasElement>` - Canvas reference
- `camera: Camera` - Camera with x, y, zoom
- `options?: { autoStart?: boolean }` - Optional config

**Returns:**
- `addCombatEvent(event: CombatEvent): void` - Add combat event
- `addAnimation(animation: Animation): void` - Add custom animation
- `clearAnimations(): void` - Clear all animations
- `start(): void` - Start animation loop
- `stop(): void` - Stop animation loop
- `getActiveCount(): number` - Get active animation count
- `getFps(): number` - Get current FPS
- `updateCamera(camera: Camera): void` - Update camera

---

## Combat Events

### Event Types

```typescript
interface CombatEvent {
  type: 'attack' | 'damage' | 'destroy' | 'victory' | 'defeat';
  attackerId?: string;
  targetId?: string;
  damage?: number;
  position?: Vector2D;
  targetPosition?: Vector2D;
}
```

### Attack Event

Fires a projectile from attacker to target.

```typescript
addCombatEvent({
  type: 'attack',
  attackerId: 'ship1',
  targetId: 'ship2',
  position: { x: 100, y: 100 },
  targetPosition: { x: 300, y: 200 }
});
```

**Effects:**
- Projectile with trail
- Muzzle flash on attacker

### Damage Event

Shows damage number and flash on target.

```typescript
addCombatEvent({
  type: 'damage',
  targetId: 'ship2',
  targetPosition: { x: 300, y: 200 },
  damage: 25
});
```

**Effects:**
- Floating damage number
- Red flash on target

### Destroy Event

Explosion with screen shake.

```typescript
addCombatEvent({
  type: 'destroy',
  position: { x: 300, y: 200 }
});
```

**Effects:**
- Particle explosion
- Screen shake
- White flash

### Victory/Defeat Events

Banner animations.

```typescript
addCombatEvent({ type: 'victory' });
addCombatEvent({ type: 'defeat' });
```

**Effects:**
- Sliding banner
- Animated text

---

## Animation Classes

### ProjectileAnimation

Laser/projectile with trailing effect.

```typescript
import { ProjectileAnimation } from '@/utils/CombatAnimations';

const projectile = new ProjectileAnimation(
  { x: 100, y: 100 },  // start
  { x: 300, y: 200 },  // end
  '#00ffff',           // color
  500,                 // duration (ms)
  3                    // width
);

addAnimation(projectile);
```

**Features:**
- Eased movement
- Trail effect (5 positions)
- Glow effect

### ExplosionAnimation

Particle-based explosion.

```typescript
import { ExplosionAnimation } from '@/utils/CombatAnimations';

const explosion = new ExplosionAnimation(
  { x: 300, y: 200 },  // position
  50,                  // radius
  1000                 // duration (ms)
);

addAnimation(explosion);
```

**Features:**
- 30 particles
- Multiple colors (orange, yellow, red, white)
- Radial expansion
- Initial white flash

### DamageNumberAnimation

Floating damage number.

```typescript
import { DamageNumberAnimation } from '@/utils/CombatAnimations';

const damage = new DamageNumberAnimation(
  { x: 300, y: 200 },  // position
  25,                  // damage amount
  '#ff0000',           // color
  1500                 // duration (ms)
);

addAnimation(damage);
```

**Features:**
- Floats upward
- Gravity effect
- Fade out
- Text outline

### ColorFlashAnimation

Flash effect on target.

```typescript
import { ColorFlashAnimation } from '@/utils/CombatAnimations';

const flash = new ColorFlashAnimation(
  'ship2',             // target ID
  '#ff0000',           // color
  0.5,                 // intensity (0-1)
  300                  // duration (ms)
);

addAnimation(flash);
```

### ScreenShakeAnimation

Camera shake effect.

```typescript
import { ScreenShakeAnimation } from '@/utils/CombatAnimations';

const shake = new ScreenShakeAnimation(
  10,                  // intensity
  500                  // duration (ms)
);

addAnimation(shake);
```

**Features:**
- Random offset
- Eased decay
- Combines with other shakes

### BannerAnimation

Victory/defeat banner.

```typescript
import { BannerAnimation } from '@/utils/CombatAnimations';

const banner = new BannerAnimation(
  'VICTORY!',          // text
  'victory',           // type
  3000                 // duration (ms)
);

addAnimation(banner);
```

**Features:**
- Slide-in from left
- Background gradient
- Text shadow/glow
- Fade out

---

## Easing Functions

### Available Easings

```typescript
import { Easing } from '@/utils/Easing';

// Linear
Easing.linear(t)

// Quadratic
Easing.easeInQuad(t)
Easing.easeOutQuad(t)
Easing.easeInOutQuad(t)

// Cubic
Easing.easeInCubic(t)
Easing.easeOutCubic(t)
Easing.easeInOutCubic(t)

// Quartic
Easing.easeInQuart(t)
Easing.easeOutQuart(t)
Easing.easeInOutQuart(t)

// Quintic
Easing.easeInQuint(t)
Easing.easeOutQuint(t)
Easing.easeInOutQuint(t)

// Exponential
Easing.easeInExpo(t)
Easing.easeOutExpo(t)
Easing.easeInOutExpo(t)

// Circular
Easing.easeInCirc(t)
Easing.easeOutCirc(t)
Easing.easeInOutCirc(t)

// Back
Easing.easeInBack(t)
Easing.easeOutBack(t)
Easing.easeInOutBack(t)

// Elastic
Easing.easeInElastic(t)
Easing.easeOutElastic(t)
Easing.easeInOutElastic(t)

// Bounce
Easing.easeInBounce(t)
Easing.easeOutBounce(t)
Easing.easeInOutBounce(t)
```

### Usage Example

```typescript
class CustomAnimation extends Animation {
  private easing = Easing.easeOutBack;

  update(deltaTime: number): void {
    const progress = this.easing(this.getProgress());
    // Use eased progress...
  }
}
```

---

## Camera Integration

The animation system works with camera zoom and pan:

```typescript
const [camera, setCamera] = useState({
  x: 0,      // Camera X position
  y: 0,      // Camera Y position
  zoom: 1    // Zoom level (0.5 - 2.0)
});

const { updateCamera } = useCombatAnimations(canvasRef, camera);

// Update camera
const handleZoom = (delta: number) => {
  const newCamera = {
    ...camera,
    zoom: Math.max(0.5, Math.min(2, camera.zoom + delta))
  };
  setCamera(newCamera);
  updateCamera(newCamera);
};
```

**World to Screen Conversion:**

```typescript
const worldToScreen = (worldPos: Vector2D) => ({
  x: (worldPos.x - camera.x) * camera.zoom,
  y: (worldPos.y - camera.y) * camera.zoom
});
```

---

## Performance

### FPS Monitoring

```typescript
const { getFps, getActiveCount } = useCombatAnimations(canvasRef, camera);

useEffect(() => {
  const interval = setInterval(() => {
    console.log('FPS:', getFps());
    console.log('Active:', getActiveCount());
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### Optimization Tips

1. **Limit Active Animations**
   ```typescript
   if (getActiveCount() > 50) {
     clearAnimations();
   }
   ```

2. **Use Object Pooling**
   ```typescript
   // Reuse particle objects instead of creating new ones
   ```

3. **Reduce Particle Count**
   ```typescript
   // For lower-end devices
   const explosion = new ExplosionAnimation(pos, 50, 1000);
   // vs
   const explosion = new ExplosionAnimation(pos, 50, 1000);
   // Modify internal particle count
   ```

4. **Disable on Low FPS**
   ```typescript
   if (getFps() < 30) {
     stop(); // Disable animations
   }
   ```

---

## Integration Examples

### With Socket.io

```typescript
import { useSocket } from '@/hooks/useSocket';

function CombatView() {
  const { on } = useSocket();
  const { addCombatEvent } = useCombatAnimations(canvasRef, camera);

  useEffect(() => {
    on('combatAttack', (data) => {
      addCombatEvent({
        type: 'attack',
        position: data.attackerPos,
        targetPosition: data.targetPos
      });
    });

    on('combatDamage', (data) => {
      addCombatEvent({
        type: 'damage',
        targetPosition: data.position,
        damage: data.amount
      });
    });

    on('shipDestroyed', (data) => {
      addCombatEvent({
        type: 'destroy',
        position: data.position
      });
    });
  }, [on, addCombatEvent]);

  return <canvas ref={canvasRef} />;
}
```

### With Audio

```typescript
import { useAudio } from '@/hooks/useAudio';
import { SoundEffectType } from '@/services/AudioManager';

function CombatView() {
  const { playSound } = useAudio();
  const { addCombatEvent } = useCombatAnimations(canvasRef, camera);

  const handleCombatEvent = (event: CombatEvent) => {
    addCombatEvent(event);

    // Play sound
    switch (event.type) {
      case 'attack':
        playSound(SoundEffectType.SHIP_LAUNCHED);
        break;
      case 'damage':
        playSound(SoundEffectType.COMBAT_HIT);
        break;
      case 'destroy':
        playSound(SoundEffectType.COMBAT_DESTROY);
        break;
    }
  };

  return <canvas ref={canvasRef} />;
}
```

### With Game State

```typescript
function CombatView() {
  const { addCombatEvent } = useCombatAnimations(canvasRef, camera);
  const [ships, setShips] = useState<Ship[]>([]);

  const handleShipAttack = (attackerId: string, targetId: string) => {
    const attacker = ships.find(s => s.id === attackerId);
    const target = ships.find(s => s.id === targetId);

    if (!attacker || !target) return;

    // Animate attack
    addCombatEvent({
      type: 'attack',
      attackerId,
      targetId,
      position: { x: attacker.x, y: attacker.y },
      targetPosition: { x: target.x, y: target.y }
    });

    // Calculate and apply damage
    setTimeout(() => {
      const damage = calculateDamage(attacker, target);
      
      addCombatEvent({
        type: 'damage',
        targetId,
        targetPosition: { x: target.x, y: target.y },
        damage
      });

      // Update ship HP
      setShips(prev => prev.map(ship =>
        ship.id === targetId
          ? { ...ship, hp: ship.hp - damage }
          : ship
      ));

      // Check if destroyed
      if (target.hp - damage <= 0) {
        setTimeout(() => {
          addCombatEvent({
            type: 'destroy',
            position: { x: target.x, y: target.y }
          });
        }, 300);
      }
    }, 500);
  };

  return <canvas ref={canvasRef} />;
}
```

---

## Advanced Usage

### Custom Animation Class

```typescript
import { Animation, Vector2D } from '@/utils/CombatAnimations';
import { Easing } from '@/utils/Easing';

class BeamAnimation extends Animation {
  private start: Vector2D;
  private end: Vector2D;
  private width: number = 1;
  private maxWidth: number = 10;

  constructor(start: Vector2D, end: Vector2D, duration: number = 1000) {
    super(duration);
    this.start = start;
    this.end = end;
  }

  update(deltaTime: number): void {
    const progress = Easing.easeInOutQuad(this.getProgress());
    
    if (progress < 0.5) {
      this.width = this.maxWidth * (progress / 0.5);
    } else {
      this.width = this.maxWidth * (1 - (progress - 0.5) / 0.5);
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const s = {
      x: (this.start.x - camera.x) * camera.zoom,
      y: (this.start.y - camera.y) * camera.zoom
    };
    const e = {
      x: (this.end.x - camera.x) * camera.zoom,
      y: (this.end.y - camera.y) * camera.zoom
    };

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = this.width * camera.zoom;
    ctx.shadowBlur = 20 * camera.zoom;
    ctx.shadowColor = '#00ffff';
    
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }
}

// Use it
const beam = new BeamAnimation({ x: 100, y: 100 }, { x: 300, y: 200 });
addAnimation(beam);
```

---

## Browser Compatibility

- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Chrome 90+
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Firefox 88+
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Safari 14+
- ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Edge 90+

**Requirements:**
- Canvas API
- requestAnimationFrame
- ES6+ support

---

## See Also

- [Galaxy Canvas](./GALAXY-CANVAS.md)
- [Audio Manager](./AUDIO-MANAGER.md)
- [Socket Client](./SOCKET-CLIENT.md)
- [Easing Functions Reference](https://easings.net/)
