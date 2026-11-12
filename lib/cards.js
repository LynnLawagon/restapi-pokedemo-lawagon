// Card rarity + booster-pack logic.

import { MAX_ID } from "./types";
import { getPokemon } from "./pokeapi";

export function rarityOf(bst) {
  if (bst >= 600) return "ultra";
  if (bst >= 520) return "holo";
  if (bst >= 460) return "rare";
  if (bst >= 360) return "uncommon";
  return "common";
}

const ORDER = ["common", "uncommon", "rare", "holo", "ultra"];
export const rarityRank = (r) => ORDER.indexOf(r);

export const PACK_SIZE = 5;
export const SHINY_ODDS = 1 / 25;

/** Open a pack: 5 distinct random Pokémon, best card last for a dramatic reveal. */
export async function openPack() {
  const ids = new Set();
  while (ids.size < PACK_SIZE) ids.add(1 + Math.floor(Math.random() * MAX_ID));
  const pokemon = await Promise.all([...ids].map((id) => getPokemon(id)));
  return pokemon
    .map((p) => ({
      id: p.id,
      name: p.name,
      detail: p,
      rarity: rarityOf(p.bst),
      shiny: Math.random() < SHINY_ODDS,
    }))
    .sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity) || a.detail.bst - b.detail.bst);
}
