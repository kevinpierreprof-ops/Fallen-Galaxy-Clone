import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { Player, Planet, Ship, GameState } from '@shared/types/game';

interface GameStore {
  socket: Socket | null;
  connected: boolean;
  player: Player | null;
  planets: Planet[];
  ships: Ship[];
  
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  updateGameState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  connected: false,
  player: null,
  planets: [],
  ships: [],

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
  }
}));
