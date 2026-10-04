"use client";

import { Compass } from "@/components/ui/Compass";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { QuickStyleCard } from "@/components/ui/QuickStyleCard";
import { SidePanel } from "@/components/ui/SidePanel";
import { SideRail } from "@/components/ui/SideRail";
import { TopBar } from "@/components/ui/TopBar";
import { Legend } from "@/components/ui/Legend";
import { Hotkeys } from "@/components/ui/Hotkeys";
import { Tooltip } from "@/components/ui/Tooltip";
import { ZoomControls } from "@/components/ui/ZoomControls";
import { useIdleChrome } from "@/components/ui/useChrome";
import { useEarthStore } from "@/store/earthStore";

export function Overlay() {
  useIdleChrome();
  const cinematic = useEarthStore((state) => state.cinematic);
  return (
    <>
      <Hotkeys />
      {cinematic ? (
        <button
          type="button"
          onClick={() => useEarthStore.getState().setCinematic(false)}
          className="glass absolute top-4 right-4 z-40 rounded-full px-3 py-1.5 text-[12px] text-secondary"
        >
          Quitter
        </button>
      ) : (
        <>
          <TopBar />
          <SideRail />
          <SidePanel />
          <QuickStyleCard />
          <Compass />
          <ZoomControls />
          <PlaceCard />
          <Legend />
          <Tooltip />
        </>
      )}
    </>
  );
}
