// src/pages/ChangePassword.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import zxcvbn from "zxcvbn";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  // Redirect logic
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!user.mustChangePassword) {
      const target = user.role === "admin" ? "/admin" : "/owner";
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      setPasswordFeedback(zxcvbn(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordFeedback && passwordFeedback.score < 3) {
      setError("New password is too weak. Please choose a stronger password.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess("Password changed successfully! Redirecting to dashboard...");

      // Refresh user in context (removes mustChangePassword flag)
      await refreshUser();

      // Redirect after short delay
      setTimeout(() => {
        const target = user?.role === "admin" ? "/admin" : "/owner";
        navigate(target, { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Change Password</h2>
          <p className="text-gray-500 mt-2">
            You are using a temporary password.
            <br />
            Please set a new secure password.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-blue-500 outline-none"
              required
            />

            {formData.newPassword && passwordFeedback && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Password Strength</span>
                  <span
                    className={
                      passwordFeedback.score >= 3
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {passwordFeedback.score >= 3 ? "Strong" : "Weak"}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordFeedback.score >= 3
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${(passwordFeedback.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-blue-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-3xl transition disabled:opacity-70"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full mt-4 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
