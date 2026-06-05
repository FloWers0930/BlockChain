// src/pages/Press.jsx
import { Link } from "react-router-dom";

const pressContacts = [
  {
    title: "General Media Inquiries",
    desc: "For interviews, quotes, and general press questions.",
    email: "press@statio-nexus.com",
    response: "Within 24 hours",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    title: "Executive Interviews",
    desc: "For requests to speak with our founders or leadership team.",
    email: "leadership@statio-nexus.com",
    response: "Within 48 hours",
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    title: "Partnership & Sponsorships",
    desc: "For co-marketing opportunities and event sponsorships.",
    email: "partners@statio-nexus.com",
    response: "Within 3 business days",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
];

const pressReleases = [
  {
    date: "May 18, 2026",
    category: "Product Launch",
    title: "Statio Nexus Launches Real-Time Availability Across All 142 Stations",
    excerpt: "The platform's WebSocket-powered infrastructure now updates slot availability every 2 seconds, giving drivers unprecedented visibility into parking options across Metro Manila.",
    color: "indigo",
  },
  {
    date: "April 28, 2026",
    category: "Technology",
    title: "Statio Nexus Integrates Hyperledger Besu for Immutable Booking Records",
    excerpt: "Every parking transaction is now recorded on a private blockchain ledger, setting a new standard for transparency and dispute resolution in the Philippine mobility sector.",
    color: "emerald",
  },
  {
    date: "March 15, 2026",
    category: "Milestone",
    title: "Statio Nexus Surpasses 24,800 Active Users in Quezon City",
    excerpt: "Just 14 months after launch, the smart parking platform has processed over 87,000 bookings and established partnerships with 142 stations across Crossroad Tandang Sora.",
    color: "amber",
  },
  {
    date: "February 2, 2026",
    category: "Partnership",
    title: "Fortress Land Expands Statio Nexus to 40 New Commercial Locations",
    excerpt: "The expansion includes partnerships with Ayala Malls Vertis North, Robinsons Magnolia, and three major hotel chains in the Quezon City business district.",
    color: "pink",
  },
  {
    date: "December 10, 2025",
    category: "Funding",
    title: "Statio Nexus Raises $2.4M Seed Round Led by Kickstart Ventures",
    excerpt: "The funding will accelerate the platform's expansion across Metro Manila and fund development of AI-powered dynamic pricing for station operators.",
    color: "purple",
  },
];

const factSheet = [
  { label: "Founded", value: "March 2024" },
  { label: "Headquarters", value: "Quezon City, PH" },
  { label: "Employees", value: "38" },
  { label: "Active Users", value: "24,800+" },
  { label: "Live Stations", value: "142" },
  { label: "Monthly Bookings", value: "8,740+" },
  { label: "Funding Stage", value: "Seed" },
  { label: "Key Markets", value: "Metro Manila" },
];

const mediaLogos = [
  "TechCrunch",
  "Forbes PH",
  "BusinessWorld",
  "PhilStar",
  "Rappler",
  "Manila Bulletin",
  "ANC",
  "GMA News",
];

const brandColors = [
  { name: "Indigo Primary", hex: "#4f46e5", text: "text-white" },
  { name: "Purple Accent", hex: "#7c3aed", text: "text-white" },
  { name: "Pink Highlight", hex: "#ec4899", text: "text-white" },
  { name: "Slate Dark", hex: "#0f172a", text: "text-white" },
  { name: "Slate Light", hex: "#f8fafc", text: "text-slate-900" },
  { name: "Emerald Success", hex: "#10b981", text: "text-white" },
];

const brandAssets = [
  {
    title: "Primary Logo",
    desc: "Full wordmark for light backgrounds",
    format: "SVG, PNG",
    size: "24 KB",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Logo Mark",
    desc: "Icon-only version for app icons and favicons",
    format: "SVG, PNG",
    size: "8 KB",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
  {
    title: "Dark Logo",
    desc: "White wordmark for dark backgrounds",
    format: "SVG, PNG",
    size: "26 KB",
    icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  },
  {
    title: "Brand Guidelines",
    desc: "Complete PDF with usage rules and examples",
    format: "PDF",
    size: "4.2 MB",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const getColorStyles = (color) => {
  const map = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  };
  return map[color] || map.indigo;
};

export default function Press() {
  return (
    <div className="bg-white text-slate-900 min-h-screen overflow-hidden">
      
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Press & Media
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            The story behind
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              smarter parking
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            News, resources, and brand assets for journalists, analysts, and content creators covering the future of urban mobility in the Philippines.
          </p>
        </div>
      </section>

      {/* ── Media Contacts Section ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Get in touch</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Media contacts</h3>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Our PR team is ready to help with interviews, quotes, and story ideas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {pressContacts.map((contact) => (
            <div key={contact.title} className="bg-white border border-slate-200 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group">
              <div className={`w-12 h-12 rounded-xl ${contact.bg} ${contact.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={contact.icon} />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-1.5">{contact.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{contact.desc}</p>
              <div className="pt-5 border-t border-slate-100 space-y-2">
                <a href={`mailto:${contact.email}`} className="block text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors break-all">
                  {contact.email}
                </a>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Response: {contact.response}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Press Releases Section ───────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Newsroom</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Press releases</h3>
            </div>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5">
              View all releases
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {pressReleases.map((release, idx) => {
              const colorStyles = getColorStyles(release.color);
              return (
                <article key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Date */}
                    <div className="md:w-36 flex-shrink-0">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {release.date}
                      </div>
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border} border px-2.5 py-1 rounded-full`}>
                        {release.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {release.title}
                      </h4>
                      <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                        {release.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:gap-2.5 transition-all">
                        Read full release
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Company Fact Sheet ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4">
            <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Quick Reference
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Company fact sheet
            </h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Key information about Statio Nexus and Fortress Land Inc. for journalists and analysts writing about the company.
            </p>
            <button className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {factSheet.map((fact) => (
                  <div key={fact.label} className="border-l-2 border-indigo-100 pl-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{fact.label}</p>
                    <p className="text-base font-bold text-slate-900">{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Assets Section ─────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Brand Resources</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Logos & guidelines</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Official brand assets for media use. Please follow our brand guidelines when using these materials.
            </p>
          </div>

          {/* Downloadable Assets Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {brandAssets.map((asset) => (
              <div key={asset.title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={asset.icon} />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{asset.title}</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{asset.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold">{asset.format}</span> · {asset.size}
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 flex items-center justify-center transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Brand Colors */}
          <div className="mb-14">
            <h4 className="text-xl font-bold text-slate-900 mb-6 text-center">Brand colors</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {brandColors.map((color) => (
                <div key={color.hex} className="group cursor-pointer">
                  <div 
                    className={`aspect-square rounded-2xl mb-2.5 flex items-end p-3 ${color.text} shadow-sm group-hover:scale-105 group-hover:shadow-lg transition-all`}
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="text-[10px] font-mono font-bold opacity-80">{color.hex.toUpperCase()}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 text-center">{color.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10">
            <h4 className="text-xl font-bold text-slate-900 mb-6">Typography</h4>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Primary Typeface</p>
                <p className="text-4xl font-bold text-slate-900 mb-2">Inter</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  A clean, modern sans-serif optimized for screens. Used across all digital touchpoints.
                </p>
                <div className="space-y-1.5 text-slate-700">
                  <p className="text-2xl font-light">Light — Aa Bb Cc</p>
                  <p className="text-2xl font-normal">Regular — Aa Bb Cc</p>
                  <p className="text-2xl font-semibold">Semibold — Aa Bb Cc</p>
                  <p className="text-2xl font-bold">Bold — Aa Bb Cc</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Display Typeface</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Statio Nexus
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Our signature gradient wordmark. Reserved for logos, hero sections, and premium marketing materials.
                </p>
                <div className="bg-slate-900 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">On dark backgrounds</p>
                  <p className="text-2xl font-bold text-white">Statio Nexus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── As Featured In Section ───────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Media Coverage</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">As featured in</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 items-center">
            {mediaLogos.map((logo) => (
              <div key={logo} className="group flex items-center justify-center py-4 px-6 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <span className="text-xl md:text-2xl font-bold text-slate-400 group-hover:text-slate-900 transition-colors tracking-tight">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Executive Bios Preview ───────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Leadership</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Meet our founders</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Available for interviews on smart cities, mobility tech, and the future of Philippine urban infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                initials: "LR",
                name: "Lawrenz R.",
                role: "Co-Founder & CEO",
                bio: "Former Grab engineer. Leading product vision and strategic partnerships across Southeast Asian mobility.",
                gradient: "from-indigo-500 to-purple-600",
              },
              {
                initials: "MG",
                name: "Maria G.",
                role: "Co-Founder & COO",
                bio: "Operations leader with 10+ years in Philippine real estate and transport logistics. Oversees all 142 station partnerships.",
                gradient: "from-pink-500 to-rose-600",
              },
            ].map((exec) => (
              <div key={exec.name} className="bg-white border border-slate-200 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="flex items-center gap-5 mb-5">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exec.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {exec.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{exec.name}</h4>
                    <p className="text-sm font-semibold text-indigo-600">{exec.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{exec.bio}</p>
                <button className="text-sm font-semibold text-slate-900 hover:text-indigo-600 inline-flex items-center gap-1.5 transition-colors">
                  Request interview
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA Footer ──────────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Working on a story about us?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            We'd love to help. Reach out to our PR team for quotes, interviews, high-res images, or custom data requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:press@statio-nexus.com"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Press Team
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all"
            >
              General Contact
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
