export class ProfileStatsDto {
  // VCoin stats
  vcoinBalance: number;
  vcoinStaked: number;
  vcoinEarnedTotal: number;

  // Reputation
  reputationScore: number;

  // Verification
  verificationTier: string | null;

  // Engagement metrics
  totalLikesReceived: number;
  totalSharesReceived: number;
  totalCommentsReceived: number;
  totalViewsReceived: number;

  // Staking
  activeStakesCount: number;

  // Account info
  memberSince: Date;

  // Content counts
  postsCount: number;
  shortsCount: number;
  followersCount: number;
  followingCount: number;
}

