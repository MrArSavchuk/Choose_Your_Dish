import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";

export default function RecipeCard({ recipe, onOpen }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="card recipe-card">
      <div className="progressive-wrap" onClick={() => onOpen(recipe)} style={{ cursor: "pointer" }}>
        <div className="skeleton" style={{ aspectRatio: "4/3" }} />
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`progressive-img ${imgLoaded ? "is-loaded" : ""}`}
          />
        ) : null}
      </div>

      <div className="card-body">
        <h3 className="recipe-title">{recipe.title}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {recipe.ingredients?.slice(0, 4).map((t, i) => (
            <span className="chip" key={i}>{t}</span>
          ))}
        </div>

        <div className="card-actions">
          <button
            className={`btn btn-pill btn-ghost ${isFavorite(recipe) ? "btn-outline" : "btn-primary"}`}
            onClick={() => toggleFavorite(recipe)}
          >
            {isFavorite(recipe) ? "Saved" : "Save"}
          </button>
          <a
            className="btn btn-pill btn-solid"
            href={recipe.source || recipe.href || `https://www.themealdb.com/meal.php?c=${recipe.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
        </div>
      </div>
    </article>
  );
}
