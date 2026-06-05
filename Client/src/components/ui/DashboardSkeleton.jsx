// src/components/ui/DashboardSkeleton.jsx (or wherever it's located)
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 space-y-7 animate-fade-in">
      {/* Header Skeleton (Matches the real-time clock & title layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-64 shimmer rounded-lg" />
          <div className="h-4 w-48 shimmer rounded-lg" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-56 shimmer rounded-full" />
          <div className="w-9 h-9 shimmer rounded-full" />
        </div>
      </div>

      {/* KPI Cards Skeleton (Matches the 4-column Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="h-3 w-24 shimmer rounded-md" />
              <div className="w-9 h-9 shimmer rounded-2xl" />
            </div>
            <div className="h-8 w-32 shimmer rounded-lg mb-3" />
            <div className="h-3 w-full shimmer rounded-md" />
          </div>
        ))}
      </div>

      {/* Charts & Side Panels Skeleton (Matches the 8/4 grid layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large Chart Area */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 w-36 shimmer rounded-md" />
              <div className="h-3 w-48 shimmer rounded-md" />
            </div>
            <div className="h-6 w-20 shimmer rounded-full" />
          </div>
          {/* Chart Placeholder */}
          <div className="h-72 w-full shimmer rounded-2xl" />
        </div>

        {/* Side Panel / Top Stations List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-32 shimmer rounded-md" />
            <div className="h-3 w-24 shimmer rounded-md" />
          </div>
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 shimmer rounded-md" />
                  <div className="h-2 w-1/2 shimmer rounded-md" />
                </div>
                <div className="h-4 w-16 shimmer rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

