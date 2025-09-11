import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import { randomRecipes, searchRecipes } from "../services/api.js";

export default function Home() {
  const [random, setRandom] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoadingRandom(true);
    randomRecipes(5)
      .then((data) => alive && setRandom(data))
      .finally(() => alive && setLoadingRandom(false));
    return () => { alive = false; };
  }, []);

  async function applyFilters(payload) {
    setLoadingSearch(true);
    const data = await searchRecipes({ ...payload, limit: 10 });
    setResults(data);
    setLoadingSearch(false);
  }
  function resetFilters() { setResults([]); }

  const showRandom = useMemo(() => results.length === 0, [results]);

  return (
    <section>
      <h1>Discover today</h1>

      <div className="grid grid-5">
        {loadingRandom
          ? Array.from({length:5}).map((_,i)=><div key={i} className="card skeleton" style={{height:250}}/>)
          : random.map((r)=> <RecipeCard key={r.id} recipe={r} />)}
      </div>

      <Filters onApply={applyFilters} onReset={resetFilters} />

      {loadingSearch && <div style={{opacity:.7, marginTop:12}}>Loading results…</div>}

      {!loadingSearch && results.length>0 && (
        <>
          <h2>Results</h2>
          <div className="grid grid-4">
            {results.map((r)=> <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </>
      )}

      {showRandom && (
        <>
          <h2>Popular categories</h2>
          <div className="grid grid-5">
            {random.map((r)=> <RecipeCard key={`pop-${r.id}`} recipe={r} />)}
          </div>
        </>
      )}
    </section>
  );
}
