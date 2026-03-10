import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, MapPin, ChevronRight, BrainCircuit } from "lucide-react";

function AIMatchPopup({ matches, onClose }) {
  const navigate = useNavigate();

  // Basic guard clause: If matches is null, undefined, or empty, don't render anything
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    return null;
  }

  const handleItemClick = (id) => {
    if (!id) return;
    onClose();
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
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                <BrainCircuit size={24} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  AI Match Found
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  We found {matches.length} possible connections
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

          {/* Matches List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {matches.map((match, index) => {
              // DEFENSIVE CHECK: If the match or the inner item is missing, skip this iteration
              if (!match || !match.item) return null;

              // Fallback values to prevent crashes
              const item = match.item;
              const itemId = item._id || `fallback-id-${index}`;
              const title = item.title || "Untitled Item";
              const locationLabel = item.location || "Location not specified";
              const similarity = typeof match.similarity === 'number' ? match.similarity : 0;

              const similarityColor = 
                similarity > 80 ? "text-emerald-500" : 
                similarity > 50 ? "text-blue-500" : "text-amber-500";

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
                        src={`http://localhost:5000${item.images[0]}`}
                        alt={title}
                        className="w-20 h-20 object-cover rounded-2xl shadow-sm"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                         <Sparkles size={20} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
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

                    {/* Similarity Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Match Confidence</span>
                        <span className={`text-[10px] font-black ${similarityColor}`}>{similarity}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            similarity > 80 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${similarity}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center pr-2">
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action */}
          <div className="mt-8">
            <button
              onClick={onClose}
              className="
                w-full py-4 rounded-[1.5rem]
                bg-slate-900 dark:bg-white
                text-white dark:text-slate-900
                font-bold text-sm
                hover:opacity-90 transition-all
                active:scale-[0.98]
              "
            >
              Close and View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIMatchPopup;