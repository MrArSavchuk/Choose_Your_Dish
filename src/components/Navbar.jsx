import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <nav
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontWeight: 800 }}>Choose_Your_Dish</span>
          <Link className="link" to="/" aria-current={pathname === "/" ? "page" : undefined}>
            Home
          </Link>
          <Link className="link" to="/favorites" aria-current={pathname === "/favorites" ? "page" : undefined}>
            Favorites
          </Link>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
