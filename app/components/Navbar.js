"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PokeBall from "./PokeBall";

const LINKS = [
  { href: "/", label: "Pokédex" },
  { href: "/showdown", label: "Showdown" },
  { href: "/quiz", label: "Who's That?" },
  { href: "/packs", label: "Card Packs" },
  { href: "/facts", label: "Facts" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-4 border-poke-ink bg-poke-red shadow-[0_4px_0_rgba(27,27,31,0.2)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 text-white">
          <span className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-poke-ink bg-poke-blue shadow-[inset_0_0_0_3px_rgba(255,255,255,0.35)]">
            <PokeBall size={26} className="transition-transform group-hover:rotate-[360deg] duration-700" />
          </span>
          <span className="font-pixel text-[0.8rem] leading-tight [text-shadow:2px_2px_0_#1b1b1f] sm:text-sm">
            POKÉDEMO
          </span>
        </Link>

        <nav className="no-scrollbar -mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-1" aria-label="Main">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full border-[3px] border-poke-ink px-3.5 py-1 text-sm font-bold transition ${
                  active
                    ? "bg-poke-yellow text-poke-ink shadow-[0_3px_0_#1b1b1f]"
                    : "bg-white/95 text-poke-ink hover:bg-poke-yellow/80"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
