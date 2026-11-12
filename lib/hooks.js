"use client";

import { useEffect, useState } from "react";
import { getPokemon, getPokemonList, peekPokemon } from "./pokeapi";

/** Loads the full id+name list once (cached across pages). */
export function usePokemonList() {
  const [state, setState] = useState({ list: null, error: null, attempt: 0 });

  useEffect(() => {
    let cancelled = false;
    getPokemonList()
      .then((list) => !cancelled && setState((s) => ({ ...s, list, error: null })))
      .catch((e) => !cancelled && setState((s) => ({ ...s, error: e.message || "Network error" })));
    return () => {
      cancelled = true;
    };
  }, [state.attempt]);

  return {
    list: state.list,
    error: state.error,
    retry: () => setState({ list: null, error: null, attempt: state.attempt + 1 }),
  };
}

/**
 * Lazily loads full details for a list of ids. Returns a getter `(id) => details | undefined`.
 * Loaded data is kept in state so React re-renders (and the React Compiler re-evaluates) when it arrives.
 */
export function usePokemonDetails(ids) {
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(ids.map((id) => getPokemon(id))).then((results) => {
      if (cancelled) return;
      setLoaded((prev) => {
        const next = { ...prev };
        for (const r of results) if (r.status === "fulfilled") next[r.value.id] = r.value;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (id) => loaded[id] ?? peekPokemon(id);
}
