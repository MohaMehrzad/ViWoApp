import { io, Socket } from 'socket.io-client';
import { TokenStorage } from '../storage/tokenStorage';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000';

let socket: Socket | null = null;

export const socketService = {
  /**
   * Connect to WebSocket server
   */
  connect: async () => {
    if (socket?.connected) {
      return socket;
    }

    const token = await TokenStorage.getAccessToken();

    socket = io(`${WS_URL}/messages`, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return socket;
  },

  /**
   * Disconnect from WebSocket server
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Join a thread
   */
  joinThread: (threadId: string) => {
    socket?.emit('join_thread', { threadId });
  },

  /**
   * Leave a thread
   */
  leaveThread: (threadId: string) => {
    socket?.emit('leave_thread', { threadId });
  },

  /**
   * Send a message
   */
  sendMessage: (threadId: string, content: string) => {
    socket?.emit('send_message', { threadId, content });
  },

  /**
   * Mark thread as read
   */
  markAsRead: (threadId: string) => {
    socket?.emit('mark_read', { threadId });
  },

  /**
   * Send typing indicator
   */
  startTyping: (threadId: string) => {
    socket?.emit('typing_start', { threadId });
  },

  /**
   * Stop typing indicator
   */
  stopTyping: (threadId: string) => {
    socket?.emit('typing_stop', { threadId });
  },

  /**
   * Listen to new messages
   */
  onNewMessage: (callback: (data: any) => void) => {
    socket?.on('new_message', callback);
  },

  /**
   * Listen to typing events
   */
  onUserTyping: (callback: (data: any) => void) => {
    socket?.on('user_typing', callback);
  },

  /**
   * Remove listeners
   */
  off: (event: string, callback?: (...args: any[]) => void) => {
    socket?.off(event, callback);
  },

  /**
   * Get socket instance
   */
  getSocket: () => socket,
};

