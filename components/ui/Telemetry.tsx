"use client";

import { formatLat, formatLon, formatMeters } from "@/lib/geo";
import { useEarthStore } from "@/store/earthStore";

export function Telemetry() {
  const cursor = useEarthStore((state) => state.cursor);
  const over = useEarthStore((state) => state.pointerOverGlobe);

  return (
    <p
      className="tabular pointer-events-none absolute bottom-4 left-5 text-[12px] tracking-wide text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)] transition-opacity"
      style={{ opacity: over ? 1 : 0.66 }}
    >
      {formatLat(cursor.lat)}
      <span className="px-2 text-white/25">·</span>
      {formatLon(cursor.lon)}
      <span className="px-2 text-white/25">·</span>
      Alt. {formatMeters(cursor.altitude)}
    </p>
  );
}
