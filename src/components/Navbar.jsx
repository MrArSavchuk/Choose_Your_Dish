import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="brand">Choose_Your_Dish</div>
      <nav className="nav">
        <NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>
          Home
        </NavLink>
        <NavLink to="/favorites" className={({isActive}) => isActive ? "active" : ""}>
          Favorites
        </NavLink>
        <button className="btn btn-primary theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </nav>
    </>
  );
}
