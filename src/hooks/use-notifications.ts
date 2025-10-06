import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useSocket } from "./use-socket";
import { useToast } from "./use-toast";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Écouter les nouvelles notifications via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Afficher un toast
      toast({
        title: notification.title,
        description: notification.message,
      });
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Erreur marquage notifications:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
