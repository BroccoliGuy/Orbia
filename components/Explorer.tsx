"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useViewUrl } from "@/components/useViewUrl";
import { Overlay } from "@/components/ui/Overlay";
import { Telemetry } from "@/components/ui/Telemetry";
import { useEarthStore } from "@/store/earthStore";

const GlobeScene = dynamic(() => import("@/components/globe/GlobeScene"), {
  ssr: false,
});

function ViewUrl() {
  useViewUrl();
  return null;
}

export default function Explorer() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => useEarthStore.getState().setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <main className="fixed inset-0 h-dvh w-screen overflow-hidden bg-background text-foreground">
      <h1 className="sr-only">Orbia</h1>
      <div className="absolute inset-0">
        <GlobeScene />
      </div>
      <Suspense fallback={null}>
        <ViewUrl />
      </Suspense>
      <Overlay />
      <Telemetry />
    </main>
  );
}
