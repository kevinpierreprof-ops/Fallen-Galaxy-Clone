/**
 * useGalaxyCanvas Hook
 * 
 * Custom hook for managing galaxy canvas state and rendering
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  SpatialHashGrid,
  FrustumCuller,
  PerformanceMonitor,
  Interpolator
} from '@/utils/canvasPerformance';
import type { Planet } from '@shared/types/galaxyMap';
import type { Ship } from '@shared/types/ships';

/**
 * Camera state
 */
interface Camera {
  x: number;
  y: number;
  zoom: number;
  targetX?: number;
  targetY?: number;
  targetZoom?: number;
}

/**
 * Hook options
 */
interface UseGalaxyCanvasOptions {
  width: number;
  height: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  enablePerformanceMonitoring?: boolean;
}

/**
 * Hook return value
 */
interface UseGalaxyCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  camera: Camera;
  fps: number;
  frameTime: number;
  setCamera: (camera: Partial<Camera>) => void;
  centerOnPosition: (x: number, y: number, animated?: boolean) => void;
  worldToScreen: (x: number, y: number) => { x: number; y: number };
  screenToWorld: (x: number, y: number) => { x: number; y: number };
  zoom: (delta: number, centerX?: number, centerY?: number) => void;
  pan: (dx: number, dy: number) => void;
  getVisiblePlanets: (planets: Planet[]) => Planet[];
  getVisibleShips: (ships: Ship[]) => Ship[];
}

/**
 * Custom hook for galaxy canvas management
 */
export function useGalaxyCanvas(
  options: UseGalaxyCanvasOptions
): UseGalaxyCanvasReturn {
  const {
    width,
    height,
    initialZoom = 1,
    minZoom = 0.2,
    maxZoom = 3,
    enablePerformanceMonitoring = true
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const performanceMonitor = useRef(new PerformanceMonitor());
  const spatialGrid = useRef(new SpatialHashGrid(100));

  const [camera, setCameraState] = useState<Camera>({
    x: 0,
    y: 0,
    zoom: initialZoom
  });

  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(0);

  /**
   * Convert world coordinates to screen coordinates
   */
  const worldToScreen = useCallback(
    (worldX: number, worldY: number): { x: number; y: number } => {
      return {
        x: (worldX - camera.x) * camera.zoom + width / 2,
        y: (worldY - camera.y) * camera.zoom + height / 2
      };
    },
    [camera, width, height]
  );

  /**
   * Convert screen coordinates to world coordinates
   */
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      return {
        x: (screenX - width / 2) / camera.zoom + camera.x,
        y: (screenY - height / 2) / camera.zoom + camera.y
      };
    },
    [camera, width, height]
  );

  /**
   * Set camera with constraints
   */
  const setCamera = useCallback(
    (newCamera: Partial<Camera>) => {
      setCameraState(prev => {
        const updated = { ...prev, ...newCamera };

        // Constrain zoom
        if (updated.zoom !== undefined) {
          updated.zoom = Math.max(minZoom, Math.min(maxZoom, updated.zoom));
        }

        return updated;
      });
    },
    [minZoom, maxZoom]
  );

  /**
   * Center camera on position
   */
  const centerOnPosition = useCallback(
    (x: number, y: number, animated: boolean = false) => {
      if (animated) {
        setCamera({
          targetX: x,
          targetY: y
        });
      } else {
        setCamera({ x, y });
      }
    },
    [setCamera]
  );

  /**
   * Zoom camera
   */
  const zoom = useCallback(
    (delta: number, centerX?: number, centerY?: number) => {
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, camera.zoom * zoomFactor));

      if (centerX !== undefined && centerY !== undefined) {
        // Zoom towards point
        const worldPosBefore = screenToWorld(centerX, centerY);

        setCamera({ zoom: newZoom });

        // Adjust position to keep point under cursor
        const worldPosAfter = {
          x: (centerX - width / 2) / newZoom + camera.x,
          y: (centerY - height / 2) / newZoom + camera.y
        };

        setCamera({
          x: camera.x + (worldPosBefore.x - worldPosAfter.x),
          y: camera.y + (worldPosBefore.y - worldPosAfter.y)
        });
      } else {
        setCamera({ zoom: newZoom });
      }
    },
    [camera, width, height, minZoom, maxZoom, screenToWorld, setCamera]
  );

  /**
   * Pan camera
   */
  const pan = useCallback(
    (dx: number, dy: number) => {
      setCamera({
        x: camera.x - dx / camera.zoom,
        y: camera.y - dy / camera.zoom
      });
    },
    [camera, setCamera]
  );

  /**
   * Get visible planets (frustum culling)
   */
  const getVisiblePlanets = useCallback(
    (planets: Planet[]): Planet[] => {
      return FrustumCuller.getVisibleObjects(
        planets,
        camera.x,
        camera.y,
        width,
        height,
        camera.zoom,
        100
      );
    },
    [camera, width, height]
  );

  /**
   * Get visible ships (frustum culling)
   */
  const getVisibleShips = useCallback(
    (ships: Ship[]): Ship[] => {
      // Ships don't have direct position, need to calculate from movement or planet
      return ships; // TODO: Implement proper frustum culling for ships
    },
    [camera, width, height]
  );

  /**
   * Smooth camera animation
   */
  useEffect(() => {
    if (camera.targetX !== undefined && camera.targetY !== undefined) {
      const animate = () => {
        setCameraState(prev => {
          const speed = 0.1;
          const newX = Interpolator.lerp(prev.x, camera.targetX!, speed);
          const newY = Interpolator.lerp(prev.y, camera.targetY!, speed);

          // Check if close enough
          const dx = Math.abs(newX - camera.targetX!);
          const dy = Math.abs(newY - camera.targetY!);

          if (dx < 0.1 && dy < 0.1) {
            return {
              ...prev,
              x: camera.targetX!,
              y: camera.targetY!,
              targetX: undefined,
              targetY: undefined
            };
          }

          return { ...prev, x: newX, y: newY };
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [camera.targetX, camera.targetY]);

  /**
   * Performance monitoring
   */
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    const monitor = performanceMonitor.current;

    const update = () => {
      monitor.update();
      setFps(monitor.getFPS());
      setFrameTime(monitor.getFrameTime());

      animationFrameRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enablePerformanceMonitoring]);

  return {
    canvasRef,
    camera,
    fps,
    frameTime,
    setCamera,
    centerOnPosition,
    worldToScreen,
    screenToWorld,
    zoom,
    pan,
    getVisiblePlanets,
    getVisibleShips
  };
}

/**
 * Hook for handling canvas mouse interactions
 */
interface UseCanvasMouseOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDrag?: (dx: number, dy: number) => void;
  onClick?: (x: number, y: number) => void;
  onZoom?: (delta: number, x: number, y: number) => void;
}

export function useCanvasMouse(options: UseCanvasMouseOptions) {
  const { canvasRef, onDrag, onClick, onZoom } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePos({ x, y });

      if (isDragging && onDrag) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        onDrag(dx, dy);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, dragStart, onDrag, canvasRef]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && onClick) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        onClick(x, y);
      }

      setIsDragging(false);
    },
    [isDragging, onClick, canvasRef]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (onZoom) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        onZoom(e.deltaY, x, y);
      }
    },
    [onZoom, canvasRef]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', () => setIsDragging(false));
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', () => setIsDragging(false));
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  return {
    isDragging,
    mousePos
  };
}
