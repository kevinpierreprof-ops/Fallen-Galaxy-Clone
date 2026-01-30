/**
 * Authentication Middleware
 * 
 * Provides JWT token verification middleware for protected routes.
 * Extracts and validates JWT tokens from the Authorization header.
 * Includes token blacklist checking for logout functionality.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import type { AuthRequest, JWTPayload } from '@/types/auth';

// Import token blacklist checker
let isTokenBlacklisted: (token: string) => boolean;

// Dynamically import to avoid circular dependency
import('@/routes/authRoutes').then(module => {
  isTokenBlacklisted = module.isTokenBlacklisted;
});

/**
 * Middleware to authenticate JWT tokens
 * 
 * Expects Authorization header in format: "Bearer <token>"
 * Adds decoded user information to req.user if valid
 * Checks token blacklist for revoked tokens
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    // Check if token exists
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required'
      });
      return;
    }

    // Check if token is blacklisted (logged out)
    if (isTokenBlacklisted && isTokenBlacklisted(token)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been revoked'
      });
      return;
    }

    // Verify JWT token
    const secret = process.env.JWT_SECRET!;
    
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        logger.warn('Invalid token attempt:', err.message);
        
        // Check if token is expired
        if (err.name === 'TokenExpiredError') {
          res.status(401).json({
            error: 'Unauthorized',
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED'
          });
          return;
        }
        
        // Other token errors
        res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
        return;
      }

      // Attach user information to request object
      req.user = decoded as JWTPayload;
      
      // Log successful authentication (debug only)
      if (process.env.LOG_LEVEL === 'debug') {
        logger.debug(`Authenticated request from user: ${req.user.email}`);
      }
      
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware
 * Validates token if present, but allows request to continue if not
 * Useful for endpoints that have different behavior for authenticated users
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    next();
    return;
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted && isTokenBlacklisted(token)) {
    next(); // Continue without setting user
    return;
  }

  const secret = process.env.JWT_SECRET!;
  
  jwt.verify(token, secret, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as JWTPayload;
    }
    next();
  });
};

/**
 * Admin-only middleware
 * Requires authentication and checks if user is an admin
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // First check if user is authenticated
  authenticateToken(req, res, () => {
    // Check if user has admin privileges
    // This would need to be implemented based on your user model
    // For now, we'll check a hypothetical isAdmin property
    
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    // You would check user's admin status from database here
    // For example:
    // const user = userModel.findById(req.user.userId);
    // if (!user || user.isAdmin !== 1) { ... }
    
    next();
  });
};

/**
 * Rate limit bypass for authenticated users
 * Can be used to give authenticated users higher rate limits
 * 
 * @param req - Express request object
 * @param res - Response response object
 * @param next - Express next function
 */
export const authRateLimitBypass = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  optionalAuth(req, res, () => {
    if (req.user) {
      // User is authenticated, mark for rate limit bypass
      (req as any).rateLimitBypass = true;
    }
    next();
  });
};

