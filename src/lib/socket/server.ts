import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "@/lib/prisma";

export type SocketServer = SocketIOServer;

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connecté: ${socket.id}`);

    // Authentification
    socket.on(
      "authenticate",
      async (data: { userId: string; tenantId: string }) => {
        try {
          // Vérifier que l'utilisateur existe
          const user = await prisma.user.findUnique({
            where: { id: data.userId },
          });

          if (!user || user.tenantId !== data.tenantId) {
            socket.emit("error", { message: "Authentification échouée" });
            socket.disconnect();
            return;
          }

          // Stocker les données utilisateur
          socket.data.userId = data.userId;
          socket.data.tenantId = data.tenantId;

          // Rejoindre la room du tenant
          socket.join(`tenant:${data.tenantId}`);
          socket.join(`user:${data.userId}`);

          socket.emit("authenticated", { userId: data.userId });
          console.log(`✅ Utilisateur authentifié: ${data.userId}`);
        } catch (error) {
          console.error("Erreur authentification socket:", error);
          socket.emit("error", { message: "Erreur d'authentification" });
        }
      }
    );

    // Rejoindre une conversation
    socket.on("join_conversation", async (conversationId: string) => {
      try {
        if (!socket.data.userId) {
          socket.emit("error", { message: "Non authentifié" });
          return;
        }

        // Vérifier que l'utilisateur est membre de la conversation
        const member = await prisma.conversationMember.findFirst({
          where: {
            conversationId,
            userId: socket.data.userId,
          },
        });

        if (!member) {
          socket.emit("error", { message: "Accès refusé" });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(
          `📨 User ${socket.data.userId} rejoint conversation ${conversationId}`
        );
      } catch (error) {
        console.error("Erreur join conversation:", error);
        socket.emit("error", { message: "Erreur lors de la connexion" });
      }
    });

    // Quitter une conversation
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(
        `👋 User ${socket.data.userId} quitte conversation ${conversationId}`
      );
    });

    // Envoyer un message
    socket.on(
      "send_message",
      async (data: {
        conversationId: string;
        content: string;
        type?: string;
      }) => {
        try {
          if (!socket.data.userId || !socket.data.tenantId) {
            socket.emit("error", { message: "Non authentifié" });
            return;
          }

          // Créer le message
          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: socket.data.userId,
              tenantId: socket.data.tenantId,
              content: data.content,
              type: (data.type as any) || "TEXT",
              status: "SENT",
            },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          });

          // Mettre à jour lastMessageAt
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: { lastMessageAt: new Date() },
          });

          // Émettre le message à tous les membres de la conversation
          io?.to(`conversation:${data.conversationId}`).emit(
            "new_message",
            message
          );

          console.log(
            `💬 Message envoyé dans conversation ${data.conversationId}`
          );
        } catch (error) {
          console.error("Erreur send message:", error);
          socket.emit("error", { message: "Erreur lors de l'envoi" });
        }
      }
    );

    // Indicateur de frappe
    socket.on("typing_start", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.data.userId,
        conversationId,
      });
    });

    socket.on("typing_stop", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
        userId: socket.data.userId,
        conversationId,
      });
    });

    // Marquer comme lu
    socket.on(
      "mark_as_read",
      async (data: { conversationId: string; messageId: string }) => {
        try {
          if (!socket.data.userId) {
            return;
          }

          // Créer le read receipt
          await prisma.messageRead.upsert({
            where: {
              messageId_userId: {
                messageId: data.messageId,
                userId: socket.data.userId,
              },
            },
            create: {
              messageId: data.messageId,
              userId: socket.data.userId,
            },
            update: {
              readAt: new Date(),
            },
          });

          // Mettre à jour lastReadAt du membre
          await prisma.conversationMember.updateMany({
            where: {
              conversationId: data.conversationId,
              userId: socket.data.userId,
            },
            data: {
              lastReadAt: new Date(),
            },
          });

          // Notifier les autres membres
          socket
            .to(`conversation:${data.conversationId}`)
            .emit("message_read", {
              messageId: data.messageId,
              userId: socket.data.userId,
            });
        } catch (error) {
          console.error("Erreur mark as read:", error);
        }
      }
    );

    // Déconnexion
    socket.on("disconnect", () => {
      console.log(`🔌 Client déconnecté: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
