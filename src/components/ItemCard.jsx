import { Link } from "react-router-dom";
import { MapPin, Tag, Calendar, ArrowRight, ImageOff } from "lucide-react";
import dayjs from "dayjs";
import { toImageUrl } from "../lib/utils";

function ItemCard({ item }) {
  const rawImage = item?.images?.[0];

  const imageUrl = rawImage ? toImageUrl(rawImage) : null;

  return (
    <div className="
      group relative bg-white dark:bg-slate-900 
      rounded-[2.5rem] p-4 
      border border-slate-100 dark:border-slate-800 
      shadow-[0_10px_30px_rgba(0,0,0,0.02)] 
      hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] 
      dark:hover:shadow-none
      transition-all duration-500 
      hover:-translate-y-2
    ">
      
      {/* --- IMAGE SECTION --- */}
      <div className="relative w-full h-52 overflow-hidden rounded-[2rem]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="
              w-full h-full object-cover 
              transition-transform duration-700 
              group-hover:scale-110
            "
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
            <ImageOff size={32} strokeWidth={1.5} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">No Preview</span>
          </div>
        )}

        {/* Floating Type Badge */}
        <div className={`
          absolute top-4 left-4 px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-full 
          text-white shadow-lg backdrop-blur-md
          ${item.status === "returned"
            ? "bg-emerald-600/90"
            : item.type === "lost"
              ? "bg-rose-500/90"
              : "bg-emerald-500/90"}
        `}>
          {item.status === "returned" ? "Returned ✅" : item.type}
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="px-2 pt-5 pb-2">
        {/* Category & Date Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Tag size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {item.category || "General"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
            <Calendar size={12} />
            {dayjs(item.dateLostOrFound).format("MMM DD")}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-black text-slate-900 dark:text-white capitalize truncate leading-tight">
          {item.title}
        </h2>

        {item.status === "returned" && (
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200 dark:border-emerald-900 text-[10px] font-black uppercase tracking-wider">
            Returned to Owner ✅
          </div>
        )}

        {/* Description */}
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {item.description}
        </p>

        {/* Address and Poster Row */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 min-w-0">
          {/* Location Info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={14} className="text-rose-500 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
              {item.location || "Unknown Location"}
            </span>
          </div>

          {/* Poster Info — only when user is a populated object */}
          {typeof item.user === "object" && item.user?._id && (
            <Link
              to={`/profile?userId=${item.user._id}`}
              className="flex items-center gap-1.5 flex-shrink-0 max-w-[50%] hover:opacity-85 transition-opacity min-w-0"
            >
              {item.user.profileImage &&
               item.user.profileImage !== "/uploads/default-profile.png" ? (
                <img
                  src={toImageUrl(item.user.profileImage)}
                  alt={item.user.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[9px] flex items-center justify-center border border-slate-100 dark:border-slate-800 flex-shrink-0">
                  {item.user.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 truncate">
                {item.user.name || "Unknown"}
              </span>
            </Link>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={`/item/${item._id}`}
          state={{ from: item.type }}
          className="
            mt-4 w-full flex items-center justify-center gap-2 
            py-3 rounded-2xl
            bg-slate-900 dark:bg-white 
            text-white dark:text-slate-900 
            text-xs font-black uppercase tracking-widest
            transition-all duration-300
            hover:bg-blue-600 hover:text-white
            group-hover:shadow-xl group-hover:shadow-blue-500/20
          "
        >
          View Details
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default ItemCard;



