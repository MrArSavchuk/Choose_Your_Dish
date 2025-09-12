import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const Ctx = createContext(null);

export function FavoritesProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const raw = localStorage.getItem("favorites");
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(items));
    }, [items]);

    const getId = (r) => r?.idMeal || r?.id || r?.slug || r?.title;

    const isFavorite = (r) => {
        const id = typeof r === "string" ? r : getId(r);
        return items.some((x) => getId(x) === id);
    };

    const toggleFavorite = (r) => {
        const id = getId(r);
        setItems((prev) =>
            prev.some((x) => getId(x) === id)
                ? prev.filter((x) => getId(x) !== id)
                : [...prev, r]
        );
    };

    const clear = () => setItems([]);

    const value = useMemo(() => ({ items, isFavorite, toggleFavorite, clear }), [items]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFavorites() {
    return useContext(Ctx);
}
