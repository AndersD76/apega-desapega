import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { API_URL } from '../api/config';

// Dynamic import for socket.io-client to handle web compatibility
let io: any = null;
try {
  io = require('socket.io-client').io;
} catch (e) {
  console.warn('Socket.io-client not available:', e);
}

interface SocketContextData {
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  sendMessage: (data: { conversationId: string; receiverId: string; content: string; productId?: string }) => void;
  sendTyping: (data: { conversationId: string; receiverId: string }) => void;
  sendStopTyping: (data: { conversationId: string; receiverId: string }) => void;
}

const SocketContext = createContext<SocketContextData>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  sendMessage: () => {},
  sendTyping: () => {},
  sendStopTyping: () => {},
});

// Extract base URL without /api
const getSocketUrl = () => {
  // API_URL is like http://localhost:3001/api
  return API_URL.replace('/api', '');
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !io) {
      // Disconnect if not authenticated or socket.io not available
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket server
    const connectSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('@auth_token');
        if (!token) return;

        const socketUrl = getSocketUrl();
        console.log('🔌 Connecting to WebSocket:', socketUrl);

        const newSocket = io(socketUrl, {
          auth: { token },
          transports: Platform.OS === 'web' ? ['polling', 'websocket'] : ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
        });

        newSocket.on('connect', () => {
          console.log('🔌 WebSocket connected');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error: any) => {
          console.log('🔌 WebSocket connection error:', error?.message || error);
          setIsConnected(false);
        });

        // Receive initial list of online users when connecting
        newSocket.on('online_users_list', (data: { users: string[] }) => {
          console.log('🔌 Online users:', data.users);
          setOnlineUsers(new Set(data.users));
        });

        // Handle user online status changes
        newSocket.on('user_status', (data: { userId: string; online: boolean }) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (data.online) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Error connecting to socket:', error);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated]);

  const sendMessage = useCallback((data: { conversationId: string; receiverId: string; content: string; productId?: string }) => {
    if (socket && isConnected) {
      socket.emit('send_message', data);
    }
  }, [socket, isConnected]);

  const sendTyping = useCallback((data: { conversationId: string; receiverId: string }) => {
    if (socket && isConnected) {
      socket.emit('typing', data);
    }
  }, [socket, isConnected]);

  const sendStopTyping = useCallback((data: { conversationId: string; receiverId: string }) => {
    if (socket && isConnected) {
      socket.emit('stop_typing', data);
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        sendMessage,
        sendTyping,
        sendStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
