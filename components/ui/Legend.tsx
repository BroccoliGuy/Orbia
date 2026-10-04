"use client";

import type { Dataset } from "@/types";
import { useEarthStore } from "@/store/earthStore";

const COPY: Record<Dataset, { title: string; unit: string; low: string; high: string }> = {
  population: { title: "Population", unit: "habitants", low: "Faible", high: "Élevée" },
  density: { title: "Densité", unit: "hab. / km²", low: "0", high: "500+" },
  growth: { title: "Croissance", unit: "% / an", low: "0", high: "3+" },
  medianAge: { title: "Âge médian", unit: "années", low: "18", high: "45+" },
  temperature: { title: "Température", unit: "°C", low: "-10", high: "30" },
  precipitation: { title: "Précipitations", unit: "mm / an", low: "0", high: "3000" },
  humidity: { title: "Humidité", unit: "%", low: "20", high: "90" },
  koppen: { title: "Köppen", unit: "classe", low: "Froid", high: "Tropical" },
  elevation: { title: "Altitude", unit: "m", low: "0", high: "4000+" },
};

export function Legend() {
  const dataset = useEarthStore((state) => state.dataset);
  if (!dataset) return null;
  const copy = COPY[dataset];
  return (
    <aside className="glass absolute bottom-28 left-1/2 z-20 w-[210px] -translate-x-1/2 rounded-2xl p-3">
      <p className="text-[12px] tracking-[0.12em] text-secondary uppercase">{copy.title}</p>
      <div className="mt-2 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #14324a, #20bfff 45%, #ffb020 75%, #ff5a4a)" }} />
      <div className="mt-1 flex justify-between text-[11px] text-secondary">
        <span>{copy.low}</span>
        <span>{copy.high}</span>
      </div>
      <p className="mt-1 text-[11px] text-secondary">{copy.unit}</p>
    </aside>
  );
}
