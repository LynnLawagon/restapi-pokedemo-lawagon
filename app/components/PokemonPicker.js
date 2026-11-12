"use client";

import { useMemo, useState } from "react";
import { artwork, prettyName } from "@/lib/pokeapi";

/** Type-ahead picker over the full Pokémon list. `value` is a {id,name} or null. */
export default function PokemonPicker({ label, list, value, onChange, accent = "#3b4cca" }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase().replace(/\s+/g, "-");
    if (!q || !list) return [];
    return list.filter((p) => p.name.includes(q) || String(p.id) === q).slice(0, 8);
  }, [text, list]);

  const random = () => {
    if (!list) return;
    onChange(list[Math.floor(Math.random() * list.length)]);
    setText("");
  };

  return (
    <div className="panel relative p-4" style={{ borderColor: "#1b1b1f" }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full px-3 py-0.5 text-sm font-bold text-white" style={{ background: accent }}>{label}</span>
        <button className="btn btn-yellow !px-3 !py-1 text-sm" onClick={random} disabled={!list}>🎲 Random</button>
      </div>

      <div className="grid h-40 place-items-center rounded-xl border-[3px] border-poke-ink bg-poke-paper">
        {value ? (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artwork(value.id)} alt={prettyName(value.name)} className="mx-auto h-28 w-28 object-contain" />
            <div className="-mt-1 font-bold">{prettyName(value.name)}</div>
          </div>
        ) : (
          <span className="px-4 text-center text-sm font-semibold text-poke-ink/50">Search below or hit Random</span>
        )}
      </div>

      <div className="relative mt-3">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={list ? "Type a name…" : "Loading Pokémon…"}
          disabled={!list}
          aria-label={`${label} Pokémon`}
          className="w-full rounded-full border-[3px] border-poke-ink bg-white px-4 py-2 font-medium outline-none focus:ring-4 focus:ring-poke-blue/40"
        />
        {open && matches.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border-[3px] border-poke-ink bg-white shadow-[0_4px_0_#1b1b1f]">
            {matches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left font-semibold hover:bg-poke-yellow/60"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(m);
                    setText("");
                    setOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={artwork(m.id)} alt="" className="h-8 w-8 object-contain" loading="lazy" />
                  {prettyName(m.name)}
                  <span className="ml-auto font-pixel text-[0.55rem] text-poke-ink/50">#{m.id}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
