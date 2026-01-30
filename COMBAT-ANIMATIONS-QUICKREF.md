# Combat Animations Quick Reference

## Setup

```typescript
import { useCombatAnimations } from '@/hooks/useCombatAnimations';

const canvasRef = useRef<HTMLCanvasElement>(null);
const camera = { x: 0, y: 0, zoom: 1 };

const { addCombatEvent } = useCombatAnimations(canvasRef, camera);
```

## Combat Events

### Attack (Laser)

```typescript
addCombatEvent({
  type: 'attack',
  position: { x: 100, y: 100 },
  targetPosition: { x: 300, y: 200 }
});
```

### Damage Number

```typescript
addCombatEvent({
  type: 'damage',
  targetPosition: { x: 300, y: 200 },
  damage: 25
});
```

### Explosion

```typescript
addCombatEvent({
  type: 'destroy',
  position: { x: 300, y: 200 }
});
```

### Victory/Defeat

```typescript
addCombatEvent({ type: 'victory' });
addCombatEvent({ type: 'defeat' });
```

## Custom Animations

### Projectile

```typescript
import { ProjectileAnimation } from '@/utils/CombatAnimations';

const projectile = new ProjectileAnimation(
  { x: 100, y: 100 },  // start
  { x: 300, y: 200 },  // end
  '#00ffff',           // color
  500,                 // duration
  3                    // width
);

addAnimation(projectile);
```

### Explosion

```typescript
import { ExplosionAnimation } from '@/utils/CombatAnimations';

const explosion = new ExplosionAnimation(
  { x: 300, y: 200 },  // position
  50,                  // radius
  1000                 // duration
);

addAnimation(explosion);
```

### Damage Number

```typescript
import { DamageNumberAnimation } from '@/utils/CombatAnimations';

const damage = new DamageNumberAnimation(
  { x: 300, y: 200 },  // position
  25,                  // damage
  '#ff0000',           // color
  1500                 // duration
);

addAnimation(damage);
```

### Screen Shake

```typescript
import { ScreenShakeAnimation } from '@/utils/CombatAnimations';

const shake = new ScreenShakeAnimation(
  10,                  // intensity
  500                  // duration
);

addAnimation(shake);
```

### Banner

```typescript
import { BannerAnimation } from '@/utils/CombatAnimations';

const banner = new BannerAnimation(
  'VICTORY!',          // text
  'victory',           // type
  3000                 // duration
);

addAnimation(banner);
```

## Easing Functions

```typescript
import { Easing } from '@/utils/Easing';

Easing.linear(t)
Easing.easeInQuad(t)
Easing.easeOutQuad(t)
Easing.easeInOutQuad(t)
Easing.easeInCubic(t)
Easing.easeOutCubic(t)
Easing.easeInOutCubic(t)
Easing.easeInBack(t)
Easing.easeOutBack(t)
Easing.easeInOutBack(t)
Easing.easeInElastic(t)
Easing.easeOutElastic(t)
Easing.easeInOutElastic(t)
Easing.easeInBounce(t)
Easing.easeOutBounce(t)
Easing.easeInOutBounce(t)
```

## Combat Sequence

```typescript
const runCombat = async () => {
  // Attack
  addCombatEvent({
    type: 'attack',
    position: { x: 100, y: 300 },
    targetPosition: { x: 700, y: 300 }
  });

  await delay(500);

  // Damage
  addCombatEvent({
    type: 'damage',
    targetPosition: { x: 700, y: 300 },
    damage: 30
  });

  await delay(1000);

  // Destroy
  addCombatEvent({
    type: 'destroy',
    position: { x: 700, y: 300 }
  });

  await delay(1500);

  // Victory
  addCombatEvent({ type: 'victory' });
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Control Functions

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
} = useCombatAnimations(canvasRef, camera);

// Start/Stop
start();
stop();

// Clear all
clearAnimations();

// Monitor
console.log('FPS:', getFps());
console.log('Active:', getActiveCount());

// Update camera
updateCamera({ x: 100, y: 50, zoom: 1.5 });
```

## Integration with Audio

```typescript
import { useAudio } from '@/hooks/useAudio';
import { SoundEffectType } from '@/services/AudioManager';

const { playSound } = useAudio();

addCombatEvent({
  type: 'attack',
  position: shipPos,
  targetPosition: enemyPos
});

playSound(SoundEffectType.SHIP_LAUNCHED);
```

## Integration with Socket.io

```typescript
import { useSocket } from '@/hooks/useSocket';

const { on } = useSocket();

on('combatAttack', (data) => {
  addCombatEvent({
    type: 'attack',
    position: data.attackerPos,
    targetPosition: data.targetPos
  });
});

on('shipDestroyed', (data) => {
  addCombatEvent({
    type: 'destroy',
    position: data.position
  });
});
```

## Camera Integration

```typescript
const [camera, setCamera] = useState({
  x: 0,
  y: 0,
  zoom: 1
});

// Update camera
setCamera({ x: 100, y: 50, zoom: 1.5 });
updateCamera(camera);

// Zoom
const handleZoom = (delta: number) => {
  setCamera(prev => ({
    ...prev,
    zoom: Math.max(0.5, Math.min(2, prev.zoom + delta))
  }));
};
```

## Animation Colors

```typescript
// Common colors
'#00ffff'  // Cyan (laser)
'#ff0000'  // Red (damage)
'#ff6600'  // Orange (explosion)
'#ffffff'  // White (flash)
'#00ff00'  // Green (heal)
'#ff00ff'  // Purple (special)
```

## Performance

```typescript
// Monitor performance
useEffect(() => {
  const interval = setInterval(() => {
    if (getFps() < 30) {
      console.warn('Low FPS detected');
    }
    
    if (getActiveCount() > 50) {
      console.warn('Too many animations');
      clearAnimations();
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

## TypeScript Types

```typescript
interface Vector2D {
  x: number;
  y: number;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

interface CombatEvent {
  type: 'attack' | 'damage' | 'destroy' | 'victory' | 'defeat';
  attackerId?: string;
  targetId?: string;
  damage?: number;
  position?: Vector2D;
  targetPosition?: Vector2D;
}

type EasingFunction = (t: number) => number;
```

## Common Patterns

### Laser Hit

```typescript
// Fire
addCombatEvent({
  type: 'attack',
  position: shipA,
  targetPosition: shipB
});

// Hit after 500ms
setTimeout(() => {
  addCombatEvent({
    type: 'damage',
    targetPosition: shipB,
    damage: 25
  });
}, 500);
```

### Destroy with Shake

```typescript
addCombatEvent({
  type: 'destroy',
  position: shipPos
});

// Shake is automatic
```

### Multi-Hit

```typescript
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    addCombatEvent({
      type: 'damage',
      targetPosition: { x: 300, y: 200 },
      damage: 10
    });
  }, i * 200);
}
```

## See Full Docs

[COMBAT-ANIMATIONS.md](./COMBAT-ANIMATIONS.md)
