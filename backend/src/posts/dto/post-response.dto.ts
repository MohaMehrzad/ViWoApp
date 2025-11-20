export class PostResponseDto {
  id: string;
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  mediaThumbnail: string | null;
  mediaMedium?: string | null;
  aspectRatio: number; // Always provided with default 1.777 (16:9)
  likesCount: number;
  sharesCount: number;
  repostsCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Precomputed formatted values for display
  relativeTime: string; // e.g., "5m", "2h", "3d"
  likesCountFormatted: string; // e.g., "1.2K", "3.4M"
  sharesCountFormatted: string;
  repostsCountFormatted: string;
  commentsCountFormatted: string;
  
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    verificationTier: string | null;
  };
  
  // Optional fields based on context
  isLiked?: boolean;
  isShared?: boolean;
  isReposted?: boolean;
}

