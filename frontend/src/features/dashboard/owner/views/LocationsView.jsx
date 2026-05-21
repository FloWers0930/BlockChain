// src/components/dashboard/owner/LocationsView.jsx
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import api from "../../../../shared/api/axios";
import { useSocket } from "../../../../app/providers/SocketProvider";
import { RefreshCw, Plus, MapPin, Pencil, Trash2 } from "lucide-react";

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    address: "",
    zone: "",
    hourlyRate: "",
    totalSpots: "",
  });

  // Fetch all spots for this owner (pagination helper)
  const fetchAllSpots = useCallback(async () => {
    const abortController = new AbortController();
    let allSpots = [];
    let page = 1;
    let hasMore = true;
    const LIMIT = 100; // Reasonable pagination limit

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
                address: spot.address || "Metro Manila",
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
              address: spot.address || "Metro Manila",
              totalSpots: 0,
              freeSpots: 0,
              usedSpots: 0,
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

  const confirmDelete = (type, payload) => {
    setDeleteTarget({ type, ...payload });
    setShowDeleteConfirm(true);
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

  // ── OPTIMISTIC UI HELPERS (unchanged) ─────────────────────────────────────
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

  const optimisticDeleteStations = (namesToDelete) => {
    const previousApproved = [...approvedStations];
    const previousSelected = new Set(selectedStations);
    setApprovedStations((prev) =>
      prev.filter((s) => !namesToDelete.includes(s.name)),
    );
    setSelectedStations((prev) => {
      const newSet = new Set(prev);
      namesToDelete.forEach((n) => newSet.delete(n));
      return newSet;
    });
    return { previousApproved, previousSelected };
  };

  // ── OPTIMISTIC ACTIONS (unchanged) ────────────────────────────────────────
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
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
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
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
      setPendingGroups(previousPending);
      setNotification("⚠️ Failed to reject station");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    const count = parseInt(formData.totalSpots) || 1;
    setSubmitting(true);

    const previousApproved = optimisticAddStation(formData);

    try {
      const payloadBase = {
        location: formData.location.trim(),
        address: formData.address.trim(),
        zone: formData.zone.trim() || "General",
        hourlyRate: parseFloat(formData.hourlyRate) || 50,
        status: "available",
      };
      const promises = Array.from({ length: count }, (_, i) =>
        api.post("/owner/spots", {
          ...payloadBase,
          spotNumber: `S-${Date.now()}-${i + 1}`,
        }),
      );
      await Promise.all(promises);

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
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
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
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
      setApprovedStations(previousApproved);
      setNotification("⚠️ Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteProgress(0);
    setSubmitting(true);

    let namesToDelete = [];
    if (deleteTarget.type === "single") {
      namesToDelete = [deleteTarget.name];
    } else {
      namesToDelete = Array.from(selectedStations);
    }

    const { previousApproved, previousSelected } =
      optimisticDeleteStations(namesToDelete);

    try {
      const allSpots = await fetchAllSpots();
      let spotsToDelete =
        deleteTarget.type === "single"
          ? allSpots.filter((s) => s.location === deleteTarget.name)
          : allSpots.filter((s) => namesToDelete.includes(s.location));

      // Require confirmation for bulk deletes
      if (deleteTarget.type === "bulk" && spotsToDelete.length > 0) {
        const confirmed = window.confirm(
          `Permanently delete ${spotsToDelete.length} spot(s) across ${namesToDelete.length} location(s)? This cannot be undone.`
        );
        if (!confirmed) {
          setApprovedStations(previousApproved);
          setSelectedStations(previousSelected);
          setNotification("❌ Delete cancelled");
          return;
        }
      }

      const totalSpots = spotsToDelete.length;
      const CHUNK_SIZE = 50;

      for (let i = 0; i < spotsToDelete.length; i += CHUNK_SIZE) {
        const chunk = spotsToDelete.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(
          chunk.map((spot) => api.delete(`/owner/spots/${spot._id}`)),
        );
        setDeleteProgress(Math.round(((i + chunk.length) / totalSpots) * 100));
      }

      setDeleteProgress(100);
      setTimeout(() => {
        setNotification("✅ Stations permanently deleted");
        setTimeout(() => setNotification(""), 3500);
      }, 600);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
      setApprovedStations(previousApproved);
      setSelectedStations(previousSelected);
      setNotification("⚠️ Delete failed");
    } finally {
      setSubmitting(false);
      setIsDeleting(false);
      setDeleteTarget(null);
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
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-2">
            <span
              className={`w-2 h-2 rounded-full bg-emerald-400 ${refreshing ? "animate-ping" : "animate-pulse"}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {refreshing ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-1" />
                  Updating…
                </>
              ) : initialLoading ? (
                "Loading…"
              ) : (
                "Live"
              )}
            </span>
          </div>

          {/* Refresh Button - Icon Only */}
          <button
            onClick={() => fetchStations(true)}
            disabled={refreshing || submitting}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
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
                <p className="text-slate-500 text-sm mt-1">{group.address}</p>
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

      {/* Approved Stations */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6 relative">
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
            <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
              <i className="fas fa-spinner animate-spin" />
              Updating…
            </div>
          )}
        </div>

        {initialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow-sm overflow-hidden animate-pulse border border-slate-100"
              >
                <div className="h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
                <div className="p-7 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStations.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-slate-300">
            <i className="fas fa-map-marker-alt text-7xl mb-6" />
            <p className="text-sm text-slate-400">No stations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => {
              const occupancyPercent =
                station.totalSpots > 0
                  ? Math.round((station.usedSpots / station.totalSpots) * 100)
                  : 0;
              return (
                <div
                  key={station.name}
                  className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-slate-200"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  <div className="p-7">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-blue-500" size={22} />
                          <h3 className="text-2xl font-semibold text-slate-900">
                            {station.name}
                          </h3>
                        </div>
                        <p className="text-slate-500 text-sm mt-1 line-clamp-1">
                          {station.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedStations.has(station.name)}
                          onChange={() => toggleSelect(station.name)}
                          className="w-5 h-5 accent-blue-600 cursor-pointer"
                        />
                        <button
                          onClick={() => openEditModal(station)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          onClick={() =>
                            confirmDelete("single", {
                              name: station.name,
                              totalSpots: station.totalSpots,
                            })
                          }
                          disabled={submitting}
                          className="text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-slate-900 tracking-tighter">
                          {station.totalSpots}
                        </div>
                        <div className="uppercase text-[10px] font-semibold tracking-[1px] text-slate-400 mt-1">
                          Total Spots
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-6xl font-bold text-emerald-600 tracking-tighter">
                          {station.freeSpots}
                        </div>
                        <div className="uppercase text-[10px] font-semibold tracking-[1px] text-emerald-500 mt-1">
                          Available
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-red-600 font-semibold text-lg">
                          {station.usedSpots}
                        </div>
                        <div className="text-xs text-red-400 font-medium">
                          OCCUPIED
                        </div>
                      </div>
                      <div className="flex-1 mx-6 h-2 bg-slate-100 rounded-3xl overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-red-400 to-orange-400 transition-all"
                          style={{ width: `${occupancyPercent}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-semibold text-slate-700">
                        {occupancyPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Station Modal (unchanged) */}
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

      {/* EDIT & DELETE modals (unchanged) */}
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

      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b flex items-center gap-3 text-red-600">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
              <h3 className="text-2xl font-semibold">
                Confirm Permanent Deletion
              </h3>
            </div>
            <div className="p-8 text-slate-700 text-lg">
              <p>
                Are you sure you want to permanently delete this station and all
                its spots?
              </p>
              <p className="text-red-500 text-sm mt-4">
                This action cannot be undone.
              </p>
              {isDeleting && (
                <div className="mt-6">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-red-600 transition-all duration-300"
                      style={{ width: `${deleteProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-center">
                    Deleting… {deleteProgress}%
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-4 px-8 py-6 border-t">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-5 text-slate-700 font-medium border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={submitting || isDeleting}
                className="flex-1 py-5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-3xl transition-all disabled:opacity-70"
              >
                {isDeleting ? "Deleting…" : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

