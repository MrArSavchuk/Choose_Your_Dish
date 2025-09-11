import { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { randomRecipes } from "../services/api.js";

export default function Favorites() {
  const { favorites, clear } = useFavorites();
  const [suggest, setSuggest] = useState(null);

  useEffect(() => { randomRecipes(1).then((x)=>setSuggest(x[0])); }, []);

  return (
    <section>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:24}}>
        <h1>Favorites</h1>
        {favorites.length>0 && <button className="btn btn-soft" onClick={clear}>Clear all</button>}
      </div>

      <h2>You might like</h2>
      <div style={{maxWidth:420}}>
        {suggest ? <RecipeCard recipe={suggest} /> : <div className="card skeleton" style={{height:250}}/>}
      </div>

      <h2>Saved recipes</h2>
      {favorites.length===0 ? (
        <p style={{opacity:.7}}>No saved recipes yet.</p>
      ) : (
        <div className="grid grid-4">
          {favorites.map((r)=> <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}
