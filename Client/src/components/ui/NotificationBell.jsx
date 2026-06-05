// src/components/dashboard/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import { useSocket } from "@providers/SocketProvider";

// Helper to get icon and color based on notification type
const getNotifConfig = (type) => {
  switch (type) {
    case "booking":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
    case "support":
      return {
        bg: "bg-amber-100",
        text: "text-amber-600",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        ),
      };
    case "alert":
      return {
        bg: "bg-red-100",
        text: "text-red-600",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
      };
    default:
      return {
        bg: "bg-blue-100",
        text: "text-blue-600",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
  }
};

export default function NotificationBell() {
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Listen for socket events ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      setNotifications((prev) =>
        [
          {
            id: Date.now(),
            title: data.title || "System Update",
            message: data.message || data.details || "New activity detected",
            time: "just now",
            read: false,
            type: data.type || "system",
          },
          ...prev,
        ].slice(0, 15),
      );
      setUnreadCount((prev) => prev + 1);
    };

    const events = [
      "bookingCreated",
      "bookingCompleted",
      "bookingUpdated",
      "notification",
      "newSupportTicket",
      "auditLogUpdated",
    ];

    events.forEach((e) => socket.on(e, handleNotification));
    return () => events.forEach((e) => socket.off(e, handleNotification));
  }, [socket]);

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 hover:bg-slate-100 rounded-full transition-all duration-200 text-slate-600 hover:text-slate-900 active:scale-95"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[24rem] bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden z-50 animate-fade-in-up origin-top-right">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[28rem] overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-slate-700 mb-1">
                  You're all caught up!
                </p>
                <p className="text-sm text-slate-400">
                  New bookings and alerts will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const config = getNotifConfig(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`px-5 py-4 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors flex gap-4 ${
                      !notif.read ? "bg-indigo-50/30" : ""
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${config.bg} ${config.text} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <p
                          className={`text-sm truncate ${!notif.read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                        >
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-slate-500 text-sm leading-snug line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1.5 font-medium">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

