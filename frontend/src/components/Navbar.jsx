// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsOpen(false);
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Statio Nexus"
              className="w-9 h-9 object-contain transition-transform group-hover:rotate-12"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Statio Nexus
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button
              onClick={() => scrollToSection("home")}
              className="text-gray-700 hover:text-[#4f46e5] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-700 hover:text-[#4f46e5] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-700 hover:text-[#4f46e5] transition-colors"
            >
              About
            </button>
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-8 py-3 text-sm font-semibold bg-[#4f46e5] text-white rounded-3xl hover:bg-[#4338ca] hover:shadow-xl transition-all active:scale-95"
              >
                Login as Owner / Admin
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Hi, {user?.name || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-3xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-[#4f46e5] transition-colors"
          >
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-xl">
          <div className="px-6 py-8 space-y-6">
            <button
              onClick={() => scrollToSection("home")}
              className="block w-full text-left py-4 text-xl font-medium hover:text-[#4f46e5]"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left py-4 text-xl font-medium hover:text-[#4f46e5]"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="block w-full text-left py-4 text-xl font-medium hover:text-[#4f46e5]"
            >
              About
            </button>

            <div className="pt-8 border-t">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-5 bg-[#4f46e5] text-white text-xl font-semibold rounded-3xl hover:bg-[#4338ca]"
                >
                  Login as Owner / Admin
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="block w-full text-center py-5 text-red-600 border-2 border-red-200 rounded-3xl font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
