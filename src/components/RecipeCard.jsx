import { useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeModal from "./RecipeModal.jsx";

export default function RecipeCard({ recipe }) {
  const { isFavorite, add, remove } = useFavorites();
  const fav = isFavorite(recipe.id);
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="card recipe">
        <button className="thumb" onClick={()=>setOpen(true)}>
          <img src={recipe.image} alt={recipe.title} loading="lazy" />
        </button>

        <div className="recipe-title">{recipe.title}</div>

        <div className="chips">
          {recipe.ingredients.slice(0,4).map((i,idx)=>(
            <span key={idx} className="badge">{i}</span>
          ))}
        </div>

        <div className="actions">
          {!fav ? (
            <button className="btn btn-primary" style={{ flex:1 }} onClick={()=>add(recipe)}>Save</button>
          ) : (
            <button className="btn btn-soft" style={{ flex:1 }} onClick={()=>remove(recipe.id)}>Saved</button>
          )}

          {recipe.source ? (
            <a className="btn btn-soft" style={{ flex:1 }} href={recipe.source} target="_blank" rel="noreferrer">Open</a>
          ) : (
            <button className="btn btn-soft" style={{ flex:1 }} onClick={()=>setOpen(true)}>Open</button>
          )}
        </div>
      </article>

      {open && (
        <RecipeModal recipe={recipe} onClose={()=>setOpen(false)} onSave={()=>add(recipe)} />
      )}
    </>
  );
}
