// src/pages/LandingPage.jsx
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

export default function LandingPage() {
  const { count: users } = useAnimatedCounter(24800, 1600);
  const { count: stations } = useAnimatedCounter(142, 1800);
  const { count: bookings } = useAnimatedCounter(8740, 1400);

  return (
    <>
      <Helmet>
        <title>Statio Nexus | Smart Station Management</title>
        <meta
          name="description"
          content="Real-time station availability and intelligent management system for Crossroad Tandang Sora. Booking available via mobile app."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />

        {/* HERO */}
        <section
          id="home"
          className="min-h-screen flex items-center pt-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>

          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
            <div
              className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="container-modern relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white animate-fade-in">
                <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full text-sm font-semibold mb-8 animate-slide-in">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  🚀 NOW LIVE IN METRO MANILA
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-8">
                  Statio Nexus
                  <br />
                  <span className="gradient-text">
                    Smart Station Management
                  </span>
                </h1>

                <p className="text-xl text-blue-100 max-w-lg mb-12 leading-relaxed">
                  Real-time availability and intelligent management system for
                  Crossroad Tandang Sora's mixed-use development.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <button className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center gap-3 shadow-2xl">
                    <i className="fas fa-mobile-alt"></i>
                    Get the App — It's Free
                  </button>
                  <Link
                    to="/owner"
                    className="btn btn-outline text-white border-white hover:bg-white hover:text-indigo-600 text-lg px-8 py-4"
                  >
                    For Station Owners →
                  </Link>
                </div>

                <div className="flex flex-wrap gap-8 sm:gap-12">
                  <div
                    className="text-center animate-fade-in"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div className="text-4xl sm:text-5xl font-bold gradient-text">
                      {users.toLocaleString()}
                    </div>
                    <p className="text-blue-100 text-sm tracking-widest mt-2">
                      HAPPY USERS
                    </p>
                  </div>
                  <div
                    className="text-center animate-fade-in"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="text-4xl sm:text-5xl font-bold gradient-text">
                      {stations}
                    </div>
                    <p className="text-blue-100 text-sm tracking-widest mt-2">
                      LIVE STATIONS
                    </p>
                  </div>
                  <div
                    className="text-center animate-fade-in"
                    style={{ animationDelay: "0.6s" }}
                  >
                    <div className="text-4xl sm:text-5xl font-bold gradient-text">
                      {bookings.toLocaleString()}
                    </div>
                    <p className="text-blue-100 text-sm tracking-widest mt-2">
                      BOOKINGS THIS MONTH
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="flex justify-center animate-fade-in"
                style={{ animationDelay: "0.8s" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-50 animate-pulse-slow"></div>
                  <img
                    src="/assets/Parkingman.png"
                    alt="Statio Nexus - Smart station management platform"
                    className="relative z-10 max-w-full drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES - Kept your original context */}
        <section
          id="features"
          className="section-spacing bg-gradient-to-br from-white to-indigo-50"
        >
          <div className="container-modern">
            <div className="text-center mb-16">
              <h2 className="text-heading mb-4">
                Why Everyone Loves{" "}
                <span className="gradient-text">Crossroad Parking</span>
              </h2>
              <p className="text-body text-lg max-w-2xl mx-auto">
                Premium parking management for Crossroad Tandang Sora's
                mixed-use development
              </p>
            </div>
            <div className="grid-modern-3">
              <div
                className="card p-8 text-center group hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                  🚌
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
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                  🏨
                </div>
                <h3 className="text-subheading mb-4">Hotel Parking</h3>
                <p className="text-body">
                  Premium parking for 120-room hotel guests and visitors.
                </p>
              </div>
              <div
                className="card p-8 text-center group hover:shadow-2xl animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                  🛍️
                </div>
                <h3 className="text-subheading mb-4">Commercial Spaces</h3>
                <p className="text-body">
                  Parking for shops, restaurants, and business establishments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION - Updated for consistency */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-5xl font-bold mb-8">
                  About Crossroad Tandang Sora
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Fortress Land presents Crossroad Tandang Sora — a premier
                  13,000 SQM mixed-use development at #610 Tandang Sora Avenue,
                  Quezon City.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Featuring a central transport terminal, 120-room hotel,
                  educational institutions, and residential communities, it is
                  one of the most connected developments in Metro Manila.
                </p>
                <p className="text-lg text-gray-600">
                  Statio Nexus is the intelligent platform that powers its
                  parking ecosystem — delivering real-time availability,
                  seamless mobile booking, and professional management tools for
                  transport terminals, hotel parking, and commercial spaces.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/assets/Parkingman.png"
                  alt="Statio Nexus - Smart station management"
                  className="max-w-full drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION - Updated */}
        <section className="py-20 bg-[#f8f1ff]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold">
                Simple &amp; Transparent Pricing
              </h2>
              <p className="text-gray-500 mt-3 text-xl">
                The Statio Nexus mobile app is completely free. You only pay for
                the time you use the station.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
                <h3 className="text-2xl font-semibold mb-1">3-Hour Pass</h3>
                <div className="text-6xl font-bold text-gray-800 my-4">₱50</div>
                <p className="text-gray-500">First 3 hours</p>
                <p className="text-xs text-gray-400 mt-6">
                  Then ₱20 per additional hour
                </p>
                <button className="block w-full mt-10 py-4 bg-[#4f46e5] text-white rounded-2xl font-semibold hover:bg-[#4338ca] transition">
                  Get Started Free
                </button>
              </div>

              <div className="bg-white border-2 border-[#4f46e5] rounded-3xl p-8 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4f46e5] text-white text-xs font-bold px-5 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-semibold mb-1">Daily Pass</h3>
                <div className="text-6xl font-bold text-gray-800 my-4">
                  ₱199
                </div>
                <p className="text-gray-500">Up to 12 hours</p>
                <p className="text-xs text-gray-400 mt-6">
                  Best value for full-day use
                </p>
                <button className="block w-full mt-10 py-4 bg-[#4f46e5] text-white rounded-2xl font-semibold hover:bg-[#4338ca] transition">
                  Get Started Free
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
                <h3 className="text-2xl font-semibold mb-1">Monthly Pass</h3>
                <div className="text-6xl font-bold text-gray-800 my-4">
                  ₱2,999
                </div>
                <p className="text-gray-500">Unlimited access</p>
                <p className="text-xs text-gray-400 mt-6">For frequent users</p>
                <button className="block w-full mt-10 py-4 bg-[#4f46e5] text-white rounded-2xl font-semibold hover:bg-[#4338ca] transition">
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOR OWNERS SECTION - Updated */}
        <section className="py-20 bg-[#4f46e5] text-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-4">
              For Station Owners &amp; Managers
            </h2>
            <p className="max-w-2xl mx-auto text-blue-100 mb-12 text-xl">
              Manage Crossroad Tandang Sora's parking facilities with Statio
              Nexus — real-time analytics, automated payments, staff management,
              and full control of your stations.
            </p>
            <Link
              to="/owner"
              className="inline-flex items-center gap-3 bg-white text-[#4f46e5] px-10 py-5 rounded-3xl font-semibold text-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Open Management Portal →
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
  