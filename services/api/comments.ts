import apiClient from './client';
import { Comment, CreateCommentDto, UpdateCommentDto, CommentsResponse } from '@/types/comment';

export const commentsApi = {
  /**
   * Get comments for a post
   */
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get<CommentsResponse>(`/posts/${postId}/comments`);
    return response.data.comments;
  },

  /**
   * Create a new comment
   */
  create: async (postId: string, data: CreateCommentDto): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/posts/${postId}/comments`, data);
    return response.data;
  },

  /**
   * Update a comment
   */
  update: async (postId: string, commentId: string, data: UpdateCommentDto): Promise<Comment> => {
    const response = await apiClient.put<Comment>(
      `/posts/${postId}/comments/${commentId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a comment
   */
  delete: async (postId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },
};

