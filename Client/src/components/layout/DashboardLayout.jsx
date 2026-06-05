// src/components/layout/DashboardLayout.jsx
import { useState, useCallback } from "react";
import { useAuth } from "@providers/AuthProvider";
import NotificationBell from "../ui/NotificationBell";

// ✅ FIX: menuItems defaults to [] so .map() never runs on undefined.
// Previously, DashboardLayout crashed with "Cannot read properties of undefined
// (reading 'map')" when rendered via ProtectedLayout without menuItems being
// passed — e.g. on the /change-password route or any route that uses
// ProtectedLayout directly without a parent dashboard component.
export default function DashboardLayout({
  children,
  menuItems = [],
  title,
  role,
}) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);

  const userInitial = (user?.name || user?.username || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="w-11 h-11 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all"
        >
          {mobileMenuOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 xl:w-80
          bg-white border-r border-slate-100
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0 overflow-hidden">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Statio Nexus"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-slate-900 tracking-tight truncate">
              Statio Nexus
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Smart Parking Platform
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  closeMobileMenu();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left
                  transition-all duration-200 font-medium group
                  ${
                    item.active
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <div
                  className={`
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${
                      item.active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }
                  `}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                <span className="font-semibold text-sm truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom section - User info + Logout */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 text-sm truncate">
                {user?.name || user?.username || "User"}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {user?.role || role || "Staff"}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-2xl font-semibold text-sm transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="relative z-20 h-20 bg-white border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 pl-12 lg:pl-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block mt-0.5">
                Statio Nexus Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">
                System Online
              </span>
            </div>

            <NotificationBell />

            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-200 cursor-pointer hover:shadow-xl transition-all duration-300 select-none">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

