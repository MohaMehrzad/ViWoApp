export interface Short {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface CreateShortDto {
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface ShortsResponse {
  shorts: Short[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

