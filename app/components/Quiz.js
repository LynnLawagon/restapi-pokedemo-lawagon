"use client";

import { useState } from "react";
import { artwork, prettyName } from "@/lib/pokeapi";
import { GENERATIONS } from "@/lib/types";
import { usePokemonList } from "@/lib/hooks";
import { useLocalStorage } from "@/lib/storage";
import PokeBall from "./PokeBall";

const LIVES = 3;
const EMPTY = { best: 0, games: 0 };

function newRound(list, gen) {
  const pool = gen === "all" ? list : list.filter((p) => p.id >= GENERATIONS[gen - 1].from && p.id <= GENERATIONS[gen - 1].to);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const answer = pick(pool);
  const wrong = new Set();
  while (wrong.size < 3) {
    const w = pick(pool.length > 6 ? pool : list);
    if (w.id !== answer.id) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  // warm the cache so the reveal doesn't flicker
  new Image().src = artwork(answer.id);
  return { answer, choices, picked: null, hint: false };
}

export default function Quiz() {
  const { list, error, retry } = usePokemonList();
  const [gen, setGen] = useState("all");
  const [game, setGame] = useState(null); // { score, streak, lives, round }
  const [stats, setStats] = useLocalStorage("pokedemo:quiz", EMPTY);

  const start = () => setGame({ score: 0, streak: 0, lives: LIVES, round: newRound(list, gen), over: false, finished: false });

  const guess = (choice) => {
    if (!game || game.round.picked) return;
    const correct = choice.id === game.round.answer.id;
    const streak = correct ? game.streak + 1 : 0;
    const lives = correct ? game.lives : game.lives - 1;
    const score = game.score + (correct ? 100 + Math.min(streak - 1, 10) * 10 + (game.round.hint ? -40 : 0) : 0);
    const over = lives <= 0;
    setGame({ ...game, score, streak, lives, over, round: { ...game.round, picked: choice.id } });
    if (over) setStats((s) => ({ best: Math.max(s.best, score), games: s.games + 1 }));
  };

  const next = () =>
    game.over ? setGame({ ...game, finished: true }) : setGame({ ...game, round: newRound(list, gen) });

  const round = game?.round;
  const revealed = !!round?.picked;
  const wasRight = revealed && round.picked === round.answer.id;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="panel bg-poke-yellow p-5 text-center">
        <div className="font-pixel text-[0.65rem] text-poke-red">GUESSING GAME</div>
        <h1 className="text-4xl font-bold">Who’s that Pokémon?</h1>
        <p className="text-sm font-semibold text-poke-ink/70">Best score: {stats.best} · Games played: {stats.games}</p>
      </section>

      {error && (
        <div className="panel p-5 text-center">
          <p className="font-bold">Couldn’t load the Pokémon list — {error}</p>
          <button className="btn btn-red mt-3" onClick={retry}>Try again</button>
        </div>
      )}

      {!game && (
        <section className="panel space-y-4 p-6 text-center">
          <PokeBall size={64} className="mx-auto animate-float" />
          <p className="font-medium">Name the Pokémon from its shadow. Three wrong guesses and it’s game over — streaks earn bonus points!</p>
          <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2" role="group" aria-label="Generation">
            <button className="chip" aria-pressed={gen === "all"} onClick={() => setGen("all")}>All gens</button>
            {GENERATIONS.map((g) => (
              <button key={g.id} className="chip" aria-pressed={gen === g.id} onClick={() => setGen(g.id)}>
                {g.region}
              </button>
            ))}
          </div>
          <button className="btn btn-red !px-8 text-lg" disabled={!list} onClick={start}>
            {list ? "▶ Start!" : "Loading…"}
          </button>
        </section>
      )}

      {game && !game.finished && (
        <Round
          game={game}
          round={round}
          revealed={revealed}
          wasRight={wasRight}
          onGuess={guess}
          onNext={next}
          onHint={() => setGame({ ...game, round: { ...round, hint: true } })}
        />
      )}

      {game?.finished && (
        <section className="panel animate-pop space-y-3 p-6 text-center">
          <Scoreboard game={game} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork(round.answer.id)} alt={round.answer.name} className="mx-auto h-36 w-36 object-contain" />
          <p className="font-semibold">It was <b>{prettyName(round.answer.name)}</b>!</p>
          <div className="text-5xl">{game.score >= stats.best && game.score > 0 ? "🏆" : "🎮"}</div>
          <h2 className="text-3xl font-bold">Game over — {game.score} pts</h2>
          {game.score >= stats.best && game.score > 0 && <p className="font-bold text-poke-red">New personal best!</p>}
          <div className="flex justify-center gap-3">
            <button className="btn btn-red" onClick={start}>🔁 Play again</button>
            <button className="btn btn-white" onClick={() => setGame(null)}>Change generation</button>
          </div>
        </section>
      )}
    </div>
  );
}

function Scoreboard({ game }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm font-bold">
      <span className="flex items-center gap-1" aria-label={`${game.lives} lives left`}>
        {Array.from({ length: LIVES }, (_, i) => (
          <PokeBall key={i} size={26} className={i < game.lives ? "" : "opacity-20 grayscale"} />
        ))}
      </span>
      <span className="rounded-full border-[3px] border-poke-ink bg-poke-yellow px-3">🔥 Streak {game.streak}</span>
      <span className="rounded-full border-[3px] border-poke-ink bg-poke-blue px-3 text-white">{game.score} pts</span>
    </div>
  );
}

function Round({ game, round, revealed, wasRight, onGuess, onNext, onHint }) {
  const name = prettyName(round.answer.name);
  return (
    <section className="panel space-y-4 p-5">
      <Scoreboard game={game} />

      <div
        className="relative grid h-64 place-items-center overflow-hidden rounded-2xl border-[3px] border-poke-ink"
        style={{ background: "radial-gradient(circle at 50% 60%, #fff7c2, #ffcb05 60%, #f0a800)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: "repeating-conic-gradient(from 0deg at 50% 60%, #fff 0 8deg, transparent 8deg 16deg)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artwork(round.answer.id)}
          alt={revealed ? name : "A mystery Pokémon silhouette"}
          className={`silhouette relative h-52 w-52 object-contain ${revealed ? "revealed" : ""}`}
          draggable="false"
        />
        {revealed && (
          <div className={`animate-bounce-in absolute bottom-2 rounded-full border-[3px] border-poke-ink px-4 py-0.5 text-lg font-bold ${wasRight ? "bg-poke-grass text-white" : "bg-poke-red text-white"}`}>
            {wasRight ? "✔ " : "✘ It’s "}{name}!
          </div>
        )}
      </div>

      {!revealed && (
        <div className="text-center text-sm font-semibold">
          {round.hint ? (
            <span className="rounded-full bg-poke-paper px-3 py-1">
              Hint: starts with “{name[0]}” · {name.replace(/[^A-Za-z]/g, "").length} letters
            </span>
          ) : (
            <button className="underline" onClick={onHint}>💡 Need a hint? (−40 pts)</button>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {round.choices.map((c) => {
          const isAnswer = c.id === round.answer.id;
          const isPicked = c.id === round.picked;
          let style = "btn-white";
          if (revealed && isAnswer) style = "!bg-poke-grass text-white";
          else if (revealed && isPicked) style = "btn-red";
          return (
            <button key={c.id} className={`btn !justify-start !rounded-2xl text-lg ${style}`} disabled={revealed} onClick={() => onGuess(c)} style={revealed ? { opacity: isAnswer || isPicked ? 1 : 0.45 } : undefined}>
              {prettyName(c.name)}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="text-center">
          <button className="btn btn-blue animate-pop" onClick={onNext}>
            {game.over ? "See results" : "Next ▶"}
          </button>
        </div>
      )}
    </section>
  );
}
