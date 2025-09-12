import React, { useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";

export default function Favorites() {
  const fav = useFavorites();
  const items = fav?.items || [];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  return (
    <main className="container">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>Favorites</h1>
        {items.length > 0 && <button className="btn btn-soft" onClick={() => fav.clear()}>Clear all</button>}
      </div>
      {items.length === 0 ? (
        <p>No saved recipes yet.</p>
      ) : (
        <div className="grid grid-5">
          {items.map((r) => (
            <RecipeCard
              key={r.idMeal || r.id}
              recipe={r}
              onOpen={(x) => { setActive(x); setOpen(true); }}
              onToggleSave={(x) => fav.toggleFavorite(x)}
              isSaved={true}
            />
          ))}
        </div>
      )}
      <RecipeModal open={open} onClose={() => setOpen(false)} recipe={active} />
    </main>
  );
}
