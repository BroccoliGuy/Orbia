"use client";

import { X } from "lucide-react";
import { Hotkeys } from "@/components/ui/Hotkeys";
import { ReliefSlider } from "@/components/ui/ReliefSlider";
import { TiltSlider } from "@/components/ui/TiltSlider";
import { TopBar } from "@/components/ui/TopBar";
import { Tooltip } from "@/components/ui/Tooltip";
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
          aria-label="Quitter"
          onClick={() => useEarthStore.getState().setCinematic(false)}
          className="absolute top-4 right-4 z-40 grid h-9 w-9 place-items-center text-foreground [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.9))]"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      ) : (
        <>
          <TopBar />
          <div className="pointer-events-auto absolute right-3 bottom-5 z-30 flex items-end gap-4 sm:right-5">
            <ReliefSlider />
            <TiltSlider />
          </div>
          <Tooltip />
        </>
      )}
    </>
  );
}
