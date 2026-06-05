// src/components/layout/CookieBanner.jsx (or wherever it's located)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay so it animates in nicely after the page finishes loading
    const timer = setTimeout(() => {
      const consent = localStorage.getItem("cookieConsent");
      if (!consent) setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 z-50 p-6 animate-fade-in-up">
      <div className="flex flex-col gap-4">
        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Cookie Preferences
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We use cookies to enhance your experience and analyze site
              traffic. By clicking "Accept", you agree to our{" "}
              <Link
                to="/privacy"
                className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
          <button
            onClick={declineCookies}
            className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-[0.98]"
          >
            Decline
          </button>

          <button
            onClick={acceptCookies}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

