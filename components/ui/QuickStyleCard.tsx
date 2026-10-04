"use client";

import { ChevronRight, Globe, Mountain, Spline, Building2 } from "lucide-react";
import { useState } from "react";
import { useEarthStore } from "@/store/earthStore";

export function QuickStyleCard() {
  const style = useEarthStore((state) => state.style);
  const setStyle = useEarthStore((state) => state.setStyle);
  const layers = useEarthStore((state) => state.layers);
  const setLayer = useEarthStore((state) => state.setLayer);
  const reliefMode = useEarthStore((state) => state.reliefMode);
  const setReliefMode = useEarthStore((state) => state.setReliefMode);
  const [open, setOpen] = useState(false);
  const realistic = style === "realistic";

  const rows = [
    {
      icon: Spline,
      label: "Frontières",
      checked: layers.borders,
      toggle: () => setLayer("borders", !layers.borders),
    },
    {
      icon: Spline,
      label: "Rivières",
      checked: layers.rivers,
      toggle: () => setLayer("rivers", !layers.rivers),
    },
    {
      icon: Mountain,
      label: "Relief",
      checked: layers.relief && reliefMode !== "off",
      toggle: () => setReliefMode(reliefMode === "off" ? "normal" : "off"),
    },
    {
      icon: Building2,
      label: "Villes",
      checked: layers.cities,
      toggle: () => setLayer("cities", !layers.cities),
    },
  ];

  return (
    <section className="glass absolute bottom-12 left-4 z-30 w-[230px] rounded-3xl p-3 max-md:hidden">
      <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#123]" aria-hidden>
          <Globe size={18} className="text-accent" strokeWidth={1.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-medium">{realistic ? "Vue réaliste" : "Vue low poly"}</span>
          <span className="block text-[11px] text-secondary">{realistic ? "Terre en 3D" : "Facettes"}</span>
        </span>
        <ChevronRight size={16} strokeWidth={1.5} className="text-secondary" />
      </button>
      {open ? (
        <div className="mt-2 border-t border-white/10 pt-2" role="radiogroup" aria-label="Style de rendu">
          <button type="button" className="block w-full rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-white/5" onClick={() => setStyle("realistic")}>Réaliste</button>
          <button type="button" className="block w-full rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-white/5" onClick={() => setStyle("low-poly")}>Low poly</button>
        </div>
      ) : null}
      <ul className="mt-2 space-y-1 border-t border-white/10 pt-2">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li key={row.label} className="flex items-center gap-2 px-1 text-[13px]">
              <Icon size={14} strokeWidth={1.5} className="text-secondary" aria-hidden />
              <span className="flex-1">{row.label}</span>
              <button
                type="button"
                role="switch"
                aria-label={row.label}
                aria-checked={row.checked}
                onClick={row.toggle}
                className={`relative h-[18px] w-8 rounded-full ${row.checked ? "bg-accent" : "bg-white/15"}`}
              >
                <span className={`absolute top-[2px] h-3.5 w-3.5 rounded-full bg-white ${row.checked ? "left-[16px]" : "left-[2px]"}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
