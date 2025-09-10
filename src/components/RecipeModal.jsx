import React, { useEffect } from "react";
import { X, Star, Heart } from "lucide-react";

export default function RecipeModal({ recipe, onClose }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mx-auto modal-panel px-4" onClick={e => e.stopPropagation()}>
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
            <h2 className="font-semibold text-lg">{recipe.title}</h2>
            <button className="btn-ghost btn-press" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* scrollable content */}
          <div className="modal-content px-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <img
                src={`${recipe.image}?q_auto,f_auto`}
                alt={recipe.title}
                className="w-full h-64 object-cover rounded-lg"
                loading="lazy"
              />
              <div>
                <p className="text-sm text-muted mb-2">
                  <span className="inline-flex items-center gap-1 mr-3"><Star size={14}/> {Number(recipe.rating||0).toFixed(1)}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={14}/> {recipe.likes||0}</span>
                </p>

                {!!recipe.ingredients?.length && (
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((i, idx) => <span key={idx} className="chip no-pointer">{i}</span>)}
                    </div>
                  </div>
                )}

                {!!recipe.steps?.length && (
                  <div>
                    <h3 className="font-semibold mb-1">Steps</h3>
                    <ol className="list-decimal pl-5 space-y-1">
                      {recipe.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ol>
                  </div>
                )}

                {!!recipe.sourceUrl && (
                  <a className="btn-accent mt-4 inline-block btn-press" href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                    Open original with comments
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
