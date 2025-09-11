import { useState, useMemo } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

function buildSourceUrl(recipe) {
  if (recipe.sourceUrl) return recipe.sourceUrl;
  if (recipe.href) return recipe.href;
  return `https://www.google.com/search?q=${encodeURIComponent(recipe.title || "")} recipe`;
}

export default function RecipeCard({ recipe, onOpen }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(recipe.id);
  const [imgLoaded, setImgLoaded] = useState(false);

  const tags = useMemo(() => {
    const list = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    return list.slice(0, 5);
  }, [recipe]);

  return (
    <article className="card">
      <button className="card-img-wrap" onClick={() => onOpen?.(recipe)} aria-label="Open details">
        <img
          className="card-img"
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && <div className="img-skeleton" />}
      </button>

      <div className="card-body">
        <h3 className="card-title">{recipe.title}</h3>
        <div className="chips">
          {tags.map((t, i) => (
            <span key={`${recipe.id}-tag-${i}`} className="chip">{t}</span>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button
          className={`btn ${saved ? "btn-success" : "btn-primary"}`}
          onClick={() => toggleFavorite(recipe)}
        >
          {saved ? "Saved" : "Save"}
        </button>
        <a
          className="btn btn-ghost"
          href={buildSourceUrl(recipe)}
          target="_blank"
          rel="noreferrer"
        >
          Open
        </a>
      </div>
    </article>
  );
}
