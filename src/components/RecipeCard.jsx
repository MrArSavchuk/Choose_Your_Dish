import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { isFavorite, toggleFavorite } from "../services/favorites.js";

export default function RecipeCard({ recipe, onOpen, idx = 0, noAnim = false }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  // синхронизация флага "в избранном"
  useEffect(() => {
    setSaved(isFavorite(recipe.id));
  }, [recipe.id]);

  function onToggleSave() {
    const state = toggleFavorite(recipe);
    setSaved(state);
  }

  return (
    <article
      className={`card overflow-hidden card-col ${noAnim ? "" : "animate-rise"}`}
      style={noAnim ? undefined : { animationDelay: `${idx * 60}ms` }}
    >
      <div className="relative card-img-wrap">
        {!imgLoaded && (
          <>
            <div className="img-skeleton" />
            <div className="spinner" />
          </>
        )}
        <img
          src={recipe.image}
          alt={recipe.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity .25s ease" }}
        />
      </div>

      <h3 className="mt-3 font-semibold line-clamp-2">{recipe.title}</h3>

      {!!recipe.ingredients?.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {recipe.ingredients.slice(0, 4).map((ing, i) => (
            <span key={i} className="chip no-pointer">
              {ing}
            </span>
          ))}
        </div>
      )}

      <div className="card-spacer" />

      <div className="card-actions">
        <button
          className={`btn-fav btn-press ${saved ? "btn-fav--active" : ""}`}
          onClick={onToggleSave}
        >
          <Bookmark size={16} /> {saved ? "Saved" : "Save"}
        </button>
        <button className="btn-ghost btn-press" onClick={() => onOpen?.(recipe)}>
          Open
        </button>
      </div>
    </article>
  );
}
