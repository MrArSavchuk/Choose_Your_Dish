import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  loadFavorites,
  saveFavorites,
  toggleFavorite as svcToggle,
  isFavorite as svcIsFavorite,
} from "../services/favorites.js";

const FavoritesCtx = createContext(null);

/**
 * Провайдер избранного.
 * Необязателен: если его нет, useFavorites вернёт fallback на сервис.
 */
export function FavoritesProvider({ children }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    // первичная загрузка из localStorage
    setList(loadFavorites());

    // слушаем глобальное событие из сервиса (когда фавориты меняются)
    const onChanged = () => setList(loadFavorites());
    window.addEventListener("cyd:favorites-changed", onChanged);
    return () => window.removeEventListener("cyd:favorites-changed", onChanged);
  }, []);

  const api = useMemo(
    () => ({
      list,
      isFavorite: (id) => list.some((r) => (r.id || r) === id),
      toggleFavorite: (recipe) => {
        const saved = svcToggle(recipe); // сервис сам диспатчит событие
        // синхронизируем локальный стейт
        setList(loadFavorites());
        return saved;
      },
      clearFavorites: () => {
        saveFavorites([]);
        setList([]);
        try {
          window.dispatchEvent(new CustomEvent("cyd:favorites-changed"));
        } catch {}
      },
    }),
    [list]
  );

  return <FavoritesCtx.Provider value={api}>{children}</FavoritesCtx.Provider>;
}

/**
 * Хук для работы с избранным.
 * Если провайдера нет (например, в превью на Netlify) — используем fallback на сервис.
 */
export function useFavorites() {
  const ctx = useContext(FavoritesCtx);
  if (ctx) return ctx;

  // Fallback: работаем напрямую через сервис (без реактивного списка)
  return {
    list: loadFavorites(),
    isFavorite: (id) => svcIsFavorite(id),
    toggleFavorite: (recipe) => svcToggle(recipe),
    clearFavorites: () => saveFavorites([]),
  };
}
