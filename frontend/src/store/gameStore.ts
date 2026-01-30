import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { Player, Planet, Ship, GameState } from '@shared/types/game';
import { getPlanets } from '../services/planet';

interface GameStore {
  socket: Socket | null;
  connected: boolean;
  player: Player | null;
  planets: Planet[];
  ships: Ship[];
  selectedPlanet: Planet | null;
  
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  updateGameState: (state: GameState) => void;
  setSelectedPlanet: (planet: Planet | null) => void;
  colonizePlanet: (planetId: string) => void;
  updatePlanetsList: (planets: Planet[]) => void;
  fetchPlanets: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  connected: false,
  player: null,
  planets: [],
  ships: [],
  selectedPlanet: null,

  connect: () => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to server');
      set({ connected: true, socket });

      // Join game
      socket.emit('player:join', {
        name: `Player_${Math.random().toString(36).substring(7)}`
      });

      // Fetch initial planets list
      get().fetchPlanets();
    });

    socket.on('player:joined', (data) => {
      console.log('Joined game', data);
    });

    socket.on('game:update', (gameState: GameState) => {
      get().updateGameState(gameState);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ connected: false });
    });

    // Listen for colonization success
    socket.on('colonize:success', (data: { success: boolean; planet: Planet; player: Partial<Player> }) => {
      console.log('Colonization successful', data);
      
      // Update planets list
      const { planets } = get();
      const updatedPlanets = planets.map(p => 
        p.id === data.planet.id ? data.planet : p
      );
      set({ planets: updatedPlanets });
      
      // Update player resources if provided
      if (data.player && data.player.resources) {
        const { player } = get();
        if (player) {
          set({ 
            player: { 
              ...player, 
              resources: data.player.resources,
              planets: data.player.planets || player.planets
            } 
          });
        }
      }
    });

    // Listen for colonization errors
    socket.on('colonize:error', (data: { success: boolean; error: string }) => {
      console.error('Colonization failed:', data.error);
      alert(`Failed to colonize planet: ${data.error}`);
    });

    // Listen for planet colonization broadcasts
    socket.on('planet:colonized', (data: { planet: Planet; playerId: string }) => {
      console.log('Planet colonized by player', data.playerId);
      
      // Update planets list
      const { planets } = get();
      const updatedPlanets = planets.map(p => 
        p.id === data.planet.id ? data.planet : p
      );
      set({ planets: updatedPlanets });
    });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  sendMessage: (message: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('chat:message', { text: message });
    }
  },

  updateGameState: (state: GameState) => {
    const { socket } = get();
    if (!socket) return;

    // Find current player
    const player = state.players.find((p) => p.id === socket.id);

    set({
      player: player || null,
      planets: state.planets,
      ships: state.ships
    });
  },

  setSelectedPlanet: (planet: Planet | null) => {
    set({ selectedPlanet: planet });
  },

  colonizePlanet: (planetId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('planet:colonize', { planetId });
    }
  },

  updatePlanetsList: (planets: Planet[]) => {
    set({ planets });
  },

  fetchPlanets: async () => {
    try {
      const response = await getPlanets();
      if (response.success && response.planets) {
        set({ planets: response.planets });
      }
    } catch (error) {
      console.error('Failed to fetch planets:', error);
    }
  }
}));
