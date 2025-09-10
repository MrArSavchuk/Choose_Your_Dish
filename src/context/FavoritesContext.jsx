import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fav_ids") || "[]"); }
    catch { return []; }
  });
  const [store, setStore] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fav_store") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => { try { localStorage.setItem("fav_ids", JSON.stringify(ids)); } catch {} }, [ids]);
  useEffect(() => { try { localStorage.setItem("fav_store", JSON.stringify(store)); } catch {} }, [store]);

  const add = (recipe) => {
    if (!recipe?.id) return;
    setIds((prev) => (prev.includes(recipe.id) ? prev : [...prev, recipe.id]));
    setStore((prev) => ({ ...prev, [recipe.id]: recipe }));
  };

  const remove = (id) => {
    setIds((prev) => prev.filter((x) => x !== id));
    setStore((prev) => {
      const copy = { ...prev }; delete copy[id]; return copy;
    });
  };

  const value = useMemo(() => ({
      ids,
      isFav: (id) => ids.includes(id),
      toggleFav: (id, recipe) => (ids.includes(id) ? remove(id) : add(recipe)),
      getAll: () => ids.map((id) => store[id]).filter(Boolean),
      hidden: new Set(), 
    }),
    [ids, store]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFav = () => useContext(Ctx);
