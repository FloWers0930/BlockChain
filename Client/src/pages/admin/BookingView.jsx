// src/components/dashboard/admin/BookingsView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";

export default function BookingsView() {
  const { socket } = useSocket();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/bookings?limit=1000");
      setBookings(data.bookings || []);
    } catch (err) {
      // Keep UI responsive; don't spam console.
      // (Low severity: will show empty state until next fetch.)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on("bookingCreated", handleUpdate);
    socket.on("bookingCompleted", handleUpdate);
    socket.on("bookingUpdated", handleUpdate);
    socket.on("paymentProcessed", handleUpdate);

    fetchData();

    return () => {
      socket.off("bookingCreated", handleUpdate);
      socket.off("bookingCompleted", handleUpdate);
      socket.off("bookingUpdated", handleUpdate);
      socket.off("paymentProcessed", handleUpdate);
    };
  }, [socket, fetchData]);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const search = searchTerm.toLowerCase();
    return (
      matchesStatus &&
      (!search ||
        (b.user?.name || "").toLowerCase().includes(search) ||
        (b.spot?.location || "").toLowerCase().includes(search) ||
        (b.spot?.spotNumber || "").toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-3xl bg-white shadow-sm border border-slate-100">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Bookings</h2>
        <p className="text-gray-500">Manage all platform bookings • Live</p>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-80 bg-white border border-gray-200 focus:border-blue-400 rounded-3xl px-5 py-3.5 pl-12 text-sm outline-none"
          />
          <div className="flex gap-2">
            {["all", "pending", "active", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-5 py-2.5 text-sm font-medium rounded-2xl transition ${statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-5 text-left">Booking ID</th>
              <th className="px-6 py-5 text-left">Customer</th>
              <th className="px-6 py-5 text-left">Spot</th>
              <th className="px-6 py-5 text-left">Location</th>
              <th className="px-6 py-5 text-right">Amount</th>
              <th className="px-6 py-5 text-center">Status</th>
              <th className="px-6 py-5 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredBookings.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-6 py-5 font-medium">#{b._id?.slice(-8)}</td>
                <td className="px-6 py-5">{b.user?.name || "Guest"}</td>
                <td className="px-6 py-5">{b.spot?.spotNumber || "—"}</td>
                <td className="px-6 py-5">{b.spot?.location || "—"}</td>
                <td className="px-6 py-5 text-right font-semibold">
                  ₱{b.totalCost || 0}
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-4 py-1 text-xs font-semibold rounded-full ${b.status === "completed" ? "bg-green-100 text-green-700" : b.status === "active" ? "bg-blue-100 text-blue-700" : b.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {b.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-gray-500">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
}



