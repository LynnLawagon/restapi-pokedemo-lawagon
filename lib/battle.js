// A small, pure battle engine for the Showdown page (level-50 stats, simplified damage formula).

import { effectiveness } from "./types";
import { getMove, prettyName } from "./pokeapi";

export const LEVEL = 50;

const BANNED_MOVES = new Set([
  "self-destruct", "explosion", "misty-explosion", "final-gambit", "memento",
  "belly-drum", "focus-punch", "dream-eater", "steel-roller", "last-resort",
  "fake-out", "first-impression", "sucker-punch", "upper-hand",
]);

const FALLBACK_MOVE = { name: "tackle", type: "normal", power: 40, accuracy: 100, pp: 35, cls: "physical" };

export function levelStats(base, level = LEVEL) {
  const other = (b) => Math.floor(((2 * b + 31) * level) / 100) + 5;
  return {
    hp: Math.floor(((2 * base.hp + 31) * level) / 100) + level + 10,
    atk: other(base.attack),
    def: other(base.defense),
    spa: other(base.spAtk),
    spd: other(base.spDef),
    spe: other(base.speed),
  };
}

export function buildFighter(pokemon, moves) {
  const s = levelStats(pokemon.stats);
  return {
    id: pokemon.id,
    name: prettyName(pokemon.name),
    types: pokemon.types,
    ...s,
    maxHp: s.hp,
    hp: s.hp,
    moves,
  };
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Pick four damaging moves (favouring STAB / strong / accurate ones) from the Pokémon's movepool. */
export async function pickMoves(pokemon) {
  const pool = shuffle(pokemon.moves);
  const found = new Map();
  for (let offset = 0; offset < pool.length && found.size < 8; offset += 14) {
    const batch = pool.slice(offset, offset + 14);
    const results = await Promise.allSettled(batch.map(getMove));
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const m = r.value;
      if (m.cls === "status" || !m.power || BANNED_MOVES.has(m.name)) continue;
      found.set(m.name, m);
    }
    if (offset >= 28) break; // don't hammer the API
  }
  const score = (m) =>
    m.power * ((m.accuracy ?? 100) / 100) * (pokemon.types.includes(m.type) ? 1.5 : 1);
  const best = [...found.values()].sort((a, b) => score(b) - score(a)).slice(0, 4);
  return best.length ? best : [FALLBACK_MOVE];
}

/** Resolve one attack. `rand` is injectable for tests. */
export function calcDamage(att, def, move, rand = Math.random) {
  const hit = move.accuracy == null || rand() * 100 < move.accuracy;
  if (!hit) return { hit: false, damage: 0, eff: 1, crit: false };

  const physical = move.cls === "physical";
  const A = physical ? att.atk : att.spa;
  const D = physical ? def.def : def.spd;
  const base = Math.floor((Math.floor(((2 * LEVEL) / 5 + 2) * move.power * A / D)) / 50) + 2;

  const eff = effectiveness(move.type, def.types);
  const crit = rand() < 1 / 16;
  const stab = att.types.includes(move.type) ? 1.5 : 1;
  const roll = 0.85 + rand() * 0.15;
  const damage =
    eff === 0 ? 0 : Math.max(1, Math.floor(base * (crit ? 1.5 : 1) * stab * eff * roll));
  return { hit: true, damage, eff, crit };
}

/** Opponent AI: usually the best expected-damage move, sometimes a random one. */
export function chooseAiMove(att, def, rand = Math.random) {
  if (rand() < 0.15) return att.moves[Math.floor(rand() * att.moves.length)];
  let best = att.moves[0], bestScore = -1;
  for (const m of att.moves) {
    const s =
      m.power * ((m.accuracy ?? 100) / 100) *
      (att.types.includes(m.type) ? 1.5 : 1) * effectiveness(m.type, def.types);
    if (s > bestScore) { best = m; bestScore = s; }
  }
  return best;
}

/** Who moves first this turn? Faster Pokémon go first; ties are a coin flip. */
export function actsFirst(a, b, rand = Math.random) {
  return a.spe > b.spe || (a.spe === b.spe && rand() < 0.5);
}
