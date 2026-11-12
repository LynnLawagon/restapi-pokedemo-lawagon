"use client";

import { useEffect, useRef, useState } from "react";
import { artwork, getPokemon, prettyName } from "@/lib/pokeapi";
import { actsFirst, buildFighter, calcDamage, chooseAiMove, pickMoves } from "@/lib/battle";
import { textOn, typeColor } from "@/lib/types";
import { usePokemonList } from "@/lib/hooks";
import { useLocalStorage } from "@/lib/storage";
import PokemonPicker from "./PokemonPicker";
import PokeBall from "./PokeBall";
import TypeBadge from "./TypeBadge";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const EMPTY_RECORD = { wins: 0, losses: 0, streak: 0, best: 0 };

async function loadFighter(entry) {
  const p = await getPokemon(entry.id);
  const moves = await pickMoves(p);
  return buildFighter(p, moves);
}

export default function Showdown() {
  const { list, error, retry } = usePokemonList();
  const [you, setYou] = useState(null);
  const [foe, setFoe] = useState(null);
  const [phase, setPhase] = useState("select"); // select | loading | battle | over
  const [loadError, setLoadError] = useState(null);
  const [fighters, setFighters] = useState(null); // { you, foe }
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [fx, setFx] = useState({ you: "", foe: "" });
  const [winner, setWinner] = useState(null);
  const [record, setRecord] = useLocalStorage("pokedemo:showdown", EMPTY_RECORD);

  const logRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const say = (text) => setLog((l) => [...l, text]);
  const flash = (who, cls, ms) => {
    setFx((f) => ({ ...f, [who]: cls }));
    return sleep(ms).then(() => setFx((f) => ({ ...f, [who]: "" })));
  };

  async function start() {
    if (!you || !foe) return;
    setPhase("loading");
    setLoadError(null);
    try {
      const [a, b] = await Promise.all([loadFighter(you), loadFighter(foe)]);
      if (!alive.current) return;
      setFighters({ you: a, foe: b });
      setLog([`${b.name} wants to battle!`, `Go! ${a.name}!`]);
      setWinner(null);
      setFx({ you: "", foe: "" });
      setPhase("battle");
    } catch (e) {
      setLoadError(e.message || "Couldn’t load the battlers");
      setPhase("select");
    }
  }

  async function turn(move) {
    if (busy || phase !== "battle") return;
    setBusy(true);
    const state = { you: { ...fighters.you }, foe: { ...fighters.foe } };
    const foeMove = chooseAiMove(state.foe, state.you);
    const youFirst = actsFirst(state.you, state.foe);
    const order = youFirst ? [["you", move], ["foe", foeMove]] : [["foe", foeMove], ["you", move]];
    let over = null;

    for (const [who, m] of order) {
      const other = who === "you" ? "foe" : "you";
      const att = state[who];
      const def = state[other];
      if (att.hp <= 0 || !alive.current) continue;

      say(`${who === "foe" ? "Foe " : ""}${att.name} used ${prettyName(m.name)}!`);
      await flash(who, "lunge", 450);
      const res = calcDamage(att, def, m);

      if (!res.hit) {
        say(`${att.name}’s attack missed!`);
        await sleep(600);
        continue;
      }
      if (res.eff === 0) {
        say(`It doesn’t affect ${def.name}…`);
        await sleep(700);
        continue;
      }
      def.hp = Math.max(0, def.hp - res.damage);
      setFighters({ you: { ...state.you }, foe: { ...state.foe } });
      await flash(other, "hit", 500);
      if (res.crit) say("A critical hit!");
      if (res.eff > 1) say("It’s super effective!");
      if (res.eff < 1) say("It’s not very effective…");
      await sleep(450);

      if (def.hp <= 0) {
        say(`${other === "foe" ? "Foe " : ""}${def.name} fainted!`);
        setFx((f) => ({ ...f, [other]: "faint" }));
        over = who;
        await sleep(900);
        break;
      }
    }

    if (!alive.current) return;
    if (over) {
      setWinner(over);
      setPhase("over");
      setRecord((r) => {
        const won = over === "you";
        const streak = won ? r.streak + 1 : 0;
        return {
          wins: r.wins + (won ? 1 : 0),
          losses: r.losses + (won ? 0 : 1),
          streak,
          best: Math.max(r.best, streak),
        };
      });
    }
    setBusy(false);
  }

  function rematch() {
    // refill HP, keep the same movesets
    setFighters((f) => ({ you: { ...f.you, hp: f.you.maxHp }, foe: { ...f.foe, hp: f.foe.maxHp } }));
    setLog(["A rematch! Both Pokémon are fully healed."]);
    setFx({ you: "", foe: "" });
    setWinner(null);
    setBusy(false);
    setPhase("battle");
  }

  function reselect() {
    setPhase("select");
    setFighters(null);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <Header record={record} />

      {error && (
        <div className="panel p-5 text-center">
          <p className="font-bold">Couldn’t load the Pokémon list — {error}</p>
          <button className="btn btn-red mt-3" onClick={retry}>Try again</button>
        </div>
      )}

      {(phase === "select" || phase === "loading") && (
        <section className="space-y-5">
          <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <PokemonPicker label="You" list={list} value={you} onChange={setYou} accent="#3b4cca" />
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-[3px] border-poke-ink bg-poke-yellow font-pixel text-lg shadow-[0_4px_0_#1b1b1f]">VS</div>
            <PokemonPicker label="Opponent" list={list} value={foe} onChange={setFoe} accent="#ee1515" />
          </div>
          {loadError && <p className="text-center font-semibold text-poke-red">⚠️ {loadError}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              className="btn btn-white"
              disabled={!list || phase === "loading"}
              onClick={() => {
                setYou(list[Math.floor(Math.random() * list.length)]);
                setFoe(list[Math.floor(Math.random() * list.length)]);
              }}
            >
              🎲 Surprise me
            </button>
            <button className="btn btn-red !px-8 text-lg" disabled={!you || !foe || phase === "loading"} onClick={start}>
              {phase === "loading" ? (
                <>
                  <PokeBall size={22} className="animate-spin-slow" /> Preparing moves…
                </>
              ) : (
                "⚔️ Start battle!"
              )}
            </button>
          </div>
          <p className="text-center text-sm font-medium text-poke-ink/60">
            Level 50 · each Pokémon gets four real moves from its own movepool · types, STAB and crits all count.
          </p>
        </section>
      )}

      {(phase === "battle" || phase === "over") && fighters && (
        <section className="space-y-4">
          <Arena fighters={fighters} fx={fx} />

          <div className="dialogue">
            <div ref={logRef} className="h-24 space-y-0.5 overflow-y-auto pr-1 font-semibold" aria-live="polite">
              {log.map((l, i) => (
                <p key={i} className={i === log.length - 1 ? "" : "opacity-55"}>{l}</p>
              ))}
            </div>
          </div>

          {phase === "battle" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {fighters.you.moves.map((m) => {
                const c = typeColor(m.type);
                return (
                  <button
                    key={m.name}
                    className="move-btn"
                    disabled={busy}
                    onClick={() => turn(m)}
                    style={{ background: c, color: textOn(c) }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-lg capitalize">{prettyName(m.name)}</span>
                      <span className="rounded-full bg-white/85 px-2 text-xs capitalize text-poke-ink">{m.type}</span>
                    </div>
                    <div className="text-sm opacity-90">
                      {m.cls === "physical" ? "⚔️ Physical" : "✨ Special"} · Power {m.power} · Acc {m.accuracy ?? "—"}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="panel animate-pop p-6 text-center">
              <div className="text-5xl">{winner === "you" ? "🏆" : "💥"}</div>
              <h2 className="mt-1 text-3xl font-bold">
                {winner === "you" ? `${fighters.you.name} wins!` : `${fighters.foe.name} wins…`}
              </h2>
              <p className="text-sm font-medium text-poke-ink/60">
                {winner === "you" ? "You're on fire!" : "Shake it off — try a different matchup!"}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button className="btn btn-red" onClick={rematch}>🔁 Rematch</button>
                <button className="btn btn-blue" onClick={reselect}>🧑‍🤝‍🧑 New matchup</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Header({ record }) {
  return (
    <section className="panel flex flex-wrap items-center justify-between gap-4 bg-poke-blue p-5 text-white">
      <div>
        <div className="font-pixel text-[0.65rem] text-poke-yellow">BATTLE ARENA</div>
        <h1 className="text-4xl font-bold [text-shadow:3px_3px_0_#1b1b1f]">Pokémon Showdown</h1>
      </div>
      <div className="flex gap-2 text-center">
        {[
          ["Wins", record.wins],
          ["Losses", record.losses],
          ["Streak", record.streak],
          ["Best", record.best],
        ].map(([k, v]) => (
          <div key={k} className="min-w-16 rounded-xl border-[3px] border-poke-ink bg-white px-2 py-1 text-poke-ink">
            <div className="text-[0.6rem] font-bold uppercase text-poke-ink/55">{k}</div>
            <div className="text-xl font-bold leading-tight">{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Arena({ fighters, fx }) {
  return (
    <div className="arena">
      <div className="platform" style={{ top: 150, right: 18 }} />
      <div className="platform" style={{ bottom: 38, left: 18 }} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artwork(fighters.foe.id)} alt={fighters.foe.name} className={`fighter-img foe ${fx.foe}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artwork(fighters.you.id)} alt={fighters.you.name} className={`fighter-img you ${fx.you}`} />

      <InfoBox f={fighters.foe} style={{ top: 14, left: 14 }} label="Foe" />
      <InfoBox f={fighters.you} style={{ bottom: 14, right: 14 }} label="You" showNumbers />
    </div>
  );
}

function InfoBox({ f, style, label, showNumbers }) {
  const pct = (f.hp / f.maxHp) * 100;
  const color = pct > 50 ? "#3fae4a" : pct > 20 ? "#ffcb05" : "#ee1515";
  return (
    <div className="info-box" style={style}>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-bold">{f.name}</span>
        <span className="font-pixel text-[0.55rem]">Lv50</span>
      </div>
      <div className="mb-1 flex gap-1">
        {f.types.map((t) => <TypeBadge key={t} type={t} className="!px-2 !text-[0.65rem]" />)}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[0.5rem] text-poke-red">HP</span>
        <div className="hp-track flex-1" role="progressbar" aria-label={`${label} HP`} aria-valuenow={f.hp} aria-valuemin={0} aria-valuemax={f.maxHp}>
          <div className="hp-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      {showNumbers && (
        <div className="mt-0.5 text-right text-xs font-bold">
          {f.hp} / {f.maxHp}
        </div>
      )}
    </div>
  );
}
