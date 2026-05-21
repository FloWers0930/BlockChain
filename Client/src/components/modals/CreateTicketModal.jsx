// src/components/dashboard/customer/CreateTicketModal.jsx
import { useState } from "react";
import api from "../../shared/api/axios";

export default function CreateTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/admin/support/tickets", formData);

      setSuccess(true);
      setTimeout(() => {
        onTicketCreated?.(data.ticket);
        handleClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", description: "", category: "other" });
    setSuccess(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="px-8 pt-8 pb-2">
          <h2 className="text-3xl font-semibold text-gray-900">
            Create Support Ticket
          </h2>
          <p className="text-gray-600 mt-2">
            Our team will respond as soon as possible
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title / Subject
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              placeholder="e.g. Booking not showing up"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            >
              <option value="booking">Booking Issue</option>
              <option value="payment">Payment Problem</option>
              <option value="technical">Technical Issue</option>
              <option value="account">Account Related</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message / Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="7"
              className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
              placeholder="Please describe your issue in detail..."
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-2xl">
              {error}
            </p>
          )}

          {success && (
            <div className="bg-emerald-100 text-emerald-700 p-4 rounded-3xl text-center font-medium">
              ✅ Ticket created successfully! Admin has been notified.
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-5 text-gray-700 font-medium border border-gray-300 rounded-3xl hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-3xl text-lg transition"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

