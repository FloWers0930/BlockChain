// src/pages/Terms.jsx
import { Link } from "react-router-dom";

export default function Terms() {
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-6">
            Please read these terms carefully before using the Statio Nexus
            platform. By accessing our services, you agree to be bound by these
            terms.
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
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of
              the Statio Nexus website, mobile application, and related services
              (collectively, the "Services"), operated by Fortress Land Inc.
              ("we", "us", or "our").
            </p>
            <p>
              By creating an account, booking a parking slot, or otherwise using
              our Services, you acknowledge that you have read, understood, and
              agree to be bound by these Terms and our{" "}
              <Link
                to="/privacy"
                className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
              >
                Privacy Policy
              </Link>
              . If you do not agree, you must not use our Services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              2. User Accounts
            </h2>
            <p>
              To access certain features, you must create an account. When you
              register, you agree to:
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Provide accurate, current, and complete information during
                  registration.
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
                  Maintain the security of your password and accept all risks of
                  unauthorized access to your account.
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
                  Notify us immediately if you discover any security breaches or
                  unauthorized use of your account.
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
                  You must be at least{" "}
                  <strong className="text-slate-800 font-semibold">
                    18 years old
                  </strong>{" "}
                  and possess a valid driver's license to book parking slots.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              3. Booking & Parking Services
            </h2>
            <p>
              Statio Nexus provides a platform to reserve parking slots at
              participating stations. When you confirm a booking:
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  You agree to park only in the assigned slot and for the
                  reserved duration.
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
                  You must present your booking QR code or confirmation to
                  station personnel upon arrival.
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
                  Statio Nexus acts as a{" "}
                  <strong className="text-slate-800 font-semibold">
                    booking intermediary
                  </strong>{" "}
                  between you and the station operator. We do not own or operate
                  the parking facilities.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              4. Payments & Fees
            </h2>
            <p>
              All payments are processed securely through our third-party
              partners (including Stripe and PayMongo). By making a booking, you
              authorize us to charge your selected payment method for the
              displayed rate, including any applicable taxes and service fees.
            </p>
            <p>
              Prices are displayed in{" "}
              <strong className="text-slate-800 font-semibold">
                Philippine Pesos (PHP)
              </strong>{" "}
              and are subject to change without notice. However, the price
              confirmed at the time of booking will be honored for that
              transaction.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              5. Cancellations & Refunds
            </h2>
            <p>We understand plans change. Our refund policy is as follows:</p>
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
                    Full Refund:
                  </strong>{" "}
                  Cancellations made at least 2 hours before the scheduled start
                  time.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
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
                    50% Refund:
                  </strong>{" "}
                  Cancellations made less than 2 hours before the start time.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
                    No Refund:
                  </strong>{" "}
                  No-shows or cancellations after the booking has started.
                </span>
              </li>
            </ul>
            <p className="mt-4">
              Refunds are processed to your original payment method within{" "}
              <strong className="text-slate-800 font-semibold">
                3-5 business days
              </strong>
              .
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              6. Overstay & Penalties
            </h2>
            <p>
              If you remain parked beyond your booked duration, additional
              charges will apply at the station's standard hourly rate. You will
              receive a push notification{" "}
              <strong className="text-slate-800 font-semibold">
                15 minutes before
              </strong>{" "}
              your session expires, giving you the opportunity to extend via the
              app.
            </p>
            <p>
              Vehicles left unattended for more than 24 hours beyond the booking
              period may be subject to towing at the owner's expense, in
              accordance with local regulations.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              7. Prohibited Conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="list-none pl-0 space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
                <span>
                  Use the Services for any unlawful purpose or in violation of
                  local traffic laws.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
                <span>
                  Park vehicles carrying hazardous materials, illegal goods, or
                  unregistered vehicles.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
                <span>
                  Attempt to reverse engineer, hack, or disrupt the platform or
                  its security measures.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
                <span>
                  Resell or transfer booked parking slots to third parties
                  without our written consent.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Statio Nexus and its
              affiliates shall not be liable for any indirect, incidental,
              special, or consequential damages, including loss of profits,
              data, or vehicle damage occurring at parking stations.
            </p>
            <p>
              Our total liability for any claim arising out of these Terms shall
              not exceed the{" "}
              <strong className="text-slate-800 font-semibold">
                total fees paid by you in the three (3) months
              </strong>{" "}
              preceding the claim. We are not responsible for theft, vandalism,
              or damage to vehicles or personal property while parked at any
              station.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              9. Intellectual Property
            </h2>
            <p>
              All content on the Statio Nexus platform — including text,
              graphics, logos, icons, images, software, and the "Statio Nexus"
              trademark — is the property of Fortress Land Inc. and is protected
              by Philippine and international copyright laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative
              works without our express written permission.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              10. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Updated
              versions will be posted on this page with a revised "Last Updated"
              date. Continued use of the Services after changes constitutes
              acceptance of the new Terms.
            </p>
            <p>
              For material changes, we will notify registered users via email or
              in-app notification at least{" "}
              <strong className="text-slate-800 font-semibold">
                14 days before
              </strong>{" "}
              the changes take effect.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of the{" "}
              <strong className="text-slate-800 font-semibold">
                Republic of the Philippines
              </strong>
              . Any disputes arising under these Terms shall be subject to the
              exclusive jurisdiction of the courts of Quezon City, Metro Manila.
            </p>
          </div>

          {/* ── Bottom CTA ─────────────────────────────────────────────── */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 md:p-10 text-center mt-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Questions about these terms?
            </h3>
            <p className="text-slate-600 text-sm mb-8 max-w-md mx-auto">
              Our legal and support teams are here to help clarify any section
              of this agreement.
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
                to="/privacy"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              >
                Read Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

