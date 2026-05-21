// src/components/dashboard/owner/StaffView.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../shared/api/axios";
import { useSocket } from "../../../../app/providers/SocketProvider";
import { useAuth } from "../../../../app/providers/AuthProvider";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <button
          onClick={() => onPreview(doc)}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-2 font-medium truncate"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>{doc.name}</span>
        </button>
      </div>

      <button
        onClick={() => onOCR(doc)}
        disabled={ocrLoading[doc.id]}
        className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50 text-sm font-medium"
      >
        {ocrLoading[doc.id] ? (
          <svg
            className="animate-spin w-4 h-4"
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
        ) : (
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
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

    const abortController = new AbortController();

    try {
      const { data } = await api.get("/owner/staff", {
        signal: abortController.signal,
      });
      setStaff(data.staff || data || []);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      if (err.name !== "AbortError") {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch staff:", err);
        }
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load staff data. Please check your connection and try again.";
        setError(errorMsg);
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }

    return () => abortController.abort();
  }, []);

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
    if (!editingStaff && !formData.password?.trim())
      errors.password = "Temporary password is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Lazy load zxcvbn only when typing password
  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password") {
      const { default: zxcvbn } = await import("zxcvbn");
      setPasswordFeedback(zxcvbn(value));
    }

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

  const getBase64 = (doc) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(doc.file);
    });

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
      if (process.env.NODE_ENV === "development") {
        console.error("OCR failed:", err);
      }
      showToast(
        err.response?.data?.message || "OCR failed - click to retry",
        true,
      );
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
      const u = { ...prev };
      delete u[id];
      return u;
    });
  };

  const removeExistingDocument = (id) => {
    if (!window.confirm("Remove this document permanently?")) return;
    setExistingDocuments((prev) => prev.filter((f) => f.id !== id));
    setOcrResults((prev) => {
      const u = { ...prev };
      delete u[id];
      return u;
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

      try {
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
      } catch (apiErr) {
        const errMsg =
          apiErr.response?.data?.message ||
          apiErr.message ||
          "Operation failed";
        showToast(errMsg, true);
        if (process.env.NODE_ENV === "development") {
          console.error("Staff operation failed:", apiErr);
        }
      }
    } catch (err) {
      showToast("An unexpected error occurred", true);
      if (process.env.NODE_ENV === "development") {
        console.error("Form submission error:", err);
      }
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
      try {
        await api.delete(`/owner/staff/${id}`);
        showToast(`✅ ${name} deleted successfully`);
        await fetchStaff(true);
      } catch (apiErr) {
        const errMsg = apiErr.response?.data?.message || "Delete failed";
        showToast(errMsg, true);
        if (process.env.NODE_ENV === "development") {
          console.error("Delete operation failed:", apiErr);
        }
      }
    } catch (err) {
      showToast("An unexpected error occurred during deletion", true);
      if (process.env.NODE_ENV === "development") {
        console.error("Delete error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7">
      {/* Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 ${
            notification.isError ? "bg-red-600" : "bg-emerald-600"
          } text-white`}
        >
          {notification.isError ? (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <p className="font-medium">{notification.text}</p>
        </div>
      )}

      {/* ── Header ── */}
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
          {/* Live status */}
          <div className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 shadow-sm rounded-full">
            {refreshing ? (
              <svg
                className="animate-spin w-4 h-4 text-indigo-400"
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
            ) : initialLoading ? (
              <svg
                className="animate-spin w-4 h-4 text-slate-300"
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
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => fetchStaff(true)}
            disabled={refreshing || submitting}
            className="w-9 h-9 rounded-full bg-white border border-slate-100 shadow-sm hover:bg-slate-50 flex items-center justify-center transition-colors disabled:opacity-60"
            title="Refresh"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${refreshing ? "animate-spin" : "hover:rotate-180"}`}
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

          {/* Search */}
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pl-12 border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-3xl bg-white outline-none transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all active:scale-95 shadow-xl shadow-blue-300 text-sm"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add New Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
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

      {/* ── Staff Table ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        {refreshing && !initialLoading && (
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md shadow-sm px-3 py-1 rounded-2xl text-xs font-medium flex items-center gap-1.5 z-10 text-indigo-500">
            <svg
              className="animate-spin w-3 h-3"
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
          // ── Empty State ──
          <div className="h-72 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-semibold text-lg">
                No staff found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Add your first staff member to get started"}
              </p>
            </div>
            {!searchTerm && isOwnerOrAdmin && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Staff
              </button>
            )}
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
                          className={`px-4 py-1 text-xs rounded-full ${emp.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
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

      {/* ── Add/Edit Modal ── */}
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
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.email ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.phone ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.dateOfBirth ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.dateOfBirth}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.address ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl"
                  >
                    <option value="attendant">Attendant</option>
                    <option value="cashier">Cashier</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.emergencyContactName ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.emergencyContactName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.emergencyContactName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="text"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-2xl ${formErrors.emergencyContactPhone ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.emergencyContactPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.emergencyContactPhone}
                    </p>
                  )}
                </div>
                {!editingStaff && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Temporary Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-2xl ${formErrors.password ? "border-red-500" : "border-slate-200"}`}
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.password}
                      </p>
                    )}
                    {passwordFeedback && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full ${
                                i < passwordFeedback.score
                                  ? [
                                      "bg-red-400",
                                      "bg-orange-400",
                                      "bg-yellow-400",
                                      "bg-emerald-400",
                                    ][passwordFeedback.score - 1]
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        {passwordFeedback.feedback?.suggestions?.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {passwordFeedback.feedback.suggestions[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">
                  Documents
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  onClick={() => document.getElementById("fileInput").click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-slate-300 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-slate-400 text-sm">
                    Drop files here or click to upload (max 5MB each)
                  </p>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                </div>

                {(existingDocuments.length > 0 || newDocuments.length > 0) && (
                  <div className="mt-4 space-y-3">
                    {existingDocuments.map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        doc={doc}
                        isExisting
                        onPreview={openPreview}
                        onOCR={performOCR}
                        onCategoryChange={updateFileCategory}
                        onRemove={removeExistingDocument}
                        ocrLoading={ocrLoading}
                      />
                    ))}
                    {newDocuments.map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        doc={doc}
                        isExisting={false}
                        onPreview={openPreview}
                        onOCR={performOCR}
                        onCategoryChange={updateFileCategory}
                        onRemove={removeNewDocument}
                        ocrLoading={ocrLoading}
                      />
                    ))}
                  </div>
                )}

                {Object.keys(ocrResults).length > 0 && (
                  <div className="mt-4 space-y-3">
                    {Object.entries(ocrResults).map(([id, result]) => (
                      <div
                        key={id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            OCR Result
                          </span>
                          <span className="text-xs text-emerald-600 font-medium">
                            {result.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {result.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

      {/* ── Preview Modal ── */}
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
