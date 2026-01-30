/**
 * Authentication Utilities
 * 
 * Helper functions for authentication and security
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '@/utils/logger';
import type { JWTPayload, PasswordRequirements } from '@/types/auth';

/**
 * Password strength validator
 */
export class PasswordValidator {
  private requirements: PasswordRequirements;

  constructor(requirements?: Partial<PasswordRequirements>) {
    this.requirements = {
      minLength: requirements?.minLength ?? 8,
      requireUppercase: requirements?.requireUppercase ?? true,
      requireLowercase: requirements?.requireLowercase ?? true,
      requireNumbers: requirements?.requireNumbers ?? true,
      requireSpecialChars: requirements?.requireSpecialChars ?? true,
      specialChars: requirements?.specialChars ?? '@$!%*?&'
    };
  }

  /**
   * Validate password against requirements
   */
  validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.requirements.minLength) {
      errors.push(`Password must be at least ${this.requirements.minLength} characters long`);
    }

    if (this.requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.requirements.requireSpecialChars) {
      const specialCharsRegex = new RegExp(`[${this.requirements.specialChars}]`);
      if (!specialCharsRegex.test(password)) {
        errors.push(`Password must contain at least one special character (${this.requirements.specialChars})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate password strength (0-100)
   */
  calculateStrength(password: string): number {
    let strength = 0;

    // Length contribution (up to 40 points)
    strength += Math.min(40, password.length * 2);

    // Character variety (up to 60 points)
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/\d/.test(password)) strength += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
    if (password.length >= 12) strength += 10;
    if (/[a-z].*[a-z].*[a-z]/.test(password) && /[A-Z].*[A-Z]/.test(password)) strength += 5;

    return Math.min(100, strength);
  }

  /**
   * Check if password is commonly used
   */
  isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
      'baseball', '111111', 'iloveyou', 'master', 'sunshine',
      'ashley', 'bailey', 'passw0rd', 'shadow', '123123'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }
}

/**
 * Token utilities
 */
export class TokenUtils {
  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Decode JWT token without verification
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch (error) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    return decoded.exp * 1000 < Date.now();
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }

  /**
   * Get time until token expiration (in milliseconds)
   */
  static getTimeUntilExpiration(token: string): number | null {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return null;
    }

    return expiration.getTime() - Date.now();
  }
}

/**
 * Rate limiting for authentication attempts
 */
export class AuthRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }>;
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.attempts = new Map();
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Record failed login attempt
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      record.count++;
    }
  }

  /**
   * Check if identifier is rate limited
   */
  isRateLimited(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) {
      return false;
    }

    const now = Date.now();
    if (now > record.resetTime) {
      this.attempts.delete(identifier);
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) {
      return this.maxAttempts;
    }

    const now = Date.now();
    if (now > record.resetTime) {
      this.attempts.delete(identifier);
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  /**
   * Reset attempts for identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

/**
 * Email validation
 */
export class EmailValidator {
  /**
   * Validate email format
   */
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate email domain
   */
  static hasValidDomain(email: string): boolean {
    if (!this.isValid(email)) {
      return false;
    }

    const domain = email.split('@')[1];
    // Basic domain validation
    return domain.includes('.') && domain.length > 3;
  }

  /**
   * Check if email is from a disposable email provider
   */
  static isDisposable(email: string): boolean {
    const disposableDomains = [
      'tempmail.com', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.includes(domain);
  }
}

/**
 * Session utilities
 */
export class SessionUtils {
  /**
   * Generate session ID
   */
  static generateSessionId(): string {
    return TokenUtils.generateSecureToken(32);
  }

  /**
   * Create session data
   */
  static createSession(userId: string, metadata?: any): any {
    return {
      sessionId: this.generateSessionId(),
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      metadata: metadata || {}
    };
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(session: any, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    const lastActivity = new Date(session.lastActivity).getTime();
    return Date.now() - lastActivity > maxAge;
  }
}

// Export singleton instances
export const passwordValidator = new PasswordValidator();
export const authRateLimiter = new AuthRateLimiter();
