// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Download } from "lucide-react";

export default function Navbar({ onNavigate, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "about", label: "About" },
    { id: "faq", label: "FAQ" },
    { id: "pricing", label: "Pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 border-b border-gray-100 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white/95"
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
              <div className="relative">
                <img
                  src="/assets/star-removebg-preview.jpg"
                  alt="Statio Nexus"
                  className="w-10 h-10 object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                />
              </div>

              <span className="text-2xl font-bold bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#c026d3] bg-clip-text text-transparent tracking-tight">
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
                className={`relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-2xl ${
                  activeSection === item.id
                    ? "text-[#4f46e5] bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm"
                    : "text-gray-600 hover:text-[#4f46e5] hover:bg-gray-100"
                }`}
              >
                {item.label}

                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* RIGHT - Download Button */}
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-medium shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
              <Download className="w-4 h-4" />
              Download App Now
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-[#4f46e5] transition-all duration-300 p-2 rounded-lg hover:bg-indigo-50"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-7 h-7 rotate-90 transition-transform duration-300" />
            ) : (
              <Menu className="w-7 h-7 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t shadow-xl transition-all duration-300 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="px-6 py-8 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (onNavigate) onNavigate(item.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-4 text-lg font-medium rounded-2xl transition-all duration-300 ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-[#4f46e5]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Mobile Download Button */}
          <button className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white font-medium shadow-lg">
            <Download className="w-5 h-5" />
            Download App Now
          </button>
        </div>
      </div>
    </nav>
  );
}
