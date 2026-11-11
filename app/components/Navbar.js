"use client";
import Link from "next/link";
export default function Navbar(){return <header className="topbar"><Link href="/" className="brand"><span className="brand-ball">◉</span>Poké<span>Atlas</span></Link><nav><Link href="/#pokedex">Explore</Link><a href="/#showdown">Showdown</a><a href="/#trivia">Trivia</a><Link href="/about">About</Link></nav><span className="top-tag">FAN PROJECT</span></header>;}
