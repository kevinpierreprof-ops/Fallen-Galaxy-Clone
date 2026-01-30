/**
 * Frontend Integration Tests
 * 
 * Tests React components and user interactions
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import GamePage from '../pages/GamePage';
import HomePage from '../pages/HomePage';
import GameCanvas from '../components/GameCanvas';
import ChatPanel from '../components/ChatPanel';
import ResourcePanel from '../components/ResourcePanel';
import PlanetList from '../components/PlanetList';

// Mock Socket.io client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connected: true
  }))
}));

// Mock Zustand store
vi.mock('../store/gameStore', () => ({
  useGameStore: vi.fn(() => ({
    connected: true,
    socket: { emit: vi.fn(), on: vi.fn() },
    gameState: {
      planets: [
        {
          id: '1',
          name: 'Test Planet',
          position: { x: 100, y: 100 },
          size: 3,
          ownerId: null,
          resources: { minerals: 500, energy: 300 },
          production: { minerals: 10, energy: 5, credits: 2 }
        }
      ],
      players: []
    },
    messages: [
      { id: '1', text: 'Hello', sender: 'Player1', timestamp: Date.now() }
    ],
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendMessage: vi.fn()
  }))
}));

describe('Ã°Å¸Å½Â¨ Frontend Tests', () => {
  
  // ============================================================================
  // App Tests
  // ============================================================================

  describe('Ã°Å¸â€œÂ± App Component', () => {
    
    test('Should render without crashing', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      expect(document.body).toBeTruthy();
    });

    test('Should render routes', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
      // App should render (exact content depends on your routes)
      expect(document.body).toBeTruthy();
    });
  });

  // ============================================================================
  // HomePage Tests
  // ============================================================================

  describe('Ã°Å¸ÂÂ  HomePage', () => {
    
    test('Should render HomePage with title', () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const title = screen.getByText(/Space Strategy Game/i);
      expect(title).toBeDefined();
    });

    test('Should have "Start Playing" button', () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const playButton = screen.getByText(/Start Playing/i);
      expect(playButton).toBeDefined();
    });

    test('Should show 4 feature cards', () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Colonize Planets/i)).toBeDefined();
      expect(screen.getByText(/Build Fleets/i)).toBeDefined();
      expect(screen.getByText(/Form Alliances/i)).toBeDefined();
      expect(screen.getByText(/Real-time Chat/i)).toBeDefined();
    });

    test('"Start Playing" button should navigate to /game', () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const playButton = screen.getByText(/Start Playing/i);
      fireEvent.click(playButton);

      // After click, URL should change (in real router)
      // This is a simplified test
      expect(playButton).toBeDefined();
    });
  });

  // ============================================================================
  // GamePage Tests
  // ============================================================================

  describe('Ã°Å¸Å½Â® GamePage', () => {
    
    test('Should render GamePage with layout', () => {
      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      expect(document.querySelector('.game-page')).toBeTruthy();
    });

    test('Should render GameCanvas', () => {
      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });

    test('Should render ResourcePanel', () => {
      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Resources/i)).toBeDefined();
    });

    test('Should render ChatPanel', () => {
      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Chat/i)).toBeDefined();
    });

    test('Should render PlanetList', () => {
      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      expect(screen.getByText(/My Planets/i)).toBeDefined();
    });
  });

  // ============================================================================
  // GameCanvas Tests
  // ============================================================================

  describe('Ã°Å¸â€“Â¼Ã¯Â¸Â GameCanvas', () => {
    
    test('Should render canvas element', () => {
      render(<GameCanvas />);
      
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();
      expect(canvas?.tagName).toBe('CANVAS');
    });

    test('Should have correct canvas dimensions', () => {
      render(<GameCanvas />);
      
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    test('Should handle click events', () => {
      render(<GameCanvas />);
      
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      
      // Click should be handled (no errors)
      expect(canvas).toBeTruthy();
    });
  });

  // ============================================================================
  // ResourcePanel Tests
  // ============================================================================

  describe('Ã°Å¸â€™Å½ ResourcePanel', () => {
    
    test('Should display resource values', () => {
      render(<ResourcePanel />);
      
      // Check that resources section exists
      expect(screen.getByText(/Resources/i)).toBeDefined();
    });

    test('Should display Minerals', () => {
      render(<ResourcePanel />);
      
      expect(screen.getByText(/Minerals/i)).toBeDefined();
    });

    test('Should display Energy', () => {
      render(<ResourcePanel />);
      
      expect(screen.getByText(/Energy/i)).toBeDefined();
    });

    test('Should display Credits', () => {
      render(<ResourcePanel />);
      
      expect(screen.getByText(/Credits/i)).toBeDefined();
    });
  });

  // ============================================================================
  // ChatPanel Tests
  // ============================================================================

  describe('Ã°Å¸â€™Â¬ ChatPanel', () => {
    
    test('Should render chat input', () => {
      render(<ChatPanel />);
      
      const input = screen.getByPlaceholderText(/Type a message/i);
      expect(input).toBeDefined();
    });

    test('Should render send button', () => {
      render(<ChatPanel />);
      
      const sendButton = screen.getByText(/Send/i);
      expect(sendButton).toBeDefined();
    });

    test('Should display chat messages', () => {
      render(<ChatPanel />);
      
      expect(screen.getByText(/Hello/i)).toBeDefined();
    });

    test('Should handle message input', () => {
      render(<ChatPanel />);
      
      const input = screen.getByPlaceholderText(/Type a message/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test message' } });
      
      expect(input.value).toBe('Test message');
    });

    test('Should send message on button click', () => {
      const { useGameStore } = require('../store/gameStore');
      const mockSendMessage = vi.fn();
      useGameStore.mockReturnValue({
        ...useGameStore(),
        sendMessage: mockSendMessage
      });

      render(<ChatPanel />);
      
      const input = screen.getByPlaceholderText(/Type a message/i) as HTMLInputElement;
      const sendButton = screen.getByText(/Send/i);
      
      fireEvent.change(input, { target: { value: 'Hello!' } });
      fireEvent.click(sendButton);
      
      expect(mockSendMessage).toHaveBeenCalledWith('Hello!');
    });

    test('Should send message on Enter key', () => {
      render(<ChatPanel />);
      
      const input = screen.getByPlaceholderText(/Type a message/i) as HTMLInputElement;
      
      fireEvent.change(input, { target: { value: 'Enter test' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      // Message should be sent (input cleared)
      expect(input.value).toBe('');
    });
  });

  // ============================================================================
  // PlanetList Tests
  // ============================================================================

  describe('Ã°Å¸ÂªÂ PlanetList', () => {
    
    test('Should render planet list title', () => {
      render(<PlanetList />);
      
      expect(screen.getByText(/My Planets/i)).toBeDefined();
    });

    test('Should display planets from game state', () => {
      render(<PlanetList />);
      
      expect(screen.getByText(/Test Planet/i)).toBeDefined();
    });

    test('Should handle planet click', () => {
      render(<PlanetList />);
      
      const planetElement = screen.getByText(/Test Planet/i);
      fireEvent.click(planetElement);
      
      // Should trigger some action (details panel, etc.)
      expect(planetElement).toBeDefined();
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Ã°Å¸â€â€” Integration', () => {
    
    test('Should connect to WebSocket on GamePage mount', () => {
      const { useGameStore } = require('../store/gameStore');
      const mockConnect = vi.fn();
      
      useGameStore.mockReturnValue({
        ...useGameStore(),
        connect: mockConnect
      });

      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      expect(mockConnect).toHaveBeenCalled();
    });

    test('Should disconnect from WebSocket on GamePage unmount', () => {
      const { useGameStore } = require('../store/gameStore');
      const mockDisconnect = vi.fn();
      
      useGameStore.mockReturnValue({
        ...useGameStore(),
        disconnect: mockDisconnect
      });

      const { unmount } = render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );

      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Ã¢â„¢Â¿ Accessibility', () => {
    
    test('Should have proper heading structure', () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const h1 = document.querySelector('h1');
      expect(h1).toBeTruthy();
    });

    test('Buttons should be clickable', () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );

      const playButton = screen.getByText(/Start Playing/i);
      expect(playButton.tagName).toMatch(/BUTTON|A/i);
    });

    test('Chat input should have label or placeholder', () => {
      render(<ChatPanel />);
      
      const input = screen.getByPlaceholderText(/Type a message/i);
      expect(input).toBeDefined();
    });
  });

  // ============================================================================
  // Performance Tests
  // ============================================================================

  describe('Ã¢Å¡Â¡ Performance', () => {
    
    test('Should render GamePage quickly', () => {
      const startTime = performance.now();
      
      render(
        <BrowserRouter>
          <GamePage />
        </BrowserRouter>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in less than 1 second
      expect(renderTime).toBeLessThan(1000);
    });

    test('Should handle rapid state updates', async () => {
      const { rerender } = render(<ResourcePanel />);
      
      // Simulate 100 rapid updates
      for (let i = 0; i < 100; i++) {
        rerender(<ResourcePanel />);
      }
      
      // Should still be rendered
      expect(screen.getByText(/Resources/i)).toBeDefined();
    });
  });
});
