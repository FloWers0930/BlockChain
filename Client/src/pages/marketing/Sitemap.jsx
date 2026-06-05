// src/pages/Sitemap.jsx
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Main",
    desc: "Core pages and entry points to the Statio Nexus platform.",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    links: [
      { name: "Home", path: "/", desc: "Landing page with platform overview" },
      { name: "About", path: "/about", desc: "Our mission, values, and team" },
      { name: "How It Works", path: "/how-it-works", desc: "Step-by-step for drivers and owners" },
      { name: "Download App", path: "/download", desc: "Get Statio Nexus on iOS and Android" },
    ],
  },
  {
    title: "Product",
    desc: "Features, pricing, and the latest updates from the platform.",
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    links: [
      { name: "Live Stations", path: "/stations", desc: "Real-time map of 142 parking stations" },
      { name: "Pricing", path: "/pricing", desc: "Hourly, daily, and monthly pass options" },
      { name: "Blog", path: "/blog", desc: "Insights, updates, and parking tips" },
      { name: "Changelog", path: "/blog", desc: "Latest platform releases and features" },
    ],
  },
  {
    title: "Company",
    desc: "Learn about our team, press coverage, and how to reach us.",
    bg: "bg-pink-50",
    text: "text-pink-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    links: [
      { name: "Careers", path: "/careers", desc: "Open positions and team benefits" },
      { name: "Press & Media", path: "/press", desc: "News, brand assets, and media contacts" },
      { name: "Contact", path: "/contact", desc: "Get in touch with our team" },
      { name: "Social", path: "/social", desc: "Follow us across all platforms" },
    ],
  },
  {
    title: "Support",
    desc: "Help resources, guides, and ways to get assistance.",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    links: [
      { name: "Help Center", path: "/help", desc: "Guides, tutorials, and documentation" },
      { name: "Customer Support", path: "/support", desc: "FAQs and live system status" },
      { name: "Submit a Ticket", path: "/contact", desc: "Get personalized help from our team" },
      { name: "System Status", path: "/support", desc: "Check platform and payment uptime" },
    ],
  },
  {
    title: "Legal",
    desc: "Policies, terms, and compliance information.",
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    links: [
      { name: "Privacy Policy", path: "/privacy", desc: "How we collect and protect your data" },
      { name: "Terms of Service", path: "/terms", desc: "Rules for using the platform" },
      { name: "Cookie Policy", path: "/cookie-policy", desc: "How we use cookies and tracking" },
      { name: "Security", path: "/privacy", desc: "Enterprise-grade security practices" },
    ],
  },
];

const quickLinks = [
  { label: "Main", id: "main" },
  { label: "Product", id: "product" },
  { label: "Company", id: "company" },
  { label: "Support", id: "support" },
  { label: "Legal", id: "legal" },
];

export default function Sitemap() {
  return (
    <div className="bg-white text-slate-900 min-h-screen">
      
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-slate-50 border-b border-slate-100 py-16 md:py-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float pointer-events-none" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
             </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Sitemap</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-6">
            A complete directory of every page on the Statio Nexus platform. Find exactly what you're looking for.
          </p>
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last Updated: May 22, 2026
          </span>
        </div>
      </section>

      {/* ── Quick Jump Navigation ────────────────────────────────────── */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 whitespace-nowrap">Jump to:</span>
          {quickLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category.title} id={category.title.toLowerCase()} className="scroll-mt-24">
              {/* Category Header */}
              <div className="flex items-start gap-5 mb-8">
                <div className={`w-14 h-14 rounded-2xl ${category.bg} ${category.text} flex items-center justify-center flex-shrink-0`}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-1">
                    {category.title}
                  </h2>
                  <p className="text-slate-500 text-sm md:text-base">{category.desc}</p>
                </div>
              </div>

              {/* Links Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="group bg-white border border-slate-200 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Subtle gradient hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-300" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {link.name}
                        </h3>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {link.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Can't find what you're looking for?</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Our support team is available 24/7 to help you navigate the platform and find the information you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
            >
              Contact Support
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              Visit Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
