import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * BackButton - A premium, interactive navigation button
 * @param {string} label - The text displayed next to the icon (default: "Back")
 * @param {string} to - Optional specific path. If null, navigates to previous history entry.
 */
function BackButton({ label = "Back", to = null }) {
  const navigate = useNavigate();

  const handlePress = () => {
    if (to) {
      navigate(to);
    } else {
      // Navigates one step back in the browser history
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className="
        group relative inline-flex items-center justify-center gap-3
        pl-3 pr-6 py-2.5 mb-8 overflow-hidden
        rounded-2xl transition-all duration-500
        bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl
        border border-slate-200/60 dark:border-slate-800/60
        shadow-[0_4px_20px_rgba(0,0,0,0.03)]
        hover:shadow-[0_20px_40px_rgba(59,130,246,0.12)]
        hover:border-blue-500/40 dark:hover:border-blue-400/30
        active:scale-95 hover:-translate-y-0.5
      "
    >
      {/* 1. Animated Shimmer Overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform" />

      {/* 2. Icon Container (The "Magnetic" Box) */}
      <div className="
        relative flex items-center justify-center w-9 h-9 
        rounded-xl bg-slate-100 dark:bg-slate-800 
        group-hover:bg-blue-600 group-hover:text-white 
        transition-all duration-300 group-hover:-translate-x-1
        shadow-sm group-hover:shadow-blue-500/40
      ">
        <ArrowLeft 
          size={19} 
          strokeWidth={2.5}
          className="transition-transform duration-300 group-hover:scale-110" 
        />
      </div>

      {/* 3. Button Label */}
      <span className="
        relative text-[11px] font-black uppercase tracking-[0.15em] 
        text-slate-500 dark:text-slate-400 
        group-hover:text-slate-900 dark:group-hover:text-white 
        transition-colors duration-300
      ">
        {label}
      </span>

      {/* 4. Bottom Interaction Line */}
      <div className="
        absolute bottom-0 left-1/2 -translate-x-1/2 
        w-0 h-[3px] bg-blue-600 dark:bg-blue-500 
        group-hover:w-1/3 transition-all duration-500 
        rounded-t-full opacity-0 group-hover:opacity-100
      " />
      
      {/* 5. Subtle Inner Glow (Dark Mode only) */}
      <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none hidden dark:block" />
    </button>
  );
}

export default BackButton;