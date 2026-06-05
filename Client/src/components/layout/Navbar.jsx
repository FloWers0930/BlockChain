// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ onNavigate, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);

  const isHero = activeSection === "home";

  const navItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "about", label: "About" },
    { id: "faq", label: "FAQ" },
    { id: "pricing", label: "Pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isHero
          ? "bg-slate-900 border-b border-white/10"
          : "bg-white border-b border-slate-200 shadow-lg shadow-slate-900/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* LEFT - Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-3 group"
              onClick={() => {
                if (onNavigate) onNavigate("home");
                setIsOpen(false);
              }}
            >
              <img
                src="/assets/star-removebg-preview.jpg"
                alt="Statio Nexus"
                className="w-10 h-10 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
              />
              <span
                className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                  isHero
                    ? "text-white"
                    : "bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#c026d3] bg-clip-text text-transparent"
                }`}
              >
                Statio Nexus
              </span>
            </Link>
          </div>

          {/* CENTER - Desktop Menu */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`relative px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-2xl ${
                  activeSection === item.id
                    ? isHero
                      ? "text-white bg-white/10"
                      : "text-indigo-600 bg-indigo-50"
                    : isHero
                    ? "text-white/70 hover:text-white hover:bg-white/5"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full transition-colors duration-300 ${
                      isHero ? "bg-indigo-400" : "bg-indigo-600"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* RIGHT - ✅ Get the App button now navigates to /download */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/download"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white shadow-indigo-500/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Get the App
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-xl transition-all duration-300 ${
              isHero
                ? "text-white hover:bg-white/10"
                : "text-slate-700 hover:bg-slate-100"
            }`}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 relative flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-6 h-6 absolute transition-all duration-300 ${
                  isOpen
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-6 h-6 absolute transition-all duration-300 ${
                  isOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full border-b shadow-xl transition-all duration-300 origin-top transform ${
          isHero ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
        } ${
          isOpen
            ? "scale-y-100 opacity-100"
            : "scale-y-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (onNavigate) onNavigate(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-5 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ${
                activeSection === item.id
                  ? isHero
                    ? "bg-white/10 text-white"
                    : "bg-indigo-50 text-indigo-600"
                  : isHero
                  ? "text-white/80 hover:bg-white/5 hover:text-white"
                  : "text-slate-800 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* ✅ Mobile Get the App also navigates to /download */}
          <Link
            to="/download"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 mt-4 rounded-2xl font-semibold shadow-lg transition-all active:scale-95 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Get the App
          </Link>
        </div>
      </div>
    </nav>
  );
}
  
