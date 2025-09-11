const BASE = "https://www.themealdb.com/api/json/v1/1";

function extractIngredients(meal) {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      const label = [name.trim(), measure?.trim()].filter(Boolean).join(" ");
      items.push(label);
    }
  }
  return items;
}

function mapMeal(meal) {
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    source: meal.strSource || meal.strYoutube || "",
    ingredients: extractIngredients(meal)
  };
}

export async function randomRecipes(n = 5) {
  const tasks = Array.from({ length: n }, () =>
    fetch(`${BASE}/random.php`).then((r) => r.json())
  );
  const results = await Promise.all(tasks);
  const meals = results.flatMap((x) => x.meals || []);
  return meals.map(mapMeal);
}

export async function searchRecipes({ query, include = [], exclude = [], limit = 10 }) {
  const q = query?.trim() || "a";
  const data = await fetch(`${BASE}/search.php?s=${encodeURIComponent(q)}`).then((r) => r.json());
  const meals = (data.meals || []).map(mapMeal);

  const norm = (s) => s.toLowerCase();
  const inc = include.map(norm).filter(Boolean);
  const exc = exclude.map(norm).filter(Boolean);

  const filtered = meals.filter((m) => {
    const pool = m.ingredients.map(norm).join(" ");
    const okInc = inc.length ? inc.every((w) => pool.includes(w)) : true;
    const okExc = exc.length ? exc.every((w) => !pool.includes(w)) : true;
    return okInc && okExc;
  });

  return filtered.slice(0, limit);
}
