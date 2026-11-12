import PokeBall from "./PokeBall";

export default function Footer() {
  return (
    <footer className="mt-10 border-t-4 border-poke-ink bg-poke-ink py-6 text-center text-sm text-white/80">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4">
        <PokeBall size={28} />
        <p>
          Data from{" "}
          <a className="font-semibold text-poke-yellow underline" href="https://pokeapi.co/" target="_blank" rel="noreferrer">
            PokéAPI
          </a>
          . Pokémon and all related names &amp; artwork are © Nintendo / Creatures Inc. / GAME FREAK inc.
        </p>
        <p className="text-xs text-white/55">
          Unofficial fan project for educational purposes — not affiliated with or endorsed by The Pokémon Company.
        </p>
      </div>
    </footer>
  );
}
