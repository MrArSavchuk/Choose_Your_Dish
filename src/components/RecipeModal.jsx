import React, { useEffect, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

export default function RecipeModal({ isOpen, recipe, onClose }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const title = recipe?.title || recipe?.name || "Recipe";
  const image = recipe?.image || recipe?.thumbnail || "";
  const sourceUrl =
    recipe?.source ||
    recipe?.href ||
    (recipe?.id && `https://www.themealdb.com/meal.php?c=${recipe.id}`) ||
    "#";

  const ingredients =
    recipe?.ingredients && Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : (recipe?.ingredientLines || []).map((t) => String(t));

  const steps =
    recipe?.instructions && Array.isArray(recipe.instructions)
      ? recipe.instructions
      : typeof recipe?.instructions === "string"
      ? recipe.instructions.split(/\n+/)
      : [];

  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="document">
        <header className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          <div className="modal-figure">
            <div className="skeleton" style={{ width: "min(880px, 100%)", height: 420 }} aria-hidden />
            {image ? (
              <img
                src={image}
                alt={title}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                className={`progressive-img ${imgLoaded ? "is-loaded" : ""}`}
              />
            ) : null}
          </div>

          <h2 className="modal-title">{title}</h2>

          {ingredients?.length > 0 && (
            <section className="ingredients">
              <h3 className="modal-section-title">Ingredients</h3>
              <ul>
                {ingredients.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {steps?.length > 0 && (
            <section className="ingredients" style={{ marginTop: 16 }}>
              <h3 className="modal-section-title">Steps</h3>
              <ul>
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="modal-actions">
            <button
              className={`btn btn-pill ${isFavorite(recipe) ? "btn-outline" : "btn-primary"}`}
              onClick={() => toggleFavorite(recipe)}
            >
              {isFavorite(recipe) ? "Saved" : "Save"}
            </button>
            <a className="btn btn-pill btn-outline" href={sourceUrl} target="_blank" rel="noreferrer">
              Open source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
