import React, { useEffect, useMemo, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";

const pick = (arr, n) => arr.slice().sort(() => 0.5 - Math.random()).slice(0, n);

export default function Home() {
  const fav = useFavorites();
  const [list, setList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const q = ["pork", "beef", "chicken", "salad"][Math.floor(Math.random() * 4)];
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`);
        const json = await res.json();
        if (!ignore) setList(pick(json.meals || [], 10));
      } catch {
        setList([]);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const open = (r) => { setActive(r); setModalOpen(true); };
  const close = () => { setModalOpen(false); setActive(null); };
  const isSaved = (r) => fav?.isFavorite?.(r?.idMeal || r?.id);

  const data = useMemo(() => list || [], [list]);

  return (
    <main className="container">
      <h1>Discover today</h1>
      <div className="grid grid-5">
        {data.map((r) => (
          <RecipeCard
            key={r.idMeal}
            recipe={r}
            onOpen={open}
            onToggleSave={(x) => fav?.toggleFavorite?.(x)}
            isSaved={isSaved(r)}
          />
        ))}
      </div>
      <RecipeModal open={modalOpen} onClose={close} recipe={active} />
    </main>
  );
}
