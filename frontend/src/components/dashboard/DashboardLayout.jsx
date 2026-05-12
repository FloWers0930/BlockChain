// src/components/dashboard/DashboardLayout.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function DashboardLayout({
  children,
  menuItems,
  title,
  logoIcon = "fa-parking",
  role,
}) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-premium flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-300"
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur-xl border-r border-slate-200/50 shadow-premium flex flex-col transform transition-transform duration-300 lg:transform-none ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Header */}
        <div className="px-8 py-6 border-b border-slate-200/50 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-premium">
            <img
              src="/assets/star-removebg-preview.jpg"
              alt="Crossroad Parking"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crossroad Parking
            </span>
            <div className="text-xs text-slate-500 font-medium">
              Tandang Sora Management
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 font-medium group ${
                item.active
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-premium hover:shadow-2xl"
                  : "hover:bg-slate-100 text-slate-700 hover:text-slate-900 hover:translate-x-1"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                item.active
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
              }`}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <span className="font-semibold">{item.label}</span>
              {item.active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-slate-200/50 space-y-3">
          <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/50 hover:shadow-premium transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-premium">
              {(user?.name || "U")?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 truncate">
                {user?.name || "User"}
              </div>
              <div className="text-sm text-slate-600 capitalize font-medium">
                {user?.role || role || "Staff"} • Crossroad Tandang Sora
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 py-4 text-red-600 hover:bg-red-50 rounded-2xl font-semibold transition-all duration-300 hover:shadow-premium border border-transparent hover:border-red-200/50"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between shadow-premium">
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {title}
              </h1>
              <div className="text-sm text-slate-500 font-medium">
                Fortress Land Management Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200/50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">System Online</span>
            </div>

            {/* Notifications Bell */}
            <NotificationBell />

            {/* User Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-premium cursor-pointer hover:shadow-2xl transition-all duration-300">
              {(user?.name || "U")?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-50/50 to-white/30">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
