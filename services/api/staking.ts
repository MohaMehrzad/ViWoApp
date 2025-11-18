import apiClient from './client';

export interface Stake {
  id: string;
  userId: string;
  amount: number;
  duration: number;
  apy: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';
  earnedRewards: number;
}

export interface StakingRequirements {
  minAmount: number;
  durations: Array<{
    days: number;
    apy: number;
  }>;
}

export const stakingApi = {
  /**
   * Stake VCoin
   */
  stake: async (amount: number, duration: number): Promise<Stake> => {
    const response = await apiClient.post<Stake>('/staking/stake', {
      amount,
      duration,
    });
    return response.data;
  },

  /**
   * Unstake VCoin
   */
  unstake: async (stakeId: string): Promise<void> => {
    await apiClient.post(`/staking/unstake/${stakeId}`);
  },

  /**
   * Get user's stakes
   */
  getMyStakes: async (): Promise<Stake[]> => {
    const response = await apiClient.get<{ stakes: Stake[] }>('/staking/my-stakes');
    return response.data.stakes;
  },

  /**
   * Get staking requirements
   */
  getRequirements: async (): Promise<StakingRequirements> => {
    const response = await apiClient.get<StakingRequirements>('/staking/requirements');
    return response.data;
  },
};

