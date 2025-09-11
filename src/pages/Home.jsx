import { useEffect, useMemo, useState } from "react";
import Filters from "../components/Filters.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import RecipeModal from "../components/RecipeModal.jsx";
import {
  fetchRandomSet,
  fetchOneFromCategory,
  searchRecipes,
} from "../services/provider.themealdb.js";

const CATEGORIES = ["Beef", "Chicken", "Pasta", "Seafood", "Dessert", "Side"];

export default function Home() {
  const [discover, setDiscover] = useState(() => {
    try {
      const cached = sessionStorage.getItem("discover5");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [byCategory, setByCategory] = useState(() => {
    try {
      const cached = sessionStorage.getItem("catsBlock");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [results, setResults] = useState([]);
  const [modal, setModal] = useState({ open: false, recipe: null });

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      if (!discover.length) {
        const r = await fetchRandomSet(5);
        if (mounted) {
          setDiscover(r);
          sessionStorage.setItem("discover5", JSON.stringify(r));
        }
      }
      if (!byCategory.length) {
        const list = await Promise.all(
          CATEGORIES.map((c) => fetchOneFromCategory(c))
        );
        const filtered = list.filter(Boolean);
        if (mounted) {
          setByCategory(filtered);
          sessionStorage.setItem("catsBlock", JSON.stringify(filtered));
        }
      }
    };
    boot();
    return () => (mounted = false);
  }, []);

  const hasResults = results.length > 0;

  const onApply = async ({ q, include, exclude }) => {
    const inc = include
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const exc = exclude
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const r = await searchRecipes({ query: q.trim(), include: inc, exclude: exc, limit: 10 });
    setResults(r);
  };

  const onReset = () => setResults([]);

  const gridDiscover = useMemo(
    () => (
      <section className="container" style={{ marginTop: 20 }}>
        <h2 style={{ margin: "6px 0 12px" }}>Discover today</h2>
        <div className="grid">
          {discover.map((r) => (
            <RecipeCard key={r.id} recipe={r} onOpen={(recipe) => setModal({ open: true, recipe })} />
          ))}
        </div>
      </section>
    ),
    [discover]
  );

  const gridResults = useMemo(
    () =>
      hasResults ? (
        <section className="container" style={{ marginTop: 22 }}>
          <h2 style={{ margin: "6px 0 12px" }}>Results</h2>
          <div className="grid">
            {results.map((r) => (
              <RecipeCard key={r.id} recipe={r} onOpen={(recipe) => setModal({ open: true, recipe })} />
            ))}
          </div>
        </section>
      ) : null,
    [hasResults, results]
  );

  const gridCategories = useMemo(
    () =>
      !hasResults ? (
        <section className="container" style={{ marginTop: 28, marginBottom: 28 }}>
          <h2 style={{ margin: "6px 0 12px" }}>Popular categories</h2>
          <div className="grid">
            {byCategory.map((r) => (
              <RecipeCard key={r.id} recipe={r} onOpen={(recipe) => setModal({ open: true, recipe })} />
            ))}
          </div>
        </section>
      ) : null,
    [hasResults, byCategory]
  );

  return (
    <>
      {gridDiscover}
      <Filters onApply={onApply} onReset={onReset} />
      {gridResults}
      {gridCategories}
      <RecipeModal
        isOpen={modal.open}
        recipe={modal.recipe}
        onClose={() => setModal({ open: false, recipe: null })}
      />
    </>
  );
}
