import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="btn btn-pill" onClick={toggle} aria-label="Switch theme">
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
