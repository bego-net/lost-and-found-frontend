import { useEffect, useMemo, useState } from "react";
import { Search, Grid, List, Filter, X, ChevronLeft, ChevronRight, Calendar, MapPin, Tag, SlidersHorizontal, PackageSearch } from "lucide-react";
import axios from "../api/axios";
import ItemCard from "../components/ItemCard";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // UI States
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [error, setError] = useState(null);

  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((i) => { if (i.category) set.add(i.category); });
    return Array.from(set);
  }, [items]);

  const buildParams = () => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (type && type !== "all") params.append("type", type);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    params.append("page", page);
    params.append("limit", limit);
    return params.toString();
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildParams();
      const res = await axios.get(`/items?${qs}`);
      const dataItems = res.data.items || [];
      setItems(dataItems);
      setTotal(res.data.total ?? dataItems.length);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, type, category]);

  const onSubmitSearch = () => {
    setPage(1);
    fetchItems();
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") onSubmitSearch(); };

  const filteredByDate = useMemo(() => {
    if (!dateFrom && !dateTo) return items;
    const from = dateFrom ? dayjs(dateFrom) : null;
    const to = dateTo ? dayjs(dateTo) : null;

    return items.filter((it) => {
      if (!it.dateLostOrFound) return false;
      const d = dayjs(it.dateLostOrFound);
      if (from && to) return d.isBetween(from.startOf("day"), to.endOf("day"), null, "[]");
      if (from) return d.isSame(from, "day") || d.isAfter(from);
      if (to) return d.isSame(to, "day") || d.isBefore(to);
      return true;
    });
  }, [items, dateFrom, dateTo]);

  const clearFilters = () => {
    setCategory(""); setLocation(""); setType("all");
    setDateFrom(""); setDateTo(""); setQuery("");
    setPage(1); fetchItems();
  };

  const totalPages = Math.max(1, Math.ceil((total || filteredByDate.length) / limit));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F1A] dark:text-slate-100">
      {/* 🚀 Sticky Search Bar Section */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you looking for?"
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 border-2 rounded-2xl outline-none transition-all dark:text-white font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
                <Grid size={20} />
              </button>
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
                <List size={20} />
              </button>
            </div>
            <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
        {/* 🛠 Desktop Sidebar Filters */}
        <aside className="hidden md:block w-72 shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Filters</h3>
              <button onClick={clearFilters} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Reset</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold mb-3 text-slate-700 dark:text-slate-300">
                  <Tag size={14} className="text-blue-500" /> CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="">All Items</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold mb-3 text-slate-700 dark:text-slate-300">
                  <MapPin size={14} className="text-rose-500" /> LOCATION
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Central Library"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 outline-none text-sm font-semibold transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold mb-3 text-slate-700 dark:text-slate-300">
                  <SlidersHorizontal size={14} className="text-amber-500" /> STATUS
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                  {["all", "lost", "found"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${type === t ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 flex items-center gap-2"><Calendar size={12}/> FROM</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 flex items-center gap-2"><Calendar size={12}/> UNTIL</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              
              <button className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20" onClick={onSubmitSearch}>
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        {/* 📦 Main Results Area */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Recent Activity</h2>
              <p className="text-slate-500 font-medium">{total} items in your area</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Scanning items...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-6 rounded-3xl text-rose-600 text-center font-bold">
              {error}
            </div>
          ) : filteredByDate.length === 0 ? (
            <div className="text-center py-32 space-y-4 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <PackageSearch size={64} className="mx-auto text-slate-300" />
              <p className="text-slate-500 font-bold tracking-tight text-xl">No matches found</p>
              <button onClick={clearFilters} className="text-blue-600 font-bold hover:underline">Reset Search</button>
            </div>
          ) : (
            <div className="space-y-10">
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredByDate.map((it) => <ItemCard key={it._id} item={it} />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredByDate.map((it) => (
                    <div key={it._id} className="group bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
                      <div className="flex gap-6 items-center">
                        <img 
                           src={it.images?.[0] ? `http://localhost:5000${it.images[0]}` : "/default-profile.png"} 
                           alt="" 
                           className="w-32 h-24 object-cover rounded-2xl shadow-inner bg-slate-100 dark:bg-slate-800" 
                        />
                        <div className="flex-1 space-y-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${it.type === 'lost' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {it.type}
                          </span>
                          <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{it.title}</h3>
                          <div className="flex gap-4 text-xs font-bold text-slate-400">
                            <span className="flex items-center gap-1"><MapPin size={12}/> {it.location}</span>
                            <span className="flex items-center gap-1"><Calendar size={12}/> {dayjs(it.dateLostOrFound).format("MMM DD, YYYY")}</span>
                          </div>
                        </div>
                        <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 📟 Premium Pagination */}
              <div className="flex items-center justify-between pt-10 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 📱 Mobile Filters Slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
           <div className="absolute right-0 w-80 h-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-auto animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"><X size={20}/></button>
              </div>
              {/* Note: In a real app, you'd extract the sidebar content into a reusable component to avoid duplication */}
              <div className="space-y-6">
                 {/* Replicated sidebar logic here for mobile... */}
                 <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest" onClick={() => { setPage(1); fetchItems(); setMobileFiltersOpen(false); }}>Apply Results</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}