// src/pages/Social.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const socialPlatforms = [
  {
    name: "X (Twitter)",
    handle: "@statio_nexus",
    followers: "12.4k",
    desc: "Real-time updates, parking tips, and community conversations.",
    link: "https://twitter.com/statio_nexus",
    gradient: "from-slate-900 to-slate-800",
    hoverBorder: "hover:border-slate-900",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    handle: "Statio Nexus",
    followers: "8.7k",
    desc: "Company news, career opportunities, and industry insights.",
    link: "https://linkedin.com/company/statio-nexus",
    gradient: "from-blue-600 to-blue-700",
    hoverBorder: "hover:border-blue-600",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "StatioNexusPH",
    followers: "24.8k",
    desc: "Community updates, events, and driver success stories.",
    link: "https://facebook.com/stationexusph",
    gradient: "from-blue-500 to-blue-600",
    hoverBorder: "hover:border-blue-500",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@statio.nexus",
    followers: "18.2k",
    desc: "Behind-the-scenes, station spotlights, and user-generated content.",
    link: "https://instagram.com/statio.nexus",
    gradient: "from-pink-500 via-purple-500 to-orange-500",
    hoverBorder: "hover:border-pink-500",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "Statio Nexus",
    followers: "5.3k",
    desc: "Tutorial videos, platform walkthroughs, and driver testimonials.",
    link: "https://youtube.com/@stationexus",
    gradient: "from-red-500 to-red-600",
    hoverBorder: "hover:border-red-500",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@statio.nexus",
    followers: "31.6k",
    desc: "Quick parking hacks, station tours, and viral driver moments.",
    link: "https://tiktok.com/@statio.nexus",
    gradient: "from-slate-900 via-pink-500 to-cyan-400",
    hoverBorder: "hover:border-pink-500",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
];

const communityStats = [
  { value: "100k+", label: "Total Followers", color: "from-indigo-600 to-purple-600" },
  { value: "2.4M", label: "Monthly Impressions", color: "from-purple-600 to-pink-600" },
  { value: "847k", label: "Engagements", color: "from-pink-600 to-rose-600" },
  { value: "4.9", label: "Avg. Rating", color: "from-amber-500 to-orange-500" },
];

const featuredPosts = [
  {
    platform: "Instagram",
    handle: "@statio.nexus",
    content: "🚗 Just hit 24,800 active users! Thank you to our amazing community for making smart parking a reality in Quezon City. Here's to the next milestone! 🎉",
    likes: "2.4k",
    comments: "184",
    time: "2 hours ago",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    platform: "X (Twitter)",
    handle: "@statio_nexus",
    content: "Pro tip: Book your spot 30 minutes before arrival during peak hours (7-9 AM, 5-7 PM) to guarantee availability. Our real-time map updates every 2 seconds! ⚡",
    likes: "847",
    comments: "62",
    time: "5 hours ago",
    gradient: "from-slate-900 to-slate-800",
  },
  {
    platform: "LinkedIn",
    handle: "Statio Nexus",
    content: "We're thrilled to announce our partnership with Ayala Malls Vertis North, bringing smart parking to one of QC's premier shopping destinations. Read the full press release on our website.",
    likes: "1.2k",
    comments: "94",
    time: "1 day ago",
    gradient: "from-blue-600 to-blue-700",
  },
];

const hashtags = [
  "#StatioNexus",
  "#SmartParking",
  "#CrossroadTandangSora",
  "#QuezonCity",
  "#ParkSmarter",
  "#MobilityTech",
  "#PHStartups",
];

export default function Social() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen overflow-hidden">
      
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Join Our Community
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Connect with us
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              across every platform
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Follow Statio Nexus for real-time updates, parking tips, community stories, and behind-the-scenes content from the team building the future of urban mobility.
          </p>
        </div>
      </section>

      {/* ── Community Stats ──────────────────────────────────────────── */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {communityStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight mb-2`}>
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Platforms Grid ────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Follow Us</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Find us on social</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Choose your favorite platform and join the conversation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${platform.hoverBorder} transition-all duration-300 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    {platform.icon}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-1">{platform.name}</h4>
                <p className="text-sm font-semibold text-indigo-600 mb-3">{platform.handle}</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{platform.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {platform.followers} followers
                  </div>
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Visit →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Content ─────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Latest Updates</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">From our feeds</h3>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Recent posts and announcements from across our social channels.
            </p>
          </div>

          <div className="space-y-5">
            {featuredPosts.map((post, idx) => (
              <article key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${post.gradient} text-white flex items-center justify-center flex-shrink-0`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{post.platform}</span>
                      <span className="text-sm text-slate-500">· {post.handle}</span>
                    </div>
                    <p className="text-xs text-slate-400">{post.time}</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>
                <div className="flex items-center gap-6 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comments}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hashtag Campaign ─────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Join the conversation</h3>
          <p className="text-slate-500 mb-8">Use these hashtags to connect with our community and share your parking experiences.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {hashtags.map((tag) => (
              <span key={tag} className="bg-white border border-slate-200 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter Signup ────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-slate-200 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Stay in the loop</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Get weekly updates, parking tips, and exclusive offers delivered straight to your inbox.
              </p>

              {subscribed ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl text-sm flex items-center justify-center gap-3 animate-fade-in-up">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You're subscribed! Check your inbox for a welcome email.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10 whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}

              <p className="text-xs text-slate-400 mt-4">No spam, ever. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark CTA Footer ──────────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to join the community?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Follow us on your favorite platform and be part of the smart parking revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://twitter.com/statio_nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow on X
            </a>
            <a
              href="https://instagram.com/statio.nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
