import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';
import { ProfileStats } from '@/types/user';

export function useProfileStats(userId: string | undefined) {
  return useQuery<ProfileStats>({
    queryKey: ['profileStats', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return usersApi.getProfileStats(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

