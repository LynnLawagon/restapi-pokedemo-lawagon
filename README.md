# Pokédemo — Pokémon Dashboard

A Pokémon fan playground built on the free [PokéAPI](https://pokeapi.co/) with **Next.js (App Router)**, **React 19** and **Tailwind CSS v4**.
Originally a REST-API practice project, now with a lot more to do.

## Features
| Page | What it does |
| --- | --- |
| **Pokédex** `/` | All 1,025 Pokémon as holographic trading cards (tilt + glare). Search, filter by generation / type / favorites, ❤️ favorites, "load more". Click a card for the full entry: Pokédex text, stats + radar chart, evolution line, type matchups, shiny art and cry. |
| **Showdown** `/showdown` | Turn-based battles at level 50 with real moves from the PokéAPI movepool, type effectiveness, STAB, crits, speed order and an AI opponent. Win/loss/streak record is saved. |
| **Who's That Pokémon?** `/quiz` | Silhouette guessing game: 3 lives, streak bonus, hints, per-generation mode, saved high score. |
| **Card Packs** `/packs` | Open 5-card booster packs (rarity from base-stat total, 1-in-25 ✨ shiny) and fill your binder. |
| **Facts** `/facts` | Pokémon of the Day, random Pokédex entries, trivia deck and an interactive type-matchup lab. |

Favorites, collection and game records are stored in `localStorage`.

## Run it
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```
Requires internet access (PokéAPI for data; the PokéAPI sprites/cries repos for images and audio).

## Project layout
```
app/            routes (page.js per feature) + components/
lib/pokeapi.js  cached fetch helpers, name/artwork helpers
lib/types.js    type colours, type chart, generations
lib/battle.js   damage formula, move picking, AI
lib/cards.js    rarity + pack opening
lib/storage.js  localStorage hooks (favorites, collection)
```
Pokémon and all related names & artwork are © Nintendo / Creatures Inc. / GAME FREAK inc. Educational, non-commercial fan project.
