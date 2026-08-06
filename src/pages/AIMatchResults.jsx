import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  BrainCircuit,
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  Sparkles,
  ChevronRight,
  RotateCw,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { toImageUrl } from "../lib/utils";
import { toast } from "sonner";

const resultsCache = new Map();

function AIMatchResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const cachedData = resultsCache.get(id);

  const [targetItem, setTargetItem] = useState(cachedData?.targetItem || null);
  const [matches, setMatches] = useState(cachedData?.matches || []);
  const [loading, setLoading] = useState(!cachedData);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatchesData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch target item details and matches in parallel
      const [itemRes, matchRes] = await Promise.all([
        api.get(`/items/${id}`),
        api.get(`/items/${id}/matches`),
      ]);

      const fetchedItem = itemRes.data?.item || null;
      const fetchedMatches = matchRes.data?.matches || [];

      setTargetItem(fetchedItem);
      setMatches(fetchedMatches);

      // Save to memory cache for instant browser back navigation
      resultsCache.set(id, {
        targetItem: fetchedItem,
        matches: fetchedMatches,
      });
    } catch (err) {
      console.error("Failed to load match results:", err);
      if (!silent) toast.error("Failed to load match results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      // If we have cached data, do a background update silently
      const hasCache = resultsCache.has(id);
      fetchMatchesData(hasCache);
    }
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post(`/items/${id}/refresh-matches`);
      const newMatches = data.matches || [];
      setMatches(newMatches);
      resultsCache.set(id, {
        targetItem,
        matches: newMatches,
      });
      toast.success("AI match scores updated!");
    } catch (err) {
      console.error("Failed to refresh matches:", err);
      toast.error("Failed to refresh matches");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] py-16 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-600 dark:text-slate-400 text-sm">
          Analyzing visual & text similarities...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                  <BrainCircuit size={18} />
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  AI Match Results
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Visual CLIP vector embeddings and multi-signal metadata similarity
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50 self-start sm:self-auto shadow-md"
          >
            <RotateCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Recalculating..." : "Refresh Matches"}
          </button>
        </div>

        {/* TARGET ITEM SUMMARY CARD */}
        {targetItem && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <Sparkles size={14} />
              Target Item for Comparison
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex gap-4 items-center">
                {targetItem.images && targetItem.images.length > 0 ? (
                  <img
                    src={toImageUrl(targetItem.images[0])}
                    alt={targetItem.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
                    onError={(e) => {
                      e.target.src = toImageUrl("/uploads/default-image.png");
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                    <Tag size={24} />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      targetItem.type === "lost"
                        ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {targetItem.type}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {targetItem.category}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {targetItem.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {targetItem.location || "Location unlisted"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />{" "}
                      {targetItem.dateLostOrFound
                        ? new Date(targetItem.dateLostOrFound).toLocaleDateString()
                        : "Date unlisted"}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/item/${targetItem._id}`}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0"
              >
                <span>View Target Item Details</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* MATCHES RESULTS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Suggested Candidate Matches</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                {matches.length}
              </span>
            </h3>
          </div>

          {matches.length === 0 ? (
            <div className="py-16 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Sparkles className="mx-auto text-slate-300 dark:text-slate-600" size={48} />
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-200">
                No similar items found at the moment
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We'll automatically notify you if a matching item is reported later by another user on the platform.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => {
                const item = match?.item || match;
                if (!item) return null;

                const itemId = item._id || `match-${index}`;
                const title = item.title || "Untitled Candidate";
                const category = item.category || "General";
                const locationLabel = item.location || "Location not specified";
                const rawDate = item.dateLostOrFound || item.createdAt;
                const dateLabel = rawDate
                  ? new Date(rawDate).toLocaleDateString()
                  : "Unlisted date";
                const similarity = typeof match?.similarity === "number" ? match.similarity : 0;
                const scores = match?.scores || {};

                const similarityColor =
                  similarity >= 80
                    ? "text-emerald-500 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20"
                    : similarity >= 50
                    ? "text-blue-500 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20"
                    : "text-amber-500 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20";

                const progressBg =
                  similarity >= 80 ? "bg-emerald-500" : "bg-blue-500";

                return (
                  <div
                    key={itemId}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                  >
                    {/* Top Image Preview & Confidence Badge */}
                    <div className="relative">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={toImageUrl(item.images[0])}
                          alt={title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = toImageUrl("/uploads/default-image.png");
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Sparkles size={32} />
                        </div>
                      )}

                      {/* Similarity Score Pill */}
                      <div className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full border backdrop-blur-md font-black text-xs shadow-md ${similarityColor}`}>
                        {similarity}% Match
                      </div>

                      {/* Type Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                        {item.type}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          <span>{category}</span>
                          <span>{dateLabel}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1.5 font-medium">
                          <MapPin size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{locationLabel}</span>
                        </p>
                      </div>

                      {/* Score Breakdown Indicators */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>Confidence Breakdown</span>
                          <span className="text-slate-700 dark:text-slate-300 font-extrabold">{similarity}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${progressBg}`}
                            style={{ width: `${similarity}%` }}
                          />
                        </div>

                        {/* Breakdown Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {scores.visionScore > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                              📷 {scores.visionScore}% Visual
                            </span>
                          )}
                          {scores.textScore > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                              📝 {scores.textScore}% Text
                            </span>
                          )}
                          {scores.categoryScore > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                              🏷️ {scores.categoryScore}% Cat
                            </span>
                          )}
                          {scores.locationScore > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                              📍 {scores.locationScore}% Loc
                            </span>
                          )}
                          {scores.dateScore > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300">
                              📅 {scores.dateScore}% Date
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/item/${item._id}`}
                        className="w-full mt-3 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                      >
                        <span>View Details</span>
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIMatchResults;
