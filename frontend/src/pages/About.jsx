// src/pages/About.jsx
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f1ff]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 mb-12 font-medium text-lg transition"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            About Statio Nexus
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Solving Metro Manila’s biggest daily headache — finding a parking
            spot.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div className="space-y-10">
            <div className="prose text-gray-600 max-w-none text-lg leading-relaxed">
              <p className="mb-8">
                Statio Nexus was born from personal frustration. Like many
                drivers in Metro Manila, our founder spent countless hours
                circling blocks in Makati, BGC, and Mall of Asia — often
                arriving late or stressed.
              </p>
              <p className="mb-12">
                So we built a smart parking reservation system that shows
                real-time availability and lets drivers reserve a spot in
                seconds. Today, Statio Nexus connects thousands of drivers with
                parking owners across Metro Manila.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg">
                To make parking simple, reliable, and stress-free for every
                driver in the Philippines by combining real-time data, instant
                reservations, and seamless digital payments — while giving
                parking owners powerful tools to manage and grow their business.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                What Sets Us Apart
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <span className="text-4xl text-blue-600 font-bold">01</span>
                  <div>
                    <h3 className="font-semibold">Real-Time Availability</h3>
                    <p className="text-gray-500">
                      Live updates so drivers always know which spots are open.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-4xl text-blue-600 font-bold">02</span>
                  <div>
                    <h3 className="font-semibold">Instant Reservations</h3>
                    <p className="text-gray-500">
                      Book your spot in seconds, guaranteed when you arrive.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-4xl text-blue-600 font-bold">03</span>
                  <div>
                    <h3 className="font-semibold">Secure Payments</h3>
                    <p className="text-gray-500">
                      Pay digitally with one tap — no cash, no tickets.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-4xl text-blue-600 font-bold">04</span>
                  <div>
                    <h3 className="font-semibold">Built for Manila</h3>
                    <p className="text-gray-500">
                      Designed specifically for the unique parking challenges of
                      Metro Manila.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://picsum.photos/id/1015/800/900"
              alt="Statio Nexus Story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Team Bios */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            Meet the Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <img
                src="https://picsum.photos/id/64/600/600"
                alt="Juan Dela Cruz"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-xl">Juan Dela Cruz</h3>
                <p className="text-blue-600 text-sm mb-3">Founder &amp; CEO</p>
                <p className="text-gray-600 text-sm">
                  Former driver who got tired of circling for parking. Visionary
                  behind Statio Nexus.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <img
                src="https://picsum.photos/id/1005/600/600"
                alt="Maria Santos"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-xl">Maria Santos</h3>
                <p className="text-blue-600 text-sm mb-3">
                  CTO &amp; Co-Founder
                </p>
                <p className="text-gray-600 text-sm">
                  Led the development of our real-time reservation system.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <img
                src="https://picsum.photos/id/201/600/600"
                alt="Miguel Reyes"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-xl">Miguel Reyes</h3>
                <p className="text-blue-600 text-sm mb-3">Head of Operations</p>
                <p className="text-gray-600 text-sm">
                  Ensures every parking location runs smoothly.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <img
                src="https://picsum.photos/id/1009/600/600"
                alt="Sophia Lim"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-xl">Sophia Lim</h3>
                <p className="text-blue-600 text-sm mb-3">
                  Marketing &amp; Partnerships
                </p>
                <p className="text-gray-600 text-sm">
                  Builds relationships with parking owners across Metro Manila.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-6xl text-blue-200 mb-4">“</div>
              <p className="italic text-gray-700 text-lg leading-relaxed mb-8">
                I used to waste 30–45 minutes every day looking for parking in
                Makati. Now I reserve a spot before I even leave the office.
                Game changer!
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="font-semibold">Sarah Lim</p>
                  <p className="text-sm text-gray-500">
                    Marketing Executive, Makati
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-6xl text-blue-200 mb-4">“</div>
              <p className="italic text-gray-700 text-lg leading-relaxed mb-8">
                My parking revenue increased by 42% in the first two months. The
                real-time dashboard and automatic payments are game changers.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-200 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="font-semibold">Roberto Cruz</p>
                  <p className="text-sm text-gray-500">
                    Parking Lot Owner, BGC
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-6xl text-blue-200 mb-4">“</div>
              <p className="italic text-gray-700 text-lg leading-relaxed mb-8">
                Managing three parking locations is now effortless. Real-time
                updates and excellent support make Statio Nexus the best choice
                in Metro Manila.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-200 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="font-semibold">Elena Morales</p>
                  <p className="text-sm text-gray-500">
                    Operations Manager, Ortigas Center
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
