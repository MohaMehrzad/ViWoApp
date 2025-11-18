export class UserResponseDto {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  location: string | null;
  website: string | null;
  socialLinks: any | null;
  privacySettings: any | null;
  emailNotifications: any | null;
  walletAddress: string | null;
  verificationTier: string | null;
  createdAt: Date;
  
  // Optional aggregated data
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  shortsCount?: number;
  isFollowing?: boolean;
}

