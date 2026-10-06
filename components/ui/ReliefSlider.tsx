"use client";

import { MAX_DISPLACEMENT, REAL_DISPLACEMENT, reliefDisplacement } from "@/lib/elevation";
import { useEarthStore } from "@/store/earthStore";

function sliderValue(displacement: number) {
  if (displacement <= 0) return 0;
  if (displacement <= REAL_DISPLACEMENT) return 0.5 * (displacement / REAL_DISPLACEMENT);
  const span = MAX_DISPLACEMENT - REAL_DISPLACEMENT;
  return Math.min(1, 0.5 + 0.5 * ((displacement - REAL_DISPLACEMENT) / span));
}

export function applyReliefStrength(value: number) {
  const store = useEarthStore.getState();
  if (value <= 0) {
    store.setReliefMode("off");
    return;
  }
  if (value <= 0.5) {
    store.setReliefExaggeration(value / 0.5);
    store.setReliefMode("normal");
    return;
  }
  const displacement = REAL_DISPLACEMENT + ((value - 0.5) / 0.5) * (MAX_DISPLACEMENT - REAL_DISPLACEMENT);
  store.setReliefExaggeration(displacement / (MAX_DISPLACEMENT / 3));
  store.setReliefMode("exaggerated");
}

let restored: { mode: "normal" | "exaggerated"; amount: number } = { mode: "normal", amount: 1 };

export function toggleRelief() {
  const store = useEarthStore.getState();
  const displacement = reliefDisplacement(store.reliefMode, store.reliefExaggeration, store.layers.relief);
  if (displacement > 0) {
    restored = {
      mode: store.reliefMode === "exaggerated" ? "exaggerated" : "normal",
      amount: store.reliefExaggeration,
    };
    store.setReliefMode("off");
    return;
  }
  store.setReliefExaggeration(restored.amount);
  store.setReliefMode(restored.mode);
}

export function ReliefSlider() {
  const mode = useEarthStore((state) => state.reliefMode);
  const amount = useEarthStore((state) => state.reliefExaggeration);
  const enabled = useEarthStore((state) => state.layers.relief);
  const value = Math.round(sliderValue(reliefDisplacement(mode, amount, enabled)) * 100) / 100;

  return (
    <label className="w-[min(13rem,calc(100vw-6.75rem))] text-[12px]">
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        aria-label="Relief"
        onChange={(event) => applyReliefStrength(Number(event.target.value))}
        className="orb-range w-full"
      />
      <span className="mt-1 grid grid-cols-3 text-[10px] tracking-wide text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]">
        <span>Plat</span>
        <span className="text-center">Réel</span>
        <span className="text-right">Exagéré</span>
      </span>
    </label>
  );
}
