// src/pages/CustomerSupport.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Submit a Ticket",
    desc: "Get personalized help from our support team for account or booking issues.",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
    link: "/contact",
  },
  {
    title: "FAQs & Guides",
    desc: "Browse step-by-step tutorials on how to use the Statio Nexus platform.",
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    link: "#faqs",
  },
  {
    title: "System Status",
    desc: "Check the real-time operational status of our stations and payment gateways.",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    link: "#status",
  },
  {
    title: "Billing & Refunds",
    desc: "Manage your payment methods, view invoices, and request refunds.",
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    link: "/contact",
  },
];

const faqs = [
  {
    q: "How do I book a parking slot in advance?",
    a: "Open the Statio Nexus app, select your desired station on the live map, choose an available time slot, and confirm your booking using any of our supported payment methods. You'll receive a digital QR code to scan upon arrival at the station.",
  },
  {
    q: "What happens if I overstay my booked time?",
    a: "If you overstay, the system will automatically extend your session at the standard hourly rate of your specific station. You'll receive a push notification 15 minutes before your time expires so you can extend it manually via the app if needed.",
  },
  {
    q: "How do I request a refund for a cancelled booking?",
    a: "Cancellations made at least 2 hours before the start time are fully refunded automatically to your original payment method within 3-5 business days. For emergencies or late cancellations, please submit a support ticket with your booking ID.",
  },
  {
    q: "Is my payment and personal information secure?",
    a: "Yes. We use enterprise-grade encryption and partner with Stripe and PayMongo for payment processing. We do not store your full credit card details on our servers. Our platform is fully compliant with data privacy regulations.",
  },
  {
    q: "Can I use Statio Nexus without the mobile app?",
    a: "While the mobile app provides the best experience with live maps and push notifications, you can also book and manage parking directly through our web portal on any desktop or mobile browser.",
  },
];

export default function CustomerSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* ── Hero & Search Section ─────────────────────────────────────── */}
      <section className="relative bg-slate-50 border-b border-slate-100 py-20 md:py-28 overflow-hidden">
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
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Help Center
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
            How can we{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              help you
            </span>{" "}
            today?
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            Find answers to common questions, browse our guides, or get in touch
            with our support team.
          </p>

          {/* Premium Search Bar */}
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
              placeholder="Search for articles, FAQs, or guides..."
            />
          </div>
        </div>
      </section>

      {/* ── Quick Actions Grid ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10 mb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group"
            >
              <div
                className={`w-11 h-11 rounded-xl ${action.bg} ${action.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
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
                    d={action.icon}
                  />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">
                {action.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── System Status Banner ──────────────────────────────────────── */}
      <section id="status" className="max-w-4xl mx-auto px-6 mb-20">
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-emerald-900">
                All Systems Operational
              </h3>
              <p className="text-sm text-emerald-700">
                Booking, payments, and station maps are running smoothly.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Updated just now
          </span>
        </div>
      </section>

      {/* ── FAQ Accordion Section ─────────────────────────────────────── */}
      <section id="faqs" className="max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500">
            Quick answers to the most common parking and billing questions.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-slate-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-slate-900 pr-4">
                  {faq.q}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-indigo-600" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-48 pb-5" : "max-h-0"}`}
              >
                <p className="px-6 text-slate-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Still need help?
          </h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Can't find what you're looking for? Our support team is available
            24/7 to assist you.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
          >
            Contact Support Team
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

