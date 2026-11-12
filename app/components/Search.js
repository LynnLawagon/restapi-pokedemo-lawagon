"use client";

export default function Search({ value, onChange, placeholder = "Search by name or number…" }) {
  return (
    <label className="relative block">
      <span className="sr-only">Search Pokémon</span>
      <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
        🔍
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border-[3px] border-poke-ink bg-white py-2.5 pl-12 pr-4 text-base font-medium shadow-[0_4px_0_#1b1b1f] outline-none placeholder:text-poke-ink/40 focus:ring-4 focus:ring-poke-blue/40"
      />
    </label>
  );
}
