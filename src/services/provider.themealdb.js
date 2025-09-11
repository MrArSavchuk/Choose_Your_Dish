const API = "https://www.themealdb.com/api/json/v1/1";

const mapMeal = (m) => {
  if (!m) return null;
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = m[`strIngredient${i}`];
    const measure = m[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const line = [ing.trim(), measure ? measure.trim() : ""].filter(Boolean).join(" ");
      ingredients.push(line);
    }
  }
  const instructions = (m.strInstructions || "").split(/\r?\n+/).filter(Boolean);
  return {
    id: m.idMeal,
    title: m.strMeal,
    image: m.strMealThumb,
    source: m.strSource || "",
    href: `${API.replace("/api/json/v1/1", "")}/meal.php?c=${m.idMeal}`,
    ingredients,
    instructions,
  };
};

export async function fetchRandomSet(n = 5) {
  const arr = [];
  const seen = new Set();
  while (arr.length < n) {
    const res = await fetch(`${API}/random.php`).then((r) => r.json());
    const meal = mapMeal(res.meals?.[0]);
    if (meal && !seen.has(meal.id)) {
      arr.push(meal);
      seen.add(meal.id);
    }
  }
  return arr;
}

export async function fetchOneFromCategory(category) {
  try {
    const res = await fetch(`${API}/filter.php?c=${encodeURIComponent(category)}`).then((r) => r.json());
    const list = res.meals || [];
    if (!list.length) return null;
    const pick = list[Math.floor(Math.random() * list.length)];
    const det = await fetch(`${API}/lookup.php?i=${pick.idMeal}`).then((r) => r.json());
    return mapMeal(det.meals?.[0]);
  } catch {
    return null;
  }
}

const normalize = (s) => s.toLowerCase();

export async function searchRecipes({ query, include = [], exclude = [], limit = 10 }) {
  if (!query) return [];
  try {
    const res = await fetch(`${API}/search.php?s=${encodeURIComponent(query)}`).then((r) => r.json());
    let meals = (res.meals || []).map(mapMeal).filter(Boolean);

    if (include.length) {
      const inc = include.map(normalize);
      meals = meals.filter((m) =>
        inc.every((x) => m.ingredients.some((line) => line.toLowerCase().includes(x)))
      );
    }

    if (exclude.length) {
      const exc = exclude.map(normalize);
      meals = meals.filter(
        (m) => !exc.some((x) => m.ingredients.some((line) => line.toLowerCase().includes(x)))
      );
    }

    return meals.slice(0, limit);
  } catch {
    return [];
  }
}
