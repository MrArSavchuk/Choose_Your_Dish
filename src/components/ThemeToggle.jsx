import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Switch theme"
      onClick={toggle}
      title="Switch theme"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
