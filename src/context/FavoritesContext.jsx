import { createContext, useContext, useMemo, useState, useEffect } from "react";

const FavoritesContext = createContext();

const key = "favorite_recipes_v1";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (recipe) =>
    favorites.some((r) => String(r.id) === String(recipe.id));

  const toggleFavorite = (recipe) => {
    setFavorites((prev) =>
      prev.some((r) => String(r.id) === String(recipe.id))
        ? prev.filter((r) => String(r.id) !== String(recipe.id))
        : [...prev, recipe]
    );
  };

  const clearFavorites = () => setFavorites([]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites }),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
