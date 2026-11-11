import "./globals.css";
import Navbar from "./components/Navbar";
export const metadata={title:"PokéAtlas — Explore the Pokémon World",description:"A fan-made Pokédex and Pokémon playground powered by PokéAPI."};
export default function RootLayout({children}){return <html lang="en"><body><Navbar/>{children}</body></html>;}
