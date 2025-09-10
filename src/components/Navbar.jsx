import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 1 1-1.5 0V2.25A.75.75 0 0 1 12 1.5Zm0 18a.75.75 0 0 1 .75.75v1.5a.75.75 0 1 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm10.5-7.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 1 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM3.75 12a.75.75 0 0 1-.75-.75V9.75a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 3.75 12Zm14.72 6.03a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06Zm-12.72-12a.75.75 0 1 1-1.06-1.06L3.69 3.94a.75.75 0 0 1 1.06 1.06L5.75 6.03Zm12 0 1.06-1.03a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06ZM6.81 17.97l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06Z"/>
  </svg>
);
const Moon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/>
  </svg>
);

export default function Navbar() {
  const loc = useLocation();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cyd:theme");
    const isDark = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme(){
    setDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("cyd:theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <header className="navbar">
      <div className="nav-inner">
        <NavLink to="/" className="brand">Choose Your Dish</NavLink>

        <nav className="nav-spacer" aria-label="Main">
          <NavLink
            to="/"
            className="nav-link"
            aria-current={loc.pathname === "/" ? "page" : undefined}
          >
            Home
          </NavLink>
          <NavLink
            to="/favorites"
            className="nav-link"
            aria-current={loc.pathname.startsWith("/favorites") ? "page" : undefined}
          >
            Favorites
          </NavLink>
        </nav>

        <button
          className={`theme-toggle ${dark ? "is-dark" : ""}`}
          aria-label="Switch theme"
          title="Switch theme"
          onClick={toggleTheme}
        >
          <span className="thumb">{dark ? <Moon/> : <Sun/>}</span>
        </button>
      </div>
    </header>
  );
}
