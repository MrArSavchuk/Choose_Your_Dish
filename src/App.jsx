import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import Home from "./pages/Home.jsx";
import Favorites from "./pages/Favorites.jsx";

function ThemeToggle() {
  const [t, setT] = useState(() => localStorage.getItem("theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }, [t]);
  return (
    <button className="btn btn-soft theme-btn" onClick={() => setT(t === "dark" ? "light" : "dark")}>
      {t === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <header className="header shadow-soft">
        <div className="container navbar">
          <div className="brand">Choose Your Dish</div>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
              Home
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => (isActive ? "active" : undefined)}>
              Favorites
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </FavoritesProvider>
  );
}
