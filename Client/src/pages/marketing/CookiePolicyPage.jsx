// src/pages/CookiePolicy.jsx
import { Link } from "react-router-dom";

const cookieTypes = [
  {
    title: "Strictly Necessary Cookies",
    desc: "These cookies are essential for you to browse the website and use its features, such as accessing secure areas, maintaining your login session, and processing real-time parking bookings.",
    required: true,
    color: "bg-emerald-50 text-emerald-600",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "Performance & Analytics",
    desc: "These cookies collect information about how you use our platform, such as which pages you visit most often. This helps us optimize the booking flow and improve station map accuracy.",
    required: false,
    color: "bg-blue-50 text-blue-600",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Functional Cookies",
    desc: "These cookies allow the platform to remember choices you make (such as your preferred station, language, or region) and provide enhanced, more personalized parking features.",
    required: false,
    color: "bg-purple-50 text-purple-600",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

export default function CookiePolicy() {
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-6">
            How Statio Nexus uses cookies and similar tracking technologies to
            provide, secure, and improve our smart parking platform.
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
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files that are placed on your device
              (computer, tablet, or mobile phone) when you visit a website. They
              are widely used to make websites work more efficiently, provide a
              better user experience, and supply information to the owners of
              the site.
            </p>
            <p>
              When you use the Statio Nexus web platform or mobile app, we may
              send one or more cookies to your device. We also use similar
              technologies like local storage and session storage to achieve
              similar results, such as keeping you logged in across sessions.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              2. How We Use Cookies
            </h2>
            <p className="mb-6">
              We use cookies for a variety of reasons, detailed below. Some are
              strictly required for the platform to function, while others help
              us understand how you interact with our services so we can build
              better features.
            </p>

            <div className="space-y-4">
              {cookieTypes.map((type) => (
                <div
                  key={type.title}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center flex-shrink-0`}
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
                          d={type.icon}
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {type.title}
                        </h3>
                        {type.required ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                            Always Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              3. Third-Party Cookies
            </h2>
            <p>
              In some special cases, we also use cookies provided by trusted
              third parties. For example, our platform uses{" "}
              <strong className="text-slate-800 font-semibold">
                Google Analytics
              </strong>
              , which is one of the most widespread and trusted analytics
              solutions on the web. These cookies may track things such as how
              long you spend on the site and the pages that you visit so we can
              continue to produce engaging content.
            </p>
            <p>
              We also use secure payment processors (like{" "}
              <strong className="text-slate-800 font-semibold">Stripe</strong>{" "}
              and{" "}
              <strong className="text-slate-800 font-semibold">PayMongo</strong>
              ) which set their own cookies to securely process your parking
              transactions, remember your payment methods, and prevent fraud.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              4. Managing Your Cookies
            </h2>
            <p>
              You can control and manage cookies in various ways. Please keep in
              mind that removing or blocking cookies may negatively impact your
              user experience, and parts of our platform (like real-time booking
              and live map tracking) may no longer function properly.
            </p>
            <ul className="list-none pl-0 space-y-3 text-slate-600 mt-4">
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
                  <strong className="text-slate-800 font-semibold">
                    Browser Settings:
                  </strong>{" "}
                  Most web browsers allow you to manage your cookie preferences.
                  You can set your browser to refuse cookies or delete certain
                  cookies.
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
                  <strong className="text-slate-800 font-semibold">
                    Opt-Out Links:
                  </strong>{" "}
                  You can opt-out of Google Analytics by installing the official
                  Google Analytics Opt-out Browser Add-on.
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
                  <strong className="text-slate-800 font-semibold">
                    Mobile Devices:
                  </strong>{" "}
                  You can reset your device's advertising identifier in your iOS
                  or Android settings to limit cross-app tracking.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              5. Changes to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time in order to
              reflect, for example, changes to the cookies we use or for other
              operational, legal, or regulatory reasons. Please therefore
              re-visit this Cookie Policy regularly to stay informed about our
              use of cookies and related technologies.
            </p>
          </div>

          {/* ── Bottom CTA ─────────────────────────────────────────────── */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 md:p-10 text-center mt-16">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Have questions about your privacy?
            </h3>
            <p className="text-slate-600 text-sm mb-8 max-w-md mx-auto">
              If you have any questions about our use of cookies, your data, or
              this policy, please contact our Data Protection team.
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

