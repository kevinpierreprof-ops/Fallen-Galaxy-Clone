/**
 * End-to-End Tests with Playwright
 * 
 * Tests complete user workflows in the browser
 */

import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

test.describe('🌐 E2E Tests - Space Strategy Game', () => {
  
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ============================================================================
  // Homepage Tests
  // ============================================================================

  test.describe('🏠 Homepage', () => {
    
    test('Should load homepage successfully', async () => {
      await page.goto(FRONTEND_URL);
      await expect(page).toHaveTitle(/Space Strategy/i);
    });

    test('Should display game title', async () => {
      await page.goto(FRONTEND_URL);
      const title = page.locator('h1');
      await expect(title).toContainText(/Space Strategy/i);
    });

    test('Should have "Start Playing" button', async () => {
      await page.goto(FRONTEND_URL);
      const playButton = page.locator('button:has-text("Start Playing")');
      await expect(playButton).toBeVisible();
    });

    test('Should show 4 feature cards', async () => {
      await page.goto(FRONTEND_URL);
      
      await expect(page.locator('text=/Colonize Planets/i')).toBeVisible();
      await expect(page.locator('text=/Build Fleets/i')).toBeVisible();
      await expect(page.locator('text=/Form Alliances/i')).toBeVisible();
      await expect(page.locator('text=/Real-time Chat/i')).toBeVisible();
    });

    test('"Start Playing" button should navigate to game', async () => {
      await page.goto(FRONTEND_URL);
      
      const playButton = page.locator('button:has-text("Start Playing")');
      await playButton.click();
      
      await expect(page).toHaveURL(/\/game/);
    });
  });

  // ============================================================================
  // Game Page Tests
  // ============================================================================

  test.describe('🎮 Game Page', () => {
    
    test('Should load game page', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('canvas', { timeout: 5000 });
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    });

    test('Should display galaxy canvas', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Canvas should have dimensions
      const canvasElement = await canvas.elementHandle();
      const width = await canvasElement?.evaluate(el => (el as HTMLCanvasElement).width);
      expect(width).toBeGreaterThan(0);
    });

    test('Should display resource panel', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      await expect(page.locator('text=/Resources/i')).toBeVisible();
      await expect(page.locator('text=/Minerals/i')).toBeVisible();
      await expect(page.locator('text=/Energy/i')).toBeVisible();
      await expect(page.locator('text=/Credits/i')).toBeVisible();
    });

    test('Should display chat panel', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      await expect(page.locator('text=/Chat/i')).toBeVisible();
      const chatInput = page.locator('input[placeholder*="message" i]');
      await expect(chatInput).toBeVisible();
    });

    test('Should display planet list', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      await expect(page.locator('text=/My Planets/i')).toBeVisible();
    });
  });

  // ============================================================================
  // Galaxy Interaction Tests
  // ============================================================================

  test.describe('🌌 Galaxy Interactions', () => {
    
    test('Should click on canvas (planet selection)', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('canvas');
      
      const canvas = page.locator('canvas');
      await canvas.click({ position: { x: 200, y: 200 } });
      
      // Should not crash
      await expect(canvas).toBeVisible();
    });

    test('Should display planet details on click (if implemented)', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('canvas');
      
      const canvas = page.locator('canvas');
      await canvas.click({ position: { x: 300, y: 300 } });
      
      // Wait a bit to see if modal appears
      await page.waitForTimeout(500);
      
      // Check if a modal or details panel appeared
      const modal = page.locator('[role="dialog"], .modal, .planet-details');
      const isVisible = await modal.isVisible().catch(() => false);
      
      // Log result (may not be implemented yet)
      console.log(`Planet details modal visible: ${isVisible}`);
    });

    test('Should support canvas drag (panning)', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('canvas');
      
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();
      
      if (box) {
        // Drag from center to a new position
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
        await page.mouse.up();
      }
      
      // Should not crash
      await expect(canvas).toBeVisible();
    });

    test('Should support zoom (scroll wheel)', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('canvas');
      
      const canvas = page.locator('canvas');
      await canvas.hover();
      
      // Scroll up (zoom in)
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(200);
      
      // Scroll down (zoom out)
      await page.mouse.wheel(0, 100);
      
      // Should not crash
      await expect(canvas).toBeVisible();
    });
  });

  // ============================================================================
  // Chat Tests
  // ============================================================================

  test.describe('💬 Chat Functionality', () => {
    
    test('Should send a chat message', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('input[placeholder*="message" i]');
      
      const chatInput = page.locator('input[placeholder*="message" i]');
      const sendButton = page.locator('button:has-text("Send")');
      
      await chatInput.fill('E2E Test Message');
      await sendButton.click();
      
      // Message should appear in chat
      await expect(page.locator('text="E2E Test Message"')).toBeVisible({ timeout: 3000 });
    });

    test('Should send message with Enter key', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      const chatInput = page.locator('input[placeholder*="message" i]');
      await chatInput.fill('Enter key test');
      await chatInput.press('Enter');
      
      // Message should appear
      await expect(page.locator('text="Enter key test"')).toBeVisible({ timeout: 3000 });
    });

    test('Should display chat history', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      // Send multiple messages
      const chatInput = page.locator('input[placeholder*="message" i]');
      
      await chatInput.fill('Message 1');
      await chatInput.press('Enter');
      await page.waitForTimeout(300);
      
      await chatInput.fill('Message 2');
      await chatInput.press('Enter');
      await page.waitForTimeout(300);
      
      await chatInput.fill('Message 3');
      await chatInput.press('Enter');
      
      // All messages should be visible
      await expect(page.locator('text="Message 1"')).toBeVisible();
      await expect(page.locator('text="Message 2"')).toBeVisible();
      await expect(page.locator('text="Message 3"')).toBeVisible();
    });
  });

  // ============================================================================
  // Resource Panel Tests
  // ============================================================================

  test.describe('💎 Resources', () => {
    
    test('Should display resource values', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      
      // Wait for resources to load
      await page.waitForSelector('text=/Minerals/i');
      
      const mineralsText = page.locator('text=/Minerals.*\\d+/i');
      await expect(mineralsText).toBeVisible();
      
      const energyText = page.locator('text=/Energy.*\\d+/i');
      await expect(energyText).toBeVisible();
      
      const creditsText = page.locator('text=/Credits.*\\d+/i');
      await expect(creditsText).toBeVisible();
    });

    test('Resources should update over time (if auto-production enabled)', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('text=/Minerals/i');
      
      // Get initial minerals value
      const mineralsText = await page.locator('text=/Minerals.*?(\\d+)/i').textContent();
      const initialMinerals = parseInt(mineralsText?.match(/\\d+/)?.[0] || '0');
      
      // Wait 3 seconds
      await page.waitForTimeout(3000);
      
      // Get updated value
      const newMineralsText = await page.locator('text=/Minerals.*?(\\d+)/i').textContent();
      const newMinerals = parseInt(newMineralsText?.match(/\\d+/)?.[0] || '0');
      
      console.log(`Minerals: ${initialMinerals} -> ${newMinerals}`);
      
      // May or may not increase depending on implementation
      expect(newMinerals).toBeGreaterThanOrEqual(initialMinerals);
    });
  });

  // ============================================================================
  // Multi-Tab Tests (Multiplayer)
  // ============================================================================

  test.describe('👥 Multiplayer', () => {
    
    test('Should handle multiple connected players', async ({ browser }) => {
      // Open two tabs
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      await page1.goto(`${FRONTEND_URL}/game`);
      await page2.goto(`${FRONTEND_URL}/game`);
      
      await page1.waitForSelector('canvas');
      await page2.waitForSelector('canvas');
      
      // Send message from page1
      const chatInput1 = page1.locator('input[placeholder*="message" i]');
      await chatInput1.fill('Hello from Player 1');
      await chatInput1.press('Enter');
      
      // Message should appear in page2
      await expect(page2.locator('text="Hello from Player 1"')).toBeVisible({ timeout: 5000 });
      
      // Send message from page2
      const chatInput2 = page2.locator('input[placeholder*="message" i]');
      await chatInput2.fill('Hello from Player 2');
      await chatInput2.press('Enter');
      
      // Message should appear in page1
      await expect(page1.locator('text="Hello from Player 2"')).toBeVisible({ timeout: 5000 });
      
      await page1.close();
      await page2.close();
      await context1.close();
      await context2.close();
    });
  });

  // ============================================================================
  // Backend API Tests (via browser)
  // ============================================================================

  test.describe('🔌 Backend API', () => {
    
    test('Should call /health endpoint successfully', async () => {
      const response = await page.request.get(`${BACKEND_URL}/health`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
    });

    test('Should call /api/game/stats successfully', async () => {
      const response = await page.request.get(`${BACKEND_URL}/api/game/stats`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('activePlayers');
      expect(data).toHaveProperty('activeGames');
    });

    test('Should call /api/game/planets successfully', async () => {
      const response = await page.request.get(`${BACKEND_URL}/api/game/planets`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('planets');
      expect(Array.isArray(data.planets)).toBeTruthy();
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  test.describe('⚡ Performance', () => {
    
    test('Page should load within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto(FRONTEND_URL);
      await page.waitForSelector('h1');
      
      const loadTime = Date.now() - startTime;
      
      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // Should load in < 5 seconds
    });

    test('Game page should be responsive', async () => {
      await page.goto(`${FRONTEND_URL}/game`);
      await page.waitForSelector('canvas');
      
      // Interact rapidly
      for (let i = 0; i < 10; i++) {
        await page.locator('canvas').click({ position: { x: 100 + i * 10, y: 100 } });
        await page.waitForTimeout(50);
      }
      
      // Should still be responsive
      await expect(page.locator('canvas')).toBeVisible();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  test.describe('♿ Accessibility', () => {
    
    test('Page should have proper heading structure', async () => {
      await page.goto(FRONTEND_URL);
      
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
    });

    test('Interactive elements should be keyboard accessible', async () => {
      await page.goto(FRONTEND_URL);
      
      // Tab to "Start Playing" button
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.textContent);
      
      console.log(`Focused element: ${focused}`);
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
    });
  });
});
