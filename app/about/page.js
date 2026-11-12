import Link from "next/link";

export const metadata = { title: "About — Pokédemo" };

const FEATURES = [
  ["Pokédex", "/", "Browse all 1,025 Pokémon as holographic trading cards. Filter by generation, type or favorites and open any card for its full entry — stats radar, evolutions, matchups, cry and shiny art."],
  ["Showdown", "/showdown", "A turn-based battle at level 50 using real moves from the PokéAPI movepool, with type effectiveness, STAB, critical hits and a simple AI opponent."],
  ["Who’s That Pokémon?", "/quiz", "Guess the Pokémon from its silhouette. Three lives, streak bonuses and a saved high score."],
  ["Card Packs", "/packs", "Open five-card booster packs with rarities based on base stats, chase ✨ shiny cards and fill your binder."],
  ["Facts", "/facts", "A new Pokémon of the Day, random Pokédex entries, a trivia deck and an interactive type-matchup lab."],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="panel p-6 sm:p-8">
        <h1 className="text-4xl font-bold">About this project</h1>
        <p className="mt-3">
          Pokédemo started as a performance task for a Web Programming course — a small page demonstrating how to fetch and render
          REST API data with <span className="font-bold">Next.js App Router</span> and Tailwind CSS. It has since grown into a
          Pokémon fan playground, while still being a REST API practice project at heart.
        </p>

        <h2 className="mt-6 text-2xl font-bold">What’s inside</h2>
        <ul className="mt-2 space-y-3">
          {FEATURES.map(([name, href, text]) => (
            <li key={name} className="rounded-xl border-[3px] border-poke-ink bg-poke-paper p-3">
              <Link href={href} className="font-bold text-poke-blue underline">{name}</Link>
              <p className="text-sm font-medium">{text}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-2xl font-bold">Pokémon overview</h2>
        <p className="mt-1">
          Pokémon (short for Pocket Monsters) is a franchise created by Satoshi Tajiri and developed by Game Freak, published by
          Nintendo. Since its debut in 1996 it has expanded into trading cards, animation and media worldwide, with creatures that
          players collect, train and battle.
        </p>

        <h2 className="mt-6 text-2xl font-bold">API source</h2>
        <p className="mt-1">
          All Pokémon data comes from the free, open REST API{" "}
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer" className="font-bold text-poke-blue underline">
            pokeapi.co
          </a>
          . Artwork and cries are served from the PokéAPI sprites &amp; cries repositories. Results are cached in memory so each
          resource is only requested once per visit; favorites, your card collection and game records live in your browser’s
          localStorage.
        </p>

        <h2 className="mt-6 text-2xl font-bold">Important note</h2>
        <p className="mt-1">
          This website is intended solely for educational demonstration. No commercial usage is intended, and all Pokémon data and
          assets belong to their respective copyright owners (© Nintendo / Creatures Inc. / GAME FREAK inc.).
        </p>

        <p className="mt-6 text-sm text-poke-ink/50">© {new Date().getFullYear()} Web Programming — Demo Application</p>
      </div>
    </div>
  );
}
