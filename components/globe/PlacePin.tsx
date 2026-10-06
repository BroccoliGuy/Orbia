"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { Vector3 } from "three";
import { latLonToVector3 } from "@/lib/geo";
import { useEarthStore } from "@/store/earthStore";

export function PlacePin() {
  const location = useEarthStore((state) => state.selectedLocation);
  const cinematic = useEarthStore((state) => state.cinematic);
  const camera = useThree((state) => state.camera);
  const [facing, setFacing] = useState(true);
  const facingRef = useRef(true);
  const point = useRef(new Vector3());

  useFrame(() => {
    if (!location) return;
    const next = latLonToVector3(location.lat, location.lon, 1);
    point.current.set(next.x, next.y, next.z);
    const visible = point.current.dot(camera.position) > 0.05;
    if (visible === facingRef.current) return;
    facingRef.current = visible;
    setFacing(visible);
  });

  if (!location || cinematic || !facing) return null;

  const spot = latLonToVector3(location.lat, location.lon, 1.02);

  return (
    <Html position={[spot.x, spot.y, spot.z]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div className="pointer-events-none flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <div className="mb-2 w-max max-w-56 text-[12px] text-foreground [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]">
          <p className="border-b border-white/45 pb-1 font-medium">{location.name}</p>
          {location.subtitle ? <p className="border-b border-white/20 py-1">{location.subtitle}</p> : null}
          {location.primaryValue ? (
            <p className="flex items-baseline justify-between gap-4 border-b border-white/20 py-1">
              <span>{location.primaryLabel}</span>
              <span className="tabular whitespace-nowrap">{location.primaryValue}</span>
            </p>
          ) : null}
        </div>
        <MapPin size={18} strokeWidth={1.5} className="text-foreground [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.9))]" aria-hidden />
      </div>
    </Html>
  );
}
