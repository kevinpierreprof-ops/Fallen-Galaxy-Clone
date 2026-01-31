/**
 * Authentication Routes Tests
 * 
 * Tests for authentication endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../server';
import { userModel } from '../../../database/models/UserModel';
import { initializeDatabase, shutdownDatabase } from '../../../database';

describe('Authentication Routes', () => {
  beforeEach(async () => {
    // Initialize in-memory database for testing
    process.env.DATABASE_PATH = ':memory:';
    await initializeDatabase();
  });

  afterEach(() => {
    shutdownDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject registration with duplicate email', async () => {
      // Create first user
      await userModel.create({
        username: 'user1',
        email: 'test@example.com',
        password: 'Test@1234'
      });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Conflict');
    });

    it('should reject registration with duplicate username', async () => {
      // Create first user
      await userModel.create({
        username: 'testuser',
        email: 'test1@example.com',
        password: 'Test@1234'
      });

      // Try to register with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Conflict');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Test@1234'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await userModel.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@1234'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPass@123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication Failed');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication Failed');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test@1234'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('GET /api/auth/me', () => {
    let token: string;

    beforeEach(async () => {
      // Register and get token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      token = response.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden');
    });
  });

  describe('POST /api/auth/logout', () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      token = response.body.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should reject subsequent requests with logged out token', async () => {
      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Try to use token again
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token has been revoked');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let token: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      token = response.body.accessToken;
    });

    it('should change password with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'NewPass@5678'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should reject password change with wrong current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPass@123',
          newPassword: 'NewPass@5678'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication Failed');
    });

    it('should reject password change with weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Test@1234',
          newPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });
});
