// src/pages/Privacy.jsx
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="bg-white text-slate-900 min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-slate-50 border-b border-slate-100 py-16 md:py-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float pointer-events-none" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-6">
            Your privacy is important to us. This policy explains how Statio
            Nexus collects, uses, and protects your personal information in
            compliance with the Philippine Data Privacy Act of 2012.
          </p>
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 text-slate-400"
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
            Last Updated: May 22, 2026
          </span>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <div className="space-y-12 text-slate-600 leading-relaxed text-[15px]">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              1. Introduction
            </h2>
            <p>
              Statio Nexus ("we", "us", or "our"), operated by Fortress Land
              Inc., is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our website, mobile application, and
              parking booking services (collectively, the "Services").
            </p>
            <p>
              We comply with the{" "}
              <strong className="text-slate-800 font-semibold">
                Data Privacy Act of 2012 (Republic Act No. 10173)
              </strong>{" "}
              and its Implementing Rules and Regulations, as enforced by the
              National Privacy Commission (NPC) of the Philippines.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              2. Information We Collect
            </h2>
            <p>
              We collect the following types of information to provide and
              improve our Services:
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
              2.1 Personal Information You Provide
            </h3>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Account Information:
                  </strong>{" "}
                  Full name, email address, phone number, and password.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Payment Information:
                  </strong>{" "}
                  Billing address and payment details (processed securely by
                  Stripe and PayMongo — we do not store full card numbers).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Vehicle Information:
                  </strong>{" "}
                  License plate number and vehicle type (required for station
                  verification).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Support Communications:
                  </strong>{" "}
                  Any messages, feedback, or support tickets you send through
                  our platform.
                </span>
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
              2.2 Information Collected Automatically
            </h3>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Device & Usage Data:
                  </strong>{" "}
                  IP address, browser type, operating system, device
                  identifiers, and app usage patterns.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Location Data:
                  </strong>{" "}
                  Approximate location (with your permission) to show nearby
                  parking stations.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Cookies & Tracking:
                  </strong>{" "}
                  See our{" "}
                  <Link
                    to="/cookie-policy"
                    className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for details.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              3. How We Use Your Information
            </h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-none pl-0 space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>To process parking bookings, payments, and refunds.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  To display real-time availability of parking slots near you.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  To send booking confirmations, session reminders, and
                  important service updates.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  To respond to customer support inquiries and resolve disputes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  To detect and prevent fraud, abuse, and security incidents.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  To improve our platform, develop new features, and analyze
                  usage trends (in aggregated, anonymized form).
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              4. How We Share Your Information
            </h2>
            <p>
              We do{" "}
              <strong className="text-slate-800 font-semibold">not sell</strong>{" "}
              your personal information. We only share your data with trusted
              third parties in the following limited circumstances:
            </p>
            <ul className="list-none pl-0 space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Station Operators:
                  </strong>{" "}
                  Your name, vehicle plate number, and booking details are
                  shared with the parking station operator to verify your
                  reservation upon arrival.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Payment Processors:
                  </strong>{" "}
                  Stripe and PayMongo process your payments under strict PCI-DSS
                  compliance.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Service Providers:
                  </strong>{" "}
                  Cloud hosting (AWS, MongoDB Atlas), analytics (Google
                  Analytics), and email delivery services, all bound by data
                  processing agreements.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Legal Compliance:
                  </strong>{" "}
                  When required by law, subpoena, court order, or to protect the
                  rights and safety of our users or the public.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              5. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your
              personal information, including:
            </p>
            <ul className="list-none pl-0 space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    TLS/SSL Encryption:
                  </strong>{" "}
                  All data transmitted between your device and our servers is
                  encrypted.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Password Hashing:
                  </strong>{" "}
                  Passwords are hashed using bcrypt with strong salt rounds —
                  never stored in plain text.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Two-Factor Authentication (2FA):
                  </strong>{" "}
                  Optional TOTP-based 2FA for all account holders.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Access Controls:
                  </strong>{" "}
                  Strict role-based access control for all internal staff and
                  administrators.
                </span>
              </li>
            </ul>
            <p className="mt-4">
              While we strive to protect your information, no method of
              transmission over the Internet or electronic storage is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              6. Data Retention
            </h2>
            <p>
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this policy:
            </p>
            <ul className="list-none pl-0 space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Active Accounts:
                  </strong>{" "}
                  Retained as long as your account is active.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Booking Records:
                  </strong>{" "}
                  Retained for{" "}
                  <strong className="text-slate-800 font-semibold">
                    5 years
                  </strong>{" "}
                  for tax and audit compliance under Philippine law.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Deleted Accounts:
                  </strong>{" "}
                  Personal data is anonymized or deleted within{" "}
                  <strong className="text-slate-800 font-semibold">
                    30 days
                  </strong>{" "}
                  of account deletion request.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              7. Your Rights Under the Data Privacy Act
            </h2>
            <p>
              Under the Philippine Data Privacy Act of 2012, you have the
              following rights regarding your personal information:
            </p>
            <ul className="list-none pl-0 space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Right to Access:
                  </strong>{" "}
                  Request a copy of the personal data we hold about you.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Right to Rectification:
                  </strong>{" "}
                  Request correction of inaccurate or incomplete data.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Right to Erasure:
                  </strong>{" "}
                  Request deletion of your personal data (subject to legal
                  retention requirements).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Right to Object:
                  </strong>{" "}
                  Object to processing of your data for marketing or profiling
                  purposes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Right to Data Portability:
                  </strong>{" "}
                  Receive your data in a structured, commonly used format.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
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
                <span>
                  <strong className="text-slate-800 font-semibold">
                    Right to Lodge a Complaint:
                  </strong>{" "}
                  File a complaint with the National Privacy Commission (NPC) if
                  you believe your rights have been violated.
                </span>
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, please contact our Data
              Protection Officer at{" "}
              <a
                href="mailto:privacy@statio-nexus.com"
                className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
              >
                privacy@statio-nexus.com
              </a>
              . We will respond within{" "}
              <strong className="text-slate-800 font-semibold">30 days</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              8. Children's Privacy
            </h2>
            <p>
              Our Services are not intended for individuals under the age of{" "}
              <strong className="text-slate-800 font-semibold">18</strong>. We
              do not knowingly collect personal information from children. If
              you believe we have inadvertently collected such data, please
              contact us immediately and we will delete it.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              9. International Data Transfers
            </h2>
            <p>
              Statio Nexus is based in the Philippines, but some of our service
              providers (such as AWS and MongoDB Atlas) may process data in
              other countries, including the United States and Singapore. When
              we transfer data internationally, we ensure appropriate safeguards
              are in place, such as Standard Contractual Clauses or adequacy
              decisions, to protect your information in accordance with the DPA.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for legal and operational reasons. The
              updated version will be posted on this page with a revised "Last
              Updated" date.
            </p>
            <p>
              For material changes, we will notify registered users via email or
              in-app notification at least{" "}
              <strong className="text-slate-800 font-semibold">
                14 days before
              </strong>{" "}
              the changes take effect. Your continued use of the Services after
              the effective date constitutes acceptance of the updated policy.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              11. Contact Our Data Protection Officer
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact our Data
              Protection Officer:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4">
              <p className="font-semibold text-slate-900 mb-1">
                Fortress Land Inc. — Data Protection Office
              </p>
              <p className="text-slate-600 text-sm mb-1">
                #610 Tandang Sora Avenue, Quezon City, Philippines
              </p>
              <p className="text-slate-600 text-sm mb-1">
                Email:{" "}
                <a
                  href="mailto:privacy@statio-nexus.com"
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
                >
                  privacy@statio-nexus.com
                </a>
              </p>
              <p className="text-slate-600 text-sm">
                Phone:{" "}
                <a
                  href="tel:+63288888888"
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
                >
                  +63 2 8888 8888
                </a>
              </p>
            </div>
          </div>

          {/* ── Bottom CTA ─────────────────────────────────────────────── */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 md:p-10 text-center mt-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Have questions about your data?
            </h3>
            <p className="text-slate-600 text-sm mb-8 max-w-md mx-auto">
              Our Data Protection Officer and support team are here to help you
              understand and exercise your privacy rights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
              >
                Contact Support
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
                to="/terms"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              >
                Read Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

