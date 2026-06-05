// src/components/dashboard/MetricCard.jsx (or src/components/ui/MetricCard.jsx)

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  color = "blue", // "blue", "green", "purple", "amber", "red"
  accent, // Optional hex code override (e.g., "#10b981")
  icon, // Expects an inline SVG node, e.g. <svg>...</svg>
  loading = false,
}) {
  // Fallback color map if hex accent isn't provided
  const colorMap = {
    blue: "#6366f1",
    green: "#10b981",
    purple: "#8b5cf6",
    amber: "#f59e0b",
    red: "#f87171",
  };

  const activeAccent = accent || colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase leading-tight">
          {title}
        </p>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${activeAccent}15`, color: activeAccent }}
        >
          {icon || (
            // Default fallback icon if none is passed
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-24 shimmer rounded-lg" />
          <div className="h-4 w-32 shimmer rounded-lg" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-bold tracking-tighter font-mono text-slate-900 leading-none mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-slate-500 text-sm font-medium mt-2">
              {subtitle}
            </p>
          )}
        </>
      )}

      {/* Trend Indicator */}
      {trend !== undefined && !loading && (
        <div
          className={`
            inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mt-4 border
            ${
              trendUp
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }
          `}
        >
          {trendUp ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
          {trend}
        </div>
      )}
    </div>
  );
}

