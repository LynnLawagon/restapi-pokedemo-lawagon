import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Pokédemo — Pokémon Dashboard",
  description:
    "A Pokémon fan playground built on PokeAPI: Pokédex trading cards, Showdown battles, Who's That Pokémon quiz, card packs and facts.",
};

export const viewport = {
  themeColor: "#ee1515",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
