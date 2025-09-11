import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext();

const SUGGEST_POOL = [
  {
    id: "s-1",
    title: "Three Fish Pie",
    image:
      "https://www.themealdb.com/images/media/meals/spswqs1511558697.jpg",
    ingredients: ["Potatoes 1kg", "Butter Knob", "Milk Dash", "Gruyere 50g"],
    sourceUrl:
      "https://www.bbcgoodfood.com/recipes/three-fish-pie",
  },
  {
    id: "s-2",
    title: "Beef Wellington",
    image:
      "https://www.themealdb.com/images/media/meals/vvpprx1487325699.jpg",
    ingredients: ["Beef 750g", "Puff pastry", "Mushrooms"],
    sourceUrl:
      "https://www.jamieoliver.com/recipes/beef-recipes/beef-wellington/",
  },
  {
    id: "s-3",
    title: "Mediterranean Pasta Salad",
    image:
      "https://www.themealdb.com/images/media/meals/wvqpwt1468339226.jpg",
    ingredients: ["Mozzarella balls", "Tomatoes", "Basil", "Farfalle"],
    sourceUrl:
      "https://www.allrecipes.com/recipe/14447/mediterranean-pasta-salad/",
  },
];

const LS_KEY = "cyd_favorites_v1";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const ids = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  function isFavorite(id) {
    return ids.has(id);
  }

  function toggleFavorite(recipe) {
    setFavorites((prev) => {
      const exists = prev.find((r) => r.id === recipe.id);
      if (exists) return prev.filter((r) => r.id !== recipe.id);
      const safe = {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        sourceUrl:
          recipe.sourceUrl ||
          recipe.href ||
          `https://www.google.com/search?q=${encodeURIComponent(
            recipe.title || "recipe"
          )}`,
      };
      return [safe, ...prev].slice(0, 200);
    });
  }

  function clearFavorites() {
    setFavorites([]);
  }

  function suggest() {
    const pool = SUGGEST_POOL.filter((x) => !ids.has(x.id));
    if (pool.length === 0) return SUGGEST_POOL[0];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites, suggest }),
    [favorites, ids]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
