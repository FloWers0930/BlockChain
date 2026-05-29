// src/app/providers/SocketProvider.jsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo, // ← ADD THIS LINE
} from "react";
import { io } from "socket.io-client";

// ✅ Using Vite aliases for cleaner imports
import { useAuth } from "@providers/AuthProvider";
import { getToken } from "@api/token";

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
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle | connecting | connected | disconnected | error

  useEffect(() => {
    // Disconnect and clean up if user logs out
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        if (import.meta.env.DEV) {
          logger.debug("[Socket] Disconnecting due to logout");
        }
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setIsConnected(false);
      setConnectionStatus("idle");
      return;
    }

    // Already have a socket for this session — don't create another
    if (socketRef.current) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace("/api", "") || // strip /api if needed
      "http://localhost:5000";

    if (import.meta.env.DEV) {
      // Socket connecting to server
    }

    setConnectionStatus("connecting");

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
      setConnectionStatus("connected");

      if (process.env.NODE_ENV === "development") {
        console.log("[Socket] Connected successfully");
      }

      // Join user-specific notification room
      newSocket.emit("join", `user:${user.id}`);
      if (user.role === "owner" || user.role === "admin") {
        newSocket.emit("join", `owner:${user.id}`);
        if (import.meta.env.DEV) {
          // Joined owner room
        }
      }
    };

    const onDisconnect = (reason) => {
      setIsConnected(false);
      setConnectionStatus("disconnected");

      if (process.env.NODE_ENV === "development") {
        console.log(`[Socket] Disconnected: ${reason}`);
      }
    };

    const onConnectError = (err) => {
      setConnectionStatus("error");

      if (process.env.NODE_ENV === "development") {
        console.warn("[Socket] Connection error:", err?.message || err);
      }
    };

    const onReconnectAttempt = (attempt) => {
      setConnectionStatus("connecting");

      if (process.env.NODE_ENV === "development") {
        console.log(`[Socket] Reconnection attempt ${attempt}/8`);
      }
    };

    const onReconnectFailed = () => {
      setConnectionStatus("error");

      if (process.env.NODE_ENV === "development") {
        console.error("[Socket] Failed to reconnect after 8 attempts");
      }
    };

    // Register event listeners
    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("connect_error", onConnectError);
    newSocket.on("reconnect_attempt", onReconnectAttempt);
    newSocket.on("reconnect_failed", onReconnectFailed);

    return () => {
      // Cleanup all listeners and disconnect
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("connect_error", onConnectError);
      newSocket.off("reconnect_attempt", onReconnectAttempt);
      newSocket.off("reconnect_failed", onReconnectFailed);

      if (newSocket.connected) {
        newSocket.disconnect();
      }

      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setConnectionStatus("idle");

      if (process.env.NODE_ENV === "development") {
        console.log("[Socket] Cleanup complete");
      }
    };
  }, [isAuthenticated, user?.id, user?.role]);

  // ── Safe emit: silently drops if socket isn't connected ──────────────────
  // Prevents consumers from having to check isConnected before every emit.
  const emit = useCallback((event, ...args) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, ...args);
      return true;
    }
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Socket] Emit failed: not connected (event: ${event})`);
    }
    return false;
  }, []);

  // ── Helper: Register event listener with automatic cleanup ───────────────
  // Usage: const unsubscribe = useSocket().on('bookingCreated', handler);
  const on = useCallback((event, callback) => {
    if (!socketRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Socket] Cannot register listener: socket not initialized (event: ${event})`,
        );
      }
      return () => {};
    }

    socketRef.current.on(event, callback);

    // Return unsubscribe function for cleanup
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  // ── Helper: Register one-time event listener ─────────────────────────────
  const once = useCallback((event, callback) => {
    if (!socketRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[Socket] Cannot register once listener: socket not initialized (event: ${event})`,
        );
      }
      return () => {};
    }

    socketRef.current.once(event, callback);

    // Return unsubscribe function for cleanup
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  // ── Helper: Unregister event listener ────────────────────────────────────
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // ── Context value (memoised to prevent unnecessary re-renders) ───────────
  const value = useMemo(
    () => ({
      socket,
      isConnected,
      connectionStatus, // "idle" | "connecting" | "connected" | "disconnected" | "error"
      emit,
      on, // register persistent listener: on(event, callback) → unsubscribe()
      once, // register one-time listener: once(event, callback) → unsubscribe()
      off, // unregister listener: off(event, callback)
    }),
    [socket, isConnected, connectionStatus, emit, on, once, off],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
