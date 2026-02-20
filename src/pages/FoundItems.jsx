import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";
import { Search } from "lucide-react";
import SkeletonCard from "../components/skeletons/SkeletonCard"; // ✅ ADDED

function FoundItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); // ✅ ADDED

  /* =============================
     FETCH FOUND ITEMS
  ============================= */
  useEffect(() => {
    async function fetchFound() {
      try {
        setLoading(true); // ✅ start loading
        const res = await api.get("/items?type=found");
        setItems(res.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // ✅ stop loading
      }
    }

    fetchFound();
  }, []);

  /* =============================
     DERIVED FILTER (CORRECT)
  ============================= */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  }, [search, items]);

  return (
    <div className="min-h-screen bg-[#E7E7E7] dark:bg-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-[#103B66] dark:text-white mb-6 text-center">
          Found Items
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-12">
          Browse all reported found items. Use the search below to filter.
        </p>

        {/* SEARCH BAR */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="
            flex items-center bg-white dark:bg-gray-800 
            rounded-xl shadow-lg border border-gray-300 dark:border-gray-700
            px-4 py-3
          ">
            <Search className="text-gray-500 dark:text-gray-300" size={22} />
            <input
              type="text"
              placeholder="Search found items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow ml-3 bg-transparent outline-none text-lg dark:text-white"
            />
          </div>
        </div>

        {/* GRID LIST */}
        {loading ? (
          /* ✅ SKELETON LOADING GRID */
          <div
            className="
              grid gap-8 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-4
            "
          >
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* ✅ EMPTY STATE (ONLY AFTER LOADING) */
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No found items found.
          </p>
        ) : (
          /* ✅ REAL DATA */
          <div
            className="
              grid gap-8 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-4
            "
          >
            {filtered.map((item) => (
              <div
                key={item._id}
                className="transform transition duration-300 hover:-translate-y-2"
              >
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default FoundItems;
