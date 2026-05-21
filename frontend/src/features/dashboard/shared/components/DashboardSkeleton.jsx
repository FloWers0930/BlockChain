// src/components/dashboard/DashboardSkeleton.jsx
export default function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header bar */}
      <div className="h-8 w-64 bg-gray-200 rounded-xl" />

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl p-6 space-y-3">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="bg-gray-100 rounded-2xl h-64 w-full" />

      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
