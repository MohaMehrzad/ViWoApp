import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';

/**
 * Hook to fetch aggregated profile view data
 * Combines user, stats, and recent posts in a single API call
 * Reduces 3 requests to 1 for faster profile loading
 */
export function useProfileView(userId: string) {
  return useQuery({
    queryKey: ['profileView', userId],
    queryFn: () => usersApi.getProfileView(userId),
    enabled: !!userId,
  });
}

