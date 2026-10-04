"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { BackSide, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import { sunDirection } from "@/lib/sun";
import { atmosphereFragment, atmosphereVertex } from "@/shaders/atmosphere";

export function Atmosphere() {
  const geometry = useMemo(() => new SphereGeometry(1.055, 64, 48), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uSun: { value: new Vector3(1, 0, 0) } },
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        side: BackSide,
      }),
    [],
  );

  useFrame(() => {
    material.uniforms.uSun.value.copy(sunDirection);
  });

  return <mesh geometry={geometry} material={material} />;
}
