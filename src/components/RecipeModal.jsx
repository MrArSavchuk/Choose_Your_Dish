import React, { useEffect, useMemo, useState } from "react";

export default function RecipeModal({ open, onClose, recipe }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => { setImgLoaded(false); }, [recipe]);

  if (!open) return null;

  const title = recipe?.strMeal || recipe?.title || "Untitled recipe";
  const img = recipe?.strMealThumb || recipe?.image || "";
  const instructions = useMemo(() => {
    const raw = recipe?.strInstructions || recipe?.instructions || "";
    return String(raw).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }, [recipe]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-media">
          {!imgLoaded && <div className="img-skeleton" />}
          {img && (
            <img
              className={`modal-img ${imgLoaded ? "show" : ""}`}
              src={img}
              alt={title}
              onLoad={() => setImgLoaded(true)}
            />
          )}
        </div>

        <div className="modal-content">
          <div>
            <div className="modal-title">{title}</div>
            <div className="chips" style={{ marginTop: 8 }}>
              {recipe?.strArea && <span className="chip">{recipe.strArea}</span>}
              {recipe?.strCategory && <span className="chip">{recipe.strCategory}</span>}
            </div>
          </div>

          <div>
            <h2>Ingredients</h2>
            <div className="chips">
              {Array.from({ length: 20 }).map((_, i) => {
                const idx = i + 1;
                const ing = recipe?.[`strIngredient${idx}`];
                const meas = recipe?.[`strMeasure${idx}`];
                const txt = [ing, meas].filter(Boolean).join(" ");
                return txt ? <span key={idx} className="chip">{txt}</span> : null;
              })}
            </div>
          </div>

          <div>
            <h2>Instructions</h2>
            {instructions.length ? (
              <ol className="modal-instructions">
                {instructions.map((line, i) => <li key={i}>{line}</li>)}
              </ol>
            ) : (
              <p className="modal-subtitle">No details provided for this recipe.</p>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onClose}>Close</button>
            {recipe?.strSource && (
              <button className="btn btn-secondary" onClick={() => window.open(recipe.strSource, "_blank", "noopener,noreferrer")}>
                Open source
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
