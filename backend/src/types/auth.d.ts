/**
 * Authentication Type Definitions
 * 
 * TypeScript interfaces for authentication-related data structures
 */

import { Request } from 'express';

/**
 * JWT Token Payload
 * Data stored in the JWT token
 */
export interface JWTPayload {
  userId: string;
  email: string;
  type?: 'access' | 'refresh';
  iat?: number;  // Issued at
  exp?: number;  // Expiration time
}

/**
 * Authenticated Request
 * Extends Express Request with user information
 */
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * User Registration Data
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * User Login Data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Password Change Data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Token Refresh Data
 */
export interface RefreshTokenData {
  refreshToken: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date | string;
    lastLogin?: Date | string;
    isActive?: boolean;
    isAdmin?: boolean;
  };
  accessToken: string;
  refreshToken?: string;
}

/**
 * Token Response
 */
export interface TokenResponse {
  message: string;
  accessToken: string;
}

/**
 * Password Strength Requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
}

/**
 * Default password requirements
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&'
};

