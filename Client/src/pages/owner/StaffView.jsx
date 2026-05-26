// src/components/dashboard/owner/StaffView.jsx
import { useState, useEffect, useCallback } from "react";
import api from "@api/axios";
import { useSocket } from "@providers/SocketProvider";
import { useAuth } from "@providers/AuthProvider";

// ─── Role badge colors ─────────────────────────────────────────────────────
const ROLE_STYLES = {
  admin: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  manager: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  staff: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  viewer: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  viewer: "Viewer",
};

// ─── Status badge styles ───────────────────────────────────────────────────
const STATUS_STYLES = {
  active: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  inactive: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

export default function StaffView() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Section loading + error states ───────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ── Modal states ─────────────────────────────────────────────────────────
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // ── Form states ──────────────────────────────────────────────────────────
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "staff",
    stationAccess: [],
  });
  const [editForm, setEditForm] = useState({
    name: "",
    role: "staff",
    stationAccess: [],
    status: "active",
  });

  // ── Notification state ───────────────────────────────────────────────────
  const [notification, setNotification] = useState(null);

  // ── Available stations for access assignment ─────────────────────────────
  const [availableStations, setAvailableStations] = useState([]);

  // ── Fetch staff list ─────────────────────────────────────────────────────
  const fetchStaff = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const { data } = await api.get("/owner/staff");
      if (data.success) {
        setStaffList(data.staff || []);
        setAvailableStations(data.availableStations || []);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load staff list";
      setError(msg);
      if (process.env.NODE_ENV === "development") console.error(err);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStaff(false);
  }, [fetchStaff]);

  // ── Real-time socket updates ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handlers = {
      staffAdded: () => fetchStaff(true),
      staffUpdated: () => fetchStaff(true),
      staffRemoved: () => fetchStaff(true),
      staffInviteAccepted: () => fetchStaff(true),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, fetchStaff]);

  // ── Filtered staff list ──────────────────────────────────────────────────
  const filteredStaff = staffList.filter((member) => {
    const matchesSearch =
      !searchQuery ||
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || member.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // ── Show toast notification ──────────────────────────────────────────────
  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // ── Open invite modal ────────────────────────────────────────────────────
  const openInviteModal = () => {
    setInviteForm({ email: "", role: "staff", stationAccess: [] });
    setShowInviteModal(true);
  };

  // ── Open edit modal ──────────────────────────────────────────────────────
  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setEditForm({
      name: staff.name || "",
      role: staff.role || "staff",
      stationAccess: staff.stationAccess || [],
      status: staff.status || "active",
    });
    setShowEditModal(true);
  };

  // ── Open remove confirmation ─────────────────────────────────────────────
  const openRemoveModal = (staff) => {
    setSelectedStaff(staff);
    setShowRemoveModal(true);
  };

  // ── Handle invite form changes ───────────────────────────────────────────
  const handleInviteChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setInviteForm((prev) => ({
        ...prev,
        stationAccess: checked
          ? [...prev.stationAccess, value]
          : prev.stationAccess.filter((id) => id !== value),
      }));
    } else {
      setInviteForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Handle edit form changes ─────────────────────────────────────────────
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setEditForm((prev) => ({
        ...prev,
        stationAccess: checked
          ? [...prev.stationAccess, value]
          : prev.stationAccess.filter((id) => id !== value),
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Send staff invite ────────────────────────────────────────────────────
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email) {
      showNotification("error", "Email address is required");
      return;
    }

    try {
      const { data } = await api.post("/owner/staff/invite", inviteForm);
      if (data.success) {
        showNotification("success", `Invite sent to ${inviteForm.email}`);
        setShowInviteModal(false);
        fetchStaff(true);
      }
    } catch (err) {
      showNotification(
        "error",
        err?.response?.data?.message || "Failed to send invite",
      );
    }
  };

  // ── Update staff member ──────────────────────────────────────────────────
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff?.id) return;

    try {
      const { data } = await api.put(
        `/owner/staff/${selectedStaff.id}`,
        editForm,
      );
      if (data.success) {
        showNotification("success", "Staff member updated");
        setShowEditModal(false);
        fetchStaff(true);
      }
    } catch (err) {
      showNotification(
        "error",
        err?.response?.data?.message || "Failed to update staff",
      );
    }
  };

  // ── Remove staff member ──────────────────────────────────────────────────
  const handleRemoveStaff = async () => {
    if (!selectedStaff?.id) return;

    try {
      const { data } = await api.delete(`/owner/staff/${selectedStaff.id}`);
      if (data.success) {
        showNotification("success", "Staff member removed");
        setShowRemoveModal(false);
        fetchStaff(true);
      }
    } catch (err) {
      showNotification(
        "error",
        err?.response?.data?.message || "Failed to remove staff",
      );
    }
  };

  // ── Resend invite ────────────────────────────────────────────────────────
  const handleResendInvite = async (staff) => {
    try {
      const { data } = await api.post(`/owner/staff/${staff.id}/resend-invite`);
      if (data.success) {
        showNotification("success", `Invite resent to ${staff.email}`);
      }
    } catch (err) {
      showNotification("error", "Failed to resend invite");
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-slate-500 font-medium">Loading team members…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* ── Toast Notification ───────────────────────────────────────────── */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 ${
            notification.type === "success"
              ? "bg-emerald-600"
              : notification.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
          } text-white`}
        >
          {notification.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
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
          ) : notification.type === "error" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <p className="font-medium">{notification.text}</p>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage staff access and permissions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-2">
            <span
              className={`w-2 h-2 rounded-full ${refreshing ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-ping"}`}
            />
            <span className="text-xs text-slate-400 font-medium">
              {refreshing ? "Syncing…" : "Live"}
            </span>
          </div>
          <button
            onClick={() => fetchStaff(true)}
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform ${refreshing ? "animate-spin" : "hover:rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium text-sm">{error}</span>
          </div>
          <button
            onClick={() => fetchStaff(true)}
            className="px-5 py-2 text-sm font-semibold bg-white border border-red-300 hover:bg-red-50 rounded-2xl transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Filters & Actions ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search staff by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Invite Button */}
          <button
            onClick={openInviteModal}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Invite Staff
          </button>
        </div>
      </div>

      {/* ── Staff List Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stations
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-12 h-12 text-slate-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-slate-500 font-medium">
                        No staff members found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Invite your first team member to get started
                      </p>
                      <button
                        onClick={openInviteModal}
                        className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
                      >
                        Invite Staff
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const roleStyle =
                    ROLE_STYLES[staff.role] || ROLE_STYLES.staff;
                  const statusStyle =
                    STATUS_STYLES[staff.status] || STATUS_STYLES.inactive;

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-semibold">
                            {staff.name?.charAt(0)?.toUpperCase() ||
                              staff.email?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {staff.name || "—"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {staff.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          {ROLE_LABELS[staff.role] || staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {staff.stationAccess?.length || 0} station
                          {staff.stationAccess?.length !== 1 ? "s" : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {staff.status?.charAt(0)?.toUpperCase() +
                            staff.status?.slice(1) || "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500">
                          {staff.lastActive
                            ? new Date(staff.lastActive).toLocaleDateString()
                            : "Never"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {staff.status === "pending" && (
                            <button
                              onClick={() => handleResendInvite(staff)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition"
                              title="Resend Invite"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(staff)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => openRemoveModal(staff)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Remove"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Invite Staff Modal ───────────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Invite Team Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  placeholder="staff@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={inviteForm.role}
                  onChange={handleInviteChange}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition bg-white"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">
                  Station Access
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {availableStations.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No stations available. Create a station first.
                    </p>
                  ) : (
                    availableStations.map((station) => (
                      <label
                        key={station.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          name="stationAccess"
                          value={station.id}
                          checked={inviteForm.stationAccess.includes(
                            station.id,
                          )}
                          onChange={handleInviteChange}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">
                          {station.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto">
                          #{station.code}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-4 border border-slate-200 rounded-3xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-3xl font-semibold transition shadow-lg shadow-indigo-500/25"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Staff Modal ─────────────────────────────────────────────── */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Edit Team Member
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition bg-white"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">
                  Station Access
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {availableStations.map((station) => (
                    <label
                      key={station.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        name="stationAccess"
                        value={station.id}
                        checked={editForm.stationAccess.includes(station.id)}
                        onChange={handleEditChange}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">
                        {station.name}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        #{station.code}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 border border-slate-200 rounded-3xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-3xl font-semibold transition shadow-lg shadow-indigo-500/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Remove Confirmation Modal ────────────────────────────────────── */}
      {showRemoveModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900">
                Remove Team Member
              </h3>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-slate-600">
                Are you sure you want to remove{" "}
                <strong className="text-slate-900">
                  {selectedStaff.name || selectedStaff.email}
                </strong>{" "}
                from your team? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="flex-1 py-4 border border-slate-200 rounded-3xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveStaff}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-semibold transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
