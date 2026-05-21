// src/components/dashboard/admin/UsersView.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../../shared/api/axios";
import { useSocket } from "../../../../app/providers/SocketProvider";

const ROW_HEIGHT = 68;

export default function UsersView() {
  const { socket } = useSocket();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Fetch all users + staff
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, staffRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/owner/staff"),
      ]);

      const userList = usersRes?.data?.users || usersRes?.data?.data || [];
      const staffList = staffRes?.data?.staff || staffRes?.data?.data || [];

      const userMap = new Map();
      [...userList, ...staffList].forEach((u) => {
        const key = u._id || u.email;
        if (key) {
          userMap.set(key, {
            ...u,
            category: u.role?.toUpperCase() || u.category || "USER",
          });
        }
      });

      setUsers(Array.from(userMap.values()));
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch users:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserActivity = useCallback(async (userId) => {
    if (!userId) return;
    setActivityLoading(true);
    try {
      const { data } = await api.get(`/admin/audit?userId=${userId}&limit=30`);
      setActivities(data.activities || data.audits || data.data || []);
    } catch (err) {
      console.error(err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Real-time updates via shared SocketContext
  useEffect(() => {
    if (!socket) return;

    const handleActivity = (activity) => {
      if (
        selectedUser &&
        (activity.user === selectedUser._id ||
          activity.user === selectedUser.id)
      ) {
        setActivities((prev) => [activity, ...prev].slice(0, 30));
      }
      if (
        activity.action === "staff_created" ||
        activity.action === "user_updated"
      ) {
        fetchAllUsers();
      }
    };

    socket.on("userActivity", handleActivity);
    socket.on("auditLogUpdated", handleActivity);

    fetchAllUsers(); // Initial load

    return () => {
      socket.off("userActivity", handleActivity);
      socket.off("auditLogUpdated", handleActivity);
    };
  }, [socket, selectedUser, fetchAllUsers]);

  const openActivityModal = useCallback(
    (user) => {
      setSelectedUser(user);
      setShowActivityModal(true);
      fetchUserActivity(user?._id || user?.id);
    },
    [fetchUserActivity],
  );

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      const searchString =
        `${user?.name || ""} ${user?.username || ""} ${user?.email || ""}`.toLowerCase();
      return (
        searchString.includes(searchTerm.toLowerCase()) &&
        (roleFilter === "all" || user?.category === roleFilter) &&
        (statusFilter === "all" ||
          (statusFilter === "active" && user?.isActive) ||
          (statusFilter === "inactive" && !user?.isActive))
      );
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">
            User Management
          </h2>
          <p className="text-gray-500">Live view of all registered users</p>
        </div>
        <button
          onClick={fetchAllUsers}
          className="px-6 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 flex items-center gap-2 font-medium"
        >
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {["all", "OWNER", "STAFF", "ADMIN", "USER"].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-5 py-2 rounded-3xl font-medium transition ${
              roleFilter === role
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {role === "all" ? "All Users" : role}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-6 py-5 text-left">User</th>
                <th className="px-6 py-5 text-left">Role</th>
                <th className="px-6 py-5 text-left">Status</th>
                <th className="px-6 py-5 text-left">Last Login</th>
                <th className="px-6 py-5 text-right">Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 last:border-none"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-2xl flex items-center justify-center font-medium text-gray-700">
                        {(user.name || user.username || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-4 py-1 text-xs font-semibold rounded-full ${
                        user.category === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : user.category === "OWNER"
                            ? "bg-amber-100 text-amber-700"
                            : user.category === "STAFF"
                              ? "bg-teal-100 text-teal-700"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-4 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => openActivityModal(user)}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <i className="fas fa-history"></i> View Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-400">No users found</div>
        )}
      </div>

      {/* Activity Timeline Modal */}
      {showActivityModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Activity Timeline</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center text-3xl">
                👤
              </div>
              <div>
                <div className="font-semibold text-xl">
                  {selectedUser.name || selectedUser.username}
                </div>
                <div className="text-gray-500">{selectedUser.email}</div>
              </div>
            </div>

            {activityLoading ? (
              <div className="text-center py-12">Loading activity...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No activity recorded yet
              </div>
            ) : (
              <div className="relative pl-8 border-l-2 border-gray-200 space-y-8">
                {activities.map((activity) => (
                  <div key={activity._id || activity.id} className="relative">
                    <div className="absolute -left-8 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">
                      📌
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                      {activity.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 text-center">
              <button
                onClick={() => setShowActivityModal(false)}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

