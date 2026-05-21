// src/app/main.jsx
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./router";
import { AuthProvider } from "./providers/AuthProvider";
import { SocketProvider } from "./providers/SocketProvider";
import "../shared/styles/index.css";

const LoadingScreen = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-2xl border-4 border-violet-200 border-t-violet-600" />
      <p className="text-slate-500">Loading Statio Nexus...</p>
    </div>
  </div>
);

// Register service worker only in production
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<LoadingScreen />}>
            <App />
          </Suspense>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
);

