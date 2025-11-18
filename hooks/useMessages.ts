import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/services/api/messages';

export function useMessageThreads() {
  return useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: () => messagesApi.getThreads(),
    refetchInterval: 10000, // Refetch every 10 seconds for new messages
  });
}

export function useThreadMessages(threadId: string) {
  return useQuery({
    queryKey: ['messages', 'thread', threadId],
    queryFn: () => messagesApi.getMessages(threadId),
    enabled: !!threadId,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantIds: string[]) => messagesApi.createThread(participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'threads'] });
    },
  });
}

