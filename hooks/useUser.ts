import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });
}

export function useUserByUsername(username: string) {
  return useQuery({
    queryKey: ['user', 'username', username],
    queryFn: () => usersApi.getByUsername(username),
    enabled: !!username,
  });
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => usersApi.search(query),
    enabled: query.length > 0,
  });
}

