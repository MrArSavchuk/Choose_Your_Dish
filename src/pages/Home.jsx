import React, { useMemo, useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";

export default function Home({ recipes = [], recommended = [] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(null);

  const fav = useFavorites?.();
  const isSaved = (r) => fav?.isFavorite?.(r?.idMeal || r?.id);

  const onOpen = (r) => {
    setActive(r);
    setModalOpen(true);
  };

  const onClose = () => {
    setModalOpen(false);
    setActive(null);
  };

  const list = useMemo(
    () => (recipes.length ? recipes : recommended),
    [recipes, recommended]
  );

  return (
    <main className="container">
      <h1>Discover today</h1>

      <div className="grid grid-5">
        {list.map((r) => {
          const key = r.idMeal || r.id || r.strMeal;
          return (
            <RecipeCard
              key={key}
              recipe={r}
              onOpen={onOpen}
              onToggleSave={(x) => fav?.toggleFavorite?.(x)}
              isSaved={isSaved(r)}
            />
          );
        })}
      </div>

      <RecipeModal open={modalOpen} onClose={onClose} recipe={active} />
    </main>
  );
}
