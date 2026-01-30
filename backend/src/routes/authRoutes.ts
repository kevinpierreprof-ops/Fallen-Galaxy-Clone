/**
 * Authentication Routes
 * 
 * Handles user authentication endpoints with database integration:
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Login existing user
 * - POST /api/auth/logout - Logout current user
 * - GET /api/auth/me - Get current user profile
 * - GET /api/auth/verify - Verify JWT token
 * - POST /api/auth/refresh - Refresh JWT token
 * - POST /api/auth/change-password - Change user password
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { logger } from '@/utils/logger';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { userModel } from '@/database/models/UserModel';
import type { AuthRequest } from '@/types/auth';

const router = Router();

// ============================================================================
// TOKEN BLACKLIST (for logout functionality)
// ============================================================================

// In production, use Redis or a database table for this
const tokenBlacklist = new Set<string>();

/**
 * Add token to blacklist
 */
const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
  
  // Auto-cleanup after token expiration (7 days)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000);
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Password strength requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 100 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    'any.required': 'Password is required'
  });

/**
 * Joi schema for user registration validation
 */
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 20 characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: passwordSchema
});

/**
 * Joi schema for user login validation
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

/**
 * Joi schema for password change validation
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: passwordSchema
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.invalid': 'New password must be different from current password'
    })
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate JWT access token for authenticated user
 */
const generateAccessToken = (userId: string, email: string): string => {
  const payload = { 
    userId, 
    email,
    type: 'access'
  };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId: string, email: string): string => {
  const payload = { 
    userId, 
    email,
    type: 'refresh'
  };
  const secret = process.env.JWT_SECRET!;
  const expiresIn = '30d'; // Refresh tokens last longer
  
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Create user response object (excluding sensitive data)
 */
const createUserResponse = (user: any) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.created_at,
    lastLogin: user.last_login,
    isActive: user.is_active === 1,
    isAdmin: user.is_admin === 1
  };
};

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { username, email, password } = value;

    // Check if user already exists by email
    const existingUserByEmail = userModel.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email already exists',
        field: 'email'
      });
    }

    // Check if username is taken
    const existingUserByUsername = userModel.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'This username is already taken',
        field: 'username'
      });
    }

    // Create new user (password will be hashed in the model)
    const newUser = await userModel.create({
      username,
      email,
      password
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id, newUser.email);
    const refreshToken = generateRefreshToken(newUser.id, newUser.email);

    logger.info(`New user registered: ${username} (${email})`);

    // Send response
    res.status(201).json({
      message: 'Registration successful',
      user: createUserResponse(newUser),
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login existing user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { email, password } = value;

    // Verify user credentials
    const user = await userModel.verifyPassword(email, password);
    
    if (!user) {
      // Generic error message for security
      logger.warn(`Failed login attempt for: ${email}`);
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.is_active !== 1) {
      return res.status(403).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Update last login time
    userModel.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    logger.info(`User logged in: ${user.username} (${email})`);

    // Send response
    res.json({
      message: 'Login successful',
      user: createUserResponse(user),
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout current user (blacklist token)
 * @access  Private
 */
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    // Extract token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      // Add token to blacklist
      blacklistToken(token);
    }

    logger.info(`User logged out: ${req.user?.email}`);
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = userModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      user: createUserResponse(user)
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user profile'
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token validity
 * @access  Private
 */
router.get('/verify', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    valid: true,
    user: {
      userId: req.user?.userId,
      email: req.user?.email
    }
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Refresh token is required'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(refreshToken)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been revoked'
      });
    }

    // Verify refresh token
    const secret = process.env.JWT_SECRET!;
    jwt.verify(refreshToken, secret, (err, decoded: any) => {
      if (err) {
        logger.warn('Invalid refresh token attempt');
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid or expired refresh token'
        });
      }

      // Check token type
      if (decoded.type !== 'refresh') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid token type'
        });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.userId, decoded.email);

      res.json({
        message: 'Token refreshed successfully',
        accessToken: newAccessToken
      });
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh token'
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const { error, value } = changePasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
        field: error.details[0].path[0]
      });
    }

    const { currentPassword, newPassword } = value;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Get user
    const user = userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Verify current password
    const validUser = await userModel.verifyPassword(user.email, currentPassword);
    if (!validUser) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await userModel.update(userId, {
      password: newPassword
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Verify password before deletion
    const user = userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const validUser = await userModel.verifyPassword(user.email, password);
    if (!validUser) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Password is incorrect'
      });
    }

    // Delete user account
    userModel.delete(userId);

    // Blacklist current token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      blacklistToken(token);
    }

    logger.info(`Account deleted for user: ${user.email}`);

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
});

export default router;
export { blacklistToken, isTokenBlacklisted };

