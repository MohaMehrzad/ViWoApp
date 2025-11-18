import apiClient from './client';
import { Short, CreateShortDto, ShortsResponse } from '@/types/short';

export const shortsApi = {
  /**
   * Get shorts feed
   */
  getFeed: async (page = 1, limit = 20): Promise<ShortsResponse> => {
    const response = await apiClient.get<ShortsResponse>('/shorts', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Create a new short
   */
  create: async (data: CreateShortDto): Promise<Short> => {
    const response = await apiClient.post<Short>('/shorts', data);
    return response.data;
  },

  /**
   * Get a single short by ID
   */
  getById: async (id: string): Promise<Short> => {
    const response = await apiClient.get<Short>(`/shorts/${id}`);
    return response.data;
  },

  /**
   * Like a short
   */
  like: async (id: string): Promise<void> => {
    await apiClient.post(`/shorts/${id}/like`);
  },

  /**
   * Delete a short
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/shorts/${id}`);
  },

  /**
   * Get shorts by a specific user
   */
  getUserShorts: async (userId: string, page = 1): Promise<ShortsResponse> => {
    const response = await apiClient.get<ShortsResponse>(`/shorts/user/${userId}`, {
      params: { page, limit: 20 },
    });
    return response.data;
  },
};

