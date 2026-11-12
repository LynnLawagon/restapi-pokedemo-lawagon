// Thin, cached client for https://pokeapi.co plus a few formatting helpers.

import { MAX_ID } from "./types";

const API = "https://pokeapi.co/api/v2";
const SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const cache = new Map();

async function get(url) {
  if (cache.has(url)) return cache.get(url);
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`PokeAPI responded ${r.status}`);
      return r.json();
    })
    .catch((e) => {
      cache.delete(url); // let the next call retry
      throw e;
    });
  cache.set(url, p);
  return p;
}

// ---------- helpers ----------

export function idFromUrl(url) {
  return Number(url.replace(/\/$/, "").split("/").pop());
}

export function artwork(id, shiny = false) {
  return `${SPRITES}/${shiny ? "shiny/" : ""}${id}.png`;
}

const NAME_OVERRIDES = {
  "nidoran-f": "Nidoran ♀",
  "nidoran-m": "Nidoran ♂",
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mr-rime": "Mr. Rime",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "type-null": "Type: Null",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  flabebe: "Flabébé",
};

export function prettyName(name = "") {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name];
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  spAtk: "Sp. Atk",
  spDef: "Sp. Def",
  speed: "Speed",
};

const STAT_MAP = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "spAtk",
  "special-defense": "spDef",
  speed: "speed",
};

// ---------- endpoints ----------

/** Every Pokémon (id + name) – one small request, cached. */
export async function getPokemonList() {
  const data = await get(`${API}/pokemon?limit=${MAX_ID}&offset=0`);
  return data.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((p) => p.id <= MAX_ID);
}

const resolved = new Map();

/** Peek at an already-loaded Pokémon without triggering a request. */
export function peekPokemon(id) {
  return resolved.get(Number(id));
}

/** A trimmed-down Pokémon: just what the UI needs. */
export async function getPokemon(idOrName) {
  const p = await get(`${API}/pokemon/${idOrName}`);
  const stats = {};
  for (const s of p.stats) stats[STAT_MAP[s.stat.name]] = s.base_stat;
  const slim = {
    id: p.id,
    name: p.name,
    types: [...p.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    stats,
    bst: Object.values(stats).reduce((a, b) => a + b, 0),
    height: p.height / 10, // metres
    weight: p.weight / 10, // kg
    baseExp: p.base_experience,
    abilities: p.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    cry: p.cries?.latest ?? null,
    moves: p.moves.map((m) => m.move.url),
  };
  resolved.set(slim.id, slim);
  return slim;
}

export async function getSpecies(id) {
  const s = await get(`${API}/pokemon-species/${id}`);
  const seen = new Set();
  const flavors = [];
  for (const f of s.flavor_text_entries) {
    if (f.language.name !== "en") continue;
    const text = f.flavor_text.replace(/[\f\n\r­]+/g, " ").replace(/\s+/g, " ").trim();
    if (!seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      flavors.push(text);
    }
  }
  return {
    genus: s.genera.find((g) => g.language.name === "en")?.genus ?? "",
    flavors,
    color: s.color?.name,
    habitat: s.habitat?.name,
    isLegendary: s.is_legendary,
    isMythical: s.is_mythical,
    isBaby: s.is_baby,
    evolutionUrl: s.evolution_chain?.url ?? null,
  };
}

/** Evolution chain flattened into stages: [[{id,name}], [{id,name}, …], …] */
export async function getEvolutionStages(url) {
  if (!url) return [];
  const data = await get(url);
  const stages = [];
  const walk = (node, depth) => {
    (stages[depth] ??= []).push({ id: idFromUrl(node.species.url), name: node.species.name });
    node.evolves_to.forEach((n) => walk(n, depth + 1));
  };
  walk(data.chain, 0);
  return stages;
}

const typeCache = new Map();
/** Set of Pokémon ids (≤ MAX_ID) of a given type. */
export async function getTypeMembers(type) {
  if (typeCache.has(type)) return typeCache.get(type);
  const data = await get(`${API}/type/${type}`);
  const ids = new Set(
    data.pokemon.map((p) => idFromUrl(p.pokemon.url)).filter((id) => id <= MAX_ID)
  );
  typeCache.set(type, ids);
  return ids;
}

export async function getMove(url) {
  const m = await get(url);
  return {
    name: m.name,
    type: m.type.name,
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
    cls: m.damage_class.name, // physical | special | status
  };
}
