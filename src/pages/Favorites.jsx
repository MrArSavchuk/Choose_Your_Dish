import React, { useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";

export default function Favorites() {
  const fav = useFavorites?.();
  const items = fav?.items || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(null);

  const onOpen = (r) => {
    setActive(r);
    setModalOpen(true);
  };
  const onClose = () => {
    setModalOpen(false);
    setActive(null);
  };

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Favorites</h1>
        {items.length ? (
          <button className="btn btn-soft" onClick={() => fav?.clear?.()}>
            Clear all
          </button>
        ) : null}
      </div>

      {!items.length ? (
        <p>No saved recipes yet.</p>
      ) : (
        <div className="grid grid-5">
          {items.map((r) => {
            const key = r.idMeal || r.id || r.strMeal;
            return (
              <RecipeCard
                key={key}
                recipe={r}
                onOpen={onOpen}
                onToggleSave={(x) => fav?.toggleFavorite?.(x)}
                isSaved={true}
              />
            );
          })}
        </div>
      )}

      <RecipeModal open={modalOpen} onClose={onClose} recipe={active} />
    </main>
  );
}
