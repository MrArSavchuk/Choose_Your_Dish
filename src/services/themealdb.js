const API = 'https://www.themealdb.com/api/json/v1/1';

export async function getMealById(id) {
  if (!id) return null;
  const res = await fetch(`${API}/lookup.php?i=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.meals && data.meals[0] ? data.meals[0] : null;
}
