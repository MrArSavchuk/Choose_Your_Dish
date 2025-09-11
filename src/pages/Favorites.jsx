import { useMemo } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";

export default function Favorites() {
  const { favorites, clearFavorites, suggest } = useFavorites();

  const suggestion = useMemo(() => suggest(), [suggest]);

  return (
    <main className="container page">
      <h1 className="page-title">Favorites</h1>

      <section className="section">
        <h2 className="section-title">You might like</h2>
        <div className="grid">
          {suggestion && (
            <RecipeCard
              key={`suggest-${suggestion.id}`}
              recipe={suggestion}
              onOpen={() => {}}
            />
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Saved recipes</h2>
          {favorites.length > 0 && (
            <button className="btn btn-danger" onClick={clearFavorites}>Clear all</button>
          )}
        </div>

        {favorites.length === 0 ? (
          <p className="muted">No saved recipes yet.</p>
        ) : (
          <div className="grid">
            {favorites.map((r) => (
              <RecipeCard key={r.id} recipe={r} onOpen={() => {}} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
