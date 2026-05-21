// src/app/providers/SocketProvider.jsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider.jsx";
import { getToken } from "../api/token.js";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);

  // ── socket stored in BOTH ref (stable identity) and state (triggers re-render)
  // The bug in the original: socketRef.current is captured at render time.
  // Changing a ref doesn't trigger re-renders, so consumers received `null`
  // for `socket` until some other state change caused a re-render.
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Disconnect and clean up if user logs out
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Already have a socket for this session — don't create another
    if (socketRef.current) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace("/api", "") || // strip /api if needed
      "http://localhost:5000";

    const newSocket = io(socketUrl, {
      // Allow socket.io to negotiate the best transport (prevents websocket-before-handshake issues)
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        // backend expects socket.handshake.auth.token to verify JWT
        token: getToken(),
        userId: user.id,
        role: user.role,
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket); // ← expose to consumers via state

    const onConnect = () => {
      setIsConnected(true);

      // Join user-specific notification room
      newSocket.emit("join", `user:${user.id}`);
      if (user.role === "owner" || user.role === "admin") {
        newSocket.emit("join", `owner:${user.id}`);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = () => {};

    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id, user?.role]);

  // ── Safe emit: silently drops if socket isn't connected ──────────────────
  // Prevents consumers from having to check isConnected before every emit.
  const emit = useCallback((event, ...args) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit }}>
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
