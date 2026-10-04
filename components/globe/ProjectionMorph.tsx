"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils } from "three";
import { earthRefs } from "@/lib/earthRefs";
import { writeProjectedPositions } from "@/lib/projections";
import { useEarthStore } from "@/store/earthStore";

export function ProjectionMorph() {
  const built = useRef("");

  useFrame((_, delta) => {
    const state = useEarthStore.getState();
    const geometry = earthRefs.geometry;
    const material = earthRefs.material;
    if (!geometry || !material) return;
    const key = `${state.projection}:${geometry.uuid}`;
    if (key !== built.current && state.projection !== "globe") {
      writeProjectedPositions(geometry, state.projection);
      built.current = key;
    }
    if (state.projection === "globe") built.current = key;
    const target = state.projection === "globe" ? 0 : 1;
    const current = material.uniforms.uMorph.value as number;
    const next = state.reducedMotion ? target : MathUtils.damp(current, target, 2.4, delta);
    material.uniforms.uMorph.value = next;
    if (Math.abs(next - state.projectionMix) > 0.02) state.setProjectionMix(next);
  });

  return null;
}
