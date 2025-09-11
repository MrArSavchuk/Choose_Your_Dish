import { useEffect, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import { fetchRandomSet } from "../services/provider.themealdb.js";

export default function Favorites() {
  const { favorites, clearFavorites } = useFavorites();
  const [suggest, setSuggest] = useState([]);
  const [modal, setModal] = useState({ open: false, recipe: null });

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      const r = await fetchRandomSet(1);
      if (mounted) setSuggest(r);
    };
    boot();
    return () => (mounted = false);
  }, []);

  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1>Favorites</h1>
        {favorites.length > 0 && (
          <button className="btn btn-danger btn-pill" onClick={clearFavorites}>
            Clear all
          </button>
        )}
      </div>

      <h3 style={{ margin: "10px 0" }}>You might like</h3>
      <div className="grid" style={{ marginBottom: 18 }}>
        {suggest.map((r) => (
          <RecipeCard key={r.id} recipe={r} onOpen={(recipe) => setModal({ open: true, recipe })} />
        ))}
      </div>

      <h3 style={{ margin: "10px 0" }}>Saved recipes</h3>
      {favorites.length === 0 ? (
        <p className="muted">No saved recipes yet.</p>
      ) : (
        <div className="grid">
          {favorites.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={(recipe) => setModal({ open: true, recipe })} />
          ))}
        </div>
      )}

      <RecipeModal
        isOpen={modal.open}
        recipe={modal.recipe}
        onClose={() => setModal({ open: false, recipe: null })}
      />
    </div>
  );
}
