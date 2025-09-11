import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Favorites from "./pages/Favorites.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
