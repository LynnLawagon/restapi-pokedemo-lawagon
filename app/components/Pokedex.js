"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTypeMembers } from "@/lib/pokeapi";
import { GENERATIONS, TYPES, genOf, typeColor, textOn } from "@/lib/types";
import { usePokemonDetails, usePokemonList } from "@/lib/hooks";
import { useFavorites } from "@/lib/storage";
import Search from "./Search";
import PokemonCard from "./PokemonCard";
import PokemonModal from "./PokemonModal";
import PokeBall from "./PokeBall";

const PAGE = 24;

const MODES = [
  { href: "/showdown", icon: "⚔️", title: "Showdown", text: "Pick two Pokémon and battle it out turn by turn.", bg: "bg-poke-red text-white" },
  { href: "/quiz", icon: "❓", title: "Who’s That Pokémon?", text: "Guess from the silhouette. Build a streak!", bg: "bg-poke-yellow" },
  { href: "/packs", icon: "🎴", title: "Card Packs", text: "Rip open booster packs and fill your binder.", bg: "bg-poke-blue text-white" },
  { href: "/facts", icon: "💡", title: "Facts & Types", text: "Pokémon of the Day, trivia and a type-matchup lab.", bg: "bg-white" },
];

export default function Pokedex() {
  const { list, error, retry } = usePokemonList();
  const { favs, toggle } = useFavorites();

  const [query, setQuery] = useState("");
  const [gen, setGen] = useState("all");
  const [type, setType] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [count, setCount] = useState(PAGE);
  const [openId, setOpenId] = useState(null);
  const [typeMembers, setTypeMembers] = useState({ type: null, ids: null, error: false });

  // load the members of the selected type
  useEffect(() => {
    if (type === "all") return;
    let cancelled = false;
    getTypeMembers(type)
      .then((ids) => !cancelled && setTypeMembers({ type, ids, error: false }))
      .catch(() => !cancelled && setTypeMembers({ type, ids: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [type]);

  const typeReady = type === "all" || typeMembers.type === type;
  const typeSet = type !== "all" && typeMembers.type === type ? typeMembers.ids : null;

  const filtered = useMemo(() => {
    if (!list) return [];
    const q = query.trim().toLowerCase().replace(/\s+/g, "-").replace(/^#/, "");
    return list.filter(
      (p) =>
        (gen === "all" || genOf(p.id) === Number(gen)) &&
        (!typeSet || typeSet.has(p.id)) &&
        (!favOnly || favs.includes(p.id)) &&
        (!q || p.name.includes(q) || String(p.id) === q)
    );
  }, [list, query, gen, typeSet, favOnly, favs]);

  const visible = useMemo(() => filtered.slice(0, count), [filtered, count]);
  const visibleIds = useMemo(() => visible.map((p) => p.id), [visible]);
  const peek = usePokemonDetails(visibleIds);

  const reset = (setter) => (v) => {
    setter(v);
    setCount(PAGE);
  };

  return (
    <div className="space-y-6">
      {/* hero */}
      <section className="panel relative overflow-hidden bg-poke-red p-5 text-white sm:p-7">
        <PokeBall size={260} className="pointer-events-none absolute -right-10 -top-12 opacity-20" />
        <div className="relative">
          <div className="font-pixel text-[0.65rem] text-poke-yellow [text-shadow:2px_2px_0_#1b1b1f]">NATIONAL POKÉDEX</div>
          <h1 className="mt-1 text-4xl font-bold leading-none [text-shadow:3px_3px_0_#1b1b1f] sm:text-5xl">
            Gotta browse ’em all!
          </h1>
          <p className="mt-2 max-w-xl font-medium text-white/90">
            Tap a card to open its Pokédex entry — then jump into a battle, test your knowledge or crack open some packs.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Game modes">
        {MODES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`panel group p-4 transition hover:-translate-y-1 hover:shadow-[0_9px_0_#1b1b1f] ${m.bg}`}
          >
            <div className="text-3xl transition group-hover:animate-wiggle">{m.icon}</div>
            <div className="mt-1 text-lg font-bold">{m.title}</div>
            <p className="text-sm opacity-85">{m.text}</p>
          </Link>
        ))}
      </section>

      {/* controls */}
      <section className="space-y-3" aria-label="Filters">
        <Search value={query} onChange={reset(setQuery)} />

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Generation">
          <button className="chip" aria-pressed={gen === "all"} onClick={() => reset(setGen)("all")}>All gens</button>
          {GENERATIONS.map((g) => (
            <button key={g.id} className="chip" aria-pressed={gen === String(g.id)} onClick={() => reset(setGen)(String(g.id))}>
              {g.id} · {g.region}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Type">
          <button className="chip" aria-pressed={type === "all"} onClick={() => reset(setType)("all")}>All types</button>
          {TYPES.map((t) => (
            <button
              key={t}
              className="chip capitalize"
              aria-pressed={type === t}
              onClick={() => reset(setType)(type === t ? "all" : t)}
              style={type === t ? { background: typeColor(t), color: textOn(typeColor(t)) } : { borderColor: typeColor(t) }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button className="chip" aria-pressed={favOnly} onClick={() => reset(setFavOnly)(!favOnly)}>
            ❤️ Favorites only ({favs.length})
          </button>
          <span className="text-sm font-semibold text-poke-ink/60" aria-live="polite">
            {list ? `${filtered.length} Pokémon` : ""}
          </span>
        </div>
      </section>

      {/* results */}
      {error ? (
        <div className="panel mx-auto max-w-lg p-6 text-center">
          <div className="text-4xl">📡</div>
          <p className="mt-2 text-lg font-bold">Couldn’t reach PokéAPI</p>
          <p className="text-sm text-poke-ink/60">{error}. Check your connection and try again.</p>
          <button className="btn btn-red mt-4" onClick={retry}>Try again</button>
        </div>
      ) : !list || !typeReady ? (
        typeMembers.error && type !== "all" ? (
          <p className="panel p-6 text-center font-semibold">Couldn’t load that type — try another one.</p>
        ) : (
          <Grid>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="skeleton h-80 rounded-[18px] border-[3px] border-poke-ink" />
            ))}
          </Grid>
        )
      ) : filtered.length === 0 ? (
        <div className="panel mx-auto max-w-md p-8 text-center">
          <div className="text-5xl">🫥</div>
          <p className="mt-2 text-lg font-bold">No Pokémon found</p>
          <p className="text-sm text-poke-ink/60">Try a different name, type or generation.</p>
        </div>
      ) : (
        <>
          <Grid>
            {visible.map((p) => (
              <PokemonCard
                key={p.id}
                id={p.id}
                name={p.name}
                detail={peek(p.id)}
                isFav={favs.includes(p.id)}
                onToggleFav={toggle}
                onOpen={setOpenId}
              />
            ))}
          </Grid>
          {visible.length < filtered.length && (
            <div className="text-center">
              <button className="btn btn-blue" onClick={() => setCount((c) => c + PAGE)}>
                Load more ({filtered.length - visible.length} left)
              </button>
            </div>
          )}
        </>
      )}

      {openId && <PokemonModal id={openId} onClose={() => setOpenId(null)} onSelect={setOpenId} />}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}
