/**
 * useCombatAnimations Hook
 * 
 * React hook for combat animation system
 */

import { useEffect, useRef, useCallback } from 'react';
import CombatAnimationManager, { CombatEvent, Camera } from '@/services/CombatAnimationManager';
import { Animation } from '@/utils/CombatAnimations';

/**
 * Hook options
 */
interface UseCombatAnimationsOptions {
  autoStart?: boolean;
}

/**
 * Hook return value
 */
interface UseCombatAnimationsReturn {
  addCombatEvent: (event: CombatEvent) => void;
  addAnimation: (animation: Animation) => void;
  clearAnimations: () => void;
  start: () => void;
  stop: () => void;
  getActiveCount: () => number;
  getFps: () => number;
  updateCamera: (camera: Camera) => void;
}

/**
 * useCombatAnimations Hook
 */
export function useCombatAnimations(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  camera: Camera,
  options: UseCombatAnimationsOptions = {}
): UseCombatAnimationsReturn {
  const { autoStart = true } = options;
  const managerRef = useRef<CombatAnimationManager | null>(null);

  /**
   * Initialize manager
   */
  useEffect(() => {
    if (!canvasRef.current) return;

    const manager = new CombatAnimationManager(canvasRef.current, camera);
    managerRef.current = manager;

    if (autoStart) {
      manager.start();
    }

    return () => {
      manager.destroy();
    };
  }, [canvasRef.current]);

  /**
   * Update camera
   */
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateCamera(camera);
    }
  }, [camera]);

  /**
   * Add combat event
   */
  const addCombatEvent = useCallback((event: CombatEvent) => {
    if (managerRef.current) {
      managerRef.current.addCombatEvent(event);
    }
  }, []);

  /**
   * Add custom animation
   */
  const addAnimation = useCallback((animation: Animation) => {
    if (managerRef.current) {
      managerRef.current.addAnimation(animation);
    }
  }, []);

  /**
   * Clear all animations
   */
  const clearAnimations = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.clearAnimations();
    }
  }, []);

  /**
   * Start animations
   */
  const start = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.start();
    }
  }, []);

  /**
   * Stop animations
   */
  const stop = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.stop();
    }
  }, []);

  /**
   * Get active animation count
   */
  const getActiveCount = useCallback(() => {
    return managerRef.current?.getActiveCount() || 0;
  }, []);

  /**
   * Get current FPS
   */
  const getFps = useCallback(() => {
    return managerRef.current?.getFps() || 0;
  }, []);

  /**
   * Update camera
   */
  const updateCamera = useCallback((newCamera: Camera) => {
    if (managerRef.current) {
      managerRef.current.updateCamera(newCamera);
    }
  }, []);

  return {
    addCombatEvent,
    addAnimation,
    clearAnimations,
    start,
    stop,
    getActiveCount,
    getFps,
    updateCamera
  };
}

export default useCombatAnimations;
