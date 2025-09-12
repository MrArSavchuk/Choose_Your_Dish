import React, { useEffect, useMemo, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import { searchRecipes, randomMeals } from "../services/api.js";

const pick = (arr, n) => arr.slice().sort(() => 0.5 - Math.random()).slice(0, n);
const norm = (s) => String(s || "").trim().toLowerCase();

export default function Home() {
  const fav = useFavorites();

  const [random, setRandom] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const seed = await randomMeals(12);
        if (!ignore) setRandom(pick(seed, 10));
      } catch {
        if (!ignore) setRandom([]);
      }
    })();
    return () => { ignore = true; };
  }, []);

  async function apply(e) {
    e?.preventDefault?.();
    const payload = {
      query: q,
      include: include.split(",").map((s) => norm(s)).filter(Boolean),
      exclude: exclude.split(",").map((s) => norm(s)).filter(Boolean),
      limit: 10
    };
    setLoading(true);
    try {
      const data = await searchRecipes(payload);
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setQ(""); setInclude(""); setExclude("");
    setList([]);
  }

  const showRandom = useMemo(() => list.length === 0, [list]);
  const data = useMemo(() => (showRandom ? random : list), [showRandom, random, list]);

  const open = (r) => { setActive(r); setModalOpen(true); };
  const close = () => { setActive(null); setModalOpen(false); };
  const isSaved = (r) => fav?.isFavorite?.(r?.idMeal || r?.id);

  return (
    <main className="container">
      <h1>Discover today</h1>

      {showRandom && (
        <div className="grid grid-5">
          {random.length
            ? random.map((r) => (
              <RecipeCard
                key={r.idMeal}
                recipe={r}
                onOpen={open}
                onToggleSave={(x) => fav?.toggleFavorite?.(x)}
                isSaved={isSaved(r)}
              />
            ))
            : Array.from({ length: 10 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 250 }} />)}
        </div>
      )}

      <form className="card" style={{ marginTop: 18, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr auto" }} onSubmit={apply}>
        <div className="field">
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Search in title</div>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="pasta, chicken..." />
        </div>
        <div className="field">
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Include ingredients</div>
          <input className="input" value={include} onChange={(e) => setInclude(e.target.value)} placeholder="tomato, basil" />
        </div>
        <div className="field">
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Exclude ingredients</div>
          <input className="input" value={exclude} onChange={(e) => setExclude(e.target.value)} placeholder="nuts, gluten" />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>Apply</button>
          <button className="btn btn-soft" type="button" onClick={reset} disabled={loading}>Reset</button>
        </div>
      </form>

      <div className="grid grid-5" style={{ marginTop: 18 }}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 250 }} />)
          : !showRandom
            ? data.map((r) => (
              <RecipeCard
                key={r.idMeal}
                recipe={r}
                onOpen={open}
                onToggleSave={(x) => fav?.toggleFavorite?.(x)}
                isSaved={isSaved(r)}
              />
            ))
            : null}
      </div>

      <RecipeModal open={modalOpen} onClose={close} recipe={active} />
    </main>
  );
}
