// frontend/src/shared/components/ErrorBoundary.jsx
import React from "react";

/**
 * Error Boundary component - catches React component errors and displays a fallback UI
 * Prevents the entire app from crashing due to errors in child components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Error Info:", errorInfo);
    }

    // Store error and errorInfo in state for display
    this.setState({
      error,
      errorInfo,
    });

    // Send error to logging service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      console.warn("Error logged for production monitoring");
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 text-center animate-fade-in-up">
            {/* Icon Badge */}
            <div className="w-20 h-20 mx-auto mb-6 bg-rose-50 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            {/* Text Content */}
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Something went wrong
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page
              or return to the dashboard. If the problem persists, contact
              support.
            </p>

            {/* Development Error Details (Terminal Style) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-8 text-left bg-slate-900 rounded-2xl overflow-hidden shadow-lg group">
                <summary className="cursor-pointer px-5 py-4 flex items-center justify-between text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-colors">
                  <span className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-rose-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    Developer Stack Trace
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-slate-800">
                  <pre className="text-xs text-slate-400 font-mono overflow-auto max-h-60 no-scrollbar leading-relaxed">
                    <code className="text-rose-400 font-semibold block mb-2">
                      {this.state.error.toString()}
                    </code>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-semibold hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

