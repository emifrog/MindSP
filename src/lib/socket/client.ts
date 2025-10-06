import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(userId: string, tenantId: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io({
    path: "/api/socket",
    autoConnect: false,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connecté");
    socket?.emit("authenticate", { userId, tenantId });
  });

  socket.on("authenticated", () => {
    console.log("✅ Socket authentifié");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket déconnecté");
  });

  socket.on("error", (error) => {
    console.error("❌ Erreur socket:", error);
  });

  socket.connect();

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
