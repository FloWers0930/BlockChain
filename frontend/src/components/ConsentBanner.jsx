// src/components/CookieBanner.jsx
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
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
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 z-[9999] p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use cookies to enhance your experience, analyze usage, and
            provide personalized features. By continuing, you agree to our{" "}
            <a
              href="/privacy"
              className="text-[#4f46e5] hover:underline font-medium"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={declineCookies}
            className="flex-1 sm:flex-none px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-2xl transition"
          >
            Decline
          </button>

          <button
            onClick={acceptCookies}
            className="flex-1 sm:flex-none px-8 py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold rounded-2xl transition"
          >
            Accept All Cookies
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center sm:text-left">
          You can manage your preferences anytime in Settings.
        </p>
      </div>
    </div>
  );
}
