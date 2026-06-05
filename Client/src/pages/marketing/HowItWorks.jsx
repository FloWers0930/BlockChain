// src/pages/HowItWorks.jsx
import { Link } from "react-router-dom";

const driverSteps = [
  {
    num: "01",
    title: "Download & Sign Up",
    desc: "Get the Statio Nexus app from the App Store or Google Play. Create your free account in under 60 seconds using just your email or phone number.",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Find a Live Station",
    desc: "Open the interactive map to see all 142 stations in real-time. Filter by distance, price, or availability to find the perfect spot near your destination.",
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Book & Pay Instantly",
    desc: "Reserve your slot with a single tap. Pay securely with GCash, Maya, credit card, or Apple Pay. You'll receive a scannable QR code confirmation instantly.",
    bg: "bg-pink-50",
    text: "text-pink-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Park & Go",
    desc: "Arrive at the station and scan your QR code at the entrance. Park in your reserved slot and let the app handle the rest — including smart overstay alerts.",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const ownerSteps = [
  {
    num: "01",
    title: "Register Your Station",
    desc: "Sign up as a station owner and list your parking facility. Add details like location, total slots, hourly rates, and operating hours in minutes.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Manage Live Operations",
    desc: "Use your dashboard to monitor real-time occupancy, manage staff, handle bookings, and view revenue analytics — all from a single, unified platform.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Grow Your Revenue",
    desc: "Get paid automatically for every booking. Access detailed reports, export tax-ready invoices, and use smart pricing tools to maximize your station's profitability.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

const techFeatures = [
  {
    title: "Real-Time Availability Engine",
    desc: "Our WebSocket-powered infrastructure updates slot availability across all 142 stations every 2 seconds, so you always see the live picture.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Enterprise-Grade Security",
    desc: "TLS encryption, bcrypt password hashing, optional 2FA, and PCI-DSS compliant payment processing through Stripe and PayMongo.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Blockchain Audit Trail",
    desc: "Every booking and payment is immutably recorded on a private Hyperledger Besu ledger, ensuring complete transparency and dispute resolution.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    title: "Smart Analytics Dashboard",
    desc: "Station owners get AI-powered insights on peak hours, revenue forecasts, and occupancy trends to optimize pricing and staffing.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-white text-slate-900 min-h-screen overflow-hidden">
      
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            How It Works
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Parking made <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">effortless</span>,
            <br className="hidden md:block" />
            from search to slot.
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Whether you're a driver looking for a spot or a station owner managing operations, Statio Nexus simplifies every step of the journey.
          </p>
        </div>
      </section>

      {/* ── For Drivers Section ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              For Drivers
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Book a spot in 4 simple steps
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              From opening the app to pulling into your reserved slot — the entire experience takes less than 2 minutes.
            </p>
          </div>

          <div className="relative">
            {/* Connecting dashed line (desktop only) */}
            <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-slate-200" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {driverSteps.map((step, idx) => (
                <div key={step.num} className="relative group">
                  <div className="bg-white border border-slate-200 rounded-3xl p-7 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/60 hover:border-slate-300 transition-all duration-300 h-full">
                    {/* Giant Number */}
                    <div className="text-6xl font-black bg-gradient-to-br from-slate-100 to-slate-200 bg-clip-text text-transparent mb-4 leading-none">
                      {step.num}
                    </div>
                    
                    {/* Icon Badge */}
                    <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.text} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                      {step.icon}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Arrow connector (desktop only) */}
                  {idx < driverSteps.length - 1 && (
                    <div className="hidden lg:flex absolute top-24 -right-3 w-6 h-6 bg-white border-2 border-slate-200 rounded-full items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For Station Owners Section ───────────────────────────────── */}
      <section className="py-20 md:py-28 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              For Station Owners
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Turn your parking lot into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">smart business</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              List your station, automate bookings, and watch your revenue grow — all from one powerful dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ownerSteps.map((step) => (
              <div key={step.num} className="relative group">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/60 hover:border-amber-200 transition-all duration-300 h-full">
                  {/* Step number badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <span className="text-5xl font-black text-slate-100 group-hover:text-amber-100 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/20"
            >
              Become a Station Partner
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Technology Section ───────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-indigo-300 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Built on Modern Tech
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
              The technology behind the magic
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every booking, payment, and status update is powered by enterprise-grade infrastructure designed for speed, security, and scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {techFeatures.map((feature) => (
              <div key={feature.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              Powered by industry-leading technologies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["React", "Node.js", "MongoDB", "Socket.IO", "Stripe", "Hyperledger", "AWS", "Tailwind CSS"].map((tech) => (
                <span key={tech} className="bg-white/5 border border-white/10 text-slate-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-colors">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "24.8k+", label: "Active Users", color: "from-indigo-600 to-purple-600" },
            { value: "142", label: "Live Stations", color: "from-purple-600 to-pink-600" },
            { value: "8.7k", label: "Bookings/Month", color: "from-pink-600 to-rose-600" },
            { value: "99.9%", label: "Uptime", color: "from-emerald-600 to-teal-600" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight mb-2`}>
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dark CTA Footer ──────────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to experience smarter parking?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of drivers and station owners already using Statio Nexus every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/download"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Get the App
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all"
            >
              Become a Partner
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
