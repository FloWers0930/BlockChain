// src/components/dashboard/admin/SupportView.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";

// Status configuration
const STATUS_CONFIG = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-400",
    label: "Pending",
  },
  "in-progress": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-400",
    label: "In Progress",
  },
  open: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-400",
    label: "Open",
  },
  resolved: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-400",
    label: "Resolved",
  },
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.open;

export default function SupportView() {
  const { socket } = useSocket();

  const [tickets, setTickets] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // ── Real-time clock state ───────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Fetch all support tickets
  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/admin/support/tickets");
      setTickets(data.tickets || data.data || []);
      setError(null);
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("Failed to fetch support tickets:", err);
      setError("Failed to load support tickets. Please check your connection.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchTickets(true);
    socket.on("newSupportTicket", handleUpdate);
    socket.on("ticketUpdated", handleUpdate);
    fetchTickets(false);
    return () => {
      socket.off("newSupportTicket", handleUpdate);
      socket.off("ticketUpdated", handleUpdate);
    };
  }, [socket, fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = filter === "all" || ticket.status === filter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (ticket.title || ticket.subject || "")
          .toLowerCase()
          .includes(searchLower) ||
        (ticket.description || ticket.message || "")
          .toLowerCase()
          .includes(searchLower) ||
        (ticket.customer?.name || ticket.user?.name || "")
          .toLowerCase()
          .includes(searchLower) ||
        (ticket.customer?.email || ticket.user?.email || "")
          .toLowerCase()
          .includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, filter, searchTerm]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      pending: tickets.filter((t) => t.status === "pending").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    }),
    [tickets],
  );

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText("");
    setNewStatus(ticket.status);
    setSendEmail(true);
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    setSubmitting(true);
    const ticketId = selectedTicket._id || selectedTicket.id;

    try {
      await api.post(`/admin/support/tickets/${ticketId}/reply`, {
        message: responseText.trim(),
        status: newStatus,
        sendEmail: sendEmail,
      });

      setNotification({ type: "success", text: "Response sent successfully!" });
      setTimeout(() => {
        setShowResponseModal(false);
        fetchTickets(true);
        setNotification(null);
      }, 1500);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setNotification({ type: "error", text: "Failed to send response." });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 ${
            notification.type === "success" ? "bg-emerald-600" : "bg-red-600"
          } text-white`}
        >
          {notification.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <p className="font-medium">{notification.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Support Tickets
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage customer support requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live indicator with real-time clock */}
          <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-full px-5 py-2.5">
            <div className="flex items-center gap-2">
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-indigo-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span className="text-xs text-slate-400 font-medium">
                    Syncing…
                  </span>
                </>
              ) : initialLoading ? (
                <span className="text-xs text-slate-400 font-medium">
                  Loading…
                </span>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400 font-medium">
                    Live
                  </span>
                </>
              )}
            </div>
            {!refreshing && !initialLoading && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => fetchTickets(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${refreshing ? "animate-spin" : "hover:rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchTickets(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by title, description, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-3xl bg-white outline-none transition-all text-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "open", "pending", "in-progress", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all"
                ? "All Tickets"
                : f.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
              Total Tickets
            </p>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </div>
          {initialLoading ? (
            <div className="h-8 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-indigo-600 tracking-tighter font-mono">
              {stats.total}
            </p>
          )}
        </div>

        {/* Pending */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
              Pending
            </p>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          {initialLoading ? (
            <div className="h-8 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-amber-600 tracking-tighter font-mono">
              {stats.pending}
            </p>
          )}
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
              In Progress
            </p>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
          {initialLoading ? (
            <div className="h-8 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-blue-600 tracking-tighter font-mono">
              {stats.inProgress}
            </p>
          )}
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
              Resolved
            </p>
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.25}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          {initialLoading ? (
            <div className="h-8 bg-slate-100 rounded-lg w-1/3 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-emerald-600 tracking-tighter font-mono">
              {stats.resolved}
            </p>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {initialLoading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-4 bg-slate-200 rounded w-20" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-full mb-1" />
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-6" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-24" />
                    <div className="h-3 bg-slate-200 rounded w-32" />
                  </div>
                </div>
                <div className="h-10 bg-slate-200 rounded-full w-24" />
              </div>
            </div>
          ))
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg">
                No tickets found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Customer support requests will appear here"}
              </p>
            </div>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const ticketId = ticket._id || ticket.id;
            const customer = ticket.customer || ticket.user || {};
            const createdAt = ticket.createdAt;
            const statusConf = getStatusConfig(ticket.status);

            return (
              <div
                key={ticketId}
                className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 border-l-4 hover:shadow-md transition ${statusConf.border}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      #
                      {typeof ticketId === "string"
                        ? ticketId.slice(-6).toUpperCase()
                        : ticketId}
                    </span>
                    <span
                      className={`px-3 py-1 text-[11px] font-semibold rounded-full ${statusConf.bg} ${statusConf.text}`}
                    >
                      {statusConf.label}
                    </span>
                    {ticket.category && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full">
                        {ticket.category}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {ticket.title || ticket.subject}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-6">
                  {ticket.description || ticket.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {customer.name || customer.username || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {customer.email || "—"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openResponseModal(ticket)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Respond
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Respond to Ticket
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-8 flex-1 overflow-auto space-y-6">
              {/* Ticket Summary */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex gap-3 mb-3 flex-wrap items-center">
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    #
                    {(selectedTicket._id || selectedTicket.id || "")
                      .toString()
                      .slice(-6)
                      .toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full ${getStatusConfig(selectedTicket.status).bg} ${getStatusConfig(selectedTicket.status).text}`}
                  >
                    {getStatusConfig(selectedTicket.status).label}
                  </span>
                </div>
                <h4 className="font-semibold text-lg text-slate-800 mb-1">
                  {selectedTicket.title || selectedTicket.subject}
                </h4>
                <p className="text-slate-600 text-sm">
                  {selectedTicket.description || selectedTicket.message}
                </p>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="6"
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none resize-none transition"
                    placeholder="Write a clear and helpful response..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Update Ticket Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none bg-white transition"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Send email notification to customer
                  </span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 py-4 border border-slate-200 rounded-3xl font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-3xl font-semibold transition disabled:opacity-70 shadow-lg shadow-blue-200"
                  >
                    {submitting ? "Sending..." : "Send Response"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

