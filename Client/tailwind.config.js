  /** @type {import('tailwindcss').Config} */
  import plugin from "tailwindcss/plugin";

  export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

    darkMode: "class",

    theme: {
      extend: {
        // Brand Colors
        colors: {
          primary: {
            500: "#4f46e5",
            600: "#4338ca",
            700: "#3730a3",
          },
          accent: "#7c3aed",
          gold: "#f59e0b",
        },

        // Shadows
        boxShadow: {
          premium: "0 32px 64px -12px rgba(79, 70, 229, 0.25)",
          gold: "0 8px 16px -4px rgba(245, 158, 11, 0.2)",
        },

        // Border Radius
        borderRadius: {
          "3xl": "2rem",
          "4xl": "2.5rem",
        },

        // Animations
        animation: {
          float: "float 4s ease-in-out infinite",
          "fade-in": "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        },

        keyframes: {
          float: {
            "0%, 100%": { transform: "translateY(0px) scale(1)" },
            "50%": { transform: "translateY(-20px) scale(1.05)" },
          },
          fadeInUp: {
            from: { opacity: "0", transform: "translateY(30px) scale(0.95)" },
            to: { opacity: "1", transform: "translateY(0) scale(1)" },
          },
        },
      },
    },

    plugins: [
      plugin(function ({ addComponents, addUtilities }) {
        // ─── Layout ────────────────────────────────────────────────────────────
        addComponents({
          ".container-modern": {
            width: "100%",
            maxWidth: "80rem", // 1280px
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          },

          ".section-spacing": {
            paddingTop: "5rem",
            paddingBottom: "5rem",
          },

          // 3-column responsive grid
          ".grid-modern-3": {
            display: "grid",
            gap: "2rem",
            gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
            "@screen md": {
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            },
          },
        });

        // ─── Typography ────────────────────────────────────────────────────────
        addComponents({
          // Large section headings  (e.g. "Why Everyone Loves…")
          ".text-heading": {
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: "700",
            lineHeight: "1.15",
            color: "#111827", // gray-900 — solid, readable on white
            letterSpacing: "-0.02em",
          },

          // Sub-headings inside cards / smaller sections
          ".text-subheading": {
            fontSize: "1.25rem",
            fontWeight: "600",
            lineHeight: "1.4",
            color: "#1f2937", // gray-800
          },

          // Body / description copy
          ".text-body": {
            fontSize: "1rem",
            lineHeight: "1.75",
            color: "#6b7280", // gray-500 — readable on white bg
          },
        });

        // ─── Gradient text (hero stats + heading accents) ───────────────────
        addUtilities({
          ".gradient-text": {
            background:
              "linear-gradient(135deg, #a5b4fc 0%, #e879f9 50%, #fbbf24 100%)",
            "-webkit-background-clip": "text",
            "background-clip": "text",
            "-webkit-text-fill-color": "transparent",
            color: "transparent",
          },
        });

        // ─── Card ──────────────────────────────────────────────────────────────
        addComponents({
          ".card": {
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,.06), 0 2px 4px -1px rgba(0,0,0,.04)",
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
            "&:hover": {
              boxShadow: "0 20px 40px -8px rgba(79, 70, 229, 0.15)",
              transform: "translateY(-4px)",
            },
          },
        });

        // ─── Buttons ───────────────────────────────────────────────────────────
        addComponents({
          // Shared base
          ".btn": {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "1rem",
            fontWeight: "600",
            fontSize: "1rem",
            paddingTop: "0.875rem",
            paddingBottom: "0.875rem",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            transition: "all 0.2s ease",
            cursor: "pointer",
            border: "2px solid transparent",
            textDecoration: "none",
            lineHeight: "1",
            whiteSpace: "nowrap",
          },

          // Filled indigo — primary CTA
          ".btn-primary": {
            backgroundColor: "#4f46e5",
            color: "#ffffff",
            borderColor: "#4f46e5",
            "&:hover": {
              backgroundColor: "#4338ca",
              borderColor: "#4338ca",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 24px -4px rgba(79, 70, 229, 0.45)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },

          // Outlined — secondary CTA (used on dark hero bg)
          ".btn-outline": {
            backgroundColor: "transparent",
            borderColor: "currentColor",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          },
        });
      }),
    ],
  };

