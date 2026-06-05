// src/pages/Help.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Getting Started",
    desc: "Create your account and book your first parking slot in under 2 minutes.",
    guides: 8,
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Booking & Reservations",
    desc: "Learn how to reserve slots, extend sessions, and manage upcoming bookings.",
    guides: 14,
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Payments & Billing",
    desc: "Add payment methods, view invoices, and understand our refund policies.",
    guides: 11,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    title: "Account & Security",
    desc: "Update your profile, enable 2FA, and manage your notification preferences.",
    guides: 9,
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    title: "For Station Owners",
    desc: "Manage your parking stations, staff, pricing, and analytics dashboard.",
    guides: 18,
    bg: "bg-pink-50",
    text: "text-pink-600",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Troubleshooting",
    desc: "Fix common issues with login, payments, QR codes, and mobile app crashes.",
    guides: 22,
    bg: "bg-red-50",
    text: "text-red-600",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

const popularGuides = [
  {
    title: "How to book your first parking slot",
    category: "Getting Started",
    readTime: "3 min",
    difficulty: "Beginner",
    color: "indigo",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Adding GCash, Maya, or credit card payments",
    category: "Payments",
    readTime: "4 min",
    difficulty: "Beginner",
    color: "emerald",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    title: "Understanding real-time station availability",
    category: "Booking",
    readTime: "5 min",
    difficulty: "Intermediate",
    color: "purple",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    title: "Requesting a refund for a cancelled booking",
    category: "Payments",
    readTime: "3 min",
    difficulty: "Beginner",
    color: "emerald",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    title: "Enabling two-factor authentication (2FA)",
    category: "Security",
    readTime: "4 min",
    difficulty: "Intermediate",
    color: "amber",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    title: "Setting up your first parking station as an owner",
    category: "Station Owners",
    readTime: "8 min",
    difficulty: "Advanced",
    color: "pink",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5",
  },
];

const videos = [
  { title: "Platform Overview (2 min)", duration: "2:14", views: "12.4k" },
  { title: "Live Station Map Walkthrough", duration: "4:32", views: "8.7k" },
  { title: "Mobile App Booking Flow", duration: "3:18", views: "15.2k" },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up with email or phone" },
  { num: "02", title: "Add Payment", desc: "Link GCash, Maya, or card" },
  { num: "03", title: "Find Station", desc: "Browse live availability map" },
  { num: "04", title: "Book & Park", desc: "Scan QR on arrival" },
];

const getDifficultyStyle = (difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Intermediate":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Advanced":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getColorStyles = (color) => {
  const map = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    pink: { bg: "bg-pink-50", text: "text-pink-600" },
  };
  return map[color] || map.indigo;
};

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-slate-50 border-b border-slate-100 py-20 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float pointer-events-none" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-6 shadow-sm">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Help & Guides
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
            Learn how to use{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Statio Nexus
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            Step-by-step guides, video tutorials, and documentation to help you
            get the most out of the platform.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-lg text-slate-900 placeholder-slate-400 shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
              placeholder="Search for guides, tutorials, or topics..."
            />
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-sm text-slate-500">Popular:</span>
            {["Booking", "Refunds", "2FA", "Mobile App", "Station Owner"].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {tag}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Getting Started Stepper ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">
            New here?
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Get started in 4 easy steps
          </h3>
        </div>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white border-2 border-slate-200 rounded-full mb-5 shadow-lg shadow-slate-200/50 z-10">
                  <span className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {step.num}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-1">
                  {step.title}
                </h4>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Grid ──────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Browse by category
            </h2>
            <p className="text-slate-500 text-lg">
              Find guides organized by what you're trying to do.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={cat.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1.5 group-hover:text-indigo-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {cat.desc}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">
                    {cat.guides} guides
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Guides ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Most read
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Popular guides
            </h3>
          </div>
          <Link
            to="/help/all"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5"
          >
            View all guides
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularGuides.map((guide) => {
            const colorStyles = getColorStyles(guide.color);
            return (
              <article
                key={guide.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${colorStyles.bg} ${colorStyles.text} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
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
                        d={guide.icon}
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getDifficultyStyle(guide.difficulty)}`}
                  >
                    {guide.difficulty}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {guide.category}
                </p>
                <h4 className="font-bold text-slate-900 text-lg mb-4 leading-snug group-hover:text-indigo-600 transition-colors">
                  {guide.title}
                </h4>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {guide.readTime}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Video Tutorials ──────────────────────────────────────────── */}
      <section className="bg-slate-900 py-20 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3">
              Video Library
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
              Watch & learn
            </h3>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Short, focused video walkthroughs for visual learners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.title} className="group cursor-pointer">
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl overflow-hidden mb-4 border border-slate-700/50 group-hover:border-indigo-500/50 transition-colors">
                  {/* Fake video thumbnail pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 40%, #6366f1 2px, transparent 2px), radial-gradient(circle at 70% 60%, #8b5cf6 2px, transparent 2px)",
                      backgroundSize: "30px 30px",
                    }}
                  />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-slate-900 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                    {video.duration}
                  </div>
                </div>
                <h4 className="font-bold text-white text-base mb-1 group-hover:text-indigo-400 transition-colors">
                  {video.title}
                </h4>
                <p className="text-sm text-slate-500">{video.views} views</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-slate-200 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                Still can't find what you need?
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Browse our FAQ or reach out to our support team — we typically
                respond within 2 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/support"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
                >
                  Visit Help Center
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

