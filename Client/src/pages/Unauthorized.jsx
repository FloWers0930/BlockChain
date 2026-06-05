// src/pages/Unauthorized.jsx
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-lg w-full text-center animate-fade-in-up">
        {/* Premium Lock Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-rose-500/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
          Access Restricted
        </h1>

        <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          This area is reserved for station operators and administrators.
          Drivers should use the mobile app to book parking.
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Homepage
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold transition-all shadow-sm active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>

        <p className="mt-10 text-sm text-slate-400">
          Need access?{" "}
          <Link
            to="/contact"
            className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
          >
            Contact our team
          </Link>{" "}
          to request permissions.
        </p>

        {/* Helpful Hint for Station Owners */}
        <div className="mt-8 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
          <p className="text-xs text-indigo-700 font-medium">
            💡 <strong>Station Partner?</strong> Log in at{" "}
            <Link
              to="/login"
              className="underline hover:text-indigo-900 transition-colors"
            >
              /login
            </Link>{" "}
            with your owner credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

