// src/pages/CustomerSupport.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import CreateTicketModal from "../components/dashboard/customer/CreateTicketModal";

export default function CustomerSupport() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch customer's own tickets - CORRECT PATH
  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/support/my-tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to load your tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleTicketCreated = () => {
    fetchMyTickets(); // refresh list after new ticket
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-gray-900">
              My Support Tickets
            </h1>
            <p className="text-gray-600">
              Track your tickets and get help from our team
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-3xl flex items-center gap-3 transition"
          >
            <span className="text-xl">✚</span>
            New Ticket
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading your tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6">📬</div>
            <h3 className="text-2xl font-semibold mb-3">No tickets yet</h3>
            <p className="text-gray-500 mb-8">
              Create your first support ticket below
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-10 py-4 bg-teal-600 text-white rounded-3xl font-medium"
            >
              Create First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-white rounded-3xl p-6 hover:shadow-xl transition border border-transparent hover:border-teal-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs bg-gray-100 px-3 py-1 rounded-2xl">
                        {ticket.ticketNumber || `#${ticket._id?.slice(-6)}`}
                      </span>
                      <span
                        className={`px-4 py-1 text-xs font-medium rounded-3xl ${
                          ticket.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : ticket.status === "open"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xl">{ticket.title}</h3>
                    <p className="text-gray-600 line-clamp-2 mt-2">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="text-right text-sm text-gray-500 ml-6">
                    <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    {ticket.replies?.length > 0 && (
                      <p className="text-teal-600 mt-1">
                        {ticket.replies.length} reply
                        {ticket.replies.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Ticket Modal */}
        <CreateTicketModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      </div>
    </div>
  );
}
