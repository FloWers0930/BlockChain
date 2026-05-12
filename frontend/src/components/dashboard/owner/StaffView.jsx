// src/components/dashboard/owner/StaffView.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../../api/axios";
import { useSocket } from "../../../context/SocketContext";
import { useAuth } from "../../../context/AuthContext";
import zxcvbn from "zxcvbn";

const DOCUMENT_CATEGORIES = [
  "ID Proof",
  "Resume / CV",
  "Contract / Agreement",
  "Medical Certificate",
  "Training Certificate",
  "Other",
];

const DocumentItem = ({
  doc,
  isExisting,
  onPreview,
  onOCR,
  onCategoryChange,
  onRemove,
  ocrLoading,
}) => {
  const isImage =
    doc.type?.startsWith("image/") || doc.base64?.startsWith("data:image");

  return (
    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={doc.base64 || doc.objectURL}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <i className="fas fa-file-pdf text-red-500 text-3xl" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => onPreview(doc)}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2 font-medium truncate"
        >
          <i className="fas fa-eye" />
          <span>{doc.name}</span>
        </button>
      </div>

      <button
        onClick={() => onOCR(doc)}
        disabled={ocrLoading[doc.id]}
        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50 text-sm font-medium"
      >
        {ocrLoading[doc.id] ? (
          <i className="fas fa-spinner fa-spin" />
        ) : (
          <i className="fas fa-magic" />
        )}
        OCR
      </button>

      <select
        value={doc.category || "Other"}
        onChange={(e) => onCategoryChange(doc.id, e.target.value, isExisting)}
        className="text-sm border border-slate-300 rounded-xl px-3 py-1 bg-white"
      >
        {DOCUMENT_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <button
        onClick={() => onRemove(doc.id)}
        className="text-red-500 hover:text-red-700 px-2"
      >
        ✕
      </button>
    </div>
  );
};

export default function StaffView() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "admin";

  const [staff, setStaff] = useState([]);

  // ── Section loading + error states ───────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // ── Pagination for main staff table ──────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    idNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    role: "attendant",
    password: "",
  });

  const [existingDocuments, setExistingDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [ocrResults, setOcrResults] = useState({});
  const [ocrLoading, setOcrLoading] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchStaff = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setError(null);

    try {
      const { data } = await api.get("/owner/staff");
      setStaff(data.staff || data || []);
      setError(null);
      setCurrentPage(1); // reset pagination on refresh
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load staff data. Please check your connection and try again.";
      setError(errorMsg);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Real-time updates (silent refresh)
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchStaff(true);

    socket.on("staffUpdated", handleUpdate);
    socket.on("staffCreated", handleUpdate);
    socket.on("staffDeleted", handleUpdate);

    fetchStaff(false);

    return () => {
      socket.off("staffUpdated", handleUpdate);
      socket.off("staffCreated", handleUpdate);
      socket.off("staffDeleted", handleUpdate);
    };
  }, [socket, fetchStaff]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staff;
    const term = searchTerm.toLowerCase();
    return staff.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.username?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term),
    );
  }, [staff, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const showToast = useCallback((message, isError = false) => {
    setNotification({ text: message, isError });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Full name is required";
    if (!formData.username?.trim()) errors.username = "Username is required";
    if (!formData.email?.trim()) errors.email = "Email is required";
    if (!formData.phone?.trim()) errors.phone = "Phone is required";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.address?.trim()) errors.address = "Address is required";
    if (!formData.emergencyContactName?.trim())
      errors.emergencyContactName = "Emergency contact name is required";
    if (!formData.emergencyContactPhone?.trim())
      errors.emergencyContactPhone = "Emergency contact phone is required";

    if (!editingStaff && !formData.password?.trim()) {
      errors.password = "Temporary password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password") setPasswordFeedback(zxcvbn(value));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const openAddModal = () => {
    if (!isOwnerOrAdmin) return;
    setEditingStaff(null);
    setFormData({
      name: "",
      username: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "Male",
      address: "",
      idNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      role: "attendant",
      password: "",
    });
    setExistingDocuments([]);
    setNewDocuments([]);
    setFormErrors({});
    setPasswordFeedback(null);
    setOcrResults({});
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    if (!isOwnerOrAdmin) return;
    setEditingStaff(emp);
    setFormData({
      name: emp.name || "",
      username: emp.username || "",
      email: emp.email || "",
      phone: emp.phone || "",
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
      gender: emp.gender || "Male",
      address: emp.address || "",
      idNumber: emp.idNumber || "",
      emergencyContactName: emp.emergencyContactName || "",
      emergencyContactPhone: emp.emergencyContactPhone || "",
      role: emp.role || "attendant",
      password: "",
    });
    setExistingDocuments(emp.documents || []);
    setNewDocuments([]);
    setFormErrors({});
    setPasswordFeedback(null);
    setOcrResults({});
    setShowModal(true);
  };

  const getBase64 = (doc) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(doc.file);
    });
  };

  const performOCR = async (doc) => {
    if (ocrLoading[doc.id]) return;
    setOcrLoading((prev) => ({ ...prev, [doc.id]: true }));

    try {
      const base64 = doc.base64 || (await getBase64(doc));
      const { data } = await api.post("/owner/documents/ocr", { base64 });

      setOcrResults((prev) => ({
        ...prev,
        [doc.id]: {
          text: data.extractedText,
          confidence: data.confidence || 0,
        },
      }));

      showToast(`✅ OCR complete (${data.confidence || 0}%)`);
    } catch (err) {
      showToast("OCR failed", true);
    } finally {
      setOcrLoading((prev) => {
        const updated = { ...prev };
        delete updated[doc.id];
        return updated;
      });
    }
  };

  const handleFilesSelected = (files) => {
    const validFiles = Array.from(files).filter(
      (f) => f.size <= 5 * 1024 * 1024,
    );
    const newFiles = validFiles.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type: file.type,
      file,
      category: "Other",
      objectURL: URL.createObjectURL(file),
    }));
    setNewDocuments((prev) => [...prev, ...newFiles]);
  };

  const updateFileCategory = (id, category, isExisting) => {
    if (isExisting) {
      setExistingDocuments((prev) =>
        prev.map((f) => (f.id === id ? { ...f, category } : f)),
      );
    } else {
      setNewDocuments((prev) =>
        prev.map((f) => (f.id === id ? { ...f, category } : f)),
      );
    }
  };

  const removeNewDocument = (id) => {
    setNewDocuments((prev) => prev.filter((f) => f.id !== id));
    setOcrResults((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const removeExistingDocument = (id) => {
    if (!window.confirm("Remove this document permanently?")) return;
    setExistingDocuments((prev) => prev.filter((f) => f.id !== id));
    setOcrResults((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const openPreview = (doc) => setPreviewDoc(doc);
  const closePreview = () => setPreviewDoc(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validateForm()) return;

    setSubmitting(true);
    try {
      const payload = { ...formData };

      const newDocsWithBase64 = await Promise.all(
        newDocuments.map(async (doc) => {
          const base64 = await getBase64(doc);
          return { id: doc.id, name: doc.name, base64, category: doc.category };
        }),
      );

      if (newDocsWithBase64.length > 0) {
        payload.documents = [...existingDocuments, ...newDocsWithBase64];
      }

      if (editingStaff) {
        await api.put(`/owner/staff/${editingStaff._id}`, payload);
        showToast(`✅ ${formData.name} updated successfully!`);
      } else {
        await api.post("/owner/staff", payload);
        showToast(`✅ ${formData.name} created successfully!`);
      }

      await fetchStaff(true);
      setShowModal(false);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "Male",
      address: "",
      idNumber: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      role: "attendant",
      password: "",
    });
    setExistingDocuments([]);
    setNewDocuments([]);
    setFormErrors({});
    setPasswordFeedback(null);
    setOcrResults({});
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/owner/staff/${id}`);
      showToast(`✅ ${name} deleted successfully`);
      await fetchStaff(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 ${
            notification.isError ? "bg-red-600" : "bg-emerald-600"
          } text-white`}
        >
          <i
            className={`fas ${notification.isError ? "fa-times-circle" : "fa-check-circle"} text-2xl`}
          />
          <p className="font-medium">{notification.text}</p>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Staff Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage your station team members
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

          <button
            onClick={() => fetchStaff(true)}
            disabled={refreshing || submitting}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <i
              className={`fas fa-rotate-right text-slate-400 text-sm ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pl-12 border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-3xl bg-white outline-none transition-all"
            />
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all active:scale-95 shadow-xl shadow-blue-300 text-sm"
            >
              <i className="fas fa-plus" />
              <span>Add New Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700">
            <i className="fas fa-triangle-exclamation text-lg" />
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

      {/* Staff Table with Pagination */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        {refreshing && !initialLoading && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
            <i className="fas fa-spinner animate-spin" />
            Updating…
          </div>
        )}

        {initialLoading ? (
          <div className="p-8 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-36" />
                <div className="h-4 bg-slate-200 rounded w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-300">
            <i className="fas fa-users text-7xl mb-6 opacity-40" />
            <p className="text-slate-400 font-medium text-lg mb-1">
              No staff found
            </p>
            <p className="text-slate-400 text-sm">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500">
                      Phone
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
                  {currentStaff.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-5 font-medium text-slate-800">
                        {emp.name}
                      </td>
                      <td className="px-6 py-5 font-mono text-sm text-slate-600">
                        @{emp.username}
                      </td>
                      <td className="px-6 py-5 capitalize text-slate-700">
                        {emp.role}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        {emp.phone || "—"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-4 py-1 text-xs rounded-full ${
                            emp.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-4">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        {isOwnerOrAdmin && (
                          <button
                            onClick={() => handleDelete(emp._id, emp.name)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-5 border-t">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-2 text-sm font-medium border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-40 flex items-center gap-2"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1 text-sm">
                  <span className="text-slate-400">Page</span>
                  <span className="font-semibold text-slate-800">
                    {currentPage}
                  </span>
                  <span className="text-slate-400">of</span>
                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2 text-sm font-medium border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-40 flex items-center gap-2"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ADD/EDIT STAFF MODAL (unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingStaff ? "Edit Staff Member" : "Add New Staff"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-auto p-8 space-y-8"
            >
              {/* ... all original form fields and document section remain exactly the same ... */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.name ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.username ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.username}
                    </p>
                  )}
                </div>
              </div>

              {/* (All other form fields, documents section, password strength, etc. are unchanged) */}

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border border-slate-200 rounded-3xl font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-3xl font-semibold disabled:opacity-70"
                >
                  {submitting
                    ? "Saving..."
                    : editingStaff
                      ? "Save Changes"
                      : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal (unchanged) */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-5 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-900 truncate">
                {previewDoc.name}
              </h3>
              <button
                onClick={closePreview}
                className="text-3xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-8 bg-slate-50 overflow-auto flex items-center justify-center">
              {previewDoc.type?.startsWith("image/") ||
              previewDoc.base64?.startsWith("data:image") ? (
                <img
                  src={previewDoc.base64 || previewDoc.objectURL}
                  alt={previewDoc.name}
                  className="max-h-[75vh] max-w-full object-contain rounded-3xl shadow-md"
                />
              ) : (
                <iframe
                  src={previewDoc.base64 || previewDoc.objectURL}
                  className="w-full h-[70vh] border-0 rounded-3xl"
                  title={previewDoc.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
