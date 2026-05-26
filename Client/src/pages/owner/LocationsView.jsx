// src/components/dashboard/owner/LocationsView.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import {
  RefreshCw,
  Plus,
  MapPin,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function LocationsView() {
  const { socket } = useSocket();

  const [approvedStations, setApprovedStations] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);

  // ── Section loading + error states ───────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [notification, setNotification] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStations, setSelectedStations] = useState(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableTarget, setDisableTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    address: "",
    zone: "",
    hourlyRate: "",
    totalSpots: "",
  });

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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

  // Fetch all spots for this owner (pagination helper)
  const fetchAllSpots = useCallback(async () => {
    const abortController = new AbortController();
    let allSpots = [];
    let page = 1;
    let hasMore = true;
    const LIMIT = 100;

    try {
      while (hasMore) {
        const res = await api.get("/owner/spots", {
          params: { limit: LIMIT, page },
          signal: abortController.signal,
        });
        const spotsThisPage = res.data?.spots || [];
        allSpots = [...allSpots, ...spotsThisPage];
        hasMore = spotsThisPage.length === LIMIT;
        page++;
      }
      return allSpots;
    } catch (err) {
      if (err.name === "AbortError") {
        if (process.env.NODE_ENV === "development") {
          console.log("Spot fetch cancelled");
        }
      } else {
        throw err;
      }
    }
  }, []);

  const fetchStations = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setError(null);

      try {
        const allSpots = await fetchAllSpots();

        // Pending groups
        const pendingMap = {};
        allSpots
          .filter((s) => s.status === "pending")
          .forEach((spot) => {
            const name = spot.location || "Unknown";
            if (!pendingMap[name])
              pendingMap[name] = {
                name,
                address: spot.address || "",
                totalPendingSpots: 0,
                spots: [],
              };
            pendingMap[name].totalPendingSpots += 1;
            pendingMap[name].spots.push(spot);
          });

        // Approved stations
        const stationMap = {};
        const approvedSpots = allSpots.filter(
          (s) => s.status !== "pending" && s.status !== "rejected",
        );
        approvedSpots.forEach((spot) => {
          const name = spot.location || "Unknown";
          if (!stationMap[name]) {
            stationMap[name] = {
              name,
              address: spot.address || "",
              totalSpots: 0,
              freeSpots: 0,
              usedSpots: 0,
              isEnabled: spot.isEnabled !== false, // Default to true if not set
            };
          }
          stationMap[name].totalSpots += 1;
          if (spot.status === "available") stationMap[name].freeSpots += 1;
          else stationMap[name].usedSpots += 1;
        });

        setPendingGroups(Object.values(pendingMap));
        setApprovedStations(Object.values(stationMap));
        setSelectedStations(new Set());
        setError(null);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Locations] fetch error:", err);
        }
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load stations. Please check your connection and try again.";
        setError(errorMsg);
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [fetchAllSpots],
  );

  // ── Real-time updates (silent refresh) ───────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchStations(true);

    socket.on("spotUpdated", handleUpdate);
    socket.on("spotDeleted", handleUpdate);
    socket.on("newLocationRequest", handleUpdate);
    socket.on("locationApproved", handleUpdate);
    socket.on("locationRejected", handleUpdate);

    fetchStations(false);

    return () => {
      socket.off("spotUpdated", handleUpdate);
      socket.off("spotDeleted", handleUpdate);
      socket.off("newLocationRequest", handleUpdate);
      socket.off("locationApproved", handleUpdate);
      socket.off("locationRejected", handleUpdate);
    };
  }, [socket, fetchStations]);

  const filteredStations = useMemo(
    () =>
      approvedStations.filter(
        (station) =>
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.address.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [approvedStations, searchTerm],
  );

  const toggleSelect = (name) => {
    const newSet = new Set(selectedStations);
    newSet.has(name) ? newSet.delete(name) : newSet.add(name);
    setSelectedStations(newSet);
  };

  const selectAll = () => {
    selectedStations.size === filteredStations.length
      ? setSelectedStations(new Set())
      : setSelectedStations(new Set(filteredStations.map((s) => s.name)));
  };

  const confirmDisable = (station) => {
    setDisableTarget(station);
    setShowDisableConfirm(true);
  };

  const openEditModal = (station) => {
    setEditingStation(station);
    setFormData({
      location: station.name,
      address: station.address || "",
      zone: "",
      hourlyRate: "",
      totalSpots: station.totalSpots || "",
    });
    setShowEditModal(true);
  };

  // ── OPTIMISTIC UI HELPERS ────────────────────────────────────────────────
  const optimisticApproveGroup = (group) => {
    const previousPending = [...pendingGroups];
    const previousApproved = [...approvedStations];

    setPendingGroups((prev) => prev.filter((g) => g.name !== group.name));

    const optimisticStation = {
      name: group.name,
      address: group.address,
      totalSpots: group.totalPendingSpots,
      freeSpots: group.totalPendingSpots,
      usedSpots: 0,
      isEnabled: true,
    };
    setApprovedStations((prev) => [...prev, optimisticStation]);

    return { previousPending, previousApproved };
  };

  const optimisticRejectGroup = (group) => {
    const previousPending = [...pendingGroups];
    setPendingGroups((prev) => prev.filter((g) => g.name !== group.name));
    return previousPending;
  };

  const optimisticAddStation = (newStationData) => {
    const previousApproved = [...approvedStations];
    const optimisticStation = {
      name: newStationData.location,
      address: newStationData.address,
      totalSpots: parseInt(newStationData.totalSpots) || 1,
      freeSpots: parseInt(newStationData.totalSpots) || 1,
      usedSpots: 0,
      isEnabled: true,
    };
    setApprovedStations((prev) => [...prev, optimisticStation]);
    return previousApproved;
  };

  const optimisticEditStation = (oldName, updatedData) => {
    const previousApproved = [...approvedStations];
    setApprovedStations((prev) =>
      prev.map((station) =>
        station.name === oldName
          ? {
              ...station,
              name: updatedData.location,
              address: updatedData.address,
            }
          : station,
      ),
    );
    return previousApproved;
  };

  const optimisticToggleStation = (name, newStatus) => {
    const previousApproved = [...approvedStations];
    setApprovedStations((prev) =>
      prev.map((station) =>
        station.name === name ? { ...station, isEnabled: newStatus } : station,
      ),
    );
    return previousApproved;
  };

  // ── OPTIMISTIC ACTIONS ───────────────────────────────────────────────────
  const handleApproveGroup = async (group) => {
    if (
      !window.confirm(
        `Approve all ${group.totalPendingSpots} spots for "${group.name}"?`,
      )
    )
      return;

    setSubmitting(true);
    const { previousPending, previousApproved } = optimisticApproveGroup(group);

    try {
      await Promise.all(
        group.spots.map((spot) =>
          api.patch(`/owner/spots/${spot._id}`, { status: "available" }),
        ),
      );
      setNotification(`✅ "${group.name}" approved!`);
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setPendingGroups(previousPending);
      setApprovedStations(previousApproved);
      setNotification("⚠️ Failed to approve station");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectGroup = async (group) => {
    if (
      !window.confirm(
        `Permanently delete all ${group.totalPendingSpots} pending spots for "${group.name}"?`,
      )
    )
      return;

    setSubmitting(true);
    const previousPending = optimisticRejectGroup(group);

    try {
      await Promise.all(
        group.spots.map((spot) => api.delete(`/owner/spots/${spot._id}`)),
      );
      setNotification(`❌ "${group.name}" permanently deleted`);
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setPendingGroups(previousPending);
      setNotification("⚠️ Failed to reject station");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Send ONE request with totalSpots parameter
  const handleAddStation = async (e) => {
    e.preventDefault();
    const count = parseInt(formData.totalSpots) || 1;
    setSubmitting(true);

    const previousApproved = optimisticAddStation(formData);

    try {
      // ✅ Send ONE request. Backend handles batch creation, single audit log, and single socket event
      await api.post("/owner/spots", {
        location: formData.location.trim(),
        address: formData.address.trim(),
        zone: formData.zone.trim() || "General",
        hourlyRate: parseFloat(formData.hourlyRate) || 50,
        status: "available",
        totalSpots: count,
      });

      setNotification(`✅ ${count} new station spots added!`);
      setTimeout(() => setNotification(""), 4000);
      setShowAddModal(false);
      setFormData({
        location: "",
        address: "",
        zone: "",
        hourlyRate: "",
        totalSpots: "",
      });

      // Refresh to ensure we have the latest data from the batch insert
      await fetchStations(true);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setApprovedStations(previousApproved);
      setNotification("⚠️ Failed to add station");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStation = async (e) => {
    e.preventDefault();
    if (!editingStation) return;
    setSubmitting(true);

    const previousApproved = optimisticEditStation(
      editingStation.name,
      formData,
    );

    try {
      const allSpots = await fetchAllSpots();
      const spotsToUpdate = allSpots.filter(
        (s) => s.location === editingStation.name,
      );
      const updateData = {
        location: formData.location.trim(),
        address: formData.address.trim(),
        zone: formData.zone.trim() || "General",
        hourlyRate: parseFloat(formData.hourlyRate) || 50,
      };
      await Promise.all(
        spotsToUpdate.map((spot) =>
          api.patch(`/owner/spots/${spot._id}`, updateData),
        ),
      );
      setNotification("✅ Station updated successfully!");
      setTimeout(() => setNotification(""), 3000);
      setShowEditModal(false);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setApprovedStations(previousApproved);
      setNotification("⚠️ Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStation = async (station, newStatus) => {
    setIsProcessing(true);
    const previousApproved = optimisticToggleStation(station.name, newStatus);

    try {
      const allSpots = await fetchAllSpots();
      const spotsToUpdate = allSpots.filter((s) => s.location === station.name);

      await Promise.all(
        spotsToUpdate.map((spot) =>
          api.patch(`/owner/spots/${spot._id}`, { isEnabled: newStatus }),
        ),
      );

      setNotification(
        `✅ "${station.name}" ${newStatus ? "enabled" : "disabled"} successfully!`,
      );
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      if (process.env.NODE_ENV === "development") console.error(err);
      setApprovedStations(previousApproved);
      setNotification("⚠️ Failed to update station status");
    } finally {
      setIsProcessing(false);
      setShowDisableConfirm(false);
      setDisableTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-emerald-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3">
          <i className="fas fa-check-circle text-2xl"></i>
          <p className="font-medium">{notification}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Stations
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage locations • Real-time updates
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Live indicator with real-time clock */}
          <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-full px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">
                {refreshing ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-1" />
                    Syncing…
                  </>
                ) : initialLoading ? (
                  "Loading…"
                ) : (
                  "Live"
                )}
              </span>
            </div>
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
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchStations(true)}
            disabled={refreshing || submitting}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* Add New Station */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all active:scale-95 shadow-xl shadow-blue-300 text-sm"
          >
            <Plus size={18} />
            <span>Add New Station</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <i className="fas fa-triangle-exclamation text-lg" />
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchStations(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Pending Approval Section */}
      {pendingGroups.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold text-amber-700 mb-5 flex items-center gap-2">
            <div className="h-3 w-3 bg-amber-500 rounded-full animate-pulse"></div>
            Pending Approval ({pendingGroups.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingGroups.map((group) => (
              <div
                key={group.name}
                className="bg-white border border-amber-200 hover:border-amber-300 rounded-3xl p-7 shadow-sm"
              >
                <h4 className="font-semibold text-xl">{group.name}</h4>
                <p className="text-slate-500 text-sm mt-1">
                  {group.address || "No address provided"}
                </p>
                <p className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 px-3 py-1 rounded-3xl mt-4">
                  <i className="fas fa-clock"></i> {group.totalPendingSpots}{" "}
                  spots pending
                </p>
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => handleApproveGroup(group)}
                    disabled={submitting}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-3xl"
                  >
                    Approve Station
                  </button>
                  <button
                    onClick={() => handleRejectGroup(group)}
                    disabled={submitting}
                    className="flex-1 py-4 bg-white border border-red-300 text-red-600 font-semibold rounded-3xl"
                  >
                    Reject Station
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Stations - TABLE LAYOUT */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Approved Stations
            </h3>
            <p className="text-slate-400 text-xs">
              {filteredStations.length} total
            </p>
          </div>
          {filteredStations.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStations.size === filteredStations.length}
                onChange={selectAll}
                className="w-5 h-5 accent-blue-600"
              />
              <span className="font-medium text-slate-600">Select all</span>
            </label>
          )}

          {refreshing && !initialLoading && (
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
              <i className="fas fa-spinner animate-spin" />
              Updating…
            </div>
          )}
        </div>

        {initialLoading ? (
          <div className="p-8 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-4 bg-slate-200 rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg">
                No stations found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Add your first station to get started"}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200"
              >
                <Plus size={16} />
                Add New Station
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={
                        selectedStations.size === filteredStations.length
                      }
                      onChange={selectAll}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Station Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Total Spots
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Available
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Occupied
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStations.map((station) => {
                  const occupancyPercent =
                    station.totalSpots > 0
                      ? Math.round(
                          (station.usedSpots / station.totalSpots) * 100,
                        )
                      : 0;
                  return (
                    <tr
                      key={station.name}
                      className={`hover:bg-slate-50 transition-colors ${!station.isEnabled ? "bg-slate-50 opacity-60" : ""}`}
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedStations.has(station.name)}
                          onChange={() => toggleSelect(station.name)}
                          className="w-5 h-5 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {station.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {occupancyPercent}% occupancy
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {station.address || "—"}
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-slate-800">
                          {station.totalSpots}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-emerald-600">
                          {station.freeSpots}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold text-red-600">
                          {station.usedSpots}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${station.isEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${station.isEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                          />
                          {station.isEnabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-3">
                        <button
                          onClick={() => openEditModal(station)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDisable(station)}
                          disabled={isProcessing}
                          className={`font-medium text-sm ${station.isEnabled ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}`}
                        >
                          {station.isEnabled ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b flex items-center justify-between">
              <h3 className="text-3xl font-semibold text-slate-900">
                Add New Station
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStation} className="p-8 space-y-7">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Station Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  placeholder="e.g. Ayala Mall Parking"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  placeholder="123 Main Street, Makati City"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Zone / Section
                  </label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({ ...formData, zone: e.target.value })
                    }
                    className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                    placeholder="Ground Floor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Hourly Rate (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                    placeholder="75"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Number of Spots to Create *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.totalSpots}
                  onChange={(e) =>
                    setFormData({ ...formData, totalSpots: e.target.value })
                  }
                  className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  placeholder="10"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-3xl hover:brightness-110 transition-all disabled:opacity-70"
                >
                  {submitting ? "Adding Stations..." : "Create Station"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Station Modal */}
      {showEditModal && editingStation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b flex items-center justify-between">
              <h3 className="text-3xl font-semibold text-slate-900">
                Edit Station
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditStation} className="p-8 space-y-7">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Station Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Zone / Section
                  </label>
                  <input
                    type="text"
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({ ...formData, zone: e.target.value })
                    }
                    className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Hourly Rate (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    className="w-full rounded-3xl border border-slate-200 px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-3xl hover:brightness-110 transition-all disabled:opacity-70"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable/Enable Confirmation Modal */}
      {showDisableConfirm && disableTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div
              className={`px-8 pt-8 pb-6 border-b flex items-center gap-3 ${disableTarget.isEnabled ? "text-amber-600" : "text-emerald-600"}`}
            >
              {disableTarget.isEnabled ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
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
              )}
              <h3 className="text-2xl font-semibold">
                {disableTarget.isEnabled ? "Disable Station" : "Enable Station"}
              </h3>
            </div>
            <div className="p-8 text-slate-700 text-lg">
              <p>
                {disableTarget.isEnabled
                  ? `Are you sure you want to disable "${disableTarget.name}"? This will make all ${disableTarget.totalSpots} spot(s) unavailable for booking.`
                  : `Are you sure you want to enable "${disableTarget.name}"? This will make all ${disableTarget.totalSpots} spot(s) available for booking.`}
              </p>
              <p
                className={`text-sm mt-4 ${disableTarget.isEnabled ? "text-amber-600" : "text-emerald-600"}`}
              >
                {disableTarget.isEnabled
                  ? "You can re-enable it anytime."
                  : "The station will be immediately available."}
              </p>
            </div>
            <div className="flex gap-4 px-8 py-6 border-t">
              <button
                onClick={() => {
                  setShowDisableConfirm(false);
                  setDisableTarget(null);
                }}
                className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleToggleStation(disableTarget, !disableTarget.isEnabled)
                }
                disabled={isProcessing}
                className={`flex-1 py-5 text-white font-semibold rounded-3xl transition-all disabled:opacity-70 ${disableTarget.isEnabled ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isProcessing
                  ? "Processing..."
                  : disableTarget.isEnabled
                    ? "Disable Station"
                    : "Enable Station"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
