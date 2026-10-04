"use client";

import { useEffect } from "react";
import { useEarthStore } from "@/store/earthStore";

export function Hotkeys() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const store = useEarthStore.getState();
      const key = event.key.toLowerCase();
      if (event.code === "Space") {
        event.preventDefault();
        store.toggleCinematic();
        return;
      }
      if (event.key === "Escape") {
        if (store.cinematic) store.setCinematic(false);
        else if (store.detailOpen) store.setDetailOpen(false);
        else if (store.activePanel) store.closePanel();
        else store.selectLocation(null);
        return;
      }
      if (key === "g") store.togglePanel("globe");
      if (key === "l") store.togglePanel("layers");
      if (key === "d") store.togglePanel("data");
      if (key === "t") store.togglePanel("terrain");
      if (key === "c") store.togglePanel("climate");
      if (key === "r") store.resetView();
      if (key === "f") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
