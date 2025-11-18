import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shortsApi } from '@/services/api/shorts';
import { CreateShortDto } from '@/types/short';

// Mock shorts data with working video URLs
// Using publicly accessible test videos that work on all platforms
const MOCK_SHORTS = [
  {
    id: '1',
    title: 'Welcome to ViWoApp Shorts! 🎉',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=1',
    duration: 15,
    viewsCount: 1234,
    likesCount: 89,
    commentsCount: 12,
    userId: 'mock-user-1',
    user: {
      id: 'mock-user-1',
      username: 'viwoapp',
      displayName: 'ViWoApp Official',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Earn VCoins by creating content 💰',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=2',
    duration: 20,
    viewsCount: 5678,
    likesCount: 234,
    commentsCount: 45,
    userId: 'mock-user-2',
    user: {
      id: 'mock-user-2',
      username: 'crypto_king',
      displayName: 'Crypto King',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'DeFi made simple 🚀',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=3',
    duration: 30,
    viewsCount: 9012,
    likesCount: 456,
    commentsCount: 78,
    userId: 'mock-user-3',
    user: {
      id: 'mock-user-3',
      username: 'defi_guru',
      displayName: 'DeFi Guru',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Token economy explained 📊',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=4',
    duration: 25,
    viewsCount: 3456,
    likesCount: 178,
    commentsCount: 34,
    userId: 'mock-user-4',
    user: {
      id: 'mock-user-4',
      username: 'blockchain_dev',
      displayName: 'Blockchain Dev',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Join the community! 🌟',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://picsum.photos/400/600?random=5',
    duration: 18,
    viewsCount: 7890,
    likesCount: 345,
    commentsCount: 56,
    userId: 'mock-user-5',
    user: {
      id: 'mock-user-5',
      username: 'community_mod',
      displayName: 'Community Mod',
      avatarUrl: null,
    },
    createdAt: new Date().toISOString(),
  },
];

export function useShorts() {
  // Return mock data instead of API call
  return useInfiniteQuery({
    queryKey: ['shorts', 'feed', 'mock'],
    queryFn: async ({ pageParam = 1 }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        shorts: MOCK_SHORTS,
        page: pageParam,
        hasMore: false, // Only one page of mock data
        total: MOCK_SHORTS.length,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useCreateShort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShortDto) => shortsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts', 'feed'] });
    },
  });
}

export function useShortActions(shortId: string) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => shortsApi.like(shortId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
    },
  });

  return {
    like: likeMutation.mutateAsync,
    isLiking: likeMutation.isPending,
  };
}

