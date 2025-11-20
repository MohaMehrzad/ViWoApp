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
  earnVCoin: (amount: number, action: EarnAction, postId?: string) => void;
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

  // Earn VCoin from action (backend provides the amount)
  const earnVCoin = useCallback((amount: number, action: EarnAction, postId?: string): void => {
    const earning: VCoinEarning = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      source: action,
      timestamp: Date.now(),
      postId,
    };

    // Update balance directly from backend response
    setBalance(prev => prev + amount);
    setEarnings(prev => [earning, ...prev]);
  }, []);

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

