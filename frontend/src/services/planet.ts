/**
 * Planet API Service
 * 
 * Provides functions to interact with planet-related API endpoints
 */

import { apiClient } from './api';

/**
 * Get all planets in the galaxy
 */
export const getPlanets = async () => {
  const response = await apiClient.get('/api/game/planets');
  return response.data;
};

/**
 * Get detailed information about a specific planet
 */
export const getPlanet = async (id: string) => {
  const response = await apiClient.get(`/api/game/planets/${id}`);
  return response.data;
};

/**
 * Colonize a neutral planet
 */
export const colonizePlanet = async (id: string) => {
  const response = await apiClient.post(`/api/game/planets/${id}/colonize`);
  return response.data;
};
