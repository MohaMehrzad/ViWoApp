import apiClient from './client';
import { Post, CreatePostDto, UpdatePostDto, PostsResponse } from '@/types/post';

export const postsApi = {
  /**
   * Get paginated feed of posts
   */
  getFeed: async (page = 1, limit = 20): Promise<PostsResponse> => {
    const response = await apiClient.get<PostsResponse>('/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Create a new post
   */
  create: async (data: CreatePostDto): Promise<Post> => {
    const response = await apiClient.post<Post>('/posts', data);
    return response.data;
  },

  /**
   * Get a single post by ID
   */
  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/posts/${id}`);
    return response.data;
  },

  /**
   * Update a post
   */
  update: async (id: string, data: UpdatePostDto): Promise<Post> => {
    const response = await apiClient.put<Post>(`/posts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a post
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },

  /**
   * Like a post
   */
  like: async (id: string): Promise<void> => {
    await apiClient.post(`/posts/${id}/like`);
  },

  /**
   * Unlike a post
   */
  unlike: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}/like`);
  },

  /**
   * Share a post
   */
  share: async (id: string): Promise<void> => {
    await apiClient.post(`/posts/${id}/share`);
  },

  /**
   * Repost a post
   */
  repost: async (id: string): Promise<void> => {
    await apiClient.post(`/posts/${id}/repost`);
  },

  /**
   * Get posts by a specific user
   */
  getUserPosts: async (userId: string, page = 1, limit = 20): Promise<PostsResponse> => {
    const response = await apiClient.get<PostsResponse>(`/posts/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },
};

