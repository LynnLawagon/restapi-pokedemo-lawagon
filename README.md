# PokéAtlas — Pokémon Fan Playground

A refreshed version of a college REST API practice project. Built with **Next.js**, **React**, and **PokéAPI**.

## Features
- Browse the first 151 Pokémon with official artwork.
- Search by Pokémon name or Pokédex number.
- Filter by Pokémon type.
- Save and filter favorites for the current visit.
- Open a Pokédex detail view with base stats.
- Pick two Pokémon for a lightweight, turn-based battle mini-game.
- Read rotating Pokémon facts and answer a short trivia quiz.
- Responsive layout with a classic Pokémon-inspired red, yellow, cream, and dark palette.

## Run locally

1. Install **Node.js (LTS)**.
2. Extract this project folder.
3. Open the folder in VS Code.
4. Open the VS Code terminal and run:

   ```bash
   npm install
   npm run dev
   ```

5. Visit **http://localhost:3000**.

The app needs an internet connection to retrieve Pokémon data and artwork from PokéAPI.

## Production build

```bash
npm run build
npm start
```

## Notes
- Favorites are kept in React state and reset when the page is refreshed. No account or database is required for this demo.
- The battle lab is a playful randomized mini-game, not an official Pokémon battle simulator and does not calculate the full competitive battle rules.
- Pokémon data is provided by [PokéAPI](https://pokeapi.co/).
- Pokémon names, characters, and related assets belong to their respective owners. This is a non-commercial fan-made learning project and is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
