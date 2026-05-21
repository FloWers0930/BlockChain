// src/components/dashboard/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import { Bell, BellOff } from "lucide-react";
import { useSocket } from "@providers/SocketProvider";

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
            title: data.title || "Booking Update",
            message: data.message || data.details || "New booking activity",
            time: "just now",
            read: false,
            type: data.type || "booking",
          },
          ...prev,
        ].slice(0, 12),
      );
      setUnreadCount((prev) => prev + 1);
    };

    const events = [
      "bookingCreated",
      "bookingCompleted",
      "bookingUpdated",
      "notification",
      "newSupportTicket",
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

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-600 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50/50">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1 rounded-full hover:bg-blue-50 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BellOff size={22} className="text-slate-400" />
                </div>
                <p className="font-medium text-slate-600">
                  No notifications yet
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  We'll notify you of important updates
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-6 py-4 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors ${
                    !notif.read
                      ? "bg-blue-50/40 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {notif.title}
                      </p>
                      <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400">
                        {notif.time}
                      </span>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}



