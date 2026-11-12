"use client";

import { useEffect, useState } from "react";
import { artwork, getEvolutionStages, getPokemon, getSpecies, prettyName, STAT_LABELS } from "@/lib/pokeapi";
import { defenseProfile, genOf, GENERATIONS, typeColor } from "@/lib/types";
import { useFavorites } from "@/lib/storage";
import StatsChart from "./StatsChart";
import TypeBadge from "./TypeBadge";
import PokeBall from "./PokeBall";

const STAT_KEYS = ["hp", "attack", "defense", "spAtk", "spDef", "speed"];
const TABS = [
  { id: "stats", label: "Stats" },
  { id: "evo", label: "Evolution" },
  { id: "match", label: "Matchups" },
];

/** Full-screen Pokédex entry. Mount it with an `id`; unmount (onClose) to dismiss. */
export default function PokemonModal({ id, onClose, onSelect }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Pokémon details"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-body">
        <ModalContent key={id} id={id} onClose={onClose} onSelect={onSelect} />
      </div>
    </div>
  );
}

function ModalContent({ id, onClose, onSelect }) {
  const [state, setState] = useState({ status: "loading" });
  const [tab, setTab] = useState("stats");
  const [shiny, setShiny] = useState(false);
  const [entry, setEntry] = useState(0);
  const { favs, toggle } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pokemon = await getPokemon(id);
        const species = await getSpecies(id);
        const stages = await getEvolutionStages(species.evolutionUrl).catch(() => []);
        if (!cancelled) setState({ status: "ready", pokemon, species, stages });
      } catch (e) {
        if (!cancelled) setState({ status: "error", message: e.message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status !== "ready") {
    return (
      <div className="panel p-8 text-center">
        {state.status === "loading" ? (
          <>
            <PokeBall size={56} className="mx-auto animate-spin-slow" />
            <p className="mt-3 font-semibold">Loading Pokédex entry…</p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">Couldn’t reach the Pokédex 😢</p>
            <p className="mt-1 text-sm text-poke-ink/60">{state.message}</p>
          </>
        )}
        <button className="btn btn-white mt-4" onClick={onClose}>Close</button>
      </div>
    );
  }

  const { pokemon, species, stages } = state;
  const color = typeColor(pokemon.types[0]);
  const isFav = favs.includes(id);
  const flavor = species.flavors.length ? species.flavors[entry % species.flavors.length] : "No Pokédex entry available.";
  const gen = GENERATIONS.find((g) => g.id === genOf(id));

  const playCry = () => {
    if (!pokemon.cry) return;
    const a = new Audio(pokemon.cry);
    a.volume = 0.5;
    a.play().catch(() => {});
  };

  return (
    <div className="panel overflow-hidden">
      {/* banner */}
      <div
        className="relative px-5 pb-4 pt-5"
        style={{ background: `linear-gradient(160deg, ${color}, color-mix(in srgb, ${color} 50%, #fff))` }}
      >
        <button
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border-[3px] border-poke-ink bg-white text-lg font-bold shadow-[0_3px_0_#1b1b1f] hover:bg-poke-yellow"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <div className="relative grid h-52 w-52 shrink-0 place-items-center rounded-full border-[3px] border-poke-ink bg-white/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artwork(id, shiny)} alt={prettyName(pokemon.name)} className="animate-float h-44 w-44 object-contain drop-shadow-xl" />
            <div className="absolute -bottom-2 flex gap-2">
              <button
                className={`btn !px-3 !py-1 text-sm ${shiny ? "btn-yellow" : "btn-white"}`}
                aria-pressed={shiny}
                onClick={() => setShiny((s) => !s)}
              >
                ✨ Shiny
              </button>
              <button className="btn btn-white !px-3 !py-1 text-sm" onClick={playCry} disabled={!pokemon.cry} aria-label="Play cry">
                🔊 Cry
              </button>
            </div>
          </div>

          <div className="flex-1 text-center sm:pb-3 sm:text-left">
            <div className="font-pixel text-[0.65rem] text-poke-ink/70">
              No.{String(id).padStart(4, "0")} · Gen {gen.id} · {gen.region}
            </div>
            <h2 className="text-4xl font-bold leading-tight text-poke-ink [text-shadow:0_2px_0_rgba(255,255,255,0.5)]">
              {prettyName(pokemon.name)}
            </h2>
            <div className="text-sm font-semibold text-poke-ink/75">{species.genus}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              {pokemon.types.map((t) => <TypeBadge key={t} type={t} className="!text-sm" />)}
              {species.isLegendary && <span className="type-badge bg-poke-yellow !text-sm">★ Legendary</span>}
              {species.isMythical && <span className="type-badge bg-poke-red !text-sm text-white">✦ Mythical</span>}
              {species.isBaby && <span className="type-badge bg-white !text-sm">🍼 Baby</span>}
            </div>
            <button
              className={`btn mt-3 !py-1 text-sm ${isFav ? "btn-red" : "btn-white"}`}
              aria-pressed={isFav}
              onClick={() => toggle(id)}
            >
              {isFav ? "❤️ In favorites" : "🤍 Add to favorites"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* dex entry */}
        <div className="dialogue">
          <p className="text-[1.02rem] leading-relaxed">{flavor}</p>
          {species.flavors.length > 1 && (
            <button className="mt-1 text-sm font-bold text-poke-blue underline" onClick={() => setEntry((n) => n + 1)}>
              ▶ Another entry ({(entry % species.flavors.length) + 1}/{species.flavors.length})
            </button>
          )}
        </div>

        {/* quick facts */}
        <dl className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <Fact label="Height" value={`${pokemon.height} m`} />
          <Fact label="Weight" value={`${pokemon.weight} kg`} />
          <Fact label="Base EXP" value={pokemon.baseExp ?? "—"} />
          <Fact label="Habitat" value={species.habitat ? prettyName(species.habitat) : "Unknown"} />
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">Abilities:</span>
          {pokemon.abilities.map((a) => (
            <span key={a.name} className={`chip !cursor-default ${a.hidden ? "!bg-poke-ink !text-white" : ""}`}>
              {prettyName(a.name)}
              {a.hidden && <span className="text-[0.65rem] opacity-70">hidden</span>}
            </span>
          ))}
        </div>

        {/* tabs */}
        <div role="tablist" className="flex gap-2 border-b-[3px] border-poke-ink pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border-[3px] border-poke-ink px-4 py-1 text-sm font-bold ${
                tab === t.id ? "bg-poke-blue text-white" : "bg-white hover:bg-poke-yellow/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "stats" && (
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-2.5">
              {STAT_KEYS.map((k) => {
                const v = pokemon.stats[k];
                return (
                  <div key={k} className="grid grid-cols-[4.5rem_2.2rem_1fr] items-center gap-2 text-sm">
                    <span className="font-bold text-poke-ink/70">{STAT_LABELS[k]}</span>
                    <span className="text-right font-bold">{v}</span>
                    <div className="stat-bar">
                      <span style={{ width: `${Math.min(100, (v / 160) * 100)}%`, background: statColor(v) }} />
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-[4.5rem_2.2rem_1fr] items-center gap-2 border-t-2 border-dashed border-poke-ink/30 pt-2 text-sm">
                <span className="font-bold">Total</span>
                <span className="text-right font-bold text-poke-red">{pokemon.bst}</span>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[320px]">
              <StatsChart pokemon={pokemon} color={color === "#F7D02C" ? "#d9a900" : color} />
            </div>
          </div>
        )}

        {tab === "evo" && <Evolution stages={stages} currentId={id} onSelect={onSelect} />}
        {tab === "match" && <Matchups types={pokemon.types} />}
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-xl border-[3px] border-poke-ink bg-poke-paper px-2 py-1.5">
      <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-poke-ink/55">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

function statColor(v) {
  if (v >= 110) return "#3fae4a";
  if (v >= 80) return "#ffcb05";
  if (v >= 55) return "#ee8130";
  return "#ee1515";
}

function Evolution({ stages, currentId, onSelect }) {
  if (!stages.length || (stages.length === 1 && stages[0].length === 1)) {
    return <p className="rounded-xl bg-poke-paper p-4 text-center font-semibold">This Pokémon doesn’t evolve. 🌟</p>;
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
      {stages.map((stage, i) => (
        <div key={i} className="flex flex-col items-center gap-3 sm:flex-row">
          {i > 0 && <span className="text-2xl font-black text-poke-red sm:rotate-0" aria-hidden="true">➜</span>}
          <div className="flex max-w-[22rem] flex-wrap justify-center gap-2">
            {stage.map((p) => (
              <button
                key={p.id}
                onClick={() => p.id !== currentId && onSelect(p.id)}
                className={`flex w-24 flex-col items-center rounded-2xl border-[3px] border-poke-ink p-1.5 text-center text-xs font-bold transition hover:-translate-y-1 ${
                  p.id === currentId ? "bg-poke-yellow" : "bg-white"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artwork(p.id)} alt="" className="h-16 w-16 object-contain" loading="lazy" />
                <span className="truncate">{prettyName(p.name)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchRow({ title, items, empty }) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-bold">{title}</h4>
      <div className="flex flex-wrap gap-1.5">
        {items.length ? (
          items.map(({ type, mult }) => (
            <span key={type} className="inline-flex items-center gap-1">
              <TypeBadge type={type} />
              <span className="text-xs font-bold text-poke-ink/70">×{mult}</span>
            </span>
          ))
        ) : (
          <span className="text-sm text-poke-ink/50">{empty}</span>
        )}
      </div>
    </div>
  );
}

function Matchups({ types }) {
  const { weak, resist, immune } = defenseProfile(types);
  return (
    <div className="space-y-4">
      <MatchRow title="😱 Weak to" items={weak} empty="No weaknesses!" />
      <MatchRow title="🛡️ Resists" items={resist} empty="No resistances" />
      <MatchRow title="🚫 Immune to" items={immune} empty="No immunities" />
    </div>
  );
}
