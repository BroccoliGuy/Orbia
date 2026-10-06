"use client";

import { useEarthStore } from "@/store/earthStore";

export function TiltSlider() {
  const tilt = useEarthStore((state) => state.viewTilt);
  const setViewTilt = useEarthStore((state) => state.setViewTilt);

  return (
    <label className="flex w-max flex-col items-center text-[10px] tracking-wide text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]">
      <span>Horizon</span>
      <span className="relative mt-1 h-28 w-3.5">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={tilt}
          aria-label="Inclinaison"
          aria-orientation="vertical"
          onChange={(event) => setViewTilt(Number(event.target.value))}
          style={{ transform: "translate(-50%, -50%) rotate(-90deg)" }}
          className="orb-range absolute top-1/2 left-1/2 w-28"
        />
      </span>
      <span className="mt-3 mb-9">Face</span>
    </label>
  );
}
