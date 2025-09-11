import { useFavorites } from "../context/FavoritesContext.jsx";

export default function RecipeModal({ recipe, onClose, onSave }) {
  const { isFavorite, remove } = useFavorites();
  const fav = isFavorite(recipe.id);

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal shadow-soft" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <button className="btn btn-soft" onClick={onClose}>Close</button>
        </div>

        <div className="modal-body">
          <div className="modal-img">
            <img src={recipe.image} alt={recipe.title} />
          </div>

          <div>
            <div className="modal-title">{recipe.title}</div>

            <div className="modal-chips">
              {recipe.ingredients.map((i,idx)=>(
                <span key={idx} className="badge">{i}</span>
              ))}
            </div>

            <div className="modal-actions">
              {!fav ? (
                <button className="btn btn-primary" onClick={onSave}>Save</button>
              ) : (
                <button className="btn btn-soft" onClick={()=>remove(recipe.id)}>Saved</button>
              )}
              {recipe.source && (
                <a className="btn btn-soft" href={recipe.source} target="_blank" rel="noreferrer">Open source</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
