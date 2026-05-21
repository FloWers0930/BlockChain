import { useEffect, useRef } from "react";

const stats = [
  { value: "2024", label: "Founded" },
  { value: "24,800+", label: "Happy Users" },
  { value: "142", label: "Live Stations" },
  { value: "8,740", label: "Bookings This Month" },
];

const team = [
  {
    initials: "LR",
    name: "Lawrenz R.",
    role: "Founder & CEO",
    color: "#a78bfa",
  },
  {
    initials: "MG",
    name: "Maria G.",
    role: "Head of Operations",
    color: "#f472b6",
  },
  { initials: "JD", name: "James D.", role: "Lead Engineer", color: "#60a5fa" },
  {
    initials: "SC",
    name: "Sofia C.",
    role: "Product Designer",
    color: "#fb923c",
  },
];

const values = [
  {
    icon: "🚀",
    title: "Innovation First",
    desc: "We constantly push the boundaries of smart parking technology.",
  },
  {
    icon: "🤝",
    title: "User-Centric",
    desc: "Every feature is built with our users' convenience in mind.",
  },
  {
    icon: "🔒",
    title: "Trust & Security",
    desc: "Your data and payments are protected with enterprise-grade security.",
  },
  {
    icon: "🌱",
    title: "Sustainability",
    desc: "Reducing congestion and emissions through smarter parking habits.",
  },
];

export default function About() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "#fff",
        color: "#1e1b4b",
      }}
    >
      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #6d28d9 0%, #7c3aed 30%, #a855f7 60%, #ec4899 100%)",
          padding: "100px 24px 80px",
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
        <div
          ref={heroRef}
          style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 999,
              padding: "6px 18px",
              fontSize: 13,
              color: "#fff",
              marginBottom: 24,
              letterSpacing: 1,
            }}
          >
            🅿️ ABOUT STATIO NEXUS
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 20px",
              lineHeight: 1.15,
            }}
          >
            Reimagining <span style={{ color: "#fde68a" }}>Smart Parking</span>{" "}
            for Everyone
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Statio Nexus was built to solve the everyday frustration of finding
            parking — starting with Crossroad Tandang Sora's mixed-use
            development.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#f5f3ff", padding: "60px 24px" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            textAlign: "center",
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <p
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: "#7c3aed",
                  margin: 0,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  margin: "4px 0 0",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section
        style={{
          padding: "80px 24px",
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 700,
            color: "#1e1b4b",
            marginBottom: 20,
          }}
        >
          Our Mission
        </h2>
        <p
          style={{ fontSize: 17, color: "#4b5563", lineHeight: 1.8, margin: 0 }}
        >
          We believe parking should never be a barrier to enjoying your
          destination. Through real-time availability, seamless mobile booking,
          and smart station management, we're transforming how cities and
          developments handle parking — making it effortless for drivers and
          profitable for operators.
        </p>
      </section>

      {/* Values */}
      <section style={{ background: "#f5f3ff", padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 700,
              textAlign: "center",
              color: "#1e1b4b",
              marginBottom: 48,
            }}
          >
            What We Stand For
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}
          >
            {values.map((v) => (
              <div
                key={v.title}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "28px 24px",
                  border: "1px solid #ede9fe",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 32px rgba(124,58,237,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{v.icon}</div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1e1b4b",
                    margin: "0 0 8px",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
              fontWeight: 700,
              textAlign: "center",
              color: "#1e1b4b",
              marginBottom: 48,
            }}
          >
            Meet the Team
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 24,
            }}
          >
            {team.map((m) => (
              <div key={m.name} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: m.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 auto 14px",
                  }}
                >
                  {m.initials}
                </div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#1e1b4b",
                    margin: "0 0 4px",
                  }}
                >
                  {m.name}
                </p>
                <p style={{ fontSize: 13, color: "#7c3aed", margin: 0 }}>
                  {m.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #6d28d9, #ec4899)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            fontWeight: 800,
            color: "#fff",
            marginBottom: 16,
          }}
        >
          Ready to park smarter?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 16,
            marginBottom: 32,
          }}
        >
          Join 24,800+ users already using Statio Nexus.
        </p>
        <a
          href="/"
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
          Get the App — It's Free
        </a>
      </section>
    </div>
  );
}
