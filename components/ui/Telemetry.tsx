"use client";

import { useEffect, useState } from "react";
import { formatLat, formatLon, formatMeters } from "@/lib/geo";
import { scaleBar } from "@/lib/zoom";
import { useEarthStore } from "@/store/earthStore";

export function Telemetry() {
  const cursor = useEarthStore((state) => state.cursor);
  const over = useEarthStore((state) => state.pointerOverGlobe);
  const distance = useEarthStore((state) => state.cameraDistance);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const update = () => setHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const bar = scaleBar(distance, 38, height);

  return (
    <>
      <p
        className="tabular pointer-events-none absolute bottom-4 left-5 text-[12px] tracking-wide text-secondary transition-opacity"
        style={{ opacity: over ? 1 : 0.66 }}
      >
        {formatLat(cursor.lat)}
        <span className="px-2 text-white/25">·</span>
        {formatLon(cursor.lon)}
        <span className="px-2 text-white/25">·</span>
        Alt. {formatMeters(cursor.altitude)}
      </p>
      <div className="pointer-events-none absolute right-5 bottom-4 text-right">
        <div className="ml-auto h-px bg-white/55" style={{ width: bar.px }} />
        <p className="tabular mt-1 text-[11px] text-secondary">
          {bar.km.toLocaleString("fr-FR")} km
        </p>
      </div>
    </>
  );
}
