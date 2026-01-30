/**
 * Rate Limiter Middleware
 * 
 * Implements rate limiting to prevent abuse and DDoS attacks.
 * Limits the number of requests per IP address within a time window.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests per window
}

/**
 * Request tracking for each IP
 */
interface RequestTracker {
  count: number;
  resetTime: number;
}

// Store request counts per IP address
const requestTrackers = new Map<string, RequestTracker>();

/**
 * Default rate limit configuration
 * 100 requests per 15 minutes per IP
 */
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
};

/**
 * Rate limiter middleware factory
 * 
 * @param config - Optional rate limit configuration
 * @returns Express middleware function
 */
export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig: RateLimitConfig = {
    ...defaultConfig,
    ...config
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Get or create tracker for this IP
    let tracker = requestTrackers.get(clientIp);

    if (!tracker || now > tracker.resetTime) {
      // Create new tracker or reset expired one
      tracker = {
        count: 0,
        resetTime: now + finalConfig.windowMs
      };
      requestTrackers.set(clientIp, tracker);
    }

    // Increment request count
    tracker.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, finalConfig.maxRequests - tracker.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(tracker.resetTime).toISOString());

    // Check if rate limit exceeded
    if (tracker.count > finalConfig.maxRequests) {
      logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((tracker.resetTime - now) / 1000)
      });
      return;
    }

    next();
  };
};

/**
 * Default rate limiter instance
 */
export const rateLimiter = createRateLimiter();

/**
 * Cleanup expired trackers periodically
 * Runs every 10 minutes
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [ip, tracker] of requestTrackers.entries()) {
    if (now > tracker.resetTime + 60000) { // Keep for 1 minute after reset
      requestTrackers.delete(ip);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug(`Cleaned ${cleaned} expired rate limit trackers`);
  }
}, 10 * 60 * 1000); // 10 minutes
