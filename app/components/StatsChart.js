"use client";
export default function StatsChart({pokemon}){const max=255;return <div className="stats-list">{pokemon.stats.map(s=><div className="stat-row" key={s.stat.name}><span>{s.stat.name.replace("special-","sp. ")}</span><b>{s.base_stat}</b><div><i style={{width:`${Math.min(100,s.base_stat/max*100)}%`}}/></div></div>)}</div>;}
