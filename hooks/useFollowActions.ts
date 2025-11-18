import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';

export function useFollowActions(userId: string) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => usersApi.follow(userId),
    onSuccess: () => {
      // Invalidate user queries to refresh follow status
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => usersApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    follow: followMutation.mutateAsync,
    unfollow: unfollowMutation.mutateAsync,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
  };
}

