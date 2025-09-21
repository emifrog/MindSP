import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { useTenantStore } from '../stores/tenant.store';
import { WS_URL } from '../config/constants';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { token, user } = useAuthStore();
  const { tenant } = useTenantStore();
  
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;
  
  const connect = useCallback(() => {
    if (!token || !tenant || socketRef.current?.connected) return;
    
    socketRef.current = io(WS_URL, {
      auth: { token },
      query: { 
        tenantId: tenant.id,
        userId: user?.id,
      },
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'],
    });
    
    // Event listeners
    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    socketRef.current.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });
    
    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    return socketRef.current;
  }, [token, tenant, user, reconnection, reconnectionAttempts, reconnectionDelay]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);
  
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);
  
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);
  
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);
  
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
  
  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false,
  };
}