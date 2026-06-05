// src/components/dashboard/owner/LocationsView.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import {
  RefreshCw,
  Plus,
  MapPin,
  Eye,
  Pencil,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader,
  X,
  ParkingCircle,
  LayoutGrid,
  DollarSign,
  ShieldCheck,
  ShieldOff,
  Car,
  SquareDashed,
  ChevronDown,
} from "lucide-react";

export default function LocationsView() {
  const { socket } = useSocket();

  const [approvedStations, setApprovedStations] = useState([]);
  const [pendingGroups, setPendingGroups] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");

  const [searchTerm, _setSearchTerm] = useState("");
  const [selectedStations, setSelectedStations] = useState(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Approval confirmation modal state (replaces window.confirm)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStation, setViewingStation] = useState(null);
  const [visibleSpotCount, setVisibleSpotCount] = useState(20);

  const [formData, setFormData] = useState({
    location: "",
    address: "",
    zone: "",
    hourlyRate: "",
    totalSpots: "",
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ Cache fetched spots to avoid redundant fetches in edit/toggle
  const spotsCache = useRef([]);

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

  // ✅ Added MAX_PAGES guard to prevent infinite loop
  const fetchAllSpots = useCallback(async () => {
    let allSpots = [];
    let page = 1;
    let hasMore = true;
    const LIMIT = 100;
    const MAX_PAGES = 50;

    while (hasMore && page <= MAX_PAGES) {
      const res = await api.get("/owner/spots", {
        params: { limit: LIMIT, page },
      });
      const spotsThisPage = res.data?.spots || [];
      allSpots = [...allSpots, ...spotsThisPage];
      hasMore = spotsThisPage.length === LIMIT;
      page++;
    }

    // ✅ Update cache after fetch
    spotsCache.current = allSpots;
    return allSpots;
  }, []);

  const fetchStations = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setError(null);

      try {
        const allSpots = await fetchAllSpots();

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
              isEnabled: spot.isEnabled !== false,
              hourlyRate: spot.hourlyRate || 50,
              zone: spot.zone || "General",
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
        if (import.meta.env.DEV) {
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

  const confirmDeactivate = (station) => {
    setDeactivateTarget(station);
    setShowDeactivateConfirm(true);
  };

  const openEditModal = (station) => {
    setEditingStation(station);
    setFormData({
      location: station.name,
      address: station.address || "",
      zone: station.zone || "",
      hourlyRate: station.hourlyRate || "",
      totalSpots: station.totalSpots || "",
    });
    setShowEditModal(true);
  };

  const handleViewStation = useCallback((station) => {
    setViewingStation(station);
    setShowViewModal(true);
    setVisibleSpotCount(20);
  }, []);

  // ── OPTIMISTIC UI HELPERS ────────────────────────────────────────────────
  const optimisticApproveGroup = (group) => {
    const previousPending = [...pendingGroups];
    const previousApproved = [...approvedStations];
    setPendingGroups((prev) => prev.filter((g) => g.name !== group.name));
    setApprovedStations((prev) => [
      ...prev,
      {
        name: group.name,
        address: group.address,
        totalSpots: group.totalPendingSpots,
        freeSpots: group.totalPendingSpots,
        usedSpots: 0,
        isEnabled: true,
        hourlyRate: 50,
        zone: "General",
      },
    ]);
    return { previousPending, previousApproved };
  };

  const optimisticRejectGroup = (group) => {
    const previousPending = [...pendingGroups];
    setPendingGroups((prev) => prev.filter((g) => g.name !== group.name));
    return previousPending;
  };

  const optimisticAddStation = (newStationData) => {
    const previousApproved = [...approvedStations];
    setApprovedStations((prev) => [
      ...prev,
      {
        name: newStationData.location,
        address: newStationData.address,
        totalSpots: parseInt(newStationData.totalSpots) || 1,
        freeSpots: parseInt(newStationData.totalSpots) || 1,
        usedSpots: 0,
        isEnabled: true,
        hourlyRate: parseFloat(newStationData.hourlyRate) || 50,
        zone: newStationData.zone || "General",
      },
    ]);
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
              zone: updatedData.zone || station.zone,
              hourlyRate:
                parseFloat(updatedData.hourlyRate) || station.hourlyRate,
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

  // ── ACTIONS ───────────────────────────────────────────────────────────────

  const handleApproveGroup = async (group) => {
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
      if (import.meta.env.DEV) console.error(err);
      setPendingGroups(previousPending);
      setApprovedStations(previousApproved);
      setNotification("⚠️ Failed to approve station");
    } finally {
      setSubmitting(false);
      setShowApproveConfirm(false);
      setConfirmTarget(null);
    }
  };

  const handleRejectGroup = async (group) => {
    setSubmitting(true);
    const previousPending = optimisticRejectGroup(group);
    try {
      await Promise.all(
        group.spots.map((spot) => api.delete(`/owner/spots/${spot._id}`)),
      );
      setNotification(`❌ "${group.name}" permanently deleted`);
      setTimeout(() => setNotification(""), 4000);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setPendingGroups(previousPending);
      setNotification("⚠️ Failed to reject station");
    } finally {
      setSubmitting(false);
      setShowRejectConfirm(false);
      setConfirmTarget(null);
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    const count = parseInt(formData.totalSpots) || 1;
    setSubmitting(true);
    const previousApproved = optimisticAddStation(formData);
    try {
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
      await fetchStations(true);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
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
      // ✅ Use cached spots instead of re-fetching
      const allSpots =
        spotsCache.current.length > 0
          ? spotsCache.current
          : await fetchAllSpots();

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
      if (import.meta.env.DEV) console.error(err);
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
      // ✅ Use cached spots instead of re-fetching
      const allSpots =
        spotsCache.current.length > 0
          ? spotsCache.current
          : await fetchAllSpots();

      const spotsToUpdate = allSpots.filter((s) => s.location === station.name);
      await Promise.all(
        spotsToUpdate.map((spot) =>
          api.patch(`/owner/spots/${spot._id}`, { isEnabled: newStatus }),
        ),
      );
      setNotification(
        `✅ "${station.name}" ${
          newStatus ? "activated" : "deactivated"
        } successfully!`,
      );
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setApprovedStations(previousApproved);
      setNotification("⚠️ Failed to update station status");
    } finally {
      setIsProcessing(false);
      setShowDeactivateConfirm(false);
      setDeactivateTarget(null);
    }
  };

  // ✅ Compute parking layout once and reuse
  const generateParkingLayout = (total, used, limit) => {
    const rows = [];
    const spotsPerRow = 8;
    const visibleTotal = Math.min(total, limit);
    const spots = Array.from({ length: visibleTotal }, (_, i) => ({
      id: `${String(i + 1).padStart(2, "0")}`,
      status: i < used ? "occupied" : "free",
    }));
    for (let i = 0; i < spots.length; i += spotsPerRow) {
      rows.push(spots.slice(i, i + spotsPerRow));
    }
    return rows;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-emerald-600 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3">
          <CheckCircle size={24} />
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
          <div className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-full px-5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">
                {refreshing ? (
                  <>
                    <Loader size={14} className="animate-spin inline mr-1" />
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
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs font-mono font-semibold text-slate-600">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchStations(true)}
            disabled={refreshing || submitting}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
            aria-label="Refresh stations"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
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
            <AlertTriangle size={20} />
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
            <div className="h-3 w-3 bg-amber-500 rounded-full animate-pulse" />
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
                  <Clock size={14} /> {group.totalPendingSpots} spots pending
                </p>
                <div className="mt-8 flex gap-3">
                  {/* ✅ Uses custom modal instead of window.confirm */}
                  <button
                    onClick={() => {
                      setConfirmTarget(group);
                      setShowApproveConfirm(true);
                    }}
                    disabled={submitting}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-3xl"
                  >
                    Approve Station
                  </button>
                  <button
                    onClick={() => {
                      setConfirmTarget(group);
                      setShowRejectConfirm(true);
                    }}
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

      {/* Approved Stations Table */}
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
              <Loader size={14} className="animate-spin" />
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
              <MapPin size={40} className="text-slate-300" />
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
                      className={`hover:bg-slate-50 transition-colors ${
                        !station.isEnabled ? "bg-slate-50 opacity-60" : ""
                      }`}
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
                            <ParkingCircle size={20} className="text-white" />
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
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                            station.isEnabled
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              station.isEnabled
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-slate-400"
                            }`}
                          />
                          {station.isEnabled ? "Activated" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewStation(station)}
                            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                            aria-label={`View ${station.name}`}
                            title="View station"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(station)}
                            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                            aria-label={`Edit ${station.name}`}
                            title="Edit station"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => confirmDeactivate(station)}
                            disabled={isProcessing}
                            className={`p-2.5 rounded-2xl transition-all disabled:opacity-50 ${
                              station.isEnabled
                                ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            aria-label={
                              station.isEnabled
                                ? `Deactivate ${station.name}`
                                : `Activate ${station.name}`
                            }
                            title={
                              station.isEnabled
                                ? "Deactivate station"
                                : "Activate station"
                            }
                          >
                            {station.isEnabled ? (
                              <ShieldOff size={18} />
                            ) : (
                              <ShieldCheck size={18} />
                            )}
                          </button>
                        </div>
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
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
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
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
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

      {/* ✅ Approve Confirmation Modal */}
      {showApproveConfirm && confirmTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b flex items-center gap-3 text-emerald-600">
              <CheckCircle size={32} />
              <h3 className="text-2xl font-semibold">Approve Station</h3>
            </div>
            <div className="p-8 text-slate-700 text-lg">
              <p>
                Approve all <strong>{confirmTarget.totalPendingSpots}</strong>{" "}
                spots for "<strong>{confirmTarget.name}</strong>"?
              </p>
              <p className="text-sm mt-4 text-emerald-600">
                All spots will become available for booking immediately.
              </p>
            </div>
            <div className="flex gap-4 px-8 py-6 border-t">
              <button
                onClick={() => {
                  setShowApproveConfirm(false);
                  setConfirmTarget(null);
                }}
                className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveGroup(confirmTarget)}
                disabled={submitting}
                className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-3xl transition-all disabled:opacity-70"
              >
                {submitting ? "Approving..." : "Approve Station"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Reject Confirmation Modal */}
      {showRejectConfirm && confirmTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b flex items-center gap-3 text-red-600">
              <AlertTriangle size={32} />
              <h3 className="text-2xl font-semibold">Reject Station</h3>
            </div>
            <div className="p-8 text-slate-700 text-lg">
              <p>
                Permanently delete all{" "}
                <strong>{confirmTarget.totalPendingSpots}</strong> pending spots
                for "<strong>{confirmTarget.name}</strong>"?
              </p>
              <p className="text-sm mt-4 text-red-600">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4 px-8 py-6 border-t">
              <button
                onClick={() => {
                  setShowRejectConfirm(false);
                  setConfirmTarget(null);
                }}
                className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectGroup(confirmTarget)}
                disabled={submitting}
                className="flex-1 py-5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-3xl transition-all disabled:opacity-70"
              >
                {submitting ? "Rejecting..." : "Reject Station"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate/Activate Confirmation Modal */}
      {showDeactivateConfirm && deactivateTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div
              className={`px-8 pt-8 pb-6 border-b flex items-center gap-3 ${
                deactivateTarget.isEnabled
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {deactivateTarget.isEnabled ? (
                <AlertTriangle size={32} />
              ) : (
                <CheckCircle size={32} />
              )}
              <h3 className="text-2xl font-semibold">
                {deactivateTarget.isEnabled
                  ? "Deactivate Station"
                  : "Activate Station"}
              </h3>
            </div>
            <div className="p-8 text-slate-700 text-lg">
              <p>
                {deactivateTarget.isEnabled
                  ? `Are you sure you want to deactivate "${deactivateTarget.name}"? This will make all ${deactivateTarget.totalSpots} spot(s) unavailable for booking.`
                  : `Are you sure you want to activate "${deactivateTarget.name}"? This will make all ${deactivateTarget.totalSpots} spot(s) available for booking.`}
              </p>
              <p
                className={`text-sm mt-4 ${
                  deactivateTarget.isEnabled
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {deactivateTarget.isEnabled
                  ? "You can activate it anytime."
                  : "The station will be immediately available."}
              </p>
            </div>
            <div className="flex gap-4 px-8 py-6 border-t">
              <button
                onClick={() => {
                  setShowDeactivateConfirm(false);
                  setDeactivateTarget(null);
                }}
                className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleToggleStation(
                    deactivateTarget,
                    !deactivateTarget.isEnabled,
                  )
                }
                disabled={isProcessing}
                className={`flex-1 py-5 text-white font-semibold rounded-3xl transition-all disabled:opacity-70 ${
                  deactivateTarget.isEnabled
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isProcessing
                  ? "Processing..."
                  : deactivateTarget.isEnabled
                  ? "Deactivate Station"
                  : "Activate Station"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Station Details Modal */}
      {showViewModal &&
        viewingStation &&
        (() => {
          // ✅ Compute parking layout once to avoid double call
          const parkingRows = generateParkingLayout(
            viewingStation.totalSpots,
            viewingStation.usedSpots,
            visibleSpotCount,
          );
          return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <ParkingCircle size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {viewingStation.name}
                      </h3>
                      <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                        <MapPin size={16} />
                        {viewingStation.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingStation(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="px-8 py-6 overflow-y-auto flex-1 space-y-8">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-slate-900">
                        {viewingStation.totalSpots}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Total Spots
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        {viewingStation.freeSpots}
                      </div>
                      <div className="text-xs text-emerald-700 mt-1">
                        Available
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {viewingStation.usedSpots}
                      </div>
                      <div className="text-xs text-red-700 mt-1">Occupied</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">
                        Occupancy Rate
                      </span>
                      <span className="text-slate-500">
                        {viewingStation.totalSpots > 0
                          ? Math.round(
                              (viewingStation.usedSpots /
                                viewingStation.totalSpots) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            viewingStation.totalSpots > 0
                              ? (viewingStation.usedSpots /
                                  viewingStation.totalSpots) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <LayoutGrid size={18} className="text-slate-500" />
                      Parking Floor Plan
                    </h4>
                    <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
                        {parkingRows.map((row, rowIdx) => (
                          <div key={rowIdx} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10">
                                Row {String.fromCharCode(65 + rowIdx)}
                              </span>
                              <div className="h-px bg-slate-300 flex-1" />
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                              {row.map((spot) => (
                                <div
                                  key={spot.id}
                                  className={`group relative h-12 sm:h-14 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.03] hover:shadow-md ${
                                    spot.status === "occupied"
                                      ? "border-red-200 bg-red-50/80 text-red-700"
                                      : "border-emerald-200 bg-emerald-50/80 text-emerald-700"
                                  }`}
                                  title={`Spot ${spot.id} • ${
                                    spot.status === "occupied"
                                      ? "Occupied"
                                      : "Available"
                                  }`}
                                >
                                  {spot.status === "occupied" ? (
                                    <Car
                                      size={18}
                                      className="text-red-600 drop-shadow-sm"
                                    />
                                  ) : (
                                    <SquareDashed
                                      size={18}
                                      className="text-emerald-600/60"
                                    />
                                  )}
                                  <span className="text-[10px] font-semibold mt-1 opacity-80">
                                    {spot.id}
                                  </span>
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {spot.status === "occupied"
                                      ? "Occupied"
                                      : "Available"}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* ✅ Uses computed parkingRows instead of calling generateParkingLayout again */}
                            {rowIdx < parkingRows.length - 1 && (
                              <div className="h-4 bg-slate-200/60 rounded-full my-2 flex items-center justify-center border border-slate-300/50">
                                <span className="text-[8px] text-slate-500 font-bold tracking-widest">
                                  DRIVEWAY
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {visibleSpotCount < viewingStation.totalSpots && (
                        <button
                          onClick={() =>
                            setVisibleSpotCount((prev) =>
                              Math.min(prev + 20, viewingStation.totalSpots),
                            )
                          }
                          className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <ChevronDown size={16} />
                          Load{" "}
                          {Math.min(
                            20,
                            viewingStation.totalSpots - visibleSpotCount,
                          )}{" "}
                          More Spots
                        </button>
                      )}

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200/60">
                        <div className="flex items-center gap-5 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                              <SquareDashed
                                size={8}
                                className="text-emerald-500"
                              />
                            </span>{" "}
                            Available
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-50 border border-red-200 flex items-center justify-center">
                              <Car size={8} className="text-red-500" />
                            </span>{" "}
                            Occupied
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          Showing{" "}
                          {Math.min(
                            visibleSpotCount,
                            viewingStation.totalSpots,
                          )}{" "}
                          of {viewingStation.totalSpots} bays
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <DollarSign size={18} className="text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500">
                          Hourly Rate
                        </div>
                        <div className="font-semibold text-slate-800">
                          ₱{viewingStation.hourlyRate || 50}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <LayoutGrid
                        size={18}
                        className="text-purple-600 mt-0.5"
                      />
                      <div>
                        <div className="text-xs text-slate-500">
                          Zone / Section
                        </div>
                        <div className="font-semibold text-slate-800">
                          {viewingStation.zone || "General"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                      {viewingStation.isEnabled ? (
                        <ShieldCheck
                          size={18}
                          className="text-emerald-600 mt-0.5"
                        />
                      ) : (
                        <ShieldOff
                          size={18}
                          className="text-amber-600 mt-0.5"
                        />
                      )}
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                            viewingStation.isEnabled
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {viewingStation.isEnabled
                            ? "Activated"
                            : "Deactivated"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingStation(null);
                    }}
                    className="px-6 py-3 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-white transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingStation(null);
                      openEditModal(viewingStation);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-3xl hover:brightness-110 transition-all"
                  >
                    Edit Station
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

