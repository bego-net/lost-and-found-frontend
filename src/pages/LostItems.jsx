import { useEffect, useState } from "react";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";
import { Search, MapPin, Filter, Package, X, Calendar, Tag, ArrowUpDown, Clock } from "lucide-react";
import SkeletonCard from "../components/skeletons/SkeletonCard";

function LostItems() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // ✅ ENHANCED FILTER STATES
  const [filters, setFilters] = useState({
    category: "all",
    location: "",
    sortOrder: "newest", // newest, oldest
  });

  useEffect(() => {
    async function fetchLost() {
      try {
        setLoading(true);
        const res = await api.get("/items?type=lost");
        setItems(res.data.items || []);
        setFiltered(res.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLost();
  }, []);

  // ✅ MASTER FILTER & SORT LOGIC
  useEffect(() => {
    let result = [...items];

    // 1. Filter by Name/Title
    if (search) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 2. Filter by Location
    if (filters.location) {
      result = result.filter(item => 
        item.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // 3. Filter by Category
    if (filters.category !== "all") {
      result = result.filter(item => item.category === filters.category);
    }

    // 4. Sort by Post Time (Newest/Oldest)
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return filters.sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFiltered(result);
  }, [search, items, filters]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0B0F1A] transition-colors duration-500">
      
      {/* 🚀 CENTRALIZED HEADER SECTION (Top 75% of view area) */}
      <div className="relative flex flex-col items-center justify-center pt-6 pb-12 px-6 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.05),transparent)] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-[0.25em]">
            <Package size={14} /> Community Lost & Found
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
            Lost <span className="text-rose-600">Items</span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg">
            Search through the community database to find your missing belongings.
          </p>

          {/* 🔍 CENTERED SEARCH PILL */}
          <div className="flex items-center w-full max-w-xl mx-auto p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center flex-grow pl-4">
              <Search className="text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 ml-3 bg-transparent outline-none text-sm font-bold dark:text-white"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                showFilters ? "bg-rose-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}
            >
              <Filter size={14} /> {showFilters ? "Close" : "Filters"}
            </button>
          </div>
        </div>

        {/* 🛠️ COMPACT REDUCED FILTER BOX */}
        {showFilters && (
          <div className="mt-6 w-full max-w-2xl p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Location Input */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <MapPin size={12} /> Location
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Downtown"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold dark:text-white focus:ring-2 ring-rose-500/20"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <Tag size={12} /> Category
                </label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="wallet">Wallet</option>
                  <option value="phone">Phone</option>
                  <option value="bag">Bag</option>
                  <option value="id">ID Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <Clock size={12} /> Post Time
                </label>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
                  <button 
                    onClick={() => setFilters({...filters, sortOrder: 'newest'})}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filters.sortOrder === 'newest' ? "bg-white dark:bg-slate-700 shadow-sm text-rose-600" : "text-slate-400"}`}
                  >
                    Newest
                  </button>
                  <button 
                    onClick={() => setFilters({...filters, sortOrder: 'oldest'})}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filters.sortOrder === 'oldest' ? "bg-white dark:bg-slate-700 shadow-sm text-rose-600" : "text-slate-400"}`}
                  >
                    Oldest
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 📦 ITEMS SECTION (Occupies the bottom 25% of the initial view) */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <ArrowUpDown size={12} /> Recently Reported
          </h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
            {filtered.length} Results Found
          </span>
        </div>

        {loading ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <MapPin size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No items match your criteria</h3>
            <button onClick={() => {setFilters({category: 'all', location: '', sortOrder: 'newest'}); setSearch("")}} className="mt-4 text-[10px] font-black uppercase text-rose-600 underline underline-offset-4">Reset all</button>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <div key={item._id} className="group transition-all duration-500 hover:-translate-y-2">
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LostItems;