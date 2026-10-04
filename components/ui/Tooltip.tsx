"use client";

import { useEarthStore } from "@/store/earthStore";

export function Tooltip() {
  const hover = useEarthStore((state) => state.hover);
  if (!hover) return null;
  return (
    <div
      className="glass pointer-events-none absolute z-40 rounded-xl px-3 py-2 text-[12px]"
      style={{ left: hover.x + 14, top: hover.y + 14 }}
    >
      <p className="font-medium">{hover.name}</p>
      {hover.detail ? <p className="text-secondary">{hover.detail}</p> : null}
    </div>
  );
}
