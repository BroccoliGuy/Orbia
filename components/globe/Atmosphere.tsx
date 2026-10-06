"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, Mesh, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import { reliefDisplacement, reliefShell } from "@/lib/elevation";
import { sunDirection } from "@/lib/sun";
import { useEarthStore } from "@/store/earthStore";
import { atmosphereFragment, atmosphereVertex } from "@/shaders/atmosphere";

export function Atmosphere() {
  const mesh = useRef<Mesh>(null);
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
    const state = useEarthStore.getState();
    const shell = reliefShell(reliefDisplacement(state.reliefMode, state.reliefExaggeration, state.layers.relief));
    if (mesh.current) mesh.current.scale.setScalar(shell.atmosphere / 1.055);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}
