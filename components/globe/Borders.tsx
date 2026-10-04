"use client";

import { useEffect, useMemo, useState } from "react";
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial } from "three";
import { useEarthStore } from "@/store/earthStore";

function useLineGeometry(url: string | null, mode: "borders" | "coasts") {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    if (!url) {
      setGeometry((current) => {
        current?.dispose();
        return null;
      });
      return;
    }
    let alive = true;
    const worker = new Worker(new URL("../../workers/topojson.worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<{ positions: Float32Array }>) => {
      if (!alive) return;
      const next = new BufferGeometry();
      next.setAttribute("position", new Float32BufferAttribute(event.data.positions, 3));
      setGeometry((current) => {
        current?.dispose();
        return next;
      });
    };
    worker.postMessage({ url, mode });
    return () => {
      alive = false;
      worker.terminate();
    };
  }, [url, mode]);

  return geometry;
}

export function Borders() {
  const borders = useEarthStore((state) => state.layers.borders);
  const coasts = useEarthStore((state) => state.layers.coasts);
  const zoom = useEarthStore((state) => state.zoom);
  const borderUrl = borders ? (zoom >= 3 ? "/data/countries-50m.json" : "/data/countries-110m.json") : null;
  const coastUrl = coasts ? "/data/land-110m.json" : null;
  const borderGeometry = useLineGeometry(borderUrl, "borders");
  const coastGeometry = useLineGeometry(coastUrl, "coasts");
  const borderMaterial = useMemo(() => new LineBasicMaterial({ color: "#d5e7f5", transparent: true, opacity: 0.55 }), []);
  const coastMaterial = useMemo(() => new LineBasicMaterial({ color: "#9fd7ff", transparent: true, opacity: 0.35 }), []);

  return (
    <>
      {borderGeometry ? <lineSegments geometry={borderGeometry} material={borderMaterial} /> : null}
      {coastGeometry ? <lineSegments geometry={coastGeometry} material={coastMaterial} /> : null}
    </>
  );
}
