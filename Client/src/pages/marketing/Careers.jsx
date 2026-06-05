// src/pages/Careers.jsx
import { useState } from "react";

const departments = ["All", "Engineering", "Design", "Operations", "Marketing"];

const openings = [
  {
    id: 1,
    dept: "Engineering",
    title: "Senior Backend Engineer",
    type: "Full-time",
    location: "Quezon City, PH (Hybrid)",
    desc: "Build and scale our Node.js/MongoDB backend that powers real-time parking across all stations.",
    tags: ["Node.js", "MongoDB", "REST API"],
    color: "#7c3aed",
  },
  {
    id: 2,
    dept: "Engineering",
    title: "React Frontend Developer",
    type: "Full-time",
    location: "Remote",
    desc: "Craft beautiful, high-performance UI for our web dashboard and booking platform.",
    tags: ["React", "Tailwind CSS", "Vite"],
    color: "#6366f1",
  },
  {
    id: 3,
    dept: "Design",
    title: "Product Designer (UI/UX)",
    type: "Full-time",
    location: "Quezon City, PH",
    desc: "Design seamless parking experiences that millions of drivers will use every day.",
    tags: ["Figma", "User Research", "Prototyping"],
    color: "#ec4899",
  },
  {
    id: 4,
    dept: "Operations",
    title: "Station Operations Manager",
    type: "Full-time",
    location: "Quezon City, PH (On-site)",
    desc: "Oversee day-to-day operations across all 142 live parking stations in the Tandang Sora area.",
    tags: ["Operations", "Team Management", "Logistics"],
    color: "#f59e0b",
  },
  {
    id: 5,
    dept: "Marketing",
    title: "Growth Marketing Specialist",
    type: "Part-time",
    location: "Remote",
    desc: "Drive user acquisition through digital campaigns, content, and strategic partnerships.",
    tags: ["SEO", "Social Media", "Analytics"],
    color: "#10b981",
  },
  {
    id: 6,
    dept: "Engineering",
    title: "Mobile Developer (React Native)",
    type: "Contract",
    location: "Remote",
    desc: "Build and maintain our iOS & Android app used by 24,800+ active users.",
    tags: ["React Native", "Expo", "iOS/Android"],
    color: "#0ea5e9",
  },
];

const perks = [
  {
    bg: "bg-blue-50",
    text: "text-blue-600",
    title: "Flexible Work",
    desc: "Hybrid and remote roles available across all departments.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    title: "Equity Options",
    desc: "Share in the success you help build from day one.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    bg: "bg-purple-50",
    text: "text-purple-600",
    title: "Learning Budget",
    desc: "₱30,000/year for courses, conferences, and tools.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
        />
      </svg>
    ),
  },
  {
    bg: "bg-red-50",
    text: "text-red-600",
    title: "Health Coverage",
    desc: "Full HMO coverage for you and your dependents.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    bg: "bg-amber-50",
    text: "text-amber-600",
    title: "Free Parking",
    desc: "Unlimited free parking at any Statio Nexus station.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
        />
      </svg>
    ),
  },
  {
    bg: "bg-pink-50",
    text: "text-pink-600",
    title: "Team Events",
    desc: "Quarterly offsites and monthly team lunches.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export default function Careers() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? openings : openings.filter((o) => o.dept === active);

  return (
    <div className="bg-white text-slate-900 min-h-screen overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-6">
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Join Our Team
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            Build the Future of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              Smart Parking
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join a passionate team transforming how cities park — one booking at
            a time.
          </p>
          <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-2.5 text-sm text-white font-semibold">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {openings.length} Open Positions
          </span>
        </div>
      </section>

      {/* ── Perks Section ────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">
              Benefits
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Why Work at Statio Nexus?
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((p) => (
              <div
                key={p.title}
                className="bg-white border border-slate-200 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${p.bg} ${p.text} group-hover:scale-110 transition-transform duration-300`}
                >
                  {p.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  {p.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open Positions Section ───────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Open Positions
            </h2>
            <p className="text-slate-500 mt-3 text-lg">
              Find your place on our team.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap mb-10 justify-center">
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setActive(d)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  active === d
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {filtered.map((job) => (
              <div
                key={job.id}
                className="group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Left Color Accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300"
                  style={{ backgroundColor: job.color }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-2"
                  style={{
                    backgroundColor: `${job.color}15`,
                    color: job.color,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${job.color}15`,
                        color: job.color,
                      }}
                    >
                      {job.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-3">
                    {job.desc}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {job.location}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button className="flex items-center gap-2 bg-slate-900 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex-shrink-0 shadow-lg shadow-slate-900/10 group-hover:shadow-xl group-hover:shadow-slate-900/20">
                  Apply Now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Don't see a role that fits?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            We're always looking for exceptional people. Send us your resume and
            let's build the future together.
          </p>
          <a
            href="mailto:careers@statio-nexus.com"
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
          >
            Send Open Application
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
          </a>
        </div>
      </section>
    </div>
  );
}

