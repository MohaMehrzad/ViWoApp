import apiClient from './client';
import { User, UpdateUserDto, UserSearchResponse, ProfileStats } from '@/types/user';

export const usersApi = {
  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Get user by username
   */
  getByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/username/${username}`);
    return response.data;
  },

  /**
   * Get user profile stats
   */
  getProfileStats: async (id: string): Promise<ProfileStats> => {
    const response = await apiClient.get<ProfileStats>(`/users/${id}/stats`);
    return response.data;
  },

  /**
   * Update user profile
   */
  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Follow a user
   */
  follow: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/follow`);
  },

  /**
   * Unfollow a user
   */
  unfollow: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}/follow`);
  },

  /**
   * Get user's followers
   */
  getFollowers: async (id: string): Promise<User[]> => {
    const response = await apiClient.get<{ users: User[] }>(`/users/${id}/followers`);
    return response.data.users;
  },

  /**
   * Get users the user is following
   */
  getFollowing: async (id: string): Promise<User[]> => {
    const response = await apiClient.get<{ users: User[] }>(`/users/${id}/following`);
    return response.data.users;
  },

  /**
   * Search users
   */
  search: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<UserSearchResponse>('/users/search', {
      params: { q: query },
    });
    return response.data.users;
  },
};

