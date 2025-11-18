import apiClient from './client';

export interface MessageThread {
  id: string;
  participantIds: string[];
  participants: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export const messagesApi = {
  /**
   * Get message threads
   */
  getThreads: async (): Promise<MessageThread[]> => {
    const response = await apiClient.get<{ threads: MessageThread[] }>('/messages/threads');
    return response.data.threads;
  },

  /**
   * Create a new thread
   */
  createThread: async (participantIds: string[]): Promise<MessageThread> => {
    const response = await apiClient.post<MessageThread>('/messages/threads', {
      participantIds,
    });
    return response.data;
  },

  /**
   * Get messages for a thread
   */
  getMessages: async (threadId: string): Promise<Message[]> => {
    const response = await apiClient.get<{ messages: Message[] }>(
      `/messages/threads/${threadId}`
    );
    return response.data.messages;
  },
};

