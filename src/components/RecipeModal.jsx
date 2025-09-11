import React, { useEffect } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

/** Надёжная ссылка на первоисточник */
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

  // блокируем скролл боди и закрываем по ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.body.classList.add("no-scroll");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("no-scroll");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!recipe) return null;

  const steps = Array.isArray(recipe.instructions)
    ? recipe.instructions
    : (recipe.instructions || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>

        <div className="modal-media">
          <img src={recipe.image} alt={recipe.title} />
        </div>

        <div className="modal-content">
          <h2 className="modal-title">{recipe.title}</h2>

          {!!(recipe.tags && recipe.tags.length) && (
            <div className="modal-meta">
              {recipe.tags.map((t, i) => (
                <span className="chip" key={i}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <h3 className="section-title">Ingredients</h3>
          <ul className="ingredients">
            {(recipe.ingredients || []).map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>

          {steps.length > 0 && (
            <>
              <h3 className="section-title">Steps</h3>
              <ol className="steps">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className={`btn-ghost btn-press ${saved ? "is-saved" : ""}`}
              onClick={() => toggleFavorite(recipe)}
              aria-pressed={saved}
            >
              {saved ? "Saved" : "Save"}
            </button>

            <a
              className="btn-ghost btn-press"
              href={buildExternalUrl(recipe)}
              target="_blank"
              rel="noopener"
            >
              Open source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
