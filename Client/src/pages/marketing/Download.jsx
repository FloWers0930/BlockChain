// src/pages/Download.jsx
import { Link } from "react-router-dom";

const features = [
  {
    title: "Live Station Maps",
    desc: "See real-time availability across all 142 stations before you even leave home.",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    title: "Secure Payments",
    desc: "Pay with GCash, Maya, credit cards, or Apple Pay with enterprise-grade encryption.",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "Instant Booking",
    desc: "Reserve your spot in under 30 seconds and get a scannable QR code instantly.",
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Smart Alerts",
    desc: "Get push notifications 15 minutes before your session expires to extend easily.",
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
];

export default function Download() {
  return (
    <div className="bg-white text-slate-900 min-h-screen overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-white animate-fade-in-up">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Available on iOS & Android
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Park smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                Anywhere, anytime.
              </span>
            </h1>
            <p className="text-lg text-white/85 max-w-lg mb-10 leading-relaxed">
              Download the Statio Nexus app to access live station maps, instant
              booking, and secure mobile payments at over 142 locations.
            </p>

            {/* Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* App Store */}
              <a
                href="#"
                className="group flex items-center gap-3 bg-black hover:bg-slate-900 text-white px-6 py-3.5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-black/20"
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-80 leading-none">
                    Download on the
                  </div>
                  <div className="text-lg font-semibold leading-tight">
                    App Store
                  </div>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="group flex items-center gap-3 bg-black hover:bg-slate-900 text-white px-6 py-3.5 rounded-2xl transition-all active:scale-95 shadow-xl shadow-black/20"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z"
                    fill="#4285F4"
                  />
                  <path
                    d="M17.556 8.237l-3.764 3.764 3.764 3.763 4.244-2.382c.96-.54.96-1.932 0-2.472l-4.244-2.673z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M3.609 1.814L13.792 12l3.764-3.763L6.2 1.06c-.84-.48-1.87-.36-2.591.754z"
                    fill="#34A853"
                  />
                  <path
                    d="M13.792 12L3.609 22.186c.72 1.114 1.75 1.234 2.59.754l11.356-7.176L13.792 12z"
                    fill="#EA4335"
                  />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-80 leading-none">
                    GET IT ON
                  </div>
                  <div className="text-lg font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-semibold text-white">4.9</span>
                <span>(12.4k reviews)</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>100K+ Downloads</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>Free to use</span>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div
            className="flex justify-center lg:justify-end animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-110" />

              {/* Phone Frame */}
              <div className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-black/40 border-[8px] border-slate-800">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />

                {/* Screen */}
                <div className="w-full h-full bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[2.2rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 pt-8 pb-2 text-[10px] font-semibold text-slate-900">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
                      </svg>
                      <div className="w-5 h-2.5 border border-slate-900 rounded-sm relative">
                        <div className="absolute inset-0.5 bg-slate-900 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="px-5 pt-4">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-[10px] text-slate-500">
                          Good morning
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          Find parking
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                    </div>

                    {/* Map preview */}
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl h-32 mb-4 relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 30% 40%, #6366f1 2px, transparent 2px), radial-gradient(circle at 70% 60%, #8b5cf6 2px, transparent 2px), radial-gradient(circle at 50% 80%, #ec4899 2px, transparent 2px)",
                          backgroundSize: "40px 40px",
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1 shadow-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-semibold text-slate-900">
                          Live
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-indigo-600 text-white rounded-lg px-2.5 py-1 text-[9px] font-semibold shadow-md">
                        142 stations
                      </div>
                    </div>

                    {/* Station card */}
                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            Crossroad Tandang Sora
                          </p>
                          <p className="text-[9px] text-slate-500">
                            0.8 km away
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          24 open
                        </span>
                      </div>
                      <div className="bg-indigo-600 text-white rounded-lg py-1.5 text-center text-[10px] font-semibold">
                        Book Now
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            Ayala Malls Vertis North
                          </p>
                          <p className="text-[9px] text-slate-500">
                            2.1 km away
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          5 open
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">
              Why Download
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Everything you need, in your pocket.
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200 rounded-3xl p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${f.bg} ${f.text} group-hover:scale-110 transition-transform duration-300`}
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
                      d={f.icon}
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  {f.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QR Code Section ──────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 md:p-14 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  Quick Install
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                  Scan to download instantly
                </h3>
                <p className="text-slate-500 leading-relaxed mb-6">
                  Point your phone's camera at the QR code to be taken directly
                  to the right app store for your device. No search required.
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>No signup required to browse</span>
                  </div>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg">
                  <div className="w-56 h-56 bg-white p-3 rounded-2xl relative">
                    {/* Stylized QR Code Pattern */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <linearGradient
                          id="qrGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      {/* Corner markers */}
                      <rect
                        x="5"
                        y="5"
                        width="22"
                        height="22"
                        fill="url(#qrGradient)"
                        rx="3"
                      />
                      <rect
                        x="9"
                        y="9"
                        width="14"
                        height="14"
                        fill="white"
                        rx="2"
                      />
                      <rect
                        x="12"
                        y="12"
                        width="8"
                        height="8"
                        fill="url(#qrGradient)"
                        rx="1"
                      />

                      <rect
                        x="73"
                        y="5"
                        width="22"
                        height="22"
                        fill="url(#qrGradient)"
                        rx="3"
                      />
                      <rect
                        x="77"
                        y="9"
                        width="14"
                        height="14"
                        fill="white"
                        rx="2"
                      />
                      <rect
                        x="80"
                        y="12"
                        width="8"
                        height="8"
                        fill="url(#qrGradient)"
                        rx="1"
                      />

                      <rect
                        x="5"
                        y="73"
                        width="22"
                        height="22"
                        fill="url(#qrGradient)"
                        rx="3"
                      />
                      <rect
                        x="9"
                        y="77"
                        width="14"
                        height="14"
                        fill="white"
                        rx="2"
                      />
                      <rect
                        x="12"
                        y="80"
                        width="8"
                        height="8"
                        fill="url(#qrGradient)"
                        rx="1"
                      />

                      {/* Data pattern */}
                      {[...Array(12)].map((_, i) =>
                        [...Array(12)].map((_, j) => {
                          const show =
                            (i * 7 + j * 13) % 3 === 0 &&
                            !(i < 3 && j < 3) &&
                            !(i < 3 && j > 8) &&
                            !(i > 8 && j < 3);
                          return (
                            show && (
                              <rect
                                key={`${i}-${j}`}
                                x={32 + j * 3.5}
                                y={32 + i * 3.5}
                                width="2.5"
                                height="2.5"
                                fill="url(#qrGradient)"
                                rx="0.5"
                              />
                            )
                          );
                        }),
                      )}

                      {/* Center logo */}
                      <rect
                        x="40"
                        y="40"
                        width="20"
                        height="20"
                        fill="white"
                        rx="4"
                      />
                      <rect
                        x="43"
                        y="43"
                        width="14"
                        height="14"
                        fill="url(#qrGradient)"
                        rx="3"
                      />
                      <text
                        x="50"
                        y="53"
                        textAnchor="middle"
                        fill="white"
                        fontSize="7"
                        fontWeight="bold"
                      >
                        SN
                      </text>
                    </svg>
                  </div>
                  <p className="text-center text-xs font-semibold text-slate-500 mt-4">
                    Scan with your camera
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── System Requirements ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              System Requirements
            </h3>
            <p className="text-slate-500 mt-2">
              Make sure your device is compatible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">iOS</h4>
              <p className="text-sm text-slate-600 mb-3">
                Requires iOS 14.0 or later. Compatible with iPhone, iPad, and
                iPod touch.
              </p>
              <p className="text-xs font-semibold text-slate-400">
                App size: 87 MB
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4482-.9993-.9993s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9993-.9993.9993m-11.046 0c-.5511 0-.9993-.4482-.9993-.9993s.4482-.9993.9993-.9993.9993.4482.9993.9993-.4482.9993-.9993.9993m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4161 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Android</h4>
              <p className="text-sm text-slate-600 mb-3">
                Requires Android 10.0 or later. Optimized for phones and
                tablets.
              </p>
              <p className="text-xs font-semibold text-slate-400">
                App size: 64 MB
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Web Browser</h4>
              <p className="text-sm text-slate-600 mb-3">
                Prefer not to install? Use our full-featured web app on any
                modern browser.
              </p>
              <Link
                to="/"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open Web App →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark CTA Footer ──────────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to skip the parking stress?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join 24,800+ drivers who book smarter every day with Statio Nexus.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92z"
                  fill="#4285F4"
                />
                <path
                  d="M17.556 8.237l-3.764 3.764 3.764 3.763 4.244-2.382c.96-.54.96-1.932 0-2.472l-4.244-2.673z"
                  fill="#FBBC04"
                />
                <path
                  d="M3.609 1.814L13.792 12l3.764-3.763L6.2 1.06c-.84-.48-1.87-.36-2.591.754z"
                  fill="#34A853"
                />
                <path
                  d="M13.792 12L3.609 22.186c.72 1.114 1.75 1.234 2.59.754l11.356-7.176L13.792 12z"
                  fill="#EA4335"
                />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

