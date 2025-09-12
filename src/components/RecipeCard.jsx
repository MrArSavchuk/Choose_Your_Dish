function resolveSource(recipe) {
  const s = recipe?.strSource || recipe?.source || "";
  const yt = recipe?.strYoutube || "";
  return s || yt || "";
}

export default function RecipeCard({ recipe, onOpen, onToggleSave, isSaved }) {
  if (!recipe) return null;
  const title = recipe.strMeal || recipe.title || "Untitled";
  const img = recipe.strMealThumb || recipe.image || "";
  const source = resolveSource(recipe);
  const chips = [];
  if (recipe.strArea) chips.push(recipe.strArea);
  if (recipe.strCategory) chips.push(recipe.strCategory);
  if (recipe.strTags) chips.push(...String(recipe.strTags).split(",").filter(Boolean));

  return (
    <article className="card recipe">
      <button className="thumb" onClick={() => onOpen?.(recipe)} title="Open details">
        {img ? (
          <img src={img} alt={title} loading="lazy" />
        ) : (
          <div className="skeleton" style={{ width: "100%", height: "100%" }} />
        )}
      </button>

      <div className="recipe-title">{title}</div>

      {chips.length ? (
        <div className="chips" style={{ marginTop: 6 }}>
          {chips.slice(0, 6).map((c, i) => (
            <span key={`${c}-${i}`} className="badge">{c}</span>
          ))}
        </div>
      ) : null}

      <div className="actions">
        <button className="btn btn-primary" onClick={() => onToggleSave?.(recipe)}>
          {isSaved ? "Saved" : "Save"}
        </button>
        {source ? (
          <a className="btn btn-soft" href={source} target="_blank" rel="noreferrer">Open</a>
        ) : (
          <button className="btn btn-soft" onClick={() => onOpen?.(recipe)}>Open</button>
        )}
      </div>
    </article>
  );
}
