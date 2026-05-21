// src/components/dashboard/admin/SupportView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../../../shared/api/axios";
import { useSocket } from "../../../../app/providers/SocketProvider";

export default function SupportView() {
  const { socket } = useSocket();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [notification, setNotification] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch all support tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/support/tickets");
      setTickets(data.tickets || data.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates via shared SocketContext
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchTickets();

    socket.on("newSupportTicket", handleUpdate);
    socket.on("ticketUpdated", handleUpdate);

    fetchTickets(); // Initial load

    return () => {
      socket.off("newSupportTicket", handleUpdate);
      socket.off("ticketUpdated", handleUpdate);
    };
  }, [socket, fetchTickets]);

  const filteredTickets = tickets.filter((ticket) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "open":
        return "bg-gray-100 text-gray-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case "pending":
        return "border-yellow-400";
      case "in-progress":
        return "border-blue-400";
      case "open":
        return "border-gray-400";
      case "resolved":
        return "border-green-400";
      default:
        return "border-gray-300";
    }
  };

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText("");
    setNewStatus(ticket.status);
    setSendEmail(true);
    setMessage({ type: "", text: "" });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    const ticketId = selectedTicket._id || selectedTicket.id;

    try {
      await api.post(`/admin/support/tickets/${ticketId}/reply`, {
        message: responseText.trim(),
        status: newStatus,
        sendEmail: sendEmail,
      });

      setMessage({ type: "success", text: "✅ Response sent successfully!" });
      setTimeout(() => {
        setShowResponseModal(false);
        fetchTickets();
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "❌ Failed to send response." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          Loading support tickets...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50">
          <span className="text-2xl">🔔</span>
          <p className="font-medium">{notification}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Support Tickets</h2>
          <p className="text-gray-500 flex items-center gap-2">
            Manage customer support requests
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-3xl">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-sm mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Search by title, description, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-3xl px-5 py-3.5 pl-12 text-sm outline-none transition-all"
          />
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        <div className="flex flex-wrap gap-3">
          {["all", "open", "pending", "in-progress", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl text-sm font-medium transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "All Tickets" : f.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Tickets</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {tickets.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-4xl font-bold text-yellow-600 mt-2">
            {tickets.filter((t) => t.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">In Progress</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">
            {tickets.filter((t) => t.status === "in-progress").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">Resolved</p>
          <p className="text-4xl font-bold text-green-600 mt-2">
            {tickets.filter((t) => t.status === "resolved").length}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl py-20 text-center text-gray-400">
            No tickets found
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const ticketId = ticket._id || ticket.id;
            const customer = ticket.customer || ticket.user || {};
            const createdAt = ticket.createdAt;

            return (
              <div
                key={ticketId}
                className={`bg-white p-6 rounded-3xl shadow-sm border-l-4 hover:shadow-md transition ${getStatusBorder(ticket.status)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-blue-600">
                      #
                      {typeof ticketId === "string"
                        ? ticketId.slice(-6).toUpperCase()
                        : ticketId}
                    </span>
                    <span
                      className={`px-4 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}
                    >
                      {ticket.status.toUpperCase().replace("-", " ")}
                    </span>
                    {ticket.category && (
                      <span className="px-4 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {ticket.category}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 shrink-0">
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

                <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">
                  {ticket.title || ticket.subject}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {ticket.description || ticket.message}
                </p>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-2xl flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {customer.name || customer.username || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.email || "—"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openResponseModal(ticket)}
                    className="px-6 py-3 bg-blue-600 text-white text-sm rounded-2xl hover:bg-blue-700 transition"
                  >
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">Respond to Ticket</h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-3xl text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-8 flex-1 overflow-auto">
              {/* Ticket Summary */}
              <div className="mb-8 p-5 bg-gray-50 rounded-2xl">
                <div className="flex gap-3 mb-3 flex-wrap">
                  <span className="font-mono font-bold text-blue-600">
                    #
                    {(selectedTicket._id || selectedTicket.id || "")
                      .toString()
                      .slice(-6)
                      .toUpperCase()}
                  </span>
                  <span
                    className={`px-4 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}
                  >
                    {selectedTicket.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-lg">
                  {selectedTicket.title || selectedTicket.subject}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {selectedTicket.description || selectedTicket.message}
                </p>
              </div>

              <form onSubmit={handleSubmitResponse}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows="6"
                  className="w-full px-5 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 outline-none resize-none"
                  placeholder="Write a clear and helpful response..."
                  required
                />

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Ticket Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <label
                    htmlFor="sendEmail"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Send email notification to customer
                  </label>
                </div>

                {message.text && (
                  <div
                    className={`mt-6 p-4 rounded-2xl text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="flex-1 py-5 border border-gray-300 rounded-3xl font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-3xl disabled:opacity-70"
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

