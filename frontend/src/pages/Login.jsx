// src/pages/Login.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

    const roleRoutes = {
      admin: "/admin",
      owner: "/owner",
    };

    const target = roleRoutes[user.role] || "/";
    navigate(target, { replace: true });
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

        const roleRoutes = {
          admin: "/admin",
          owner: "/owner",
        };

        const target = roleRoutes[data?.user?.role] || "/";
        navigate(target, { replace: true });
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Invalid credentials. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [login, identifier, password, loading, authLoading, navigate],
  );

  return (
    <div className="min-h-screen flex">
      {/* LEFT - Branding Panel */}
      <div className="hidden md:flex w-5/12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Statio Nexus"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-3xl font-bold tracking-tight">
            Statio Nexus
          </span>
        </div>

        <div className="z-10">
          <h2 className="text-6xl font-bold leading-none tracking-tighter mb-6 animate-fade-in">
            Welcome back to
            <br />
            <span className="gradient-text">the future</span> of
            <br />
            station management.
          </h2>
          <p className="text-xl text-white/90 max-w-xs leading-relaxed animate-slide-in" style={{animationDelay: '0.3s'}}>
            Real-time. Instant. Effortless.
          </p>
        </div>

        <div className="absolute bottom-12 right-12 text-[180px] opacity-10 font-black leading-none select-none animate-pulse-slow">
          SN
        </div>
      </div>

      {/* RIGHT - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 text-lg transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>

          <div className="mb-10">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              Sign in
            </h1>
            <p className="text-body text-lg">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username */}
            <div>
              <label className="form-label">
                Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or username"
                  className="form-input pl-12"
                  required
                />
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input pl-12 pr-12"
                  required
                />
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-slide-in">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="btn btn-primary w-full py-4 text-lg shadow-2xl"
            >
              {loading || authLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="spinner w-5 h-5"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-sign-in-alt"></i>
                  Sign in
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
