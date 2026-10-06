"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, Float32BufferAttribute, type Material } from "three";
import { vector3ToLatLon } from "@/lib/geo";
import { placedPoint } from "@/lib/projections";
import { useEarthStore } from "@/store/earthStore";
import type { Projection } from "@/types";

export function MorphedLines({
  positions,
  material,
  onClick,
  passive = false,
}: {
  positions: Float32Array;
  material: Material;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  passive?: boolean;
}) {
  const geometry = useMemo(() => {
    const next = new BufferGeometry();
    next.setAttribute("position", new Float32BufferAttribute(positions.slice(), 3));
    return next;
  }, [positions]);
  const signature = useRef("");
  const flat = useRef<Exclude<Projection, "globe">>("mercator");

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    const state = useEarthStore.getState();
    if (state.projection !== "globe") flat.current = state.projection;
    const key = `${flat.current}:${state.projectionMix.toFixed(3)}`;
    if (key === signature.current) return;
    signature.current = key;
    const attribute = geometry.getAttribute("position");
    const projection = state.projection === "globe" ? flat.current : state.projection;
    for (let index = 0; index < positions.length; index += 3) {
      const { lat, lon } = vector3ToLatLon(positions[index], positions[index + 1], positions[index + 2]);
      const point = placedPoint(lat, lon, 1.008, projection, state.projectionMix);
      attribute.setXYZ(index / 3, point.x, point.y, point.z);
    }
    attribute.needsUpdate = true;
    geometry.computeBoundingSphere();
  });

  return <lineSegments geometry={geometry} material={material} onClick={onClick} raycast={passive ? () => null : undefined} />;
}
