import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="app-header">
      <div className="container header-row">
        <NavLink to="/" className="brand">Choose Your Dish</NavLink>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Home</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>Favorites</NavLink>
        </nav>
      </div>
    </header>
  );
}
