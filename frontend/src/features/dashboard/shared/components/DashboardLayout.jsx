// src/components/dashboard/DashboardLayout.jsx
import { useState, useCallback } from "react";
import { useAuth } from "../../../../app/providers/AuthProvider";
import NotificationBell from "./NotificationBell";

export default function DashboardLayout({ children, menuItems, title, role }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);

  const userInitial = (user?.name || user?.username || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-premium flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-300"
        >
          {mobileMenuOpen ? (
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
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
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
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
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 xl:w-80
          bg-white/90 backdrop-blur-xl
          border-r border-slate-200/50 shadow-premium
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200/50 flex items-center gap-4 flex-shrink-0">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-premium flex-shrink-0">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Statio Nexus"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-blue-600 truncate">
              Statio Nexus
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Smart Parking Platform
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
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
                  w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-left
                  transition-all duration-200 font-medium group
                  ${
                    item.active
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-premium"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
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
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }
                  `}
                >
                  {Icon && <Icon size={18} strokeWidth={2} />}
                </div>
                <span className="font-semibold truncate">{item.label}</span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section - User info + Logout in bottom-left corner */}
        <div className="p-4 border-t border-slate-200/50 flex-shrink-0 space-y-3">
          {/* Minimal user info */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
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

          {/* Logout Button - Clean, no outline, bottom-left corner */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-start gap-3 py-3 px-6 text-red-600 hover:bg-red-50 rounded-2xl font-semibold transition-all duration-200"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
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
        <header className="relative z-20 min-h-[4.5rem] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 lg:px-8 flex items-center justify-between shadow-premium flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Statio Nexus Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200/60 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700">
                System Online
              </span>
            </div>

            <NotificationBell />

            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-premium cursor-pointer hover:shadow-2xl transition-all duration-300 select-none">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

