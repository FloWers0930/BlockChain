import { useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: authLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const returnPath = location.state?.from;
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading || authLoading) return;
      setError("");
      setLoading(true);
      try {
        const data = await login(identifier.trim(), password);
        if (!data?.user) throw new Error("Login failed");
        if (data.user.mustChangePassword) {
          navigate("/change-password", { replace: true });
          return;
        }
        if (returnPath) {
          navigate(returnPath, { replace: true });
          return;
        }
        const roleRoutes = {
          admin: "/admin/dashboard",
          owner: "/owner/dashboard",
          user: "/user/dashboard",
        };
        navigate(roleRoutes[data.user.role] || "/", { replace: true });
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
    [login, identifier, password, loading, authLoading, navigate, returnPath],
  );
  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Mobile Header ─────────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between p-6 absolute 
      top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <img
            src="/assets/star-removebg-preview.jpg"
            alt="Statio Nexus"
            className="w-8 h-8 object-contain rounded-lg"
          />
          <span className="text-lg font-bold text-slate-900">Statio Nexus</span>
        </div>
        <Link
          to="/"
          className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Home
        </Link>
      </div>

      {/* ── LEFT — Branding panel ──────────────────────────────────────────── */}
      <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#4f46e5] 
      via-[#7c3aed] to-[#c026d3] text-white flex-col justify-between p-14 
      relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-8 w-72 h-72 bg-purple-300 
          rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
          <div
            className="absolute bottom-24 right-8 w-72 h-72 bg-pink-300 
            rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="flex items-center gap-3 z-10">
          <img
            src="/assets/star-removebg-preview.jpg"
            alt="Statio Nexus"
            className="w-10 h-10 object-contain rounded-xl shadow-lg"
          />
          <span className="text-2xl font-bold tracking-tight">
            Statio Nexus
          </span>
        </div>

        <div className="z-10 animate-fade-in-up">
          <p className="text-white/60 text-sm font-semibold tracking-widest uppercase mb-6">
            Owner &amp; Admin Portal
          </p>
          <h2 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            Welcome back
            <br />
            to the future
            <br />
            <span className="text-white/40">of station</span>
            <br />
            management.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-xs">
            Real-time availability · Automated payments · Full control.
          </p>
        </div>

        <div
          className="z-10 grid grid-cols-3 gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {[
            { value: "24.8k", label: "Users" },
            { value: "142", label: "Stations" },
            { value: "8.7k", label: "Bookings" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-4 border 
              border-white/20 shadow-lg shadow-black/5"
            >
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-white/60 text-xs tracking-widest uppercase mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 right-10 text-[160px] opacity-[0.06] 
        font-black leading-none select-none pointer-events-none">
          SN
        </div>
      </div>

      {/* ── RIGHT — Login form ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 xl:p-16 bg-slate-50 
      md:bg-white relative">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-2 text-slate-400 
            hover:text-indigo-600 mb-10 text-sm font-medium transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>

          <div className="mb-10 mt-16 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
              Sign in
            </h1>
            <p className="text-slate-500 text-lg">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center 
                pointer-events-none text-slate-400 group-focus-within:text-indigo-600 
                transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="owner@statio-nexus.com"
                  className="w-full pl-12 pr-5 py-4 border border-slate-200 
                  rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none 
                  focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white hover:border-slate-300"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 
                  transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center 
                pointer-events-none text-slate-400 group-focus-within:text-indigo-600 
                transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 
                      2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-12 pr-12 py-4 border border-slate-200 
                  rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none 
                  focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 
                  transition-all bg-white hover:border-slate-300"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 
                  hover:text-indigo-600 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 
                        0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.
                        858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.
                        88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 
                        9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 
                        01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 
                        2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 
                        0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 
              px-5 py-4 rounded-2xl text-sm flex items-center gap-3 animate-fade-in-up">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full py-4 text-lg font-semibold text-white bg-gradient-
              to-r from-
            indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-xl 
              hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700 transition-all 
              duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed 
              disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading || authLoading ? (
                <>
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
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-10 text-center text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 font-
              semibold transition-colors"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
