import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect when user is fully authenticated
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Prevent creating duplicate sockets
    if (socketRef.current) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000";

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"], // websocket first in production
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        userId: user.id,
        role: user.role,
      },
    });

    socketRef.current = socket;

    const onConnect = () => {
      console.log("✅ Socket.IO connected");
      setIsConnected(true);

      // Auto-join user-specific room for notifications
      socket.emit("join", `user:${user.id}`);
      if (["owner", "admin"].includes(user.role)) {
        socket.emit("join", `owner:${user.id}`);
      }
    };

    const onDisconnect = (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
      setIsConnected(false);
    };

    const onConnectError = (err) => {
      console.warn("⚠️ Socket.IO connection error:", err.message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
