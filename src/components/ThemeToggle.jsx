import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={toggle}
      className="relative inline-flex items-center w-14 h-8 rounded-full bg-surface-2 border border-black/10 dark:border-white/10 hover:brightness-95 transition-colors btn-press"
      style={{ padding: 2 }}
    >
      {/* track gradient */}
      <span className="sr-only">Switch theme</span>
      {/* thumb */}
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-[#1f2736] shadow-md transition-transform ${isDark ? "translate-x-6" : "translate-x-0"}`}
      />
      {/* icons */}
      <span className="absolute left-2 text-[15px] select-none">🌞</span>
      <span className="absolute right-2 text-[15px] select-none">🌙</span>
    </button>
  );
}
