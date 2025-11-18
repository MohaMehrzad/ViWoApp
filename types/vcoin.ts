export interface VCoinBalance {
  balance: number;
}

export interface VCoinTransaction {
  id: string;
  type: 'EARN' | 'SPEND' | 'TRANSFER' | 'REWARD';
  amount: number;
  description: string;
  fromUserId?: string;
  toUserId?: string;
  postId?: string;
  createdAt: string;
}

export interface VCoinTransactionsResponse {
  transactions: VCoinTransaction[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface SendVCoinDto {
  recipientId: string;
  amount: number;
  note?: string;
}

export interface VCoinStats {
  totalSupply: number;
  circulatingSupply: number;
  totalUsers: number;
  totalTransactions: number;
}

