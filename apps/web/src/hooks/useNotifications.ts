import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { CACHE_KEYS } from '../config/constants';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  actionUrl?: string;
  readAt?: Date | null;
  createdAt: Date;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const { on, off } = useWebSocket();
  
  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: [CACHE_KEYS.NOTIFICATIONS],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.NOTIFICATIONS] });
    },
  });
  
  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.NOTIFICATIONS] });
    },
  });
  
  // Handle real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      // Add to cache
      queryClient.setQueryData([CACHE_KEYS.NOTIFICATIONS], (old: Notification[] = []) => {
        return [notification, ...old];
      });
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
        });
      }
    };
    
    on('notification', handleNewNotification);
    
    return () => {
      off('notification', handleNewNotification);
    };
  }, [on, off, queryClient]);
  
  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);
  
  const unreadCount = notifications.filter((n: Notification) => !n.readAt).length;
  
  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    requestPermission,
  };
}