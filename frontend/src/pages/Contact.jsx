// src/pages/Contact.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Contact() {
  const navigate = useNavigate();

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
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data } = await api.post("/admin/support/tickets", {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      });

      setSuccess(true);
      console.log("✅ Ticket created:", data.ticket);

      setTimeout(() => {
        setFormData({ title: "", description: "", category: "other" });
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f1ff]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 mb-12 font-medium text-lg transition"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about adding your parking location, partnership
            opportunities, or need support? We're here to help.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="md:col-span-7 bg-white rounded-3xl shadow-xl p-10">
            <h2 className="text-3xl font-semibold mb-8">Send us a message</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    placeholder="John Reyes"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    placeholder="you@yourparking.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="Partnership Inquiry / Support Request"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="8"
                  className="w-full px-6 py-4 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
                  placeholder="Tell us about your parking business or how we can assist you..."
                  required
                ></textarea>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && (
                <p className="text-emerald-600 bg-emerald-100 p-4 rounded-2xl text-center font-medium">
                  ✅ Message sent successfully! Our team has been notified.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-3xl text-lg transition"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-10 shadow-xl">
              <h3 className="text-2xl font-semibold mb-8">
                Contact Information
              </h3>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="text-4xl">✉️</div>
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <a
                      href="mailto:support@StatioNexus.com"
                      className="text-blue-600 hover:underline text-xl"
                    >
                      support@StatioNexus.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="text-4xl">📞</div>
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <a
                      href="tel:+639171234567"
                      className="text-blue-600 hover:underline text-xl"
                    >
                      +63 917 123 4567
                    </a>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="text-4xl">📍</div>
                  <div>
                    <p className="font-medium text-gray-700">Office</p>
                    <p className="text-gray-600">
                      Makati City, Metro Manila, Philippines
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl text-center">
              <p className="text-gray-600 text-lg">
                This page is for parking owners, operators, and business
                inquiries.
                <br />
                <span className="font-medium">
                  Drivers can also use this form for support.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
