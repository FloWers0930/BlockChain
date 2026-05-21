import { useState } from "react";

const categories = ["All", "Product", "Tips", "News", "Technology"];

const posts = [
  {
    id: 1,
    category: "Product",
    tag: "🆕 New Feature",
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
    tag: "💡 Tips",
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
    tag: "📣 Announcement",
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
    tag: "⛓️ Blockchain",
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
    tag: "💡 Tips",
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
    tag: "🚀 Update",
    title: "Mobile App v2.0 — Redesigned for Speed",
    excerpt:
      "Faster load times, a cleaner booking flow, and new push notification controls.",
    date: "April 10, 2026",
    readTime: "4 min read",
    color: "#ec4899",
    featured: false,
  },
];

export default function Blog() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);
  const featured = posts.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "#fff",
        color: "#1e1b4b",
        minHeight: "100vh",
      }}
    >
      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #6d28d9 0%, #7c3aed 30%, #a855f7 60%, #ec4899 100%)",
          padding: "80px 24px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 70% 50%, rgba(236,72,153,0.3) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 999,
              padding: "6px 18px",
              fontSize: 13,
              color: "#fff",
              marginBottom: 20,
              letterSpacing: 1,
            }}
          >
            📝 STATIO NEXUS BLOG
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 16px",
            }}
          >
            Insights, Updates &amp;{" "}
            <span style={{ color: "#fde68a" }}>Parking Tips</span>
          </h1>
          <p
            style={{ fontSize: 17, color: "rgba(255,255,255,0.85)", margin: 0 }}
          >
            Stay up to date with the latest from Statio Nexus
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px" }}>
        {/* Category Filter */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: active === c ? "none" : "1px solid #e5e7eb",
                background:
                  active === c
                    ? "linear-gradient(135deg, #7c3aed, #ec4899)"
                    : "#fff",
                color: active === c ? "#fff" : "#4b5563",
                fontWeight: active === c ? 700 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        {active === "All" && featured && (
          <div
            style={{
              background: "linear-gradient(135deg, #6d28d9, #ec4899)",
              borderRadius: 20,
              padding: "40px 36px",
              marginBottom: 40,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 12,
                display: "block",
              }}
            >
              ⭐ Featured Post
            </span>
            <h2
              style={{
                fontSize: "clamp(1.3rem, 3vw, 2rem)",
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 14px",
                maxWidth: 600,
              }}
            >
              {featured.title}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 15,
                lineHeight: 1.7,
                margin: "0 0 20px",
                maxWidth: 560,
              }}
            >
              {featured.excerpt}
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                {featured.date}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                ·
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                {featured.readTime}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  background: "#fff",
                  color: "#7c3aed",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "8px 18px",
                  borderRadius: 10,
                }}
              >
                Read More →
              </span>
            </div>
          </div>
        )}

        {/* Post Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {rest.map((post) => (
            <div
              key={post.id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(124,58,237,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ height: 6, background: post.color }} />
              <div style={{ padding: "20px 20px 24px" }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: post.color,
                    background: post.color + "18",
                    padding: "4px 10px",
                    borderRadius: 999,
                    display: "inline-block",
                    marginBottom: 12,
                  }}
                >
                  {post.tag}
                </span>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1e1b4b",
                    margin: "0 0 10px",
                    lineHeight: 1.4,
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    lineHeight: 1.6,
                    margin: "0 0 16px",
                  }}
                >
                  {post.excerpt}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 12,
                    color: "#9ca3af",
                    alignItems: "center",
                  }}
                >
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
