"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import {
  initChatSocket,
  getChatSocket,
  disconnectChatSocket,
} from "@/lib/socket-client";
import type {
  ChatMessage,
  ChatChannel,
  ChatReaction,
  PresenceStatus,
  SendMessageData,
} from "@/types/chat";

export function useChatSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.tenantId) {
      return;
    }

    const socket = initChatSocket(user.id, user.tenantId);

    const handleConnect = () => {
      console.log("✅ Chat socket connected");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("❌ Chat socket disconnected");
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      disconnectChatSocket();
    };
  }, [user?.id, user?.tenantId]);

  return {
    socket: getChatSocket(),
    isConnected,
  };
}

export function useChatChannel(channelId: string | null) {
  const { socket, isConnected } = useChatSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socket || !channelId || !isConnected) {
      return;
    }

    // Rejoindre le canal
    socket.emit("join-channel", channelId);

    // Écouter les nouveaux messages
    const handleNewMessage = (message: ChatMessage) => {
      if (message.channelId === channelId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Écouter les messages modifiés
    const handleMessageEdited = (message: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    };

    // Écouter les messages supprimés
    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    // Écouter les réactions
    const handleReactionAdded = (data: {
      messageId: string;
      reaction: ChatReaction;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? {
                ...m,
                reactions: [...(m.reactions || []), data.reaction],
              }
            : m
        )
      );
    };

    const handleReactionRemoved = (data: {
      messageId: string;
      reactionId: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? {
                ...m,
                reactions: (m.reactions || []).filter(
                  (r) => r.id !== data.reactionId
                ),
              }
            : m
        )
      );
    };

    // Écouter les typing indicators
    const handleUserTyping = (data: { userId: string; channelId: string }) => {
      if (data.channelId === channelId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    };

    const handleUserStoppedTyping = (data: {
      userId: string;
      channelId: string;
    }) => {
      if (data.channelId === channelId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-edited", handleMessageEdited);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("reaction-added", handleReactionAdded);
    socket.on("reaction-removed", handleReactionRemoved);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stopped-typing", handleUserStoppedTyping);

    return () => {
      socket.emit("leave-channel", channelId);
      socket.off("new-message", handleNewMessage);
      socket.off("message-edited", handleMessageEdited);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("reaction-added", handleReactionAdded);
      socket.off("reaction-removed", handleReactionRemoved);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stopped-typing", handleUserStoppedTyping);
    };
  }, [socket, channelId, isConnected]);

  const sendMessage = useCallback(
    (data: Omit<SendMessageData, "channelId">) => {
      if (!socket || !channelId) return;
      socket.emit("send-message", { ...data, channelId });
    },
    [socket, channelId]
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!socket) return;
      socket.emit("edit-message", { messageId, content });
    },
    [socket]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!socket) return;
      socket.emit("delete-message", messageId);
    },
    [socket]
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket) return;
      socket.emit("add-reaction", { messageId, emoji });
    },
    [socket]
  );

  const removeReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket) return;
      socket.emit("remove-reaction", { messageId, emoji });
    },
    [socket]
  );

  const startTyping = useCallback(() => {
    if (!socket || !channelId) return;
    socket.emit("typing-start", channelId);
  }, [socket, channelId]);

  const stopTyping = useCallback(() => {
    if (!socket || !channelId) return;
    socket.emit("typing-stop", channelId);
  }, [socket, channelId]);

  return {
    messages,
    setMessages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
  };
}

export function useChatPresence() {
  const { socket, isConnected } = useChatSocket();
  const [presences, setPresences] = useState<Map<string, PresenceStatus>>(
    new Map()
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handlePresenceUpdated = (data: {
      userId: string;
      status: PresenceStatus;
    }) => {
      setPresences((prev) => new Map(prev).set(data.userId, data.status));
    };

    socket.on("presence-updated", handlePresenceUpdated);

    return () => {
      socket.off("presence-updated", handlePresenceUpdated);
    };
  }, [socket, isConnected]);

  const updatePresence = useCallback(
    (status: PresenceStatus) => {
      if (!socket) return;
      socket.emit("update-presence", status);
    },
    [socket]
  );

  return {
    presences,
    updatePresence,
  };
}
