"use client";

import { Crosshair, LayoutGrid, Maximize, Minus, Plus } from "lucide-react";
import { ZOOM_DISTANCES, ZOOM_LABELS } from "@/lib/zoom";
import { useEarthStore } from "@/store/earthStore";

export function ZoomControls() {
  const zoom = useEarthStore((state) => state.zoom);
  const distance = useEarthStore((state) => state.cameraDistance);
  const visible = useEarthStore((state) => state.controlsVisible);
  const viewLat = useEarthStore((state) => state.viewLat);
  const viewLon = useEarthStore((state) => state.viewLon);
  const flyTo = useEarthStore((state) => state.flyTo);
  const resetView = useEarthStore((state) => state.resetView);
  const projection = useEarthStore((state) => state.projection);
  const setProjection = useEarthStore((state) => state.setProjection);
  const togglePanel = useEarthStore((state) => state.togglePanel);
  const percent = Math.max(40, Math.min(320, Math.round((ZOOM_DISTANCES[0] / distance) * 100)));

  function step(direction: -1 | 1) {
    flyTo(viewLat, viewLon, Math.min(6, Math.max(0, zoom + direction)));
  }

  return (
    <>
      <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 w-[180px] -translate-x-1/2 text-center">
        <input
          type="range"
          min={0}
          max={6}
          step={1}
          value={zoom}
          aria-label="Niveau de zoom"
          onChange={(event) => flyTo(viewLat, viewLon, Number(event.target.value))}
          className="pointer-events-auto w-full accent-[#20bfff]"
        />
        <p className="mt-1 text-[11px] text-secondary">{ZOOM_LABELS[zoom]}</p>
      </div>

      <div
        className="absolute right-5 bottom-12 z-20 flex items-center gap-2 transition-opacity max-md:right-3"
        style={{ opacity: visible ? 1 : 0.15, pointerEvents: visible ? "auto" : "none" }}
      >
        <div className="glass flex items-center rounded-full px-1 py-1">
          <button type="button" aria-label="Zoom arrière" onClick={() => step(-1)} className="grid h-8 w-8 place-items-center">
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <span className="tabular w-12 text-center text-[12px]">{percent}%</span>
          <button type="button" aria-label="Zoom avant" onClick={() => step(1)} className="grid h-8 w-8 place-items-center">
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
        <button type="button" aria-label="Recadrer" onClick={resetView} className="glass grid h-9 w-9 place-items-center rounded-full">
          <Crosshair size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Plein écran"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void document.documentElement.requestFullscreen();
          }}
          className="glass grid h-9 w-9 place-items-center rounded-full"
        >
          <Maximize size={15} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Projection"
          aria-pressed={projection !== "globe"}
          onClick={() => {
            if (projection === "globe") setProjection("mercator");
            togglePanel("globe");
          }}
          className="glass grid h-9 w-9 place-items-center rounded-full"
        >
          <LayoutGrid size={15} strokeWidth={1.5} />
        </button>
      </div>
    </>
  );
}
