"use client";

import { useEffect } from "react";
import type { Topology as GeoTopology } from "topojson-specification";
import { earthRefs, HEAT_HEIGHT, HEAT_WIDTH, heatPixels } from "@/lib/earthRefs";
import { paintHeatmap } from "@/lib/heatmap";
import { useEarthStore } from "@/store/earthStore";

export function HeatmapLayer() {
  const dataset = useEarthStore((state) => state.dataset);

  useEffect(() => {
    if (!dataset) {
      heatPixels.fill(0);
      earthRefs.heatEpoch += 1;
      if (earthRefs.heat) earthRefs.heat.needsUpdate = true;
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = HEAT_WIDTH;
    canvas.height = HEAT_HEIGHT;
    let alive = true;
    void fetch("/data/countries-110m.json")
      .then((response) => response.json())
      .then((topology: GeoTopology) => {
        if (!alive) return;
        paintHeatmap(canvas, topology, dataset);
        const pixels = canvas.getContext("2d")?.getImageData(0, 0, HEAT_WIDTH, HEAT_HEIGHT);
        if (!pixels) return;
        const row = HEAT_WIDTH * 4;
        for (let y = 0; y < HEAT_HEIGHT; y += 1) {
          const source = (HEAT_HEIGHT - 1 - y) * row;
          heatPixels.set(pixels.data.subarray(source, source + row), y * row);
        }
        earthRefs.heatEpoch += 1;
        const live = earthRefs.material?.uniforms.uHeat?.value;
        const texture = live && "needsUpdate" in live ? live : earthRefs.heat;
        if (texture) texture.needsUpdate = true;
      });
    return () => {
      alive = false;
    };
  }, [dataset]);

  return null;
}
