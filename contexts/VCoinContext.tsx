import { VCoinRewards } from '@/constants/theme';
import { vcoinApi } from '@/services/api/vcoin';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type EarnAction = 'like' | 'share' | 'repost';

interface VCoinEarning {
  id: string;
  amount: number;
  source: EarnAction;
  timestamp: number;
  postId?: string;
}

interface VCoinContextType {
  balance: number;
  earnings: VCoinEarning[];
  earnVCoin: (action: EarnAction, postId?: string) => Promise<number>;
  loadBalance: () => Promise<void>;
  resetBalance: () => Promise<void>;
}

const VCoinContext = createContext<VCoinContextType | undefined>(undefined);

export function VCoinProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [earnings, setEarnings] = useState<VCoinEarning[]>([]);

  // Load balance from API
  const loadBalance = useCallback(async () => {
    try {
      const realBalance = await vcoinApi.getBalance();
      setBalance(realBalance);
    } catch (error) {
      console.error('Failed to load VCoin balance:', error);
      // Keep current balance on error
    }
  }, []);

  // Earn VCoin from action (optimistic update - actual earning happens on backend)
  const earnVCoin = useCallback(async (action: EarnAction, postId?: string): Promise<number> => {
    const amount = VCoinRewards[action];
    const earning: VCoinEarning = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      source: action,
      timestamp: Date.now(),
      postId,
    };

    // Optimistic update - add to balance immediately
    setBalance(prev => prev + amount);
    setEarnings(prev => [earning, ...prev]);

    // The backend will automatically credit VCoin for actions like like/share/repost
    // We'll refresh the balance periodically or after actions to stay in sync
    
    // Optionally refresh balance from backend after a delay to ensure sync
    setTimeout(() => {
      loadBalance().catch(console.error);
    }, 2000);

    return amount;
  }, [loadBalance]);

  // Reset balance (for testing - clears local state only)
  const resetBalance = useCallback(async () => {
    setBalance(0);
    setEarnings([]);
    // Note: This won't affect the backend balance
    // Reload will restore the real balance
  }, []);

  return (
    <VCoinContext.Provider
      value={{
        balance,
        earnings,
        earnVCoin,
        loadBalance,
        resetBalance,
      }}
    >
      {children}
    </VCoinContext.Provider>
  );
}

export function useVCoin() {
  const context = useContext(VCoinContext);
  if (context === undefined) {
    throw new Error('useVCoin must be used within a VCoinProvider');
  }
  return context;
}

