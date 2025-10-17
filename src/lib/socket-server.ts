import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";
import type {
  PresenceStatus,
  SendMessageData,
  AddReactionData,
  RemoveReactionData,
} from "@/types/chat";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  if (io) {
    console.log("✅ Socket.IO server already initialized");
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Authentification (à implémenter avec votre système d'auth)
    // Pour l'instant, on suppose que l'userId est passé dans le handshake
    const userId = socket.handshake.auth.userId;
    const tenantId = socket.handshake.auth.tenantId;

    if (!userId || !tenantId) {
      console.log("❌ Unauthorized connection");
      socket.disconnect();
      return;
    }

    socket.userId = userId;
    socket.tenantId = tenantId;

    // Mettre à jour la présence à ONLINE
    await updateUserPresence(userId, "ONLINE");

    // Rejoindre les canaux de l'utilisateur
    const memberships = await prisma.chatChannelMember.findMany({
      where: { userId },
      select: { channelId: true },
    });

    memberships.forEach((membership) => {
      socket.join(`channel:${membership.channelId}`);
    });

    // Rejoindre un canal
    socket.on("join-channel", async (channelId: string) => {
      console.log(`📥 User ${userId} joining channel ${channelId}`);
      socket.join(`channel:${channelId}`);

      // Vérifier si l'utilisateur est membre
      const membership = await prisma.chatChannelMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });

      if (!membership) {
        // Ajouter l'utilisateur comme membre (pour les canaux publics)
        const channel = await prisma.chatChannel.findUnique({
          where: { id: channelId },
        });

        if (channel?.type === "PUBLIC") {
          await prisma.chatChannelMember.create({
            data: {
              channelId,
              userId,
              role: "MEMBER",
            },
          });
        }
      }
    });

    // Quitter un canal
    socket.on("leave-channel", (channelId: string) => {
      console.log(`📤 User ${userId} leaving channel ${channelId}`);
      socket.leave(`channel:${channelId}`);
    });

    // Envoyer un message
    socket.on("send-message", async (data: SendMessageData) => {
      try {
        console.log(`💬 New message in channel ${data.channelId}`);

        // Créer le message
        const message = await prisma.chatMessage.create({
          data: {
            channelId: data.channelId,
            userId,
            content: data.content,
            type: data.type || "TEXT",
            parentId: data.parentId,
            attachments: data.attachments
              ? {
                  create: data.attachments,
                }
              : undefined,
            mentions: data.mentions
              ? {
                  create: data.mentions.map((mentionedUserId) => ({
                    userId: mentionedUserId,
                  })),
                }
              : undefined,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            attachments: true,
            mentions: true,
          },
        });

        // Envoyer le message à tous les membres du canal
        io?.to(`channel:${data.channelId}`).emit("new-message", message);

        // Récupérer les membres du canal pour les notifications
        const channelMembers = await prisma.chatChannelMember.findMany({
          where: { channelId: data.channelId },
          select: { userId: true },
        });

        const recipientIds = channelMembers
          .map((m) => m.userId)
          .filter((id) => id !== userId); // Exclure l'expéditeur

        // Envoyer notifications aux membres du canal
        if (recipientIds.length > 0) {
          await NotificationService.notifyChatMessage(
            tenantId!,
            data.channelId,
            message.id,
            userId,
            `${message.user.firstName} ${message.user.lastName}`,
            data.content,
            recipientIds
          );
        }

        // Si des mentions, envoyer notifications spéciales
        if (data.mentions && data.mentions.length > 0) {
          await NotificationService.notifyChatMention(
            tenantId!,
            data.channelId,
            message.id,
            userId,
            `${message.user.firstName} ${message.user.lastName}`,
            data.content,
            data.mentions
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Modifier un message
    socket.on(
      "edit-message",
      async (data: { messageId: string; content: string }) => {
        try {
          const message = await prisma.chatMessage.findUnique({
            where: { id: data.messageId },
          });

          if (!message || message.userId !== userId) {
            socket.emit("error", { message: "Unauthorized" });
            return;
          }

          const updatedMessage = await prisma.chatMessage.update({
            where: { id: data.messageId },
            data: {
              content: data.content,
              editedAt: new Date(),
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              reactions: true,
              attachments: true,
            },
          });

          io?.to(`channel:${message.channelId}`).emit(
            "message-edited",
            updatedMessage
          );
        } catch (error) {
          console.error("Error editing message:", error);
        }
      }
    );

    // Supprimer un message
    socket.on("delete-message", async (messageId: string) => {
      try {
        const message = await prisma.chatMessage.findUnique({
          where: { id: messageId },
        });

        if (!message || message.userId !== userId) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { deletedAt: new Date() },
        });

        io?.to(`channel:${message.channelId}`).emit(
          "message-deleted",
          messageId
        );
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    // Ajouter une réaction
    socket.on("add-reaction", async (data: AddReactionData) => {
      try {
        const message = await prisma.chatMessage.findUnique({
          where: { id: data.messageId },
        });

        if (!message) return;

        const reaction = await prisma.chatReaction.upsert({
          where: {
            messageId_userId_emoji: {
              messageId: data.messageId,
              userId,
              emoji: data.emoji,
            },
          },
          create: {
            messageId: data.messageId,
            userId,
            emoji: data.emoji,
          },
          update: {},
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        io?.to(`channel:${message.channelId}`).emit("reaction-added", {
          messageId: data.messageId,
          reaction,
        });
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    });

    // Retirer une réaction
    socket.on("remove-reaction", async (data: RemoveReactionData) => {
      try {
        const message = await prisma.chatMessage.findUnique({
          where: { id: data.messageId },
        });

        if (!message) return;

        const reaction = await prisma.chatReaction.findFirst({
          where: {
            messageId: data.messageId,
            userId,
            emoji: data.emoji,
          },
        });

        if (reaction) {
          await prisma.chatReaction.delete({
            where: { id: reaction.id },
          });

          io?.to(`channel:${message.channelId}`).emit("reaction-removed", {
            messageId: data.messageId,
            reactionId: reaction.id,
          });
        }
      } catch (error) {
        console.error("Error removing reaction:", error);
      }
    });

    // Typing indicators
    socket.on("typing-start", async (channelId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      });

      socket.to(`channel:${channelId}`).emit("user-typing", {
        userId,
        channelId,
        user,
      });
    });

    socket.on("typing-stop", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("user-stopped-typing", {
        userId,
        channelId,
      });
    });

    // Mise à jour de la présence
    socket.on("update-presence", async (status: PresenceStatus) => {
      await updateUserPresence(userId, status);
      io?.emit("presence-updated", { userId, status });
    });

    // Déconnexion
    socket.on("disconnect", async () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      await updateUserPresence(userId, "OFFLINE");
      io?.emit("presence-updated", { userId, status: "OFFLINE" });
    });
  });

  console.log("✅ Socket.IO server initialized");
  return io;
}

async function updateUserPresence(userId: string, status: PresenceStatus) {
  try {
    await prisma.userPresence.upsert({
      where: { userId },
      create: {
        userId,
        status,
        lastSeen: new Date(),
      },
      update: {
        status,
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating presence:", error);
  }
}

export function getSocketServer() {
  return io;
}
