import { useEffect, useMemo, useState } from "react";
import { Search, Grid, List, Filter } from "lucide-react";
import axios from "../api/axios";
import ItemCard from "../components/ItemCard"; // adjust path if yours is different
import dayjs from "dayjs";

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [category, setCategory] = useState(""); // exact category filter
  const [location, setLocation] = useState("");
  const [type, setType] = useState("all"); // lost | found | all
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // UI
  const [view, setView] = useState("grid"); // grid | list
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [error, setError] = useState(null);

  // derived categories (from loaded items) - you can replace by fetching a dedicated categories endpoint
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Build query params for backend request
  const buildParams = () => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (type && type !== "all") params.append("type", type);
    if (category) params.append("category", category);
    if (location) params.append("location", location); // backend may ignore, it's still helpful
    params.append("page", page);
    params.append("limit", limit);
    // dateFrom/dateTo will be used client-side if backend doesn't support them
    return params.toString();
  };

  // Fetch items from backend (uses /items route which supports search, category, type, pagination)
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildParams();
      const res = await axios.get(`/items?${qs}`);
      // your /items returns { items, total, page, limit } per earlier code
      const dataItems = res.data.items || [];
      setItems(dataItems);
      setTotal(res.data.total ?? dataItems.length);
    } catch (err) {
      console.error("Search fetch error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch when filters change (debounce could be added)
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, category]); // query is searched via keyboard or button, not auto on change to avoid noise

  // Handle pressing Enter in keyword input
  const onSubmitSearch = () => {
    setPage(1);
    fetchItems();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSubmitSearch();
    }
  };

  // Client-side date filtering (if backend doesn't filter by dates)
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
    setCategory("");
    setLocation("");
    setType("all");
    setDateFrom("");
    setDateTo("");
    setQuery("");
    setPage(1);
    fetchItems();
  };

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil((total || filteredByDate.length) / limit));
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Search input */}
          <div className="flex items-center flex-1 gap-3">
            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 w-full border border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300 cursor-pointer" onClick={onSubmitSearch} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search keywords, titles, descriptions..."
                className="ml-3 w-full bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500"
              />
            </div>

            <button
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              onClick={onSubmitSearch}
            >
              Search
            </button>
          </div>

          {/* View toggle and mobile filters */}
          <div className="flex items-center gap-3 ml-3">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-md ${view === "grid" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-md ${view === "list" ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileFiltersOpen((s) => !s)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden md:block w-72">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow">
            <h3 className="font-semibold text-lg mb-3">Filters</h3>

            <label className="text-sm text-gray-600 dark:text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / Campus / Area"
              className="mt-2 w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            />

            <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Type</label>
            <div className="mt-2 flex gap-2">
              {["all", "lost", "found"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full border ${type === t ? "bg-blue-600 text-white border-transparent" : "bg-transparent text-gray-700 dark:text-gray-200"}`}
                >
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-2 w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            />

            <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-2 w-full p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            />

            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg" onClick={() => { setPage(1); fetchItems(); }}>
                Apply
              </button>
              <button className="flex-1 px-3 py-2 border rounded-lg" onClick={clearFilters}>
                Clear
              </button>
            </div>
          </div>

          {/* Category chips quick pick */}
          <div className="mt-4">
            <h4 className="text-sm text-gray-500 mb-2">Quick categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 10).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setPage(1); fetchItems(); }}
                  className={`px-3 py-1 rounded-full border ${category === c ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main results */}
        <main className="flex-1">
          {/* Mobile filter panel */}
          {mobileFiltersOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-black/40">
              <div className="absolute right-0 w-80 h-full bg-white dark:bg-gray-900 p-4 overflow-auto border-l border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="px-2 py-1">Close</button>
                </div>

                <label className="text-sm text-gray-600 dark:text-gray-300">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full p-2 rounded-md border">
                  <option value="">All Categories</option>
                  {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>

                <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="mt-2 w-full p-2 rounded-md border" />

                <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Date From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-2 w-full p-2 rounded-md border" />

                <label className="text-sm text-gray-600 dark:text-gray-300 mt-4 block">Date To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-2 w-full p-2 rounded-md border" />

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg" onClick={() => { setPage(1); fetchItems(); setMobileFiltersOpen(false); }}>
                    Apply
                  </button>
                  <button className="flex-1 px-3 py-2 border rounded-lg" onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* results header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Search results</h2>
              <p className="text-sm text-gray-500">{filteredByDate.length} items found</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <button className="px-3 py-1 rounded-md border" onClick={() => setItems((s) => [...s].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))}>
                  Newest
                </button>
                <button className="px-3 py-1 rounded-md border" onClick={() => setItems((s) => [...s].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))}>
                  Oldest
                </button>
              </div>
            </div>
          </div>

          {/* Loading / Error */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 py-8">{error}</div>
          ) : filteredByDate.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No items match your filters.</div>
          ) : (
            <>
              {/* results grid / list */}
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredByDate.map((it) => (
                    <ItemCard key={it._id} item={it} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredByDate.map((it) => (
                    <div key={it._id} className="p-4 bg-white dark:bg-gray-800 border rounded-lg shadow">
                      <div className="flex gap-4">
                        <img src={it.images?.[0] ? `http://localhost:5000${it.images[0]}` : "/default-profile.png"} alt="" className="w-28 h-20 object-cover rounded-md" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{it.title}</h3>
                          <p className="text-sm text-gray-500">{it.description}</p>
                          <div className="mt-2 text-sm text-gray-400">{it.category} • {it.location}</div>
                        </div>
                        <div className="text-sm text-gray-500">{dayjs(it.dateLostOrFound).format("YYYY-MM-DD")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* pagination */}
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button onClick={goPrev} disabled={page === 1} className="px-3 py-1 rounded-md border disabled:opacity-50">Prev</button>
                  <button onClick={goNext} disabled={page === totalPages} className="px-3 py-1 rounded-md border disabled:opacity-50">Next</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
