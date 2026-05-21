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

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging (only in development)
    if (process.env.NODE_ENV === "development") {
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#f8f9fa",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              maxWidth: "600px",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#dc3545", marginBottom: "16px" }}>
              ⚠️ Something went wrong
            </h1>

            <p style={{ color: "#666", marginBottom: "24px", fontSize: "16px" }}>
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  marginBottom: "24px",
                  textAlign: "left",
                  backgroundColor: "#f8f9fa",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    marginTop: "12px",
                    overflow: "auto",
                    color: "#333",
                    fontSize: "12px",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
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
