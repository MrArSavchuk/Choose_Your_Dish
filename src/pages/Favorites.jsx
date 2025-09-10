import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import { loadFavorites } from "../services/favorites.js";
import { runtimeCache } from "../services/runtimeCache.js";

function mapMeal(m) {
  const ings = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`];
    const measure = m[`strMeasure${i}`];
    if (name && name.trim()) {
      ings.push([name, measure].filter(Boolean).join(" ").trim());
    }
  }
  return {
    id: m.idMeal,
    title: m.strMeal,
    image: m.strMealThumb,
    source: m.strSource || m.strYoutube || "",
    ingredients: ings,
  };
}

async function fetchMealById(id) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  const m = data?.meals?.[0];
  return m ? mapMeal(m) : null;
}

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  const suggestion = runtimeCache.discover?.[0] || runtimeCache.showcase?.[0] || null;

  async function hydrateFavorites() {
    setLoading(true);
    try {
      const raw = loadFavorites();
      const result = await Promise.all(
        raw.map(async r => {
          if (r.title && r.image) return r;         
          const full = await fetchMealById(r.id || r);
          return full || null;
        })
      );
      setItems(result.filter(Boolean));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    hydrateFavorites();
    const onChanged = () => hydrateFavorites();
    window.addEventListener("cyd:favorites-changed", onChanged);
    return () => window.removeEventListener("cyd:favorites-changed", onChanged);
  }, []);

  return (
    <div className="min-h-screen bg-app text-app">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-10" aria-live="polite">
        <h1 className="mt-20 mb-4 font-semibold text-lg">Favorites</h1>

        {suggestion && (
          <>
            <h2 className="mb-3 font-semibold">You might like</h2>
            <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-5">
              <RecipeCard recipe={suggestion} onOpen={setOpen} idx={0} />
            </div>
          </>
        )}

        <h2 className="mt-8 mb-3 font-semibold">Saved recipes</h2>

        {loading && (
          <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="card">
            <p className="meta">You have no saved recipes yet.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-5">
            {items.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} onOpen={setOpen} idx={i} />
            ))}
          </div>
        )}
      </main>

      {open && <RecipeModal recipe={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
