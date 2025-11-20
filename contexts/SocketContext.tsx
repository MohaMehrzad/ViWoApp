import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { socketService } from '@/services/websocket/socket';
import { useAuth } from './AuthContext';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAuthenticated) {
      // Delay socket connection by 3 seconds to avoid blocking startup
      timeoutId = setTimeout(() => {
        connectSocket();
      }, 3000);
    } else {
      // Disconnect when user logs out
      disconnectSocket();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      disconnectSocket();
    };
  }, [isAuthenticated]);

  const connectSocket = async () => {
    try {
      const sock = await socketService.connect();
      setSocket(sock);
      setIsConnected(sock?.connected || false);

      sock?.on('connect', () => {
        setIsConnected(true);
      });

      sock?.on('disconnect', () => {
        setIsConnected(false);
      });
    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect: connectSocket,
        disconnect: disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

