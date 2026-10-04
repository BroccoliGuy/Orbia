"use client";

import { useEarthStore } from "@/store/earthStore";

export function Compass() {
  const heading = useEarthStore((state) => state.heading);
  const degrees = (-heading * 180) / Math.PI;

  return (
    <div
      className="pointer-events-none absolute top-24 right-5 z-20 h-[72px] w-[72px] max-md:top-16 max-md:right-3 max-md:scale-90"
      aria-hidden
    >
      <div
        className="relative h-full w-full rounded-full border border-white/15 bg-[rgba(5,12,22,0.35)]"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-[#ff5a5a]">N</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-secondary">S</span>
        <span className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[10px] text-secondary">O</span>
        <span className="absolute top-1/2 right-1.5 -translate-y-1/2 text-[10px] text-secondary">E</span>
        <span className="absolute top-1/2 left-1/2 h-0 w-0 -translate-x-1/2 -translate-y-3 border-x-[5px] border-b-0 border-t-[8px] border-x-transparent border-t-[#ff5a5a]" />
      </div>
    </div>
  );
}
