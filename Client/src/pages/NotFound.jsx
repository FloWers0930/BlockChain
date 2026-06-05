// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-lg w-full text-center animate-fade-in-up">
        {/* Giant 404 */}
        <h1 className="text-[140px] md:text-[180px] font-black bg-gradient-to-br from-slate-200 to-slate-300 bg-clip-text text-transparent tracking-tighter leading-none mb-2 select-none">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          Page Not Found
        </h2>

        <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Oops! The parking spot you're looking for doesn't exist or has been
          moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <p className="mt-10 text-sm text-slate-400">
          Need help finding your way?{" "}
          <Link
            to="/contact"
            className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default NotFound;

