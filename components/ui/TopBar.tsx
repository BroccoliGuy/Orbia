"use client";

import { CircleHelp, Globe, Settings, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchBox } from "@/components/ui/SearchBox";
import { useEarthStore } from "@/store/earthStore";

const SHORTCUTS = [
  ["G", "Globe"],
  ["L", "Couches"],
  ["D", "Données"],
  ["T", "Relief"],
  ["C", "Climat"],
  ["R", "Réinitialiser"],
  ["Échap", "Fermer"],
  ["F", "Plein écran"],
  ["Espace", "Mode cinéma"],
];

export function TopBar() {
  const [help, setHelp] = useState(false);
  const [settings, setSettings] = useState(false);
  const resetView = useEarthStore((state) => state.resetView);
  const toggleCinematic = useEarthStore((state) => state.toggleCinematic);

  useEffect(() => {
    if (!help && !settings) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelp(false);
        setSettings(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [help, settings]);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-4 pt-4 sm:px-5">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-[#041018] shadow-[0_0_24px_rgba(32,191,255,0.35)]">
          <Globe strokeWidth={1.5} size={18} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] leading-none font-semibold tracking-tight">Orbia</span>
          <span className="mt-1 block text-[11px] text-secondary">Explore · Understand · Protect</span>
        </span>
      </div>

      <SearchBox />

      <div className="pointer-events-auto flex items-center gap-2">
        <span className="glass hidden items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-secondary sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Données en direct
        </span>
        <button
          type="button"
          aria-label="Réglages"
          aria-expanded={settings}
          onClick={() => {
            setSettings((open) => !open);
            setHelp(false);
          }}
          className="glass grid h-9 w-9 place-items-center rounded-full text-secondary hover:text-foreground"
        >
          <Settings strokeWidth={1.5} size={16} />
        </button>
        <button
          type="button"
          aria-label="Raccourcis clavier"
          aria-expanded={help}
          onClick={() => {
            setHelp((open) => !open);
            setSettings(false);
          }}
          className="glass grid h-9 w-9 place-items-center rounded-full text-secondary hover:text-foreground"
        >
          <CircleHelp strokeWidth={1.5} size={16} />
        </button>
        <button
          type="button"
          aria-label="Compte non connecté"
          className="glass grid h-9 w-9 place-items-center rounded-full text-secondary"
        >
          <UserRound strokeWidth={1.5} size={16} />
        </button>
      </div>

      {settings ? (
        <div className="glass pointer-events-auto absolute top-16 right-5 w-56 rounded-2xl p-2 text-[13px]">
          <button type="button" className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/5" onClick={() => { toggleCinematic(); setSettings(false); }}>
            Mode cinéma
          </button>
          <button
            type="button"
            className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/5"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void document.documentElement.requestFullscreen();
              setSettings(false);
            }}
          >
            Plein écran
          </button>
          <button type="button" className="block w-full rounded-xl px-3 py-2 text-left hover:bg-white/5" onClick={() => { resetView(); setSettings(false); }}>
            Réinitialiser la vue
          </button>
        </div>
      ) : null}

      {help ? (
        <div role="dialog" aria-label="Raccourcis" className="glass pointer-events-auto absolute top-16 right-5 w-64 rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] tracking-[0.14em] text-secondary">RACCOURCIS</p>
            <button type="button" aria-label="Fermer" onClick={() => setHelp(false)}>
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <ul className="space-y-1.5 text-[13px]">
            {SHORTCUTS.map(([key, label]) => (
              <li key={key} className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-secondary">{key}</kbd>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
