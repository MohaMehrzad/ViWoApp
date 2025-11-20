export interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  aspectRatio?: number;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  likesCount: number;
  sharesCount: number;
  repostsCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isShared?: boolean;
  isReposted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  aspectRatio?: number;
}

export interface UpdatePostDto {
  content?: string;
}

export interface PostsResponse {
  posts: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

