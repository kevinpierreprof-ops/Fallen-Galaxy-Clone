import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { Player, Planet, Ship, GameState } from '@shared/types/game';
import { BuildingType } from '@shared/types/buildingSystem';

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
  buildBuilding: (planetId: string, buildingType: BuildingType) => void;
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
    });

    socket.on('player:joined', (data) => {
      console.log('Joined game', data);
    });

    socket.on('game:update', (gameState: GameState) => {
      get().updateGameState(gameState);
    });

    socket.on('planet:colonized', (data: { planetId: string; ownerId: string; planet: Planet }) => {
      console.log('Planet colonized:', data);
      // Update planets in state
      set((state) => ({
        planets: state.planets.map((p) =>
          p.id === data.planetId ? { ...p, ownerId: data.ownerId } : p
        ),
      }));
    });

    socket.on('colonize:success', (data: { planet: Planet; resources: any }) => {
      console.log('Colonization successful!', data);
      // Update player resources
      set((state) => ({
        player: state.player ? { ...state.player, resources: data.resources } : null,
      }));
    });

    socket.on('building:started', (data: any) => {
      console.log('Building construction started:', data);
      // TODO: Update construction queue
    });

    socket.on('building:completed', (data: any) => {
      console.log('Building completed:', data);
      // TODO: Update planet buildings
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      alert(error.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      set({ connected: false });
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

  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),

  colonizePlanet: (planetId: string) => {
    const { socket } = get();
    if (!socket) {
      console.error('No socket connection');
      return;
    }

    console.log('Attempting to colonize planet:', planetId);
    socket.emit('planet:colonize', { planetId });
  },

  buildBuilding: (planetId: string, buildingType: BuildingType) => {
    const { socket } = get();
    if (!socket) {
      console.error('No socket connection');
      return;
    }

    console.log('Attempting to build building:', buildingType, 'on planet:', planetId);
    socket.emit('building:construct', { planetId, buildingType });
  }
}));
