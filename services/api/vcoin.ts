import apiClient from './client';
import {
  VCoinBalance,
  VCoinTransaction,
  VCoinTransactionsResponse,
  SendVCoinDto,
  VCoinStats,
} from '@/types/vcoin';

export const vcoinApi = {
  /**
   * Get current user's VCoin balance
   */
  getBalance: async (): Promise<number> => {
    const response = await apiClient.get<VCoinBalance>('/vcoin/balance');
    return response.data.balance;
  },

  /**
   * Get transaction history
   */
  getTransactions: async (page = 1, limit = 20): Promise<VCoinTransactionsResponse> => {
    const response = await apiClient.get<VCoinTransactionsResponse>('/vcoin/transactions', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Send VCoin to another user
   */
  send: async (data: SendVCoinDto): Promise<VCoinTransaction> => {
    const response = await apiClient.post<VCoinTransaction>('/vcoin/send', data);
    return response.data;
  },

  /**
   * Get VCoin statistics
   */
  getStats: async (): Promise<VCoinStats> => {
    const response = await apiClient.get<VCoinStats>('/vcoin/stats');
    return response.data;
  },
};

