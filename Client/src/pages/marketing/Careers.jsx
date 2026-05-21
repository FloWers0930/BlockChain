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
    icon: "🌴",
    title: "Flexible Work",
    desc: "Hybrid and remote roles available across all departments.",
  },
  {
    icon: "📈",
    title: "Equity Options",
    desc: "Share in the success you help build from day one.",
  },
  {
    icon: "🎓",
    title: "Learning Budget",
    desc: "₱30,000/year for courses, conferences, and tools.",
  },
  {
    icon: "🏥",
    title: "Health Coverage",
    desc: "Full HMO coverage for you and your dependents.",
  },
  {
    icon: "🚗",
    title: "Free Parking",
    desc: "Unlimited free parking at any Statio Nexus station.",
  },
  {
    icon: "🎉",
    title: "Team Events",
    desc: "Quarterly offsites and monthly team lunches.",
  },
];

export default function Careers() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? openings : openings.filter((o) => o.dept === active);

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
          padding: "80px 24px 70px",
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
            💼 JOIN OUR TEAM
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 16px",
            }}
          >
            Build the Future of{" "}
            <span style={{ color: "#fde68a" }}>Smart Parking</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 520,
              margin: "0 auto 28px",
              lineHeight: 1.7,
            }}
          >
            Join a passionate team transforming how cities park — one booking at
            a time.
          </p>
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10,
              padding: "10px 22px",
              fontSize: 15,
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {openings.length} Open Positions
          </span>
        </div>
      </section>

      {/* Perks */}
      <section style={{ background: "#f5f3ff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 700,
              textAlign: "center",
              color: "#1e1b4b",
              marginBottom: 40,
            }}
          >
            Why Work at Statio Nexus?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 20,
            }}
          >
            {perks.map((p) => (
              <div
                key={p.title}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "24px 20px",
                  border: "1px solid #ede9fe",
                  textAlign: "center",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(124,58,237,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 10 }}>{p.icon}</div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#1e1b4b",
                    margin: "0 0 6px",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section style={{ padding: "72px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 700,
              textAlign: "center",
              color: "#1e1b4b",
              marginBottom: 32,
            }}
          >
            Open Positions
          </h2>

          {/* Filter */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 36,
              justifyContent: "center",
            }}
          >
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setActive(d)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: active === d ? "none" : "1px solid #e5e7eb",
                  background:
                    active === d
                      ? "linear-gradient(135deg, #7c3aed, #ec4899)"
                      : "#fff",
                  color: active === d ? "#fff" : "#4b5563",
                  fontWeight: active === d ? 700 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: "24px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  flexWrap: "wrap",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = job.color;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${job.color}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: job.color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  💼
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      marginBottom: 6,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1e1b4b",
                        margin: 0,
                      }}
                    >
                      {job.title}
                    </h3>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: job.color,
                        background: job.color + "18",
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {job.type}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      margin: "0 0 10px",
                      lineHeight: 1.5,
                    }}
                  >
                    {job.desc}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      📍 {job.location}
                    </span>
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          color: "#6b7280",
                          background: "#f3f4f6",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    padding: "10px 22px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.04)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #6d28d9, #ec4899)",
          padding: "72px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 800,
            color: "#fff",
            marginBottom: 14,
          }}
        >
          Don't see a role that fits?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            marginBottom: 28,
          }}
        >
          We're always looking for exceptional people. Send us your resume.
        </p>
        <a
          href="mailto:careers@statio-nexus.com"
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#7c3aed",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 32px",
            borderRadius: 12,
            textDecoration: "none",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.04)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Send Open Application →
        </a>
      </section>
    </div>
  );
}
