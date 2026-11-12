"use client";

import { useEffect, useState } from "react";
import { artwork, getPokemon, getSpecies, prettyName, STAT_LABELS } from "@/lib/pokeapi";
import { MAX_ID, TYPES, defenseProfile, genOf, GENERATIONS, offenseProfile, textOn, typeColor } from "@/lib/types";
import { useFavorites } from "@/lib/storage";
import PokemonCard from "./PokemonCard";
import PokemonModal from "./PokemonModal";
import TypeBadge from "./TypeBadge";
import PokeBall from "./PokeBall";

const TRIVIA = [
  { q: "When did the Pokémon games first launch?", a: "Pokémon Red and Green came out in Japan on February 27, 1996 for the Game Boy. The English Red and Blue followed in 1998 (North America)." },
  { q: "How many Pokémon does Eevee have?", a: "Eight Eeveelutions: Vaporeon, Jolteon, Flareon, Espeon, Umbreon, Leafeon, Glaceon and Sylveon." },
  { q: "Where does Pikachu’s name come from?", a: "It blends two Japanese sound words: “pika” (an electric sparkle) and “chu” (a mouse’s squeak)." },
  { q: "How did Mew sneak into Red & Blue?", a: "Programmer Shigeki Morimoto added Mew late in development, without most of the team knowing. That’s why it ended up as the secret 151st Pokémon." },
  { q: "What was the first Pokémon ever designed?", a: "Rhydon is said to be the very first Pokémon created — it even appears in early design documents long before the games released." },
  { q: "What was weird about Ghost vs. Psychic in Gen 1?", a: "A bug meant Ghost-type moves had no effect on Psychic types, even though the game’s own manual said Ghost was super effective against them!" },
  { q: "When did Fairy type arrive?", a: "In Pokémon X & Y (2013). It was the first new type since Dark and Steel were introduced in Gold & Silver (1999)." },
  { q: "Which Pokémon has the highest base HP?", a: "Blissey, with a base HP of 255 — the highest value a base stat can take. Shedinja sits at the opposite extreme with just 1 HP." },
  { q: "What makes Smeargle special?", a: "Its signature move Sketch lets it permanently copy almost any move it sees, so in theory it can learn nearly every attack in the game." },
  { q: "What’s Cubone’s sad secret?", a: "According to its Pokédex entries, Cubone wears the skull of its late mother — and its lonely cries echo inside it." },
  { q: "When did the Pokémon Trading Card Game debut?", a: "In Japan in October 1996 — only months after the first video games." },
  { q: "How many Pokémon are there?", a: `This app lists all ${MAX_ID} species from the National Pokédex across nine generations — from Bulbasaur to Pecharunt.` },
];

const dayId = () => {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return (((seed * 2654435761) >>> 0) % MAX_ID) + 1;
};

export default function Facts() {
  return (
    <div className="space-y-8">
      <section className="panel bg-poke-yellow p-5">
        <div className="font-pixel text-[0.65rem] text-poke-red">PROFESSOR’S NOTEBOOK</div>
        <h1 className="text-4xl font-bold">Facts, trivia &amp; type lab</h1>
        <p className="font-medium text-poke-ink/75">A fresh Pokémon every day, a deck of fun trivia and an interactive type-chart.</p>
      </section>
      <Daily />
      <RandomEntry />
      <TriviaDeck />
      <TypeLab />
    </div>
  );
}

// ───────── Pokémon of the day ─────────

function makeFacts(p, s) {
  const gen = GENERATIONS.find((g) => g.id === genOf(p.id));
  const entries = Object.entries(p.stats).sort((a, b) => b[1] - a[1]);
  const [topKey, topVal] = entries[0];
  const { weak } = defenseProfile(p.types);
  const facts = [
    `Introduced in Generation ${gen.id} (${gen.region}) as Pokédex No. ${p.id}.`,
    `Stands ${p.height} m tall and weighs ${p.weight} kg.`,
    `Its best stat is ${STAT_LABELS[topKey]} at ${topVal}. Total base stats: ${p.bst}.`,
  ];
  if (weak.length) {
    facts.push(`Watch out for ${weak.slice(0, 3).map((w) => `${prettyName(w.type)}${w.mult === 4 ? " (×4!)" : ""}`).join(", ")} moves — it takes extra damage from them.`);
  } else {
    facts.push("It has no type weaknesses at all — a tough customer!");
  }
  const hidden = p.abilities.find((a) => a.hidden);
  if (hidden) facts.push(`Hidden ability: ${prettyName(hidden.name)}.`);
  if (s.isLegendary) facts.push("A Legendary Pokémon.");
  if (s.isMythical) facts.push("A Mythical Pokémon — extremely rare!");
  if (s.habitat) facts.push(`Usually found in ${prettyName(s.habitat).toLowerCase()} habitats.`);
  return facts;
}

function Daily() {
  const [state, setState] = useState({ status: "loading" });
  const [open, setOpen] = useState(null);
  const { favs, toggle } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    const id = dayId();
    Promise.all([getPokemon(id), getSpecies(id)])
      .then(([p, s]) => !cancelled && setState({ status: "ready", p, s }))
      .catch((e) => !cancelled && setState({ status: "error", message: e.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="daily" className="space-y-3">
      <h2 id="daily" className="text-2xl font-bold">🌅 Pokémon of the Day</h2>
      {state.status === "loading" && <div className="skeleton h-72 rounded-2xl border-[3px] border-poke-ink" />}
      {state.status === "error" && <p className="panel p-4 font-semibold">Couldn’t reach PokéAPI — {state.message}</p>}
      {state.status === "ready" && (
        <div className="grid items-start gap-5 md:grid-cols-[260px_1fr]">
          <PokemonCard id={state.p.id} name={state.p.name} detail={state.p} isFav={favs.includes(state.p.id)} onToggleFav={toggle} onOpen={setOpen} />
          <div className="panel space-y-3 p-5">
            <h3 className="text-2xl font-bold">{prettyName(state.p.name)} <span className="text-base font-semibold text-poke-ink/60">· {state.s.genus}</span></h3>
            <div className="dialogue text-[1.02rem]">{state.s.flavors[state.s.flavors.length - 1] ?? "—"}</div>
            <ul className="space-y-1.5">
              {makeFacts(state.p, state.s).map((f) => (
                <li key={f} className="flex gap-2 font-medium"><span aria-hidden="true">▸</span>{f}</li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-poke-ink/50">New Pokémon every day (based on your local date).</p>
          </div>
        </div>
      )}
      {open && <PokemonModal id={open} onClose={() => setOpen(null)} onSelect={setOpen} />}
    </section>
  );
}

// ───────── random Pokédex entry ─────────

function RandomEntry() {
  const [state, setState] = useState({ status: "idle" });

  async function roll() {
    const id = 1 + Math.floor(Math.random() * MAX_ID);
    setState({ status: "loading" });
    try {
      const [p, s] = await Promise.all([getPokemon(id), getSpecies(id)]);
      const text = s.flavors.length ? s.flavors[Math.floor(Math.random() * s.flavors.length)] : "No entry available.";
      setState({ status: "ready", p, s, text });
    } catch (e) {
      setState({ status: "error", message: e.message });
    }
  }

  return (
    <section aria-labelledby="entry" className="space-y-3">
      <h2 id="entry" className="text-2xl font-bold">📖 Random Pokédex entry</h2>
      <div className="panel flex flex-col items-center gap-4 p-5 sm:flex-row">
        <div className="grid h-40 w-40 shrink-0 place-items-center rounded-full border-[3px] border-poke-ink bg-poke-paper">
          {state.status === "ready" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artwork(state.p.id)} alt={prettyName(state.p.name)} className="animate-pop h-32 w-32 object-contain" />
          ) : (
            <PokeBall size={64} className={state.status === "loading" ? "animate-spin-slow" : "opacity-60"} />
          )}
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          {state.status === "ready" ? (
            <>
              <div className="text-xl font-bold">{prettyName(state.p.name)} <span className="font-pixel text-[0.6rem] text-poke-ink/50">#{state.p.id}</span></div>
              <div className="flex justify-center gap-1.5 sm:justify-start">{state.p.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
              <div className="dialogue">{state.text}</div>
            </>
          ) : state.status === "error" ? (
            <p className="font-semibold text-poke-red">Couldn’t load an entry — {state.message}</p>
          ) : (
            <p className="font-medium text-poke-ink/70">Pull a random entry out of the Pokédex!</p>
          )}
          <button className="btn btn-red" onClick={roll} disabled={state.status === "loading"}>🎲 {state.status === "ready" ? "Another one" : "Surprise me"}</button>
        </div>
      </div>
    </section>
  );
}

// ───────── trivia deck ─────────

function TriviaDeck() {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const go = (d) => {
    setI((x) => (x + d + TRIVIA.length) % TRIVIA.length);
    setShown(false);
  };
  const shuffle = () => {
    setI(Math.floor(Math.random() * TRIVIA.length));
    setShown(false);
  };
  const t = TRIVIA[i];

  return (
    <section aria-labelledby="trivia" className="space-y-3">
      <h2 id="trivia" className="text-2xl font-bold">🧠 Trivia deck</h2>
      <div className="mx-auto max-w-xl">
        <div className="flip-scene">
          <button
            className={`flip-card block w-full ${shown ? "is-flipped" : ""}`}
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Show question" : "Reveal answer"}
          >
            <div className="flip-face card-back flex min-h-56 flex-col items-center justify-center gap-3 !bg-none !bg-poke-blue p-6 text-center text-white">
              <PokeBall size={36} />
              <p className="text-2xl font-bold leading-snug">{t.q}</p>
              <span className="font-pixel text-[0.55rem] text-poke-yellow">TAP TO REVEAL</span>
            </div>
            <div className="flip-face flip-front panel flex flex-col items-center justify-center gap-2 !bg-poke-yellow p-6 text-center">
              <span className="font-pixel text-[0.55rem] text-poke-red">DID YOU KNOW?</span>
              <p className="text-lg font-semibold leading-snug">{t.a}</p>
            </div>
          </button>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button className="btn btn-white" onClick={() => go(-1)}>◀ Prev</button>
          <span className="font-pixel text-[0.6rem]">{i + 1}/{TRIVIA.length}</span>
          <button className="btn btn-white" onClick={() => go(1)}>Next ▶</button>
          <button className="btn btn-yellow" onClick={shuffle}>🎲</button>
        </div>
      </div>
    </section>
  );
}

// ───────── type lab ─────────

function TypeLab() {
  const [sel, setSel] = useState(["fire"]);
  const toggle = (t) =>
    setSel((cur) => (cur.includes(t) ? (cur.length > 1 ? cur.filter((x) => x !== t) : cur) : cur.length >= 2 ? [cur[1], t] : [...cur, t]));

  const def = defenseProfile(sel);
  const off = sel.length === 1 ? offenseProfile(sel[0]) : null;

  return (
    <section aria-labelledby="lab" className="space-y-3">
      <h2 id="lab" className="text-2xl font-bold">🧪 Type matchup lab</h2>
      <div className="panel space-y-5 p-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-poke-ink/70">Pick one type — or two to build a dual-type Pokémon:</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Types">
            {TYPES.map((t) => (
              <button
                key={t}
                className="chip capitalize"
                aria-pressed={sel.includes(t)}
                onClick={() => toggle(t)}
                style={sel.includes(t) ? { background: typeColor(t), color: textOn(typeColor(t)) } : { borderColor: typeColor(t) }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border-[3px] border-poke-ink bg-poke-paper p-4">
            <h3 className="font-bold">🛡️ Defending as {sel.map(prettyName).join(" / ")}</h3>
            <TypeGroup title="Weak to" items={def.weak} />
            <TypeGroup title="Resists" items={def.resist} />
            <TypeGroup title="Immune to" items={def.immune} />
          </div>
          {off ? (
            <div className="space-y-3 rounded-2xl border-[3px] border-poke-ink bg-poke-paper p-4">
              <h3 className="font-bold">⚔️ Attacking with {prettyName(sel[0])}</h3>
              <TypeGroup title="Super effective against" items={off.strong} />
              <TypeGroup title="Not very effective against" items={off.weak} />
              <TypeGroup title="No effect on" items={off.none} />
            </div>
          ) : (
            <div className="grid place-items-center rounded-2xl border-[3px] border-dashed border-poke-ink/30 p-4 text-center text-sm font-semibold text-poke-ink/50">
              Select a single type to see what its moves hit hardest.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TypeGroup({ title, items }) {
  return (
    <div>
      <h4 className="mb-1 text-sm font-bold">{title}</h4>
      <div className="flex min-h-7 flex-wrap gap-1.5">
        {items.length ? (
          items.map((it) => {
            const type = it.type ?? it;
            return (
              <span key={type} className="inline-flex items-center gap-1">
                <TypeBadge type={type} />
                {it.mult !== undefined && <span className="text-xs font-bold text-poke-ink/60">×{it.mult}</span>}
              </span>
            );
          })
        ) : (
          <span className="text-sm text-poke-ink/45">None</span>
        )}
      </div>
    </div>
  );
}
