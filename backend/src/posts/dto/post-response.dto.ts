export class PostResponseDto {
  id: string;
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  mediaThumbnail: string | null;
  likesCount: number;
  sharesCount: number;
  repostsCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  
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

