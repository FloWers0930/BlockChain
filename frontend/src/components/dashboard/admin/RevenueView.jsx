// src/components/dashboard/admin/RevenueView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../../api/axios";
import { useSocket } from "../../../context/SocketContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RevenueView() {
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
      console.error(err);
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

  // Stats
  const calculateStats = () => {
    let today = 0,
      month = 0,
      total = 0,
      pending = 0;
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString();

    bookings.forEach((b) => {
      const amount = parseFloat(b.totalCost) || 0;
      if (b.paymentStatus === "paid") {
        total += amount;
        if (b.createdAt >= todayStart) today += amount;
        const d = new Date(b.createdAt);
        if (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
          month += amount;
      } else if (b.paymentStatus === "pending") {
        pending += amount;
      }
    });
    return { today, month, total, pending };
  };

  const stats = calculateStats();

  // Revenue trend (last 30 days)
  const revenueTrend = (() => {
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      map[key] = 0;
    }
    bookings.forEach((b) => {
      if (b.paymentStatus !== "paid") return;
      const d = new Date(b.createdAt);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (key in map) map[key] += parseFloat(b.totalCost) || 0;
    });
    return Object.entries(map).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
    }));
  })();

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

  const downloadCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "ID",
      "Customer",
      "Owner",
      "Spot",
      "Location",
      "Amount",
      "Status",
      "Payment",
      "Date",
    ];
    const csv = [
      headers.join(","),
      ...bookings.map((b) =>
        [
          b._id?.slice(-8),
          b.user?.name || "Guest",
          b.spot?.owner?.name || "—",
          b.spot?.spotNumber || "—",
          b.spot?.location || "—",
          b.totalCost || 0,
          b.status || "—",
          b.paymentStatus || "—",
          new Date(b.createdAt).toLocaleDateString(),
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Revenue Center</h2>
          <p className="text-gray-500">Platform-wide financials • Live</p>
        </div>
        <button
          onClick={downloadCSV}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-semibold flex items-center gap-2"
        >
          📤 Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">Today</p>
          <p className="text-4xl font-bold text-green-600">
            ₱{stats.today.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">This Month</p>
          <p className="text-4xl font-bold text-blue-600">
            ₱{stats.month.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">Pending Payouts</p>
          <p className="text-4xl font-bold text-yellow-600">
            ₱{stats.pending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Earnings</p>
          <p className="text-4xl font-bold text-gray-800">
            ₱{stats.total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <h3 className="font-semibold mb-4">Revenue Trend • Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={revenueTrend}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `₱${v / 1000}k`}
            />
            <Tooltip formatter={(v) => [`₱${v.toLocaleString()}`, "Revenue"]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
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
