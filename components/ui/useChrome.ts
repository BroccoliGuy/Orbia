"use client";

import { useEffect, useState } from "react";
import { useEarthStore } from "@/store/earthStore";

export function useIdleChrome() {
  useEffect(() => {
    let timer = 0;
    const poke = () => {
      useEarthStore.getState().setControlsVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        useEarthStore.getState().setControlsVisible(false);
      }, 3000);
    };
    poke();
    window.addEventListener("pointermove", poke);
    window.addEventListener("keydown", poke);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", poke);
      window.removeEventListener("keydown", poke);
    };
  }, []);
}

export function useCompact() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const apply = () => setCompact(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return compact;
}
