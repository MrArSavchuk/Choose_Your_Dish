const BASE = "https://www.themealdb.com/api/json/v1/1";

export async function getMealById(id) {
  if (!id) return null;
  const r = await fetch(`${BASE}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!r.ok) return null;
  const j = await r.json();
  return j?.meals?.[0] || null;
}

export async function randomMeals(n = 5) {
  const tasks = Array.from({ length: n }, () =>
    fetch(`${BASE}/random.php`).then((r) => r.json())
  );
  const res = await Promise.all(tasks);
  return res.flatMap((x) => x.meals || []);
}

async function searchByName(q) {
  const r = await fetch(`${BASE}/search.php?s=${encodeURIComponent(q || "")}`);
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j.meals) ? j.meals : [];
}

async function filterBySingleIngredient(ing) {
  const r = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(ing)}`);
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j.meals) ? j.meals : [];
}

function intersectById(a, b) {
  const set = new Set(b.map((m) => m.idMeal));
  return a.filter((m) => set.has(m.idMeal));
}

function getIngredientsText(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && String(ing).trim()) list.push(`${ing} ${meas || ""}`.trim());
  }
  return list.join(" ").toLowerCase();
}

export async function searchRecipes({ query = "", include = [], exclude = [], limit = 10 }) {
  const nameMeals = query ? await searchByName(query) : [];
  let incPool = [];

  const inc = include.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean);
  const exc = exclude.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean);

  if (inc.length) {
    let pool = null;
    for (const token of inc) {
      const part = await filterBySingleIngredient(token);
      pool = pool === null ? part : intersectById(pool, part);
      if (!pool?.length) break;
    }
    incPool = pool || [];
  }

  let base = nameMeals;
  if (!query && incPool.length) {
    const ids = incPool.map((m) => m.idMeal).slice(0, 24);
    const full = await Promise.all(ids.map((id) => getMealById(id)));
    base = full.filter(Boolean);
  } else if (query && incPool.length) {
    const allowed = new Set(incPool.map((m) => m.idMeal));
    base = nameMeals.filter((m) => allowed.has(m.idMeal));
  }

  if (exc.length) {
    base = base.filter((meal) => {
      const hay = getIngredientsText(meal);
      return !exc.some((bad) => hay.includes(bad));
    });
  }

  return base.slice(0, limit);
}
