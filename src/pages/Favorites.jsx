import React, { useEffect, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import { randomMeals } from "../services/api.js";

export default function Favorites() {
  const fav = useFavorites();
  const items = fav?.items || [];

  const [suggest, setSuggest] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await randomMeals(1);
        if (!ignore) setSuggest(r?.[0] || null);
      } catch {
        if (!ignore) setSuggest(null);
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Favorites</h1>
        {items.length > 0 && (
          <button className="btn btn-soft" onClick={() => fav?.clear?.()}>Clear all</button>
        )}
      </div>

      <h2>You might like</h2>
      <div style={{ maxWidth: 420 }}>
        {suggest
          ? <RecipeCard recipe={suggest} onOpen={(x) => { setActive(x); setOpen(true); }} onToggleSave={(x) => fav?.toggleFavorite?.(x)} isSaved={fav?.isFavorite?.(suggest?.idMeal)} />
          : <div className="card skeleton" style={{ height: 250 }} />}
      </div>

      <h2>Saved recipes</h2>
      {items.length === 0 ? (
        <p style={{ opacity: .7 }}>No saved recipes yet.</p>
      ) : (
        <div className="grid grid-5">
          {items.map((r) => (
            <RecipeCard
              key={r.idMeal || r.id}
              recipe={r}
              onOpen={(x) => { setActive(x); setOpen(true); }}
              onToggleSave={(x) => fav?.toggleFavorite?.(x)}
              isSaved={true}
            />
          ))}
        </div>
      )}

      <RecipeModal open={open} onClose={() => setOpen(false)} recipe={active} />
    </main>
  );
}
