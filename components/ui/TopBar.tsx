"use client";

import { CircleHelp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SearchBox } from "@/components/ui/SearchBox";

const SHORTCUTS = [
  ["T", "Relief"],
  ["I", "Horizon"],
  ["H", "Survol"],
  ["R", "Réinitialiser"],
  ["F", "Plein écran"],
  ["Espace", "Mode cinéma"],
  ["Échap", "Fermer"],
];

export function TopBar() {
  const [help, setHelp] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!help) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setHelp(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      setHelp(false);
    };
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [help]);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <SearchBox />
      <div ref={root} className="pointer-events-auto absolute top-4 right-4 sm:right-5">
        <button
          type="button"
          aria-label="Raccourcis clavier"
          aria-expanded={help}
          onClick={() => setHelp((open) => !open)}
          className="grid h-9 w-9 place-items-center text-foreground [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.9))]"
        >
          <CircleHelp strokeWidth={1.5} size={16} />
        </button>
        {help ? (
          <div role="dialog" aria-label="Raccourcis" className="absolute top-12 right-0 w-56 text-[13px]">
            <div className="mb-2 flex items-center justify-between border-b border-white/45 pb-2">
              <p className="text-[12px] tracking-[0.14em] text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]">RACCOURCIS</p>
              <button type="button" aria-label="Fermer" onClick={() => setHelp(false)} className="text-foreground [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.9))]">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
            <ul>
              {SHORTCUTS.map(([key, label]) => (
                <li key={key} className="flex items-center justify-between gap-3 border-b border-white/20 py-1.5">
                  <span>{label}</span>
                  <span className="text-[11px] text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]">{key}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </header>
  );
}
