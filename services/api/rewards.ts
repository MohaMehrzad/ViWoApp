import apiClient from './client';

export interface Reward {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  totalEarned: number;
  rank: number;
}

export const rewardsApi = {
  /**
   * Get reward history
   */
  getHistory: async (page = 1, limit = 20): Promise<{ rewards: Reward[]; total: number }> => {
    const response = await apiClient.get<{ rewards: Reward[]; total: number }>(
      '/rewards/history',
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (timeframe?: 'daily' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>(
      '/rewards/leaderboard',
      {
        params: { timeframe },
      }
    );
    return response.data.leaderboard;
  },
};

