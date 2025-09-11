import React, { useEffect, useMemo, useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";

/* --------------------------- helpers & API --------------------------- */

const API = "https://www.themealdb.com/api/json/v1/1";

/** Нормализация ответа MealDB -> внутренняя карточка */
function normalize(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const mea = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const line = [ing.trim(), (mea || "").trim()].filter(Boolean).join(" ");
      ingredients.push(line);
    }
  }
  const instructions = (meal.strInstructions || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const tags = (meal.strTags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    ingredients,
    instructions,
    tags,
    source: meal.strSource,
    youtube: meal.strYoutube,
    mealUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
  };
}

/** запрос по названию; если q пустая, вернет [] */
async function searchByTitle(q) {
  if (!q) return [];
  const res = await fetch(`${API}/search.php?s=${encodeURIComponent(q)}`);
  const json = await res.json();
  const meals = json?.meals || [];
  return meals.map(normalize);
}

/** случайный рецепт */
async function getRandomOne() {
  const res = await fetch(`${API}/random.php`);
  const json = await res.json();
  const meal = json?.meals?.[0];
  return meal ? normalize(meal) : null;
}

/** одна карточка для «категории» — берём поиск по слову-синониму */
async function oneBySeed(seed) {
  const res = await fetch(`${API}/search.php?s=${encodeURIComponent(seed)}`);
  const json = await res.json();
  const meal = json?.meals?.[0];
  return meal ? normalize(meal) : null;
}

/** фильтрация по include/exclude (через client-side фильтр) */
function filterByTokens(list, includeTokens, excludeTokens) {
  const inc = includeTokens
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const exc = excludeTokens
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (inc.length === 0 && exc.length === 0) return list;

  const inStr = (s) => (s || "").toLowerCase();

  return list.filter((r) => {
    const hay = [r.title, ...(r.ingredients || [])].join(" ").toLowerCase();
    const okInc = inc.length ? inc.every((t) => hay.includes(t)) : true;
    const okExc = exc.length ? exc.every((t) => !hay.includes(t)) : true;
    return okInc && okExc;
  });
}

/** шифр-шарфл 🤍 */
function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ------------------------------- page ------------------------------- */

export default function Home() {
  // Discover today (5)
  const [discover, setDiscover] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // Popular categories (пока нет поиска)
  const seeds = useMemo(
    () => ["salad", "beef", "pasta", "yogurt", "breakfast"],
    []
  );
  const [popular, setPopular] = useState([]);
  const [popularLoading, setPopularLoading] = useState(false);

  // Search
  const [title, setTitle] = useState("");
  const [include, setInclude] = useState("tomato, basil");
  const [exclude, setExclude] = useState("nuts, gluten");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Modal
  const [active, setActive] = useState(null);

  /* ---- Discover (5 random) c кэшем на сессию ---- */
  useEffect(() => {
    let alive = true;

    async function loadDiscover() {
      setDiscoverLoading(true);
      try {
        const cached = sessionStorage.getItem("cyd:random5");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (alive) setDiscover(parsed);
          return;
        }
        // параллельно 5 случайных
        const tasks = Array.from({ length: 5 }, () => getRandomOne());
        const ready = (await Promise.all(tasks)).filter(Boolean);
        if (alive) {
          setDiscover(ready);
          sessionStorage.setItem("cyd:random5", JSON.stringify(ready));
        }
      } finally {
        alive && setDiscoverLoading(false);
      }
    }

    loadDiscover();
    return () => {
      alive = false;
    };
  }, []);

  /* ---- Popular seeds (по одному рецепту на «категорию») ---- */
  useEffect(() => {
    let alive = true;
    async function loadPopular() {
      setPopularLoading(true);
      try {
        const tasks = seeds.map((s) => oneBySeed(s));
        const r = (await Promise.all(tasks)).filter(Boolean);
        if (alive) setPopular(r);
      } finally {
        alive && setPopularLoading(false);
      }
    }
    loadPopular();
    return () => {
      alive = false;
    };
  }, [seeds]);

  /* ---- Поиск ---- */
  async function onApply(e) {
    e?.preventDefault?.();
    setSearching(true);
    try {
      const base = await searchByTitle(title || include.split(",")[0] || "");
      const filtered = filterByTokens(base, include, exclude);
      setResults(shuffle(filtered).slice(0, 10));
    } finally {
      setSearching(false);
    }
  }

  function onReset() {
    setTitle("");
    setInclude("");
    setExclude("");
    setResults([]);
  }

  const showPopular = results.length === 0;

  return (
    <div className="page home">
      {/* Discover today */}
      <section className="section">
        <h2 className="section-title-xl">Discover today</h2>

        <div className="grid grid-cards">
          {(discoverLoading ? Array.from({ length: 5 }) : discover).map(
            (r, i) =>
              r ? (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onOpen={setActive}
                  idx={i}
                  noAnim
                />
              ) : (
                <div key={i} className="card skeleton recipe-card">
                  <div className="img-skeleton" />
                  <div className="skeleton-line w-80" />
                  <div className="skeleton-line w-60" />
                  <div className="card-actions">
                    <span className="btn-ghost disabled" />
                    <span className="btn-ghost disabled" />
                  </div>
                </div>
              )
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="section mt-24">
        <form className="filter-bar" onSubmit={onApply}>
          <div className="field">
            <label>Search in title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pasta, chicken..."
            />
          </div>

          <div className="field">
            <label>Include ingredients</label>
            <input
              value={include}
              onChange={(e) => setInclude(e.target.value)}
              placeholder="tomato, basil"
            />
          </div>

          <div className="field">
            <label>Exclude ingredients</label>
            <input
              value={exclude}
              onChange={(e) => setExclude(e.target.value)}
              placeholder="nuts, gluten"
            />
          </div>

          <div className="actions">
            <button className="btn-primary btn-press" type="submit" disabled={searching}>
              {searching ? "Loading…" : "Apply"}
            </button>
            <button
              className="btn-ghost btn-press outline"
              type="button"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section className="section">
          <h3 className="section-title">Results</h3>
          <div className="grid grid-cards">
            {results.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} onOpen={setActive} idx={i} />
            ))}
          </div>
        </section>
      )}

      {/* Popular categories (прячем при поиске) */}
      {showPopular && (
        <section className="section mt-24">
          <h3 className="section-title">Popular categories</h3>
          <div className="grid grid-cards">
            {(popularLoading ? Array.from({ length: seeds.length }) : popular).map(
              (r, i) =>
                r ? (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    onOpen={setActive}
                    idx={i}
                  />
                ) : (
                  <div key={i} className="card skeleton recipe-card">
                    <div className="img-skeleton" />
                    <div className="skeleton-line w-80" />
                    <div className="skeleton-line w-60" />
                    <div className="card-actions">
                      <span className="btn-ghost disabled" />
                      <span className="btn-ghost disabled" />
                    </div>
                  </div>
                )
            )}
          </div>
        </section>
      )}

      {/* Modal */}
      {active && <RecipeModal recipe={active} onClose={() => setActive(null)} />}
    </div>
  );
}
