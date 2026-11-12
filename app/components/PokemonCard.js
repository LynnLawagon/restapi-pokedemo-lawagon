"use client";

import { artwork, prettyName } from "@/lib/pokeapi";
import { typeColor } from "@/lib/types";
import TypeBadge from "./TypeBadge";

export const RARITY_LABEL = {
  common: "● Common",
  uncommon: "◆ Uncommon",
  rare: "★ Rare",
  holo: "★ Holo Rare",
  ultra: "✦ Ultra Rare",
};

/** Holographic trading-card version of a Pokémon. `detail` may still be loading. */
export default function PokemonCard({
  id,
  name,
  detail,
  onOpen,
  isFav,
  onToggleFav,
  rarity,
  shiny = false,
  className = "",
}) {
  const primary = detail?.types?.[0];
  const color = primary ? typeColor(primary) : "#c9c5b3";

  const tilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * 14).toFixed(1)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 14).toFixed(1)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(0)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(0)}%`);
  };
  const untilt = (e) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const classes = [
    "poke-card",
    rarity === "holo" ? "rarity-holo" : "",
    rarity === "ultra" ? "rarity-ultra" : "",
    shiny ? "is-shiny" : "",
    className,
  ].join(" ");

  return (
    <div className="relative">
      <button
        type="button"
        className={classes}
        style={{ "--c": color }}
        onClick={() => onOpen?.(id)}
        onPointerMove={tilt}
        onPointerLeave={untilt}
        aria-label={`Open ${prettyName(name)} details`}
      >
        <div className="poke-card-inner">
          <div className="flex items-baseline justify-between gap-2 pr-9">
            <h2 className="truncate text-lg font-bold leading-tight">{prettyName(name)}</h2>
          </div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-poke-ink/70">
            <span className="font-pixel text-[0.6rem]">No.{String(id).padStart(4, "0")}</span>
            {detail ? (
              <span>
                <span className="mr-0.5 text-[0.65rem] font-bold text-poke-red">HP</span>
                <span className="text-sm font-bold text-poke-ink">{detail.stats.hp}</span>
              </span>
            ) : (
              <span className="skeleton inline-block h-4 w-10 rounded" />
            )}
          </div>

          <div className="poke-card-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={artwork(id, shiny)}
              alt=""
              loading="lazy"
              draggable="false"
              onError={(e) => (e.currentTarget.style.opacity = 0.25)}
            />
            {shiny && (
              <span className="absolute left-1.5 top-1.5 rounded-full border-2 border-poke-ink bg-poke-yellow px-1.5 text-[0.65rem] font-bold">
                ✨ Shiny
              </span>
            )}
          </div>

          <div className="mt-2 flex min-h-[1.6rem] flex-wrap gap-1.5">
            {detail ? (
              detail.types.map((t) => <TypeBadge key={t} type={t} />)
            ) : (
              <span className="skeleton h-6 w-20 rounded-full" />
            )}
          </div>

          {detail ? (
            <div className="mt-2 grid grid-cols-3 gap-1 border-t-2 border-dashed border-poke-ink/25 pt-1.5 text-center text-[0.7rem] font-semibold">
              <Stat label="ATK" v={detail.stats.attack} />
              <Stat label="DEF" v={detail.stats.defense} />
              <Stat label="SPD" v={detail.stats.speed} />
            </div>
          ) : (
            <div className="skeleton mt-2 h-8 rounded" />
          )}

          {rarity && (
            <div className="mt-1.5 text-center font-pixel text-[0.5rem] uppercase text-poke-ink/70">
              {RARITY_LABEL[rarity]}
            </div>
          )}
        </div>
      </button>

      {onToggleFav && (
        <button
          type="button"
          className="fav-btn"
          aria-pressed={!!isFav}
          aria-label={isFav ? `Remove ${prettyName(name)} from favorites` : `Add ${prettyName(name)} to favorites`}
          onClick={() => onToggleFav(id)}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      )}
    </div>
  );
}

function Stat({ label, v }) {
  return (
    <div>
      <div className="text-[0.55rem] text-poke-ink/55">{label}</div>
      <div>{v}</div>
    </div>
  );
}
