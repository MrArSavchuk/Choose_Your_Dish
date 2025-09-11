import React from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";

export default function Favorites() {
  const { list, clearFavorites } = useFavorites();
  const [active, setActive] = React.useState(null);

  const confirmClear = () => {
    if (!list.length) return;
    if (window.confirm("Clear all saved recipes?")) {
      clearFavorites();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Favorites</h1>
        <button
          className="btn-ghost btn-press danger"
          onClick={confirmClear}
          disabled={!list.length}
          title="Remove all saved recipes"
        >
          Clear all
        </button>
      </div>

      {!list.length ? (
        <p className="muted">No saved recipes yet.</p>
      ) : (
        <div className="grid grid-cards">
          {list.map((r, i) => (
            <RecipeCard
              key={r.id || i}
              recipe={r}
              onOpen={setActive}
              idx={i}
              noAnim
            />
          ))}
        </div>
      )}

      {active && (
        <RecipeModal recipe={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
