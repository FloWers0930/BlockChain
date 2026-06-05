import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "@providers/AuthProvider";
import { getToken } from "@api/token";
import api from "@api/axios";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user, authChecked } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(async () => {
    if (!isAuthenticated || !user || socketRef.current?.connected) return;

    let token = getToken();
    if (!token) {
      try {
        const { data } = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        );
        token = data.token;
      } catch {
        return; // Cannot connect without valid session
      }
    }

    const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";
    const socketBaseUrl = import.meta.env.VITE_SOCKET_URL
      || (apiBaseUrl.startsWith("/")
        ? window.location.origin
        : apiBaseUrl.replace(/\/api\/?$/, ""));

    const socket = io(socketBaseUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: false,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      // Auto-join role-based rooms on connect/reconnect
      socket.emit("join", `user:${user.id}`);
      if (user.role === "owner") socket.emit("join", `owner:${user.id}`);
      if (user.role === "admin") socket.emit("join", `admin:global`);
    });

    socket.on("disconnect", () => setIsConnected(false));
    socket.on("error", (err) => {
      if (import.meta.env.DEV) console.warn("Socket error:", err.message);
    });

    // 🔑 Handle token expiry warning → refresh silently → update socket
    socket.on("auth_expiry_warning", async () => {
      try {
        const { data } = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        );
        if (data?.token) {
          socket.emit("update_token", data.token);
        }
      } catch (err) {
        if (import.meta.env.DEV)
          console.warn("Socket token refresh failed:", err);
        socket.disconnect();
      }
    });

    socketRef.current = socket;
    socket.connect();
  }, [isAuthenticated, user]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Sync connection with auth state
  useEffect(() => {
    if (authChecked && isAuthenticated && user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => disconnectSocket();
  }, [authChecked, isAuthenticated, user, connectSocket, disconnectSocket]);

  // Safe event API for components
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current.off(event, callback);
    }
  }, []);

  const value = { socket: socketRef.current, isConnected, emit, on };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

