import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, MapPin, ChevronRight, BrainCircuit, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { toImageUrl } from "../lib/utils";

function AIMatchPopup({ matches = [], createdItem = null, onClose }) {
  const navigate = useNavigate();

  // Determine item type label (Lost Item or Found Item)
  const itemType = createdItem?.type
    ? createdItem.type.charAt(0).toUpperCase() + createdItem.type.slice(1)
    : "Item";

  const hasMatches = Array.isArray(matches) && matches.length > 0;

  const handleViewMatches = () => {
    if (onClose) onClose();
    if (createdItem?._id) {
      navigate(`/item/${createdItem._id}/matches`);
    } else {
      navigate("/");
    }
  };

  const handleItemClick = (id) => {
    if (!id) return;
    if (onClose) onClose();
    navigate(`/item/${id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Animated Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
        onClick={onClose}
      />

      <div
        className="
          relative w-full max-w-lg
          rounded-[2.5rem]
          bg-white dark:bg-slate-900
          shadow-[0_20px_50px_rgba(0,0,0,0.3)]
          overflow-hidden
          border border-slate-200 dark:border-slate-800
          animate-in zoom-in-95 duration-300
        "
      >
        {/* Top Accent Bar (AI Theme) */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  ✅ {itemType} Created Successfully
                </h2>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {hasMatches
                    ? `We found ${matches.length} possible ${matches.length === 1 ? "match" : "matches"}.`
                    : "No similar items were found at the moment."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          {hasMatches ? (
            /* Matches Preview List */
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {matches.map((match, index) => {
                const item = match?.item || match;
                if (!item) return null;

                const itemId = item._id || `fallback-id-${index}`;
                const title = item.title || "Untitled Item";
                const locationLabel = item.location || "Location not specified";
                const rawDate = item.dateLostOrFound || item.date || item.createdAt;
                const dateLabel = rawDate
                  ? new Date(rawDate).toLocaleDateString()
                  : "Date not specified";
                const similarity = typeof match?.similarity === "number" ? match.similarity : 0;

                const similarityColor =
                  similarity > 80
                    ? "text-emerald-500"
                    : similarity > 50
                    ? "text-blue-500"
                    : "text-amber-500";

                return (
                  <div
                    key={itemId}
                    onClick={() => handleItemClick(itemId)}
                    className="
                      group flex gap-4
                      bg-slate-50 dark:bg-slate-800/40
                      hover:bg-blue-50 dark:hover:bg-blue-900/20
                      border border-slate-100 dark:border-slate-800
                      hover:border-blue-200 dark:hover:border-blue-700/50
                      rounded-3xl
                      p-3
                      cursor-pointer
                      transition-all duration-300
                      hover:-translate-y-1
                    "
                  >
                    {/* Thumbnail */}
                    <div className="relative shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={toImageUrl(item.images[0])}
                          alt={title}
                          className="w-20 h-20 object-cover rounded-2xl shadow-sm"
                          onError={(e) => {
                            e.target.src = toImageUrl("/uploads/default-image.png");
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                          <Sparkles size={20} className="text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info & Breakdown */}
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">
                        {title}
                      </h3>

                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin size={12} />
                        <span className="text-xs font-medium truncate">
                          {locationLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                        <Calendar size={12} />
                        <span className="text-xs font-medium truncate">
                          {dateLabel}
                        </span>
                      </div>

                      {/* Similarity Progress */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                              Match Confidence
                            </span>
                            {match?.scores?.visionScore > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                                📷 {match.scores.visionScore}% Visual
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-black ${similarityColor}`}>
                            {similarity}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              similarity > 80 ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${similarity}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center pr-2">
                      <ChevronRight
                        size={18}
                        className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 0 Matches Empty State */
            <div className="py-8 px-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BrainCircuit size={28} />
              </div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                No similar items were found at the moment.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                We'll automatically notify you if a matching item is reported later.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {hasMatches ? (
              <button
                onClick={handleViewMatches}
                className="
                  w-full py-4 rounded-[1.5rem]
                  bg-blue-600 hover:bg-blue-700
                  text-white font-bold text-base
                  flex items-center justify-center gap-2
                  shadow-lg shadow-blue-500/25
                  transition-all active:scale-[0.98]
                "
              >
                <span>View Matches</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleViewMatches}
                className="
                  w-full py-4 rounded-[1.5rem]
                  bg-slate-900 dark:bg-white
                  text-white dark:text-slate-900
                  font-bold text-base
                  hover:opacity-90 transition-all
                  active:scale-[0.98]
                "
              >
                View Item Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIMatchPopup;
