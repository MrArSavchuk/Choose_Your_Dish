import React from "react";

export default function RecipeCard({
  recipe,
  onOpen,
  onToggleSave,
  isSaved,
}) {
  if (!recipe) return null;

  const openSource = () => {
    const url =
      recipe.strSource || recipe.source || recipe.strYoutube || recipe.url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const title = recipe.strMeal || recipe.title || "Untitled";
  const img = recipe.strMealThumb || recipe.image || "";
  const chips = [];
  if (recipe.strArea) chips.push(recipe.strArea);
  if (recipe.strCategory) chips.push(recipe.strCategory);
  if (recipe.strTags) chips.push(...String(recipe.strTags).split(","));

  return (
    <div className="card recipe">
      <div
        className="thumb"
        onClick={() => onOpen?.(recipe)}
        role="button"
        title="Open details"
      >
        {img ? (
          <img src={img} alt={title} loading="lazy" />
        ) : (
          <div className="skeleton" style={{ width: "100%", height: "100%" }} />
        )}
      </div>

      <div className="recipe-title">{title}</div>

      {chips.length ? (
        <div className="chips" style={{ marginTop: 6 }}>
          {chips.slice(0, 6).map((c, i) => (
            <span key={`${c}-${i}`} className="badge">
              {c}
            </span>
          ))}
        </div>
      ) : null}

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => onToggleSave?.(recipe)}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
        <button className="btn btn-soft" onClick={openSource}>
          Open
        </button>
      </div>
    </div>
  );
}
