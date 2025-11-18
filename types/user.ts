export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private';
  postsVisibility?: 'everyone' | 'followers' | 'nobody';
  messagesVisibility?: 'everyone' | 'followers' | 'nobody';
  showEmail?: boolean;
}

export interface EmailNotifications {
  likes?: boolean;
  comments?: boolean;
  follows?: boolean;
  vcoinEarned?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
  privacySettings?: PrivacySettings;
  emailNotifications?: EmailNotifications;
  walletAddress?: string;
  verificationTier?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  shortsCount?: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface ProfileStats {
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
  memberSince: string;

  // Content counts
  postsCount: number;
  shortsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface UpdateUserDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
  privacySettings?: PrivacySettings;
  emailNotifications?: EmailNotifications;
  walletAddress?: string;
}

export interface UserSearchResponse {
  users: User[];
}

