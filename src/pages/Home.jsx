import React, { useEffect, useMemo, useState } from "react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";

const pick = (arr, n) => arr.slice().sort(() => 0.5 - Math.random()).slice(0, n);
const norm = (s) => String(s || "").trim().toLowerCase();

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Network");
  return r.json();
}

function getMealIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && String(ing).trim()) out.push(`${ing} ${meas || ""}`.trim());
  }
  return out;
}

async function lookupMeal(id) {
  const j = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  return j.meals?.[0] || null;
}

async function filterByIngredientSingle(ing) {
  if (!ing) return [];
  const j = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`);
  return Array.isArray(j.meals) ? j.meals : [];
}

function intersectIds(a, b) {
  const setB = new Set(b.map((m) => m.idMeal));
  return a.filter((m) => setB.has(m.idMeal));
}

export default function Home() {
  const fav = useFavorites();

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
        setLoading(true);
        const seed = ["pork", "beef", "chicken", "salad"][Math.floor(Math.random() * 4)];
        const j = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/search.php?s=${seed}`);
        const base = Array.isArray(j.meals) ? j.meals : [];
        if (!ignore) setList(pick(base, 10));
      } catch {
        if (!ignore) setList([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  async function handleApply(e) {
    e?.preventDefault?.();
    const name = norm(q);
    const inc = norm(include);
    const exc = norm(exclude);

    setLoading(true);
    try {
      let baseFull = [];

      if (name) {
        const j = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
        baseFull = Array.isArray(j.meals) ? j.meals : [];
      }

      let byInc = [];
      if (inc) {
        const parts = inc.split(",").map((s) => norm(s)).filter(Boolean);
        if (parts.length) {
          let pool = null;
          for (const ing of parts) {
            const one = await filterByIngredientSingle(ing);
            pool = pool === null ? one : intersectIds(pool, one);
          }
          byInc = pool || [];
        }
      }

      if (!name && inc && byInc.length) {
        const ids = byInc.map((m) => m.idMeal).slice(0, 20);
        const details = await Promise.all(ids.map((id) => lookupMeal(id)));
        baseFull = details.filter(Boolean);
      }

      if (name && inc && byInc.length) {
        const idsInc = new Set(byInc.map((m) => m.idMeal));
        baseFull = baseFull.filter((m) => idsInc.has(m.idMeal));
      }

      if (exc) {
        const bad = exc.split(",").map((s) => norm(s)).filter(Boolean);
        if (bad.length) {
          baseFull = baseFull.filter((meal) => {
            const ings = getMealIngredients(meal).join(" ").toLowerCase();
            return !bad.some((b) => ings.includes(b));
          });
        }
      }

      setList(baseFull.slice(0, 10));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setQ(""); setInclude(""); setExclude("");
    setLoading(true);
    (async () => {
      try {
        const j = await fetchJSON(`https://www.themealdb.com/api/json/v1/1/search.php?s=`);
        const base = Array.isArray(j.meals) ? j.meals : [];
        setList(pick(base, 10));
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    })();
  }

  const open = (r) => { setActive(r); setModalOpen(true); };
  const close = () => { setModalOpen(false); setActive(null); };
  const isSaved = (r) => fav?.isFavorite?.(r?.idMeal || r?.id);

  const data = useMemo(() => list || [], [list]);

  return (
    <main className="container">
      <h1>Discover today</h1>

      <form className="filters card" onSubmit={handleApply}>
        <div className="field">
          <label>Search in title</label>
          <input
            className="input"
            placeholder="pasta, chicken..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Include ingredients</label>
          <input
            className="input"
            placeholder="tomato, basil"
            value={include}
            onChange={(e) => setInclude(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Exclude ingredients</label>
          <input
            className="input"
            placeholder="nuts, gluten"
            value={exclude}
            onChange={(e) => setExclude(e.target.value)}
          />
        </div>

        <div className="field btns">
          <button type="submit" className="btn btn-primary" disabled={loading}>Apply</button>
          <button type="button" className="btn btn-soft" onClick={handleReset} disabled={loading}>Reset</button>
        </div>
      </form>

      <div className="grid grid-5" style={{ marginTop: 18 }}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="card recipe">
                <div className="thumb skeleton" />
                <div className="skeleton" style={{ height: 18, margin: "10px 0 6px", borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 8 }} />
                <div className="actions" style={{ marginTop: "auto" }}>
                  <div className="skeleton" style={{ height: 40, width: 90, borderRadius: 10 }} />
                  <div className="skeleton" style={{ height: 40, width: 90, borderRadius: 10 }} />
                </div>
              </div>
            ))
          : data.map((r) => (
              <RecipeCard
                key={r.idMeal}
                recipe={r}
                onOpen={open}
                onToggleSave={(x) => fav?.toggleFavorite?.(x)}
                isSaved={isSaved(r)}
              />
            ))}
      </div>

      <RecipeModal open={modalOpen} onClose={close} recipe={active} />
    </main>
  );
}
