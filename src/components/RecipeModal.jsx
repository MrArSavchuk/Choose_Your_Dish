import React, { useEffect } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

function buildExternalUrl(recipe) {
  const isHttp = (u) => /^https?:\/\//i.test(u || "");
  if (isHttp(recipe.source)) return recipe.source;
  if (isHttp(recipe.youtube)) return recipe.youtube;
  if (recipe.mealUrl) return recipe.mealUrl;
  return `https://www.themealdb.com/meal/${recipe.id}`;
}

export default function RecipeModal({ recipe, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(recipe.id);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openSource = () => {
    const url = buildExternalUrl(recipe);
    window.open(url, "_blank", "noopener");
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={recipe.title}
    >
      <div
        className="bg-panel rounded-2xl max-w-3xl w-full shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* верхняя картинка */}
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full max-h-[360px] object-cover"
          loading="lazy"
        />

        {/* контент со скроллом, если много текста */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold">{recipe.title}</h3>
            <button
              className="btn-ghost btn-press shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(recipe.ingredients || []).map((tag, i) => (
              <span key={i} className="chip">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              className={`btn-primary btn-press ${saved ? "saved" : ""}`}
              onClick={() => toggleFavorite(recipe)}
              aria-pressed={saved}
            >
              {saved ? "Saved" : "Save"}
            </button>
            <button className="btn-secondary btn-press" onClick={openSource}>
              Open source
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
