import React, { useEffect, useMemo, useState } from "react";
import { getMealById } from "../services/api.js";
import { useFavorites } from "../context/FavoritesContext.jsx";

function normalize(meal) {
  if (!meal) return { id:"", title:"Untitled recipe", image:"", ingredients:[], instructions:[], source:"" };
  const id = meal.idMeal || meal.id || "";
  const title = meal.strMeal || meal.title || "Untitled recipe";
  const image = meal.strMealThumb || meal.image || "";
  const source = meal.strSource || meal.source || meal.strYoutube || "";
  const ingredients = [];
  for (let i=1;i<=20;i++){
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && String(ing).trim()) ingredients.push(`${ing}${meas?` ${meas}`:""}`.trim());
  }
  const instructions = String(meal.strInstructions || meal.instructions || "")
    .split(/\r?\n+/).map(s=>s.trim()).filter(Boolean);
  return { id, title, image, source, ingredients, instructions, area: meal.strArea || "", category: meal.strCategory || "" };
}

export default function RecipeModal({ open, onClose, recipe }) {
  const [view, setView] = useState(normalize(recipe));
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const fav = useFavorites();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setImgLoaded(false);
    const base = normalize(recipe);
    setView(base);
    const need = (!base.instructions.length || !base.ingredients.length) && base.id;
    let ignore = false;
    async function hydrate() {
      if (!need) return;
      setLoading(true);
      const full = await getMealById(base.id);
      if (!ignore && full) setView(normalize(full));
      setLoading(false);
    }
    hydrate();
    return () => { ignore = true; };
  }, [open, recipe]);

  const chips = useMemo(() => {
    const a = [];
    if (view.area) a.push(view.area);
    if (view.category) a.push(view.category);
    return a;
  }, [view]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-media">
          {!imgLoaded && <div className="img-skeleton" />}
          {view.image && (
            <img
              className={`modal-img ${imgLoaded ? "show" : ""}`}
              src={view.image}
              alt={view.title}
              onLoad={() => setImgLoaded(true)}
            />
          )}
        </div>

        <div className="modal-content">
          <div>
            <div className="modal-title">{view.title}</div>
            {chips.length ? (
              <div className="chips" style={{ marginTop: 8 }}>
                {chips.map((c, i) => <span key={`${c}-${i}`} className="chip">{c}</span>)}
              </div>
            ) : null}
          </div>

          {view.ingredients.length ? (
            <div>
              <div className="modal-subtitle">Ingredients</div>
              <div className="chips">
                {view.ingredients.map((s, i)=> <span key={`${i}-${s}`} className="chip">{s}</span>)}
              </div>
            </div>
          ) : null}

          <div>
            <div className="modal-subtitle">Instructions</div>
            <ol className="modal-instructions">
              {loading && !view.instructions.length
                ? Array.from({length:6}).map((_,i)=><li key={i} className="skeleton" style={{height:14,borderRadius:6}}/>)
                : view.instructions.length
                  ? view.instructions.map((line,i)=><li key={i}>{line}</li>)
                  : <li>No details provided for this recipe.</li>}
            </ol>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() => fav?.toggleFavorite?.(recipe)}
            >
              {fav?.isFavorite?.(view.id) ? "Saved" : "Save"}
            </button>
            {view.source && (
              <a className="btn btn-soft" href={view.source} target="_blank" rel="noreferrer">Open source</a>
            )}
            <button className="btn btn-soft" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
