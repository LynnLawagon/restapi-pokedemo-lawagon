// Type colours, the type-effectiveness chart and generation ranges.

export const TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export function typeColor(type) {
  return TYPE_COLORS[type] ?? "#A8A77A";
}

// Readable text colour (ink or white) for a given hex background.
export function textOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1B1B1F" : "#FFFFFF";
}

// attacker -> { defender: multiplier } (only non-neutral entries)
const CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/** Multiplier of an `atk` type move against a Pokémon with `defTypes`. */
export function effectiveness(atk, defTypes) {
  return defTypes.reduce((m, d) => m * (CHART[atk]?.[d] ?? 1), 1);
}

/** What a single attacking type does to each defender type. */
export function offenseProfile(atk) {
  const out = { strong: [], weak: [], none: [] };
  for (const t of TYPES) {
    const m = CHART[atk]?.[t] ?? 1;
    if (m === 2) out.strong.push(t);
    else if (m === 0.5) out.weak.push(t);
    else if (m === 0) out.none.push(t);
  }
  return out;
}

/** Weaknesses / resistances / immunities for a Pokémon's type combo. */
export function defenseProfile(defTypes) {
  const weak = [], resist = [], immune = [];
  for (const t of TYPES) {
    const m = effectiveness(t, defTypes);
    if (m === 0) immune.push({ type: t, mult: 0 });
    else if (m > 1) weak.push({ type: t, mult: m });
    else if (m < 1) resist.push({ type: t, mult: m });
  }
  weak.sort((a, b) => b.mult - a.mult);
  return { weak, resist, immune };
}

export const MAX_ID = 1025;

export const GENERATIONS = [
  { id: 1, region: "Kanto", from: 1, to: 151 },
  { id: 2, region: "Johto", from: 152, to: 251 },
  { id: 3, region: "Hoenn", from: 252, to: 386 },
  { id: 4, region: "Sinnoh", from: 387, to: 493 },
  { id: 5, region: "Unova", from: 494, to: 649 },
  { id: 6, region: "Kalos", from: 650, to: 721 },
  { id: 7, region: "Alola", from: 722, to: 809 },
  { id: 8, region: "Galar", from: 810, to: 905 },
  { id: 9, region: "Paldea", from: 906, to: 1025 },
];

export function genOf(id) {
  return GENERATIONS.find((g) => id >= g.from && id <= g.to)?.id ?? 9;
}
