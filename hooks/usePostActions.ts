import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/services/api/posts';

export function usePostActions(postId: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => postsApi.like(postId),
    onSuccess: () => {
      // Invalidate all post queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => postsApi.unlike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: () => postsApi.share(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const repostMutation = useMutation({
    mutationFn: () => postsApi.repost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    like: likeMutation.mutateAsync,
    unlike: unlikeMutation.mutateAsync,
    share: shareMutation.mutateAsync,
    repost: repostMutation.mutateAsync,
    deletePost: deleteMutation.mutateAsync,
    isLiking: likeMutation.isPending || unlikeMutation.isPending,
    isSharing: shareMutation.isPending,
    isReposting: repostMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      // Invalidate posts feed to show new post
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string }) => postsApi.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

