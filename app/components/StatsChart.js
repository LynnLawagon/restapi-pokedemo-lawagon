"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { STAT_LABELS } from "@/lib/pokeapi";

// register radar components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const KEYS = ["hp", "attack", "defense", "spAtk", "spDef", "speed"];

/** Radar chart of base stats. Accepts one Pokémon, optionally a second one to compare. */
export default function StatsChart({ pokemon, color = "#3b4cca", compare, compareColor = "#ee1515" }) {
  const dataset = (p, c) => ({
    label: p.name,
    data: KEYS.map((k) => p.stats[k]),
    backgroundColor: c + "55",
    borderColor: c,
    borderWidth: 3,
    pointBackgroundColor: "#fff",
    pointBorderColor: c,
    pointRadius: 4,
  });

  const data = {
    labels: KEYS.map((k) => STAT_LABELS[k]),
    datasets: [dataset(pokemon, color), ...(compare ? [dataset(compare, compareColor)] : [])],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        suggestedMax: 150,
        ticks: { display: false, stepSize: 50 },
        grid: { color: "rgba(27,27,31,0.15)" },
        angleLines: { color: "rgba(27,27,31,0.15)" },
        pointLabels: { font: { family: "Fredoka, system-ui, sans-serif", size: 13, weight: "600" }, color: "#1b1b1f" },
      },
    },
    plugins: { legend: { display: !!compare } },
  };

  return <Radar data={data} options={options} />;
}
