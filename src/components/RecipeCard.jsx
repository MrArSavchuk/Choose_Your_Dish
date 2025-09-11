import React, { useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

/** Строим надёжный внешний URL */
function buildExternalUrl(recipe) {
  const isHttp = (u) => /^https?:\/\//i.test(u || "");
  if (isHttp(recipe.source)) return recipe.source;
  if (isHttp(recipe.youtube)) return recipe.youtube;
  if (recipe.mealUrl) return recipe.mealUrl;
  return `https://www.themealdb.com/meal/${recipe.id}`;
}

export default function RecipeCard({ recipe, onOpen, idx = 0, noAnim = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(recipe.id);
  const [imgLoaded, setImgLoaded] = useState(false);

  const openSource = () => {
    const url = buildExternalUrl(recipe);
    window.open(url, "_blank", "noopener");
  };

  const openModal = () => {
    if (onOpen) onOpen(recipe);
  };

  return (
    <article
      className={[
        "card relative",
        !noAnim ? "animate-slide-up delay-" + (idx % 6) : "",
      ].join(" ")}
      role="listitem"
    >
      {/* Кликабельное изображение — кнопка, чтобы не было конфликтов с оверлеями */}
      <button
        type="button"
        onClick={openModal}
        className="block relative rounded-xl overflow-hidden focus-outline"
        aria-label={`Open recipe ${recipe.title}`}
      >
        {!imgLoaded && <div className="img-skeleton" />}
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-48 object-cover ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </button>

      <h3 className="mt-3 mb-2 font-semibold leading-snug">{recipe.title}</h3>

      <div className="flex flex-wrap gap-2">
        {(recipe.ingredients || []).slice(0, 4).map((t, i) => (
          <span key={i} className="chip">
            {t}
          </span>
        ))}
      </div>

      {/* Кнопки внизу — одинаковая ширина */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          className={`btn-ghost btn-press w-full ${saved ? "saved" : ""}`}
          onClick={() => toggleFavorite(recipe)}
          aria-pressed={saved}
        >
          <span className="i-bookmark" aria-hidden="true" />
          {saved ? "Saved" : "Save"}
        </button>
        <button className="btn-ghost btn-press w-full" onClick={openSource}>
          Open
        </button>
      </div>
    </article>
  );
}
