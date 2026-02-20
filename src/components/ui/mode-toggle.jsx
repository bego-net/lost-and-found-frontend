import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ModeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Apply theme to <html> element
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        w-10 h-10 flex items-center justify-center
        rounded-full border border-white/30
        bg-white dark:bg-gray-800
        shadow hover:scale-105 transition-all
      "
    >
      {/* Light Mode (show Moon) */}
      {theme === "light" && (
        <Moon
          size={20}
          className="transition-all"
          color="#374151"     // 🔥 Visible in light mode
        />
      )}

      {/* Dark Mode (show Sun) */}
      {theme === "dark" && (
        <Sun
          size={20}
          className="text-yellow-400 transition-all"
        />
      )}
    </button>
  );
}
