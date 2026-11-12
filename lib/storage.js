"use client";

// localStorage-backed state that is hydration-safe (server snapshot is always "empty").

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set();

function subscribe(cb) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useLocalStorage(key, initial) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null
  );

  const value = useMemo(() => {
    if (raw == null) return initial;
    try {
      return JSON.parse(raw);
    } catch {
      return initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next) => {
      const current = (() => {
        const r = readRaw(key);
        if (r == null) return initial;
        try { return JSON.parse(r); } catch { return initial; }
      })();
      const resolved = typeof next === "function" ? next(current) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* storage full or blocked – ignore */
      }
      listeners.forEach((l) => l());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, set];
}

// ---------- app-specific stores ----------

const EMPTY_LIST = [];
export function useFavorites() {
  const [favs, setFavs] = useLocalStorage("pokedemo:favorites", EMPTY_LIST);
  const toggle = useCallback(
    (id) => setFavs((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])),
    [setFavs]
  );
  return { favs, toggle };
}

const EMPTY_COLLECTION = { owned: {}, packs: 0 };
export function useCollection() {
  const [collection, setCollection] = useLocalStorage("pokedemo:collection", EMPTY_COLLECTION);
  const addCards = useCallback(
    (cards) =>
      setCollection((cur) => {
        const owned = { ...cur.owned };
        for (const c of cards) {
          const prev = owned[c.id] ?? { count: 0, shiny: false };
          owned[c.id] = { count: prev.count + 1, shiny: prev.shiny || c.shiny };
        }
        return { owned, packs: (cur.packs ?? 0) + 1 };
      }),
    [setCollection]
  );
  const reset = useCallback(() => setCollection(EMPTY_COLLECTION), [setCollection]);
  return { collection, addCards, reset };
}
