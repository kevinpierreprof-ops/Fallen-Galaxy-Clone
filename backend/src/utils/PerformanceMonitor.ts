/**
 * Performance Monitor Utility
 * 
 * Advanced performance monitoring for game tick manager
 */

import { EventEmitter } from 'events';
import { logger } from '@/utils/logger';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  timestamp: number;
  tickDuration: number;
  ticksPerSecond: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  eventLoopLag: number;
  gcMetrics?: {
    collections: number;
    duration: number;
  };
}

/**
 * Performance Monitor
 */
export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private lastTickTime: number = 0;
  private tickTimes: number[] = [];
  private eventLoopStart: number = 0;
  
  private readonly maxMetrics: number = 1000;

  constructor() {
    super();
    this.startEventLoopMonitoring();
  }

  /**
   * Record tick performance
   */
  public recordTick(tickDuration: number): void {
    const now = Date.now();
    
    // Calculate ticks per second
    this.tickTimes.push(now);
    this.tickTimes = this.tickTimes.filter(t => now - t < 1000);
    const ticksPerSecond = this.tickTimes.length;

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryUsage = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    };

    // Record metrics
    const metric: PerformanceMetrics = {
      timestamp: now,
      tickDuration,
      ticksPerSecond,
      memoryUsage,
      eventLoopLag: this.getEventLoopLag()
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.lastTickTime = now;

    // Check for performance issues
    this.checkPerformanceIssues(metric);

    this.emit('metrics', metric);
  }

  /**
   * Get average tick duration
   */
  public getAverageTickDuration(samples: number = 60): number {
    const recentMetrics = this.metrics.slice(-samples);
    if (recentMetrics.length === 0) return 0;

    const total = recentMetrics.reduce((sum, m) => sum + m.tickDuration, 0);
    return total / recentMetrics.length;
  }

  /**
   * Get average TPS (Ticks Per Second)
   */
  public getAverageTPS(samples: number = 10): number {
    const recentMetrics = this.metrics.slice(-samples);
    if (recentMetrics.length === 0) return 0;

    const total = recentMetrics.reduce((sum, m) => sum + m.ticksPerSecond, 0);
    return total / recentMetrics.length;
  }

  /**
   * Get current memory usage
   */
  public getCurrentMemoryUsage(): PerformanceMetrics['memoryUsage'] | null {
    const latest = this.metrics[this.metrics.length - 1];
    return latest?.memoryUsage || null;
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    avgTickDuration: number;
    avgTPS: number;
    avgEventLoopLag: number;
    memoryUsage: PerformanceMetrics['memoryUsage'] | null;
    issuesDetected: number;
  } {
    const recentMetrics = this.metrics.slice(-60);
    
    const avgEventLoopLag = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.eventLoopLag, 0) / recentMetrics.length
      : 0;

    return {
      avgTickDuration: this.getAverageTickDuration(),
      avgTPS: this.getAverageTPS(),
      avgEventLoopLag,
      memoryUsage: this.getCurrentMemoryUsage(),
      issuesDetected: this.countIssues(recentMetrics)
    };
  }

  /**
   * Start event loop monitoring
   */
  private startEventLoopMonitoring(): void {
    this.eventLoopStart = Date.now();
    
    setImmediate(() => {
      this.startEventLoopMonitoring();
    });
  }

  /**
   * Get event loop lag
   */
  private getEventLoopLag(): number {
    const now = Date.now();
    const lag = now - this.eventLoopStart;
    this.eventLoopStart = now;
    return lag;
  }

  /**
   * Check for performance issues
   */
  private checkPerformanceIssues(metric: PerformanceMetrics): void {
    // Slow tick
    if (metric.tickDuration > 500) {
      logger.warn('Slow tick detected', {
        duration: metric.tickDuration,
        threshold: 500
      });
      this.emit('slowTick', metric);
    }

    // High memory usage
    if (metric.memoryUsage.heapUsed > 500) {
      logger.warn('High memory usage detected', {
        heapUsed: metric.memoryUsage.heapUsed,
        threshold: 500
      });
      this.emit('highMemory', metric);
    }

    // Event loop lag
    if (metric.eventLoopLag > 100) {
      logger.warn('Event loop lag detected', {
        lag: metric.eventLoopLag,
        threshold: 100
      });
      this.emit('eventLoopLag', metric);
    }

    // Low TPS
    if (metric.ticksPerSecond < 0.5) {
      logger.warn('Low TPS detected', {
        tps: metric.ticksPerSecond,
        threshold: 0.5
      });
      this.emit('lowTPS', metric);
    }
  }

  /**
   * Count performance issues
   */
  private countIssues(metrics: PerformanceMetrics[]): number {
    return metrics.filter(m =>
      m.tickDuration > 500 ||
      m.memoryUsage.heapUsed > 500 ||
      m.eventLoopLag > 100 ||
      m.ticksPerSecond < 0.5
    ).length;
  }

  /**
   * Export metrics for analysis
   */
  public exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.tickTimes = [];
  }
}

export default PerformanceMonitor;
