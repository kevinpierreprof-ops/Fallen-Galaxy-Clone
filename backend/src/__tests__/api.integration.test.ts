/**
 * Integration Tests - Backend API
 * 
 * Tests all API endpoints for the Space Strategy Game
 */

import request from 'supertest';
import { app, httpServer, io } from '../server';
import { getDatabase, initializeDatabase, shutdownDatabase } from '../database';

// Test user credentials
const testUser = {
  email: 'test@test.com',
  username: 'testplayer',
  password: 'Test123!@#'
};

let authToken: string;
let userId: string;
let planetId: string;

describe('Ã°Å¸Â§Âª Space Strategy Game - API Integration Tests', () => {
  
  // ============================================================================
  // Setup & Teardown
  // ============================================================================
  
  beforeAll(async () => {
    // Initialize database
    await initializeDatabase();
    console.log('Ã¢Å“â€¦ Database initialized for tests');
  });

  afterAll(async () => {
    // Cleanup
    shutdownDatabase();
    httpServer.close();
    io.close();
    console.log('Ã¢Å“â€¦ Test cleanup completed');
  });

  // ============================================================================
  // Authentication Tests
  // ============================================================================

  describe('Ã°Å¸â€Â Authentication', () => {
    
    test('POST /api/auth/register - Should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);

      // Save for later tests
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('POST /api/auth/login - Should login existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    test('GET /api/auth/me - Should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.email).toBe(testUser.email);
    });

    test('POST /api/auth/login - Should fail with wrong password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  // ============================================================================
  // Game Stats Tests
  // ============================================================================

  describe('Ã°Å¸â€œÅ  Game Stats', () => {
    
    test('GET /api/game/stats - Should return game statistics', async () => {
      const response = await request(app)
        .get('/api/game/stats')
        .expect(200);

      expect(response.body).toHaveProperty('activePlayers');
      expect(response.body).toHaveProperty('activeGames');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /api/game/players - Should return list of players', async () => {
      const response = await request(app)
        .get('/api/game/players')
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('players');
      expect(Array.isArray(response.body.players)).toBe(true);
    });
  });

  // ============================================================================
  // Planets Tests
  // ============================================================================

  describe('Ã°Å¸ÂªÂ Planets', () => {
    
    test('GET /api/game/planets - Should return list of all planets', async () => {
      const response = await request(app)
        .get('/api/game/planets')
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('planets');
      expect(Array.isArray(response.body.planets)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);

      // Save first planet ID for later tests
      if (response.body.planets.length > 0) {
        planetId = response.body.planets[0].id;
      }
    });

    test('GET /api/game/planets/:id - Should return planet details', async () => {
      const response = await request(app)
        .get(`/api/game/planets/${planetId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', planetId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('position');
      expect(response.body).toHaveProperty('resources');
    });

    test('GET /api/game/planets/invalid-id - Should return 404', async () => {
      await request(app)
        .get('/api/game/planets/invalid-id-123')
        .expect(404);
    });

    test('POST /api/game/planets/:id/colonize - Should colonize a planet (authenticated)', async () => {
      // Find a neutral planet
      const planetsResponse = await request(app)
        .get('/api/game/planets')
        .expect(200);

      const neutralPlanet = planetsResponse.body.planets.find(
        (p: any) => !p.ownerId
      );

      if (!neutralPlanet) {
        console.log('Ã¢Å¡Â Ã¯Â¸Â No neutral planet available for colonization test');
        return;
      }

      const response = await request(app)
        .post(`/api/game/planets/${neutralPlanet.id}/colonize`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.planet.ownerId).toBe(userId);
    });

    test('POST /api/game/planets/:id/colonize - Should fail without auth', async () => {
      await request(app)
        .post(`/api/game/planets/${planetId}/colonize`)
        .expect(401);
    });

    test('POST /api/game/planets/:id/colonize - Should fail if already colonized', async () => {
      // Try to colonize the same planet again
      const planetsResponse = await request(app)
        .get('/api/game/planets')
        .expect(200);

      const colonizedPlanet = planetsResponse.body.planets.find(
        (p: any) => p.ownerId === userId
      );

      if (colonizedPlanet) {
        await request(app)
          .post(`/api/game/planets/${colonizedPlanet.id}/colonize`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);
      }
    });
  });

  // ============================================================================
  // Resources Tests
  // ============================================================================

  describe('Ã°Å¸â€™Å½ Resources', () => {
    
    test('GET /api/game/resources - Should return player resources (authenticated)', async () => {
      const response = await request(app)
        .get('/api/game/resources')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('minerals');
      expect(response.body).toHaveProperty('energy');
      expect(response.body).toHaveProperty('credits');
      expect(typeof response.body.minerals).toBe('number');
    });

    test('GET /api/game/resources - Should fail without auth', async () => {
      await request(app)
        .get('/api/game/resources')
        .expect(401);
    });
  });

  // ============================================================================
  // Buildings Tests
  // ============================================================================

  describe('Ã°Å¸Ââ€”Ã¯Â¸Â Buildings', () => {
    
    test('GET /api/planets/:id/buildings - Should return buildings on planet', async () => {
      // Get a colonized planet
      const planetsResponse = await request(app)
        .get('/api/game/planets')
        .expect(200);

      const myPlanet = planetsResponse.body.planets.find(
        (p: any) => p.ownerId === userId
      );

      if (!myPlanet) {
        console.log('Ã¢Å¡Â Ã¯Â¸Â No colonized planet for building test');
        return;
      }

      const response = await request(app)
        .get(`/api/planets/${myPlanet.id}/buildings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.buildings)).toBe(true);
    });

    test('POST /api/planets/:id/buildings - Should construct a building', async () => {
      const planetsResponse = await request(app)
        .get('/api/game/planets')
        .expect(200);

      const myPlanet = planetsResponse.body.planets.find(
        (p: any) => p.ownerId === userId
      );

      if (!myPlanet) {
        console.log('Ã¢Å¡Â Ã¯Â¸Â No colonized planet for building construction');
        return;
      }

      const response = await request(app)
        .post(`/api/planets/${myPlanet.id}/buildings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          buildingType: 'MINERAL_MINE',
          quantity: 1
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  // ============================================================================
  // Fleets Tests
  // ============================================================================

  describe('Ã°Å¸Å¡â‚¬ Fleets', () => {
    
    test('GET /api/fleets - Should return player fleets', async () => {
      const response = await request(app)
        .get('/api/fleets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.fleets)).toBe(true);
    });

    test('POST /api/fleets - Should create a new fleet', async () => {
      const response = await request(app)
        .post('/api/fleets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Fleet Alpha',
          shipIds: []
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.fleet.name).toBe('Test Fleet Alpha');
    });
  });

  // ============================================================================
  // Chat/Messaging Tests
  // ============================================================================

  describe('Ã°Å¸â€™Â¬ Chat/Messaging', () => {
    
    test('POST /api/messages - Should send a message', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          channelId: 'global',
          content: 'Hello from automated test!'
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message.content).toBe('Hello from automated test!');
    });

    test('GET /api/messages - Should get message history', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ channelId: 'global', limit: 50 })
        .expect(200);

      expect(Array.isArray(response.body.messages)).toBe(true);
      expect(response.body.messages.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Alliances Tests
  // ============================================================================

  describe('Ã°Å¸Â¤Â Alliances', () => {
    
    test('GET /api/alliances - Should list all alliances', async () => {
      const response = await request(app)
        .get('/api/alliances')
        .expect(200);

      expect(Array.isArray(response.body.alliances)).toBe(true);
    });

    test('POST /api/alliances - Should create a new alliance', async () => {
      const response = await request(app)
        .post('/api/alliances')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Alliance',
          description: 'An alliance created by automated test'
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.alliance.name).toBe('Test Alliance');
    });
  });

  // ============================================================================
  // Health Check Tests
  // ============================================================================

  describe('Ã°Å¸ÂÂ¥ Health Checks', () => {
    
    test('GET /health - Should return simple health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /api/health - Should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Ã¢ÂÅ’ Error Handling', () => {
    
    test('GET /api/nonexistent - Should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('POST with invalid JSON - Should return 400', async () => {
      await request(app)
        .post('/api/auth/login')
        .send('invalid json{')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });
});
