// src/pages/Blog.jsx
import { useState } from "react";

const categories = ["All", "Product", "Tips", "News", "Technology"];

const posts = [
  {
    id: 1,
    category: "Product",
    tag: "New Feature",
    title: "Real-Time Parking Availability is Now Live",
    excerpt:
      "We've launched live slot tracking across all 142 stations in Crossroad Tandang Sora. See open spots before you even leave home.",
    date: "May 18, 2026",
    readTime: "3 min read",
    color: "#7c3aed",
    featured: true,
  },
  {
    id: 2,
    category: "Tips",
    tag: "Tips",
    title: "5 Ways to Never Miss a Parking Spot Again",
    excerpt:
      "Smart booking habits that save you time, fuel, and frustration every single day.",
    date: "May 12, 2026",
    readTime: "4 min read",
    color: "#ec4899",
    featured: false,
  },
  {
    id: 3,
    category: "News",
    tag: "Announcement",
    title: "Statio Nexus Hits 24,800 Active Users",
    excerpt:
      "A huge milestone for our team — and it's only the beginning. Here's what's coming next.",
    date: "May 5, 2026",
    readTime: "2 min read",
    color: "#f59e0b",
    featured: false,
  },
  {
    id: 4,
    category: "Technology",
    tag: "Blockchain",
    title: "How We Use Blockchain to Secure Parking Records",
    excerpt:
      "A deep dive into our Hyperledger Besu integration and what it means for transaction integrity.",
    date: "April 28, 2026",
    readTime: "6 min read",
    color: "#10b981",
    featured: false,
  },
  {
    id: 5,
    category: "Tips",
    tag: "Tips",
    title: "Peak Hours at Crossroad Tandang Sora — When to Book",
    excerpt:
      "Data from 8,740 monthly bookings reveals the best and worst times to find parking at each zone.",
    date: "April 20, 2026",
    readTime: "3 min read",
    color: "#6366f1",
    featured: false,
  },
  {
    id: 6,
    category: "Product",
    tag: "Update",
    title: "Mobile App v2.0 — Redesigned for Speed",
    excerpt:
      "Faster load times, a cleaner booking flow, and new push notification controls.",
    date: "April 10, 2026",
    readTime: "4 min read",
    color: "#ec4899",
    featured: false,
  },
];

// Helper to get tag colors and icons
const getTagConfig = (category) => {
  switch (category) {
    case "Product":
      return {
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
      };
    case "Tips":
      return {
        bg: "bg-amber-50",
        text: "text-amber-600",
        icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      };
    case "News":
      return {
        bg: "bg-pink-50",
        text: "text-pink-600",
        icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
      };
    case "Technology":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-600",
        icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      };
  }
};

export default function Blog() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);
  const featured = posts.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            Statio Nexus Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            Insights, Updates &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              Parking Tips
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Stay up to date with the latest features, engineering deep-dives,
            and smart parking habits.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* ── Category Filter ──────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-12 justify-center md:justify-start">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${
                active === c
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Featured Post ────────────────────────────────────────────── */}
        {active === "All" && featured && (
          <div className="relative bg-slate-900 rounded-3xl p-8 md:p-12 mb-16 overflow-hidden group cursor-pointer shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured Post
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4 max-w-2xl group-hover:text-indigo-300 transition-colors">
                {featured.title}
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                {featured.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{featured.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span>{featured.readTime}</span>
                </div>
                <span className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold text-sm px-5 py-2.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                  Read Article
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
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Post Grid ────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => {
            const tagConfig = getTagConfig(post.category);
            return (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer group hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col"
              >
                <div
                  className="h-1.5 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${post.color}, ${post.color}dd)`,
                  }}
                />
                <div className="p-6 flex flex-col flex-1">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${tagConfig.bg} ${tagConfig.text} px-3 py-1 rounded-full w-fit mb-4`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={tagConfig.icon}
                      />
                    </svg>
                    {post.tag}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{post.readTime}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
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
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

