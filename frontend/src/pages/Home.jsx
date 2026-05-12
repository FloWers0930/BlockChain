// src/pages/Home.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data } = await api.get("/parking/spots");
        setSpots(data.spots || data.data || data || []);
      } catch (err) {
        console.error("Failed to fetch spots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f1ff] pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 mb-8 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm">Welcome back</p>
              <h1 className="text-3xl font-bold">Statio Nexus</h1>
              <p className="text-blue-100">
                Reserve a parking slot quickly and check your latest activity.
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl">
              🚗
            </div>
          </div>
        </div>

        {/* Slot Status Now */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Slot Status Now
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl">
                📍
              </div>
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-4xl font-bold text-green-600">8</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl">
                🚗
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-4xl font-bold text-red-600">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date & Slots */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow">
          <p className="text-sm text-gray-500 mb-4">Thu, Jan 22 at 3:00 PM</p>
          <div className="flex flex-wrap gap-3">
            {["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"].map((slot) => (
              <div
                key={slot}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-5 py-3 rounded-2xl cursor-pointer transition"
              >
                {slot}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                  P
                </div>
                <div>
                  <p className="font-semibold">Reserve Parking</p>
                  <p className="text-sm text-gray-500">
                    8 slot(s) available to reserve
                  </p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </div>

            <div className="bg-white rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                  📖
                </div>
                <div>
                  <p className="font-semibold">Reservation History</p>
                  <p className="text-sm text-gray-500">
                    0 saved reservation(s)
                  </p>
                </div>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </div>
          </div>
        </div>

        {/* Nearby Spots */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Nearby Parking Spots
        </h2>

        {loading ? (
          <p>Loading spots...</p>
        ) : spots.length === 0 ? (
          <p>No spots available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <div
                key={spot._id}
                className="bg-white rounded-3xl p-6 shadow hover:shadow-xl transition"
              >
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-2xl">{spot.spotNumber}</h3>
                  <span
                    className={`px-4 py-1 text-xs font-semibold rounded-2xl ${spot.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {spot.status?.toUpperCase() || "AVAILABLE"}
                  </span>
                </div>
                <p className="text-gray-500">{spot.location}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Zone: {spot.zone || "General"}
                </p>

                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500">Hourly Rate</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ₱{spot.hourlyRate}
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-blue-700 transition">
                    Reserve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
