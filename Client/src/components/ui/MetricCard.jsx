// src/components/dashboard/MetricCard.jsx
// icon prop is now a Lucide component reference, e.g. icon={TrendingUp}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  color = "blue",
  icon: Icon, // ← Lucide component, not a string
}) {
  const iconGradient = {
    blue: "from-blue-600 to-blue-700",
    green: "from-emerald-500 to-green-600",
    purple: "from-purple-600 to-pink-600",
    amber: "from-amber-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  const cardBg = {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50",
    green: "bg-gradient-to-br from-emerald-50 to-green-50",
    purple: "bg-gradient-to-br from-purple-50 to-pink-50",
    amber: "bg-gradient-to-br from-amber-50 to-orange-50",
    red: "bg-gradient-to-br from-red-50 to-rose-50",
  };

  return (
    <div
      className={`
        ${cardBg[color] ?? cardBg.blue}
        p-8 rounded-3xl border border-white/80
        shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]
        hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.14)]
        hover:-translate-y-1
        transition-all duration-300
        animate-fade-in
      `}
    >
      <div className="flex justify-between items-start mb-6">
        {/* Left */}
        <div className="flex-1">
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-3">
            {title}
          </p>
          <span className="text-4xl font-bold text-slate-900 leading-none">
            {value}
          </span>
          {subtitle && (
            <p className="text-slate-500 text-sm font-medium mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Icon */}
        <div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
            bg-gradient-to-br ${iconGradient[color] ?? iconGradient.blue}
            text-white shadow-lg hover:scale-110 transition-transform duration-300
          `}
        >
          {Icon ? (
            <Icon size={26} strokeWidth={2} />
          ) : (
            <span className="text-2xl">📊</span>
          )}
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div
          className={`
            inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border
            ${
              trendUp
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }
          `}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${trendUp ? "bg-emerald-500" : "bg-red-500"}`}
          />
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </div>
  );
}
