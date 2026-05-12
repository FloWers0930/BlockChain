// src/components/dashboard/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

export default function NotificationBell() {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      const newNotif = {
        id: Date.now(),
        title: data.title || "Booking Update",
        message: data.message || data.details || "New booking activity",
        time: "just now",
        read: false,
        type: data.type || "booking",
      };

      setNotifications((prev) => [newNotif, ...prev].slice(0, 12));
      setUnreadCount((prev) => prev + 1);
    };

    // Booking-specific events
    socket.on("bookingCreated", handleNotification);
    socket.on("bookingCompleted", handleNotification);
    socket.on("bookingUpdated", handleNotification);

    // General events
    socket.on("notification", handleNotification);
    socket.on("newSupportTicket", handleNotification);

    return () => {
      socket.off("bookingCreated", handleNotification);
      socket.off("bookingCompleted", handleNotification);
      socket.off("bookingUpdated", handleNotification);
      socket.off("notification", handleNotification);
      socket.off("newSupportTicket", handleNotification);
    };
  }, [socket]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative flex items-center justify-center w-12 h-12 hover:bg-slate-100 rounded-2xl transition-all duration-300 group"
      >
        <i className="fas fa-bell text-xl text-slate-600 group-hover:text-slate-900 transition-colors"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-premium animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 card-premium shadow-2xl overflow-hidden z-50 animate-scale-in">
          <div className="px-6 py-5 border-b border-slate-200/50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50/50">
            <h3 className="font-bold text-slate-900 text-lg">Crossroad Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:bg-blue-50 px-3 py-1 rounded-full"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-bell-slash text-2xl"></i>
                </div>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm text-slate-500 mt-1">We'll notify you of important updates</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className={`px-6 py-4 border-b border-slate-100 last:border-none hover:bg-slate-50 transition-all duration-200 ${
                    !notif.read ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{notif.title}</p>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 font-medium">
                      {notif.time}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
