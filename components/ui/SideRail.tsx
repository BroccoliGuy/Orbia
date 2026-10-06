"use client";

import { ChevronLeft, Mountain } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PanelId } from "@/types";
import { useEarthStore } from "@/store/earthStore";
import { useCompact } from "@/components/ui/useChrome";

const ITEMS: { id: PanelId; icon: LucideIcon; label: string }[] = [
  { id: "terrain", icon: Mountain, label: "Relief" },
];

export function SideRail() {
  const active = useEarthStore((state) => state.activePanel);
  const collapsed = useEarthStore((state) => state.railCollapsed);
  const togglePanel = useEarthStore((state) => state.togglePanel);
  const setRailCollapsed = useEarthStore((state) => state.setRailCollapsed);
  const compact = useCompact();

  if (collapsed && !compact) {
    return (
      <button
        type="button"
        aria-label="Ouvrir la barre d'outils"
        onClick={() => setRailCollapsed(false)}
        className="glass absolute top-1/2 left-3 z-30 grid h-10 w-8 -translate-y-1/2 place-items-center rounded-full text-secondary"
      >
        <ChevronLeft className="rotate-180" size={16} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <nav
      aria-label="Outils"
      className={
        compact
          ? "glass absolute inset-x-3 bottom-3 z-30 flex items-center justify-between rounded-2xl px-2 py-1.5"
          : "glass absolute top-24 left-4 z-30 flex w-14 flex-col items-center gap-1 rounded-2xl py-2"
      }
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const selected = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-pressed={selected}
            onClick={() => togglePanel(item.id)}
            className={`grid h-10 w-10 place-items-center rounded-xl ${selected ? "bg-accent text-[#041018]" : "text-secondary hover:bg-white/5 hover:text-foreground"}`}
          >
            <Icon size={18} strokeWidth={1.5} />
          </button>
        );
      })}
      {compact ? null : (
        <button
          type="button"
          aria-label="Replier la barre"
          onClick={() => setRailCollapsed(true)}
          className="mt-1 grid h-8 w-8 place-items-center text-secondary"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
      )}
    </nav>
  );
}
