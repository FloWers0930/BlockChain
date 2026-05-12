// src/components/dashboard/MetricCard.jsx - Premium Crossroad Design
export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  color = "blue",
  icon,
}) {
  const colorClasses = {
    blue: "from-blue-600 to-blue-700",
    green: "from-emerald-500 to-green-600",
    purple: "from-purple-600 to-pink-600",
    amber: "from-amber-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  const bgClasses = {
    blue: "card-premium",
    green: "card-commercial",
    purple: "bg-gradient-to-br from-purple-50 to-pink-50",
    amber: "card-hotel",
    red: "bg-gradient-to-br from-red-50 to-rose-50",
  };

  return (
    <div className={`${bgClasses[color] || bgClasses.blue} p-8 interactive-card animate-fade-in`}>
      <div className="flex justify-between items-start mb-6">
        {/* Left Content */}
        <div className="flex-1">
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-3">
            {title}
          </p>

          <div className="mb-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-sans">
              {value}
            </span>
          </div>

          {subtitle && <p className="text-slate-600 text-sm font-medium">{subtitle}</p>}
        </div>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} text-white shadow-premium hover:shadow-2xl hover:scale-110 transition-all duration-300`}
        >
          {icon ? <i className={`fas ${icon}`}></i> : "📊"}
        </div>
      </div>

      {/* Optional Trend Indicator */}
      {trend !== undefined && (
        <div
          className={`inline-flex items-center gap-3 text-sm font-bold px-4 py-2 rounded-full border transition-all duration-300 hover:shadow-premium ${
            trendUp
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${trendUp ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
          <span>{trendUp ? "↑" : "↓"}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
