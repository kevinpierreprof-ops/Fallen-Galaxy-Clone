import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const gameService = {
  async getStats() {
    const response = await apiClient.get('/api/game/stats');
    return response.data;
  },

  async getHealth() {
    const response = await apiClient.get('/api/health');
    return response.data;
  }
};
