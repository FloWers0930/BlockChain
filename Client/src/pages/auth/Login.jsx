// src/pages/Login.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.mustChangePassword) {
      navigate("/change-password", { replace: true });
      return;
    }
    const roleRoutes = { admin: "/admin", owner: "/owner" };
    navigate(roleRoutes[user.role] || "/", { replace: true });
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading || authLoading) return;
      setError("");
      setLoading(true);
      try {
        const data = await login(identifier.trim(), password);
        if (data?.user?.mustChangePassword) {
          navigate("/change-password", { replace: true });
          return;
        }
        const roleRoutes = { admin: "/admin", owner: "/owner" };
        navigate(roleRoutes[data?.user?.role] || "/", { replace: true });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Invalid credentials. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [login, identifier, password, loading, authLoading, navigate],
  );

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT — Branding panel ─────────────────────────────────────────── */}
      <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#c026d3] text-white flex-col justify-between p-14 relative overflow-hidden">
        {/* Floating blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-8 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
          <div
            className="absolute bottom-24 right-8 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <img
            src="/assets/star-removebg-preview.jpg"
            alt="Statio Nexus"
            className="w-10 h-10 object-contain rounded-xl"
          />
          <span className="text-2xl font-bold tracking-tight">
            Statio Nexus
          </span>
        </div>

        {/* Headline */}
        <div className="z-10">
          <p className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-6">
            Owner &amp; Admin Portal
          </p>
          <h2 className="text-5xl xl:text-6xl font-bold leading-tight tracking-tight mb-6">
            Welcome back
            <br />
            to the future
            <br />
            <span className="text-white/40">of station</span>
            <br />
            management.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-xs">
            Real-time availability · Automated payments · Full control.
          </p>
        </div>

        {/* Stats strip */}
        <div className="z-10 grid grid-cols-3 gap-4">
          {[
            { value: "24.8k", label: "Users" },
            { value: "142", label: "Stations" },
            { value: "8.7k", label: "Bookings" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-4 border border-white/20"
            >
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-white/60 text-xs tracking-widest uppercase mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Watermark */}
        <div className="absolute bottom-8 right-10 text-[160px] opacity-[0.06] font-black leading-none select-none">
          SN
        </div>
      </div>

      {/* ── RIGHT — Login form ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 xl:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-10 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-500 text-lg mb-10">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="owner@statio-nexus.com"
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-14 transition-all bg-gray-50 hover:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="btn btn-primary w-full py-4 text-lg font-semibold shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading || authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

