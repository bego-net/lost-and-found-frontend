import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ItemCard from "../components/ItemCard";
import SkeletonCard from "../components/skeletons/SkeletonCard";
import { ArrowLeft, Search } from "lucide-react";

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = params.get("query") || "";
  const [query, setQuery] = useState(initialQuery);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔍 Fetch search results */
  useEffect(() => {
    async function searchItems() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(`/items/search?query=${query}`);
        setResults(res.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    searchItems();
  }, [query]);

  /* ⏎ ENTER key → search */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?query=${query}`);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        {/* 🔙 Back Arrow */}
        <button
          onClick={() => navigate(-1)}
          className="
            p-2 rounded-full
            hover:bg-gray-200 dark:hover:bg-cardDark
            transition
          "
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-3xl font-bold">
          Search Results
        </h1>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative mb-8 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search lost or found items..."
          className="
            w-full pl-10 pr-4 py-3 rounded-xl
            bg-white dark:bg-cardDark
            border border-gray-300 dark:border-borderDark
            text-gray-900 dark:text-textLight
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {/* NO RESULTS UI */}
      {!loading && results.length === 0 && query && (
        <div className="
          flex flex-col items-center justify-center
          text-center py-16
        ">
          <div className="text-6xl mb-4 text-gray-400 dark:text-gray-500">
            🔍
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            No items found
          </h2>

          <p className="text-gray-600 dark:text-textMuted max-w-md">
            We couldn’t find anything matching
            <span className="font-semibold"> "{query}"</span>.
            Try different keywords.
          </p>
        </div>
      )}

      {/* RESULTS */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
