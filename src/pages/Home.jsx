import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Pagination from "../components/Pagination.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import useDebouncedValue from "../hooks/useDebouncedValue.js";
import { randomFive, showcaseSamples } from "../services/provider.themealdb.js";
import { runtimeCache } from "../services/runtimeCache.js";

function mapMeal(m) {
  const ings = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`];
    const measure = m[`strMeasure${i}`];
    if (name && name.trim()) {
      ings.push([name, measure].filter(Boolean).join(" ").trim());
    }
  }
  return {
    id: m.idMeal,
    title: m.strMeal,
    image: m.strMealThumb,
    source: m.strSource || m.strYoutube || "",
    ingredients: ings,
  };
}

async function fetchMealById(id) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const data = await res.json();
  const m = data?.meals?.[0];
  return m ? mapMeal(m) : null;
}

async function fetchByIngredient(token, limit = 15) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
      token
    )}`
  );
  const data = await res.json();
  const meals = data?.meals || [];
  const ids = meals.slice(0, limit).map((m) => m.idMeal);
  const details = await Promise.all(ids.map((id) => fetchMealById(id)));
  return details.filter(Boolean);
}

async function fetchByName(term) {
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
      term
    )}`
  );
  const data = await res.json();
  const meals = data?.meals || [];
  return meals.map(mapMeal);
}

/* ----------------------------------------- */

export default function Home() {
  const [discover, setDiscover] = useState([]);
  const [samples, setSamples] = useState([]);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(null);

  const [q, setQ] = useState("");
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const dq = useDebouncedValue(q, 500);
  const dInc = useDebouncedValue(include, 500);
  const dExc = useDebouncedValue(exclude, 500);

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = Math.max(1, Math.ceil(recipes.length / pageSize));
  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return recipes.slice(start, start + pageSize);
  }, [recipes, page]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setError("");
      if (runtimeCache.discover && runtimeCache.showcase) {
        if (ignore) return;
        setDiscover(runtimeCache.discover);
        setSamples(runtimeCache.showcase);
        return;
      }
      try {
        const [r5, sc] = await Promise.all([randomFive(true), showcaseSamples(true)]);
        if (ignore) return;
        runtimeCache.discover = r5;
        runtimeCache.showcase = sc;
        setDiscover(r5);
        setSamples(sc);
      } catch {
        if (!ignore) setError("Could not load initial data. Try again later.");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!dq && !dInc && !dExc) {
      setRecipes([]);
      setPage(1);
      return;
    }
    runSearch(dq, dInc, dExc);
  }, [dq, dInc, dExc]);

  async function runSearch(qv = q, incv = include, excv = exclude) {
    setLoading(true);
    setError("");
    setPage(1);
    try {
      const includeTokens = incv
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const excludeTokens = excv
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const words = qv.trim().split(/\s+/).filter(Boolean);
      const nameTerms = [
        ...(qv.trim() ? [qv.trim()] : []),
        ...words.slice(0, 3), // не больше 3 слов
      ];

      const nameChunks = await Promise.all(
        nameTerms.map((t) => fetchByName(t))
      );
      let pool = nameChunks.flat();

      const extraChunks = await Promise.all(
        includeTokens.map((t) => fetchByIngredient(t, 18))
      );
      pool = pool.concat(extraChunks.flat());

      const byId = new Map();
      for (const r of pool) byId.set(r.id, r);
      let list = Array.from(byId.values());

      if (excludeTokens.length) {
        list = list.filter((r) => {
          const ingStr = (r.ingredients || []).join(" ").toLowerCase();
          return !excludeTokens.some((t) => ingStr.includes(t));
        });
      }

      const scored = list.map((r) => {
        const ing = (r.ingredients || []).join(" ").toLowerCase();
        const score = includeTokens.reduce(
          (acc, t) => acc + (ing.includes(t) ? 1 : 0),
          0
        );
        return { r, score };
      });
      scored.sort((a, b) => b.score - a.score);

      setRecipes(scored.map((s) => s.r));
    } catch {
      setError("Search failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  async function fillRandom() {
    setLoading(true);
    setError("");
    try {
      setRecipes(await randomFive(true));
    } catch {
      setError("Could not load random recipes.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setQ("");
    setInclude("");
    setExclude("");
    setRecipes([]);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-app text-app">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-10" aria-live="polite">
        {/* Discover */}
        <h2 className="mt-20 mb-3 font-semibold text-lg">Discover today</h2>
        {!discover.length && !error && (
          <div className="grid xs:grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
        {!!discover.length && (
          <div className="grid xs:grid-cols-2 md:grid-cols-5 gap-4" role="list">
            {discover.map((r, i) => (
              <RecipeCard
                key={`${r.id}-${i}`}
                recipe={r}
                onOpen={setOpen}
                idx={i}
                noAnim
              />
            ))}
          </div>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        {/* Filters */}
        <section className="card mt-8" aria-label="Search filters">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted" htmlFor="f-q">
                Search in title
              </label>
              <input
                id="f-q"
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="pasta, chicken…"
              />
            </div>
            <div>
              <label className="text-sm text-muted" htmlFor="f-inc">
                Include ingredients
              </label>
              <input
                id="f-inc"
                className="input"
                value={include}
                onChange={(e) => setInclude(e.target.value)}
                placeholder="tomato, basil"
              />
            </div>
            <div>
              <label className="text-sm text-muted" htmlFor="f-exc">
                Exclude ingredients
              </label>
              <input
                id="f-exc"
                className="input"
                value={exclude}
                onChange={(e) => setExclude(e.target.value)}
                placeholder="nuts, gluten"
              />
            </div>
          </div>

          <div className="filters-actions">
            <button
              className="btn-primary btn-press"
              onClick={() => runSearch()}
              disabled={loading}
            >
              {loading ? "Searching…" : "Apply"}
            </button>
            <button className="btn-secondary btn-press" onClick={reset}>
              Reset
            </button>
          </div>
        </section>

        {loading && (
          <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-5 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && recipes.length > 0 && (
          <>
            <h3 className="mt-8 mb-3 font-semibold">Results</h3>
            <div className="grid xs:grid-cols-2 md:grid-cols-3 gap-5" role="list">
              {slice.map((r, i) => (
                <RecipeCard key={`${r.id}-${i}`} recipe={r} onOpen={setOpen} idx={i} />
              ))}
            </div>
            {recipes.length > pageSize && (
              <Pagination page={page} total={total} onChange={setPage} />
            )}
          </>
        )}

        {!loading && recipes.length === 0 && !!samples.length && (
          <>
            <h3 className="mt-8 mb-3 font-semibold">Popular categories</h3>
            <div className="grid xs:grid-cols-2 md:grid-cols-5 gap-4">
              {samples.map((r, i) => (
                <RecipeCard
                  key={`${r.group || "g"}-${r.id}-${i}`}
                  recipe={r}
                  onOpen={setOpen}
                  idx={i}
                />
              ))}
            </div>
          </>
        )}

        {!loading && recipes.length === 0 && (dq || dInc || dExc) && (
          <div className="card mt-6">
            <p className="mb-3">
              Nothing found for your filters. The API sometimes returns empty lists.
            </p>
            <button className="btn-accent btn-press" onClick={fillRandom}>
              Show 5 random
            </button>
          </div>
        )}
      </main>

      {open && <RecipeModal recipe={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
