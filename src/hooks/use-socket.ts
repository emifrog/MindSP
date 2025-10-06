import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { initSocket, disconnectSocket, getSocket } from "@/lib/socket/client";
import { useAuth } from "./use-auth";

export function useSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const socketInstance = initSocket(user.id, user.tenantId);
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  return {
    socket,
    isConnected,
  };
}

export function useConversation(conversationId: string | null) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !conversationId || !isConnected) {
      return;
    }

    // Rejoindre la conversation
    socket.emit("join_conversation", conversationId);

    // Écouter les nouveaux messages
    const handleNewMessage = (message: any) => {
      setMessages((prev) => [...prev, message]);
    };

    // Écouter les indicateurs de frappe
    const handleUserTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
    };

    const handleUserStoppedTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);

    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
    };
  }, [socket, conversationId, isConnected]);

  const sendMessage = (content: string, type = "TEXT") => {
    if (!socket || !conversationId) return;

    socket.emit("send_message", {
      conversationId,
      content,
      type,
    });
  };

  const startTyping = () => {
    if (!socket || !conversationId) return;
    socket.emit("typing_start", conversationId);
  };

  const stopTyping = () => {
    if (!socket || !conversationId) return;
    socket.emit("typing_stop", conversationId);
  };

  const markAsRead = (messageId: string) => {
    if (!socket || !conversationId) return;
    socket.emit("mark_as_read", {
      conversationId,
      messageId,
    });
  };

  return {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
