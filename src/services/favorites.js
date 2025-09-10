// src/services/favorites.js
// Единый сервис для избранного (localStorage)
const KEY = "cyd:favorites";

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.map((n) =>
          typeof n === "string" || typeof n === "number" ? { id: String(n) } : n
        )
      : [];
  } catch {
    return [];
  }
}

export function saveFavorites(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export function isFavorite(id) {
  const list = loadFavorites();
  return list.some((r) => (r.id || r) === id);
}

// Минимальный набор полей на случай, если откроем избранное без сети
function minimalRecipe(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    ingredients: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.slice(0, 4)
      : [],
    source: recipe.source || "",
  };
}

export function toggleFavorite(recipe) {
  const list = loadFavorites();
  const idx = list.findIndex((r) => (r.id || r) === recipe.id);
  let nowSaved = false;

  if (idx >= 0) {
    list.splice(idx, 1);
    nowSaved = false;
  } else {
    list.unshift(minimalRecipe(recipe));
    nowSaved = true;
  }
  saveFavorites(list);

  // Сообщаем приложению, что избранное обновилось
  try {
    window.dispatchEvent(new CustomEvent("cyd:favorites-changed"));
  } catch {}

  return nowSaved;
}
