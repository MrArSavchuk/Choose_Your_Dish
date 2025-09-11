import React, { useMemo, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

function toHttp(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function buildIngredients(recipe) {
  const list = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = recipe[`strIngredient${i}`];
    const qty = recipe[`strMeasure${i}`];
    if (name && name.trim()) {
      const label = [name.trim(), qty && qty.trim() ? qty.trim() : ""]
        .filter(Boolean)
        .join(" ");
      list.push(label);
    }
  }
  return list;
}

export default function RecipeModal({ recipe, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgLoaded, setImgLoaded] = useState(false);

  const ingredients = useMemo(() => buildIngredients(recipe), [recipe]);
  const sourceUrl =
    toHttp(recipe.strSource) ||
    (recipe.strYoutube ? `https://www.youtube.com/watch?v=${recipe.strYoutube.split("v=")[1] || ""}` : "");

  const steps = useMemo(() => {
    const text = recipe.strInstructions || "";
    return text
      .split(/\r?\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [recipe]);

  const saved = isFavorite(recipe.idMeal);

  return (
    <div className="modal-overlay" onClick={onClose} role="button" tabIndex={-1}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="modal-media">
          {!imgLoaded && <div className="img-skeleton" />}
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className={`modal-img ${imgLoaded ? "show" : ""}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        <div className="modal-content">
          <h2 id="recipe-title" className="modal-title">
            {recipe.strMeal}
          </h2>

          {ingredients.length > 0 && (
            <>
              <h3 className="modal-subtitle">Ingredients</h3>
              <div className="chips">
                {ingredients.map((it, idx) => (
                  <span className="chip" key={`${recipe.idMeal}-ing-${idx}`}>{it}</span>
                ))}
              </div>
            </>
          )}

          {steps.length > 0 && (
            <>
              <h3 className="modal-subtitle">Instructions</h3>
              <ol className="modal-instructions">
                {steps.map((line, i) => (
                  <li key={`${recipe.idMeal}-step-${i}`}>{line}</li>
                ))}
              </ol>
            </>
          )}

          <div className="modal-actions">
            <button
              className={`btn ${saved ? "btn-secondary" : "btn-primary"}`}
              onClick={() => toggleFavorite(recipe)}
            >
              {saved ? "Saved" : "Save"}
            </button>

            {sourceUrl ? (
              <a
                className="btn btn-ghost"
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open source
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
