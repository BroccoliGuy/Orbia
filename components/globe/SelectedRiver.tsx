"use client";

import { useMemo } from "react";
import { LineBasicMaterial } from "three";
import { LAKES, RIVERS } from "@/data/features";
import { polylinePositions } from "@/lib/lines";
import { useEarthStore } from "@/store/earthStore";
import { MorphedLines } from "./MorphedLines";

export function SelectedRiver() {
  const location = useEarthStore((state) => state.selectedLocation);
  const cinematic = useEarthStore((state) => state.cinematic);
  const lines = useMemo(() => {
    if (!location) return null;
    if (location.kind === "river") {
      const named = RIVERS.find((item) => item.id === location.id);
      if (!named) return null;
      return RIVERS.filter((item) => item.name === named.name).map((item) => item.points);
    }
    if (location.kind === "lake") {
      const lake = LAKES.find((item) => item.id === location.id);
      return lake ? [lake.points] : null;
    }
    return null;
  }, [location]);
  const positions = useMemo(() => (lines?.length ? polylinePositions(lines, 1.008) : null), [lines]);
  const material = useMemo(() => new LineBasicMaterial({ color: "#f5f7fa", transparent: true, opacity: 0.95 }), []);

  if (!positions || positions.length === 0 || cinematic) return null;
  return <MorphedLines positions={positions} material={material} passive />;
}
