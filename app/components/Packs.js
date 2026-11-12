"use client";

import { useMemo, useState } from "react";
import { artwork, prettyName } from "@/lib/pokeapi";
import { openPack } from "@/lib/cards";
import { GENERATIONS, MAX_ID } from "@/lib/types";
import { usePokemonList } from "@/lib/hooks";
import { useCollection } from "@/lib/storage";
import PokemonCard from "./PokemonCard";
import PokemonModal from "./PokemonModal";

export default function Packs() {
  const [tab, setTab] = useState("open");
  const { collection } = useCollection();
  const ownedCount = Object.keys(collection.owned).length;

  return (
    <div className="space-y-6">
      <section className="panel flex flex-wrap items-center justify-between gap-4 bg-poke-blue p-5 text-white">
        <div>
          <div className="font-pixel text-[0.65rem] text-poke-yellow">TRADING CARDS</div>
          <h1 className="text-4xl font-bold [text-shadow:3px_3px_0_#1b1b1f]">Card Packs &amp; Binder</h1>
        </div>
        <div className="flex gap-2 text-center text-poke-ink">
          <Stat k="Packs opened" v={collection.packs ?? 0} />
          <Stat k="Collected" v={`${ownedCount}/${MAX_ID}`} />
        </div>
      </section>

      <div role="tablist" className="flex gap-2">
        {[["open", "🎴 Open packs"], ["binder", "📘 My binder"]].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`rounded-full border-[3px] border-poke-ink px-5 py-1.5 font-bold shadow-[0_3px_0_#1b1b1f] ${tab === id ? "bg-poke-yellow" : "bg-white hover:bg-poke-yellow/50"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "open" ? <PackOpener /> : <Binder />}
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div className="min-w-24 rounded-xl border-[3px] border-poke-ink bg-white px-3 py-1">
      <div className="text-[0.6rem] font-bold uppercase text-poke-ink/55">{k}</div>
      <div className="text-xl font-bold leading-tight">{v}</div>
    </div>
  );
}

function PackOpener() {
  const { addCards } = useCollection();
  const [phase, setPhase] = useState("idle"); // idle | shaking | reveal
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  async function open() {
    if (phase === "shaking") return;
    setPhase("shaking");
    setError(null);
    try {
      const [pulled] = await Promise.all([openPack(), new Promise((r) => setTimeout(r, 900))]);
      addCards(pulled);
      setCards(pulled);
      setFlipped([]);
      setPhase("reveal");
    } catch (e) {
      setError(e.message || "Couldn’t open the pack");
      setPhase("idle");
    }
  }

  const flip = (i) => setFlipped((f) => (f.includes(i) ? f : [...f, i]));
  const allFlipped = cards.length > 0 && flipped.length === cards.length;
  const best = cards.length ? cards[cards.length - 1] : null;

  return (
    <section className="space-y-6">
      {phase !== "reveal" ? (
        <div className="flex flex-col items-center gap-5 py-6">
          <button className={`pack ${phase === "shaking" ? "shaking" : ""}`} onClick={open} aria-label="Open booster pack" disabled={phase === "shaking"}>
            <span className="absolute inset-x-0 top-[24%] text-center font-pixel text-[0.6rem] text-white [text-shadow:2px_2px_0_#1b1b1f]">BOOSTER</span>
            <span className="absolute inset-x-0 bottom-[24%] text-center font-pixel text-[0.6rem] text-white [text-shadow:2px_2px_0_#1b1b1f]">5 CARDS</span>
          </button>
          <p className="font-semibold text-poke-ink/70">{phase === "shaking" ? "Opening…" : "Tap the pack to rip it open!"}</p>
          {error && <p className="font-semibold text-poke-red">⚠️ {error}</p>}
          <p className="max-w-md text-center text-sm text-poke-ink/55">
            Rarity depends on a Pokémon’s total base stats. Every card has a 1-in-25 chance of being ✨ Shiny. Your collection is saved in this browser.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((c, i) => (
              <div key={c.id} className="flip-scene animate-pop" style={{ animationDelay: `${i * 90}ms` }}>
                <div className={`flip-card ${flipped.includes(i) ? "is-flipped" : ""}`} onClick={() => flip(i)}>
                  <div className="flip-face card-back grid aspect-[0.68] cursor-pointer place-items-center" role="button" aria-label={`Reveal card ${i + 1}`} tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && flip(i)}>
                    <span className="font-pixel text-xs text-poke-ink/40">{i + 1}</span>
                  </div>
                  <div className="flip-face flip-front">
                    {flipped.includes(i) && (
                      <PokemonCard id={c.id} name={c.name} detail={c.detail} rarity={c.rarity} shiny={c.shiny} onOpen={setOpenId} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!allFlipped && <button className="btn btn-yellow" onClick={() => setFlipped(cards.map((_, i) => i))}>👀 Reveal all</button>}
            <button className="btn btn-red" onClick={() => setPhase("idle")}>🎴 Open another pack</button>
          </div>
          {allFlipped && best && (
            <p className="animate-pop text-center text-lg font-bold">
              Best pull: {best.shiny ? "✨ Shiny " : ""}{prettyName(best.name)}!
            </p>
          )}
        </>
      )}
      {openId && <PokemonModal id={openId} onClose={() => setOpenId(null)} onSelect={setOpenId} />}
    </section>
  );
}

function Binder() {
  const { list, error, retry } = usePokemonList();
  const { collection, reset } = useCollection();
  const [gen, setGen] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const g = GENERATIONS[gen - 1];
  const slots = useMemo(() => (list ? list.filter((p) => p.id >= g.from && p.id <= g.to) : []), [list, g]);
  const genOwned = slots.filter((p) => collection.owned[p.id]).length;
  const total = Object.keys(collection.owned).length;

  if (error)
    return (
      <div className="panel p-5 text-center">
        <p className="font-bold">Couldn’t load the Pokémon list — {error}</p>
        <button className="btn btn-red mt-3" onClick={retry}>Try again</button>
      </div>
    );

  return (
    <section className="space-y-4">
      <div className="panel p-4">
        <div className="mb-1 flex justify-between text-sm font-bold">
          <span>Pokédex completion</span>
          <span>{total} / {MAX_ID}</span>
        </div>
        <div className="stat-bar !h-4"><span style={{ width: `${(total / MAX_ID) * 100}%`, background: "#ee1515" }} /></div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Generation">
        {GENERATIONS.map((x) => (
          <button key={x.id} className="chip" aria-pressed={gen === x.id} onClick={() => setGen(x.id)}>
            {x.region}
          </button>
        ))}
      </div>
      <p className="text-sm font-semibold text-poke-ink/60">{g.region}: {genOwned} / {slots.length} collected</p>

      {!list ? (
        <div className="skeleton h-64 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {slots.map((p) => {
            const own = collection.owned[p.id];
            return own ? (
              <button key={p.id} onClick={() => setOpenId(p.id)}
                className={`relative rounded-xl border-[3px] border-poke-ink p-1 text-center transition hover:-translate-y-1 ${own.shiny ? "bg-gradient-to-br from-yellow-100 to-sky-200" : "bg-white"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artwork(p.id, own.shiny)} alt="" className="mx-auto aspect-square w-full object-contain" loading="lazy" />
                <div className="truncate text-[0.7rem] font-bold">{prettyName(p.name)}</div>
                {own.count > 1 && <span className="absolute -right-1.5 -top-1.5 rounded-full border-2 border-poke-ink bg-poke-yellow px-1.5 text-[0.65rem] font-bold">×{own.count}</span>}
                {own.shiny && <span className="absolute left-0.5 top-0.5 text-xs">✨</span>}
              </button>
            ) : (
              <div key={p.id} className="rounded-xl border-[3px] border-dashed border-poke-ink/30 bg-poke-ink/5 p-1 text-center" aria-label={`${p.id} not collected`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artwork(p.id)} alt="" className="mx-auto aspect-square w-full object-contain opacity-70" style={{ filter: "brightness(0)", opacity: 0.18 }} loading="lazy" />
                <div className="font-pixel text-[0.5rem] text-poke-ink/40">#{p.id}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 text-center">
        {confirm ? (
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            Erase your whole collection?
            <button className="btn btn-red !px-3 !py-1" onClick={() => { reset(); setConfirm(false); }}>Yes, reset</button>
            <button className="btn btn-white !px-3 !py-1" onClick={() => setConfirm(false)}>Cancel</button>
          </span>
        ) : (
          <button className="text-sm font-semibold text-poke-ink/50 underline" onClick={() => setConfirm(true)}>Reset collection</button>
        )}
      </div>

      {openId && <PokemonModal id={openId} onClose={() => setOpenId(null)} onSelect={setOpenId} />}
    </section>
  );
}
