import React, { useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

/** Надёжный внешний URL */
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

  const openModal = () => onOpen && onOpen(recipe);

  return (
    <article
      className={[
        "card recipe-card",
        !noAnim ? `animate-slide-up delay-${idx % 6}` : "",
      ].join(" ")}
      role="listitem"
    >
      {/* Кликабельная картинка */}
      <button
        type="button"
        className="img-button focus-outline"
        onClick={openModal}
        aria-label={`Open recipe ${recipe.title}`}
      >
        {!imgLoaded && <div className="img-skeleton" aria-hidden="true" />}
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </button>

      {/* Тело карточки */}
      <div className="card-body">
        <h3 className="title">{recipe.title}</h3>
        <div className="tags">
          {(recipe.ingredients || []).slice(0, 4).map((t, i) => (
            <span key={i} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Футер всегда снизу */}
      <div className="card-actions">
        <button
          className={`btn-ghost btn-press ${saved ? "is-saved" : ""}`}
          onClick={() => toggleFavorite(recipe)}
          aria-pressed={saved}
        >
          {saved ? "Saved" : "Save"}
        </button>
        <button className="btn-ghost btn-press" onClick={openSource}>
          Open
        </button>
      </div>
    </article>
  );
}
