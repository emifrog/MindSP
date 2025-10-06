const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialiser Socket.IO
  const io = new Server(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  // Tracking des utilisateurs en ligne
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 Client connecté: ${socket.id}`);

    // Authentification
    socket.on("authenticate", async (data) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
        });

        if (!user || user.tenantId !== data.tenantId) {
          socket.emit("error", { message: "Authentification échouée" });
          socket.disconnect();
          return;
        }

        socket.data.userId = data.userId;
        socket.data.tenantId = data.tenantId;

        socket.join(`tenant:${data.tenantId}`);
        socket.join(`user:${data.userId}`);

        // Marquer l'utilisateur comme en ligne
        onlineUsers.set(data.userId, {
          socketId: socket.id,
          userId: data.userId,
          tenantId: data.tenantId,
          connectedAt: new Date(),
        });

        // Notifier les autres utilisateurs du tenant
        socket.to(`tenant:${data.tenantId}`).emit("user_online", {
          userId: data.userId,
        });

        socket.emit("authenticated", { userId: data.userId });
        console.log(`✅ Utilisateur authentifié: ${data.userId}`);
      } catch (error) {
        console.error("Erreur authentification socket:", error);
        socket.emit("error", { message: "Erreur d'authentification" });
      }
    });

    // Rejoindre une conversation
    socket.on("join_conversation", async (conversationId) => {
      try {
        if (!socket.data.userId) {
          socket.emit("error", { message: "Non authentifié" });
          return;
        }

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
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(
        `👋 User ${socket.data.userId} quitte conversation ${conversationId}`
      );
    });

    // Envoyer un message
    socket.on("send_message", async (data) => {
      try {
        if (!socket.data.userId || !socket.data.tenantId) {
          socket.emit("error", { message: "Non authentifié" });
          return;
        }

        const message = await prisma.message.create({
          data: {
            conversationId: data.conversationId,
            senderId: socket.data.userId,
            tenantId: socket.data.tenantId,
            content: data.content,
            type: data.type || "TEXT",
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

        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { lastMessageAt: new Date() },
        });

        io.to(`conversation:${data.conversationId}`).emit(
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
    });

    // Indicateur de frappe
    socket.on("typing_start", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.data.userId,
        conversationId,
      });
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
        userId: socket.data.userId,
        conversationId,
      });
    });

    // Marquer comme lu
    socket.on("mark_as_read", async (data) => {
      try {
        if (!socket.data.userId) return;

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

        await prisma.conversationMember.updateMany({
          where: {
            conversationId: data.conversationId,
            userId: socket.data.userId,
          },
          data: {
            lastReadAt: new Date(),
          },
        });

        socket.to(`conversation:${data.conversationId}`).emit("message_read", {
          messageId: data.messageId,
          userId: socket.data.userId,
        });
      } catch (error) {
        console.error("Erreur mark as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client déconnecté: ${socket.id}`);

      // Marquer l'utilisateur comme hors ligne
      if (socket.data.userId) {
        onlineUsers.delete(socket.data.userId);

        // Notifier les autres utilisateurs du tenant
        if (socket.data.tenantId) {
          socket.to(`tenant:${socket.data.tenantId}`).emit("user_offline", {
            userId: socket.data.userId,
          });
        }
      }
    });

    // Récupérer les utilisateurs en ligne
    socket.on("get_online_users", () => {
      if (!socket.data.tenantId) return;

      const tenantOnlineUsers = Array.from(onlineUsers.values())
        .filter((u) => u.tenantId === socket.data.tenantId)
        .map((u) => u.userId);

      socket.emit("online_users", tenantOnlineUsers);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO ready on ws://${hostname}:${port}/api/socket`);
    });
});
