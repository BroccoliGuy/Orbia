"use client";

import { useEarthStore } from "@/store/earthStore";

export function Tooltip() {
  const hover = useEarthStore((state) => state.hover);
  const showHover = useEarthStore((state) => state.showHover);
  if (!showHover || !hover) return null;
  return (
    <div
      className="pointer-events-none absolute z-40 w-max text-[12px] text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]"
      style={{ left: hover.x + 14, top: hover.y + 14 }}
    >
      <p className="border-b border-white/45 pb-1 font-medium">{hover.name}</p>
      {hover.detail ? <p className="border-b border-white/20 py-1 tabular">{hover.detail}</p> : null}
    </div>
  );
}
