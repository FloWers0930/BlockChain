// src/pages/Stations.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const stations = [
  {
    id: 1,
    name: "Crossroad Tandang Sora",
    address: "#610 Tandang Sora Ave, Quezon City",
    distance: "0.8 km",
    type: "Mixed-Use",
    price: "₱50/hr",
    available: 24,
    total: 180,
    rating: 4.9,
    reviews: 1247,
    amenities: ["24/7", "Covered", "Security", "EV", "Accessible"],
    status: "plenty",
    featured: true,
  },
  {
    id: 2,
    name: "Ayala Malls Vertis North",
    address: "EDSA cor. Mindanao Ave, QC",
    distance: "2.1 km",
    type: "Commercial",
    price: "₱70/hr",
    available: 5,
    total: 420,
    rating: 4.8,
    reviews: 2103,
    amenities: ["24/7", "Covered", "Security", "Accessible"],
    status: "filling",
    featured: false,
  },
  {
    id: 3,
    name: "Robinsons Magnolia",
    address: "New Manila, Quezon City",
    distance: "3.4 km",
    type: "Commercial",
    price: "₱60/hr",
    available: 48,
    total: 320,
    rating: 4.7,
    reviews: 892,
    amenities: ["Covered", "Security", "Accessible"],
    status: "plenty",
    featured: false,
  },
  {
    id: 4,
    name: "TriNoma Terminal Hub",
    address: "EDSA, Quezon City",
    distance: "2.8 km",
    type: "Terminal",
    price: "₱40/hr",
    available: 2,
    total: 85,
    rating: 4.5,
    reviews: 634,
    amenities: ["24/7", "Security"],
    status: "almost-full",
    featured: false,
  },
  {
    id: 5,
    name: "Seda Vertis North Hotel",
    address: "Vertis North, Quezon City",
    distance: "2.3 km",
    type: "Hotel",
    price: "₱100/hr",
    available: 32,
    total: 120,
    rating: 4.9,
    reviews: 421,
    amenities: ["24/7", "Covered", "Security", "EV", "Valet"],
    status: "plenty",
    featured: false,
  },
  {
    id: 6,
    name: "UP Town Center",
    address: "Katipunan Ave, Quezon City",
    distance: "4.7 km",
    type: "Commercial",
    price: "₱55/hr",
    available: 18,
    total: 240,
    rating: 4.6,
    reviews: 1087,
    amenities: ["Covered", "Security", "Accessible"],
    status: "filling",
    featured: false,
  },
  {
    id: 7,
    name: "Commonwealth Terminal",
    address: "Commonwealth Ave, QC",
    distance: "5.2 km",
    type: "Terminal",
    price: "₱35/hr",
    available: 67,
    total: 150,
    rating: 4.4,
    reviews: 523,
    amenities: ["24/7", "Security"],
    status: "plenty",
    featured: false,
  },
  {
    id: 8,
    name: "Fairview Terraces",
    address: "Novaliches, Quezon City",
    distance: "7.8 km",
    type: "Commercial",
    price: "₱50/hr",
    available: 89,
    total: 380,
    rating: 4.7,
    reviews: 1532,
    amenities: ["Covered", "Security", "EV", "Accessible"],
    status: "plenty",
    featured: false,
  },
];

const stationTypes = ["All", "Mixed-Use", "Commercial", "Terminal", "Hotel"];
const priceRanges = ["Any Price", "Under ₱50", "₱50-₱80", "₱80+"];
const sortOptions = ["Nearest", "Most Available", "Lowest Price", "Highest Rated"];

const amenityConfig = {
  "24/7": {
    label: "24/7",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  Covered: {
    label: "Covered",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  Security: {
    label: "Security",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  EV: {
    label: "EV Charging",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  Accessible: {
    label: "Accessible",
    icon: "M12 14l9-5-9-5-9 5 9 5z",
  },
  Valet: {
    label: "Valet",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
};

const statusConfig = {
  plenty: {
    label: "Plenty of spots",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  filling: {
    label: "Filling up",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  "almost-full": {
    label: "Almost full",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export default function Stations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("Any Price");
  const [sortBy, setSortBy] = useState("Nearest");

  const filteredStations = stations
    .filter((s) => selectedType === "All" || s.type === selectedType)
    .filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((s) => !s.featured);

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-6xl mx-auto px-6 animate-fade-in-up">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white uppercase tracking-wider mb-5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live Across 142 Stations
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 leading-tight">
              Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">perfect spot</span>
            </h1>
            <p className="text-lg text-white/85 max-w-2xl mx-auto">
              Real-time availability across Metro Manila's smartest parking network. Book in seconds, park with confidence.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/20 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 bg-transparent outline-none"
                  placeholder="Search by station name or address..."
                />
              </div>
              <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3.5 rounded-xl transition-colors whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use my location
              </button>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ───────────────────────────────────────────────── */}
      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Station Type Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 whitespace-nowrap">Type:</span>
              {stationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 whitespace-nowrap ${
                    selectedType === type
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Price & Sort Selects */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold pl-4 pr-10 py-2.5 rounded-full outline-none cursor-pointer transition-colors"
                >
                  {priceRanges.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold pl-4 pr-10 py-2.5 rounded-full outline-none cursor-pointer transition-colors"
                >
                  {sortOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View on Map
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        
        {/* Featured Station Spotlight */}
        {stations.filter(s => s.featured).map((station) => {
          const status = statusConfig[station.status];
          return (
            <div key={station.id} className="relative bg-slate-900 rounded-3xl p-8 md:p-12 mb-12 overflow-hidden group shadow-2xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured Station
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                    {station.name}
                  </h2>
                  <p className="text-slate-400 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {station.address}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-2xl font-bold text-white">{station.available}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Available</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-2xl font-bold text-white">{station.total}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Total Spots</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-2xl font-bold text-white">{station.price}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Rate</p>
                    </div>
                  </div>

                  <button className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-100 active:scale-95 transition-all shadow-lg">
                    Book Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Availability Visual */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">Live Occupancy</h3>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${status.bg} ${status.text} px-3 py-1 rounded-full`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                      {status.label}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 rounded-full transition-all duration-1000"
                      style={{ width: `${((station.total - station.available) / station.total) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {Math.round(((station.total - station.available) / station.total) * 100)}% occupied
                    </span>
                    <span className="text-slate-400">
                      Updated 2s ago
                    </span>
                  </div>

                  {/* Amenity Grid */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {station.amenities.map((a) => {
                        const config = amenityConfig[a];
                        return (
                          <span key={a} className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                            </svg>
                            {config.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Stations</h2>
            <p className="text-sm text-slate-500 mt-1">
              Showing <span className="font-semibold text-slate-700">{filteredStations.length}</span> stations near you
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live data · Updated every 2 seconds
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => {
            const status = statusConfig[station.status];
            const occupancyPct = ((station.total - station.available) / station.total) * 100;
            return (
              <article key={station.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 group cursor-pointer flex flex-col">
                
                {/* Top Status Bar */}
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${status.bg} ${status.text} px-2.5 py-1 rounded-full`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
                    {status.label}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{station.distance}</span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{station.type}</span>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold">{station.rating}</span>
                      <span className="text-slate-400">({station.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {station.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {station.address}
                  </p>

                  {/* Mini Occupancy Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">{station.available} spots open</span>
                      <span className="text-slate-400">of {station.total}</span>
                    </div>
                    <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                          status.dot === "bg-emerald-500" ? "bg-emerald-500" :
                          status.dot === "bg-amber-500" ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${100 - occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {station.amenities.slice(0, 4).map((a) => {
                      const config = amenityConfig[a];
                      return (
                        <span key={a} className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                          </svg>
                          {config.label}
                        </span>
                      );
                    })}
                    {station.amenities.length > 4 && (
                      <span className="text-[10px] font-semibold text-slate-400 px-2 py-1">
                        +{station.amenities.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{station.price}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Starting rate</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition-all">
                      Book
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredStations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No stations found</h3>
            <p className="text-sm text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedType("All"); }}
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "142", label: "Live Stations", color: "from-indigo-600 to-purple-600" },
            { value: "24.8k+", label: "Active Users", color: "from-purple-600 to-pink-600" },
            { value: "8.7k", label: "Monthly Bookings", color: "from-pink-600 to-rose-600" },
            { value: "99.9%", label: "Uptime", color: "from-emerald-600 to-teal-600" },
          ].map((stat) => (
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

      {/* ── Dark CTA Footer ──────────────────────────────────────────── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            See all 142 stations on the live map
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Download the Statio Nexus app to access the interactive map with GPS navigation and push notifications when your spot is ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/download"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-xl shadow-black/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Get the App
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all"
            >
              How It Works
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
