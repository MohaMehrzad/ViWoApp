import apiClient from './client';

export interface VerificationTier {
  name: string;
  requirements: string[];
  benefits: string[];
}

export interface UserVerificationStatus {
  tier: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'VERIFIED';
  appliedAt?: string;
  approvedAt?: string;
  status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const verificationApi = {
  /**
   * Get verification tiers information
   */
  getTiers: async (): Promise<VerificationTier[]> => {
    const response = await apiClient.get<{ tiers: VerificationTier[] }>('/verification/tiers');
    return response.data.tiers;
  },

  /**
   * Get user's verification status
   */
  getStatus: async (): Promise<UserVerificationStatus> => {
    const response = await apiClient.get<UserVerificationStatus>('/verification/status');
    return response.data;
  },

  /**
   * Apply for verification
   */
  apply: async (documents: string[]): Promise<void> => {
    await apiClient.post('/verification/apply', { documents });
  },

  /**
   * Upgrade tier (if eligible)
   */
  upgrade: async (): Promise<void> => {
    await apiClient.post('/verification/upgrade');
  },
};

