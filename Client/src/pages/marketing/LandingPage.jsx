import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
import Navbar from "@components/layout/Navbar";
import Footer from "@components/layout/Footer";
import { useAnimatedCounter } from "@hooks/useAnimatedCounter";

export default function LandingPage() {
  const { count: users } = useAnimatedCounter(24800, 1600);
  const { count: stations } = useAnimatedCounter(142, 1800);
  const { count: bookings } = useAnimatedCounter(8740, 1400);

  const [activeSection, setActiveSection] = useState("home");
  const [openFaq, setOpenFaq] = useState(null);

  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const faqRef = useRef(null);
  const pricingRef = useRef(null);

  const faqs = [
    {
      question: "What is Statio Nexus?",
      answer:
        "Statio Nexus is a smart parking management platform designed for Crossroad Tandang Sora. It provides real‑time parking availability, mobile booking, and seamless payment for customers.",
    },
    {
      question: "Is the mobile app really free?",
      answer:
        "Yes, the Statio Nexus mobile app is completely free to download and use. You only pay for the actual parking time you use – no hidden fees.",
    },
    {
      question: "How do I book a parking slot?",
      answer:
        "Simply download the app, create a free account, and you can instantly see available slots. Choose your spot, select a time pass, and confirm – it’s that easy.",
    },
    {
      question: "What if I have a problem with a booking?",
      answer:
        "You can reach our 24/7 support team through the app or call our hotline. We also have on‑site personnel at the terminal to assist you immediately.",
    },
  ];

  const scrollTo = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const sections = [
      { id: "home", ref: homeRef },
      { id: "features", ref: featuresRef },
      { id: "about", ref: aboutRef },
      { id: "faq", ref: faqRef },
      { id: "pricing", ref: pricingRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.dataset.sectionId);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.5 },
    );

    sections.forEach(({ id, ref }) => {
      if (ref.current) {
        ref.current.dataset.sectionId = id;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (sectionId) => {
    const refMap = {
      home: homeRef,
      features: featuresRef,
      about: aboutRef,
      faq: faqRef,
      pricing: pricingRef,
    };
    scrollTo(refMap[sectionId]);
  };

  return (
    <>
      <Helmet>
        <title>Statio Nexus | Smart Parking at Crossroad Tandang Sora</title>
        <meta
          name="description"
          content="Real‑time parking availability and mobile booking for Crossroad Tandang Sora. Download the Statio Nexus app today."
        />
      </Helmet>

      <div
        className={`h-screen overflow-y-scroll scroll-smooth ${
          ["home", "features"].includes(activeSection)
            ? "snap-y snap-mandatory"
            : ""
        }`}
      >
        <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

        {/* ── HOME ──────────────────────────────────────────────────── */}
        <section
          ref={homeRef}
          id="home"
          className="snap-start h-screen flex items-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#c026d3] opacity-95" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" />
            <div
              className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"
              style={{ animationDelay: "4s" }}
            />
          </div>

          <div className="w-full max-w-screen-xl mx-auto px-10 xl:px-16 relative z-10 py-16">
            <div className="grid md:grid-cols-2 gap-12 xl:gap-20 items-center">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-white/30">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  NOW LIVE AT CROSSROAD TANDANG SORA
                </div>

                <h1 className="text-5xl md:text-6xl font-bold leading-none tracking-tight mb-6">
                  Statio Nexus
                  <br />
                  <span className="gradient-text">Smart Parking</span>
                </h1>

                <p className="text-xl text-white/95 max-w-lg mb-10 leading-relaxed">
                  Real‑time availability and seamless mobile booking for
                  Crossroad Tandang Sora's mixed‑use development.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-14">
                  <Link
                    to="/download"
                    className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center gap-3 shadow-2xl no-underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Download the App Now
                  </Link>
                </div>

                <div className="flex flex-wrap gap-10 sm:gap-14">
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold gradient-text">
                      {users.toLocaleString()}
                    </div>
                    <p className="text-white/80 text-xs tracking-widest mt-2 uppercase">
                      Happy Users
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold gradient-text">
                      {stations}
                    </div>
                    <p className="text-white/80 text-xs tracking-widest mt-2 uppercase">
                      Live Stations
                    </p>
                  </div>
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold gradient-text">
                      {bookings.toLocaleString()}
                    </div>
                    <p className="text-white/80 text-xs tracking-widest mt-2 uppercase">
                      Bookings This Month
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <div className="relative w-full max-w-md xl:max-w-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-40 animate-pulse-slow" />
                  <img
                    src="/assets/Parkingman.png"
                    alt="Statio Nexus Platform"
                    className="relative z-10 w-full drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────── */}
        <section
          ref={featuresRef}
          id="features"
          className="snap-start h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-50"
        >
          <div className="w-full max-w-screen-xl mx-auto px-10 xl:px-16">
            <div className="text-center mb-16">
              <h2 className="text-heading mb-4">
                Why Everyone Loves{" "}
                <span className="gradient-text">Crossroad Parking</span>
              </h2>
              <p className="text-body text-lg max-w-2xl mx-auto">
                Premium parking management for Crossroad Tandang Sora's
                mixed‑use development
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div
                className="card p-8 text-center group hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                    />
                  </svg>
                </div>
                <h3 className="text-subheading mb-4">Transport Terminal</h3>
                <p className="text-body">
                  Dedicated parking for UV Express, Jeepney, and Tricycle
                  terminals.
                </p>
              </div>

              <div
                className="card p-8 text-center group hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-subheading mb-4">Hotel Parking</h3>
                <p className="text-body">
                  Premium parking for 120‑room hotel guests and visitors.
                </p>
              </div>

              <div
                className="card p-8 text-center group hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-subheading mb-4">Commercial Spaces</h3>
                <p className="text-body">
                  Parking for shops, restaurants, and business establishments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────────────────── */}
        <section
          ref={aboutRef}
          id="about"
          className="snap-start h-screen flex items-center bg-white"
        >
          <div className="w-full max-w-screen-xl mx-auto px-10 xl:px-16">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8">
                  About Statio Nexus
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Statio Nexus is an intelligent parking management platform
                  designed to modernize how parking ecosystems operate across
                  mixed-use developments, transport hubs, and residential
                  communities. We serve as the central digital infrastructure
                  that connects drivers, facility operators, and station owners
                  through a single unified system.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  We deliver real-time spot availability tracking and seamless
                  mobile booking to eliminate parking friction for end users.
                  Simultaneously, we provide operators with comprehensive
                  dashboards featuring revenue analytics, occupancy heatmaps,
                  and live performance monitoring to optimize daily operations.
                </p>
                <p className="text-lg text-gray-600">
                  Ultimately, Statio Nexus transforms static parking
                  infrastructure into smart, data-driven assets. By bridging the
                  gap between user convenience and operational visibility, we
                  turn parking from a logistical challenge into a streamlined,
                  revenue-generating component of any development.
                </p>
              </div>
              <div className="flex justify-end">
                <img
                  src="/assets/Parkingman.png"
                  alt="Statio Nexus"
                  className="max-w-sm xl:max-w-md drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────────── */}
        <section
          ref={faqRef}
          id="faq"
          className="snap-start h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-50"
        >
          <div className="w-full max-w-screen-xl mx-auto px-10 xl:px-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked{" "}
                <span className="gradient-text">Questions</span>
              </h2>
              <p className="text-body text-lg max-w-2xl mx-auto">
                Everything you need to know about parking at Crossroad Tandang
                Sora.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-xl font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <svg
                      className={`w-6 h-6 transform transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "pb-6 max-h-96" : "max-h-0"
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ────────────────────────────────────────────────── */}
        <section
          ref={pricingRef}
          id="pricing"
          className="snap-start h-screen flex items-center justify-center bg-[#f8f1ff]"
        >
          <div className="w-full max-w-screen-xl mx-auto px-10 xl:px-16">
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-gray-900">
                Simple &amp; Transparent Pricing
              </h2>
              <p className="text-gray-500 mt-3 text-xl max-w-xl">
                The Statio Nexus mobile app is completely free. You only pay for
                the time you use the station.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                  3‑Hour Pass
                </h3>
                <div className="text-6xl font-bold text-gray-800 my-4">₱50</div>
                <p className="text-gray-500">First 3 hours</p>
                <p className="text-xs text-gray-400 mt-4">
                  ₱2500 per succeeding hour
                </p>
                <Link
                  to="/download"
                  className="block w-full mt-10 py-4 bg-[#4f46e5] text-white text-center rounded-2xl font-semibold hover:bg-[#4338ca] transition no-underline"
                >
                  Download the App Now
                </Link>
              </div>

              <div className="bg-white border-2 border-[#4f46e5] rounded-3xl p-8 relative shadow-premium">
                <div className="absolute -top-3 left-8 bg-[#4f46e5] text-white text-xs font-bold px-5 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                  Overnight Pass
                </h3>
                <div className="text-6xl font-bold text-gray-800 my-4">
                  ₱500
                </div>
                <p className="text-gray-500">Overnight parking</p>
                <p className="text-xs text-gray-400 mt-4">
                  Best value for overnight stays
                </p>
                <Link
                  to="/download"
                  className="block w-full mt-10 py-4 bg-[#4f46e5] text-white text-center rounded-2xl font-semibold hover:bg-[#4338ca] transition no-underline"
                >
                  Download the App Now
                </Link>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                  Succeeding Hours
                </h3>
                <div className="text-6xl font-bold text-gray-800 my-4">₱10</div>
                <p className="text-gray-500">Per succeeding hour</p>
                <p className="text-xs text-gray-400 mt-4">
                  Penalty for overstaying
                </p>
                <Link
                  to="/download"
                  className="block w-full mt-10 py-4 bg-[#4f46e5] text-white text-center rounded-2xl font-semibold hover:bg-[#4338ca] transition no-underline"
                >
                  Download the App Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        {!["home", "features"].includes(activeSection) && <Footer />}
      </div>
    </>
  );
}

