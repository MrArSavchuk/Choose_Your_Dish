import React, { useEffect, useMemo, useState } from 'react';
import { getMealById } from '../services/themealdb';
import { useFavorites } from '../context/FavoritesContext.jsx';

function normalizeRecipe(base) {
  if (!base) return { title: 'Untitled recipe', image: '', ingredients: [], instructions: [], source: '' };
  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const ing = base[`strIngredient${i}`];
    const ms = base[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const line = `${ing}`.trim() + (ms && `${ms}`.trim() ? ` ${ms}` : '');
      ingredients.push(line.trim());
    }
  }
  const instructionsText = base.strInstructions || '';
  const instructions = instructionsText
    ? instructionsText.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    : [];

  return {
    id: base.idMeal || base.id || '',
    title: base.strMeal || base.title || 'Untitled recipe',
    image: base.strMealThumb || base.image || '',
    area: base.strArea || base.area || '',
    tags: (base.strTags ? base.strTags.split(',') : base.tags || []).filter(Boolean),
    ingredients: base.ingredients && base.ingredients.length ? base.ingredients : ingredients,
    instructions: base.instructions && base.instructions.length ? base.instructions : instructions,
    source: base.strSource || base.source || base.strYoutube || ''
  };
}

export default function RecipeModal({ open, onClose, recipe }) {
  const [full, setFull] = useState(() => normalizeRecipe(recipe));
  const [loading, setLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const favApi = useFavorites?.();
  const isFav = favApi?.isFavorite?.(full.id) || false;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setImgLoaded(false);
    const base = normalizeRecipe(recipe);
    setFull(base);
    const needFetch = (!base.instructions.length || !base.ingredients.length) && base.id;
    let ignore = false;
    async function load() {
      if (!needFetch) return;
      setLoading(true);
      const meal = await getMealById(base.id);
      if (!ignore && meal) {
        setFull(normalizeRecipe(meal));
      }
      setLoading(false);
    }
    load();
    return () => { ignore = true; };
  }, [open, recipe]);

  const chips = useMemo(() => {
    const zone = [];
    if (full.area) zone.push(full.area);
    return [...zone, ...full.tags];
  }, [full]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-media">
          {!imgLoaded && <div className="img-skeleton" />}
          {full.image ? (
            <img
              className={`modal-img ${imgLoaded ? 'show' : ''}`}
              src={full.image}
              alt={full.title}
              onLoad={() => setImgLoaded(true)}
              loading="eager"
            />
          ) : null}
        </div>

        <div className="modal-content">
          <div style={{ display: 'grid', gap: 8 }}>
            <div className="modal-title">{full.title}</div>
            {chips.length ? (
              <div className="chips">
                {chips.map((c, i) => <span key={`${c}-${i}`} className="chip">{c}</span>)}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {full.ingredients.length ? (
              <div>
                <div className="modal-subtitle">Ingredients</div>
                <div className="chips">
                  {full.ingredients.map((ing, i) => (
                    <span key={`${ing}-${i}`} className="chip">{ing}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="modal-subtitle">Instructions</div>
              <ol className="modal-instructions">
                {loading && !full.instructions.length ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="skeleton" style={{ height: 14, borderRadius: 6 }} />
                  ))
                ) : full.instructions.length ? (
                  full.instructions.map((step, i) => <li key={i}>{step}</li>)
                ) : (
                  <li>No details provided for this recipe.</li>
                )}
              </ol>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn-modal btn-primary"
              onClick={() => favApi?.toggleFavorite?.(full)}
            >
              {isFav ? 'Saved' : 'Save'}
            </button>
            {full.source ? (
              <a
                className="btn-modal btn-secondary"
                href={full.source}
                target="_blank"
                rel="noreferrer"
              >
                Open source
              </a>
            ) : null}
            <button className="btn-modal btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
