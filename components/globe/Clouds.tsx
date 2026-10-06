"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Mesh, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import { reliefDisplacement, reliefShell } from "@/lib/elevation";
import { sunDirection } from "@/lib/sun";
import { cloudsFragment, cloudsVertex } from "@/shaders/clouds";
import { useEarthStore } from "@/store/earthStore";

export function Clouds() {
  const visible = useEarthStore((state) => state.layers.clouds && state.style === "realistic");
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => new SphereGeometry(1.02, 64, 48), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSun: { value: new Vector3(1, 0, 0) },
          uTime: { value: 0 },
        },
        vertexShader: cloudsVertex,
        fragmentShader: cloudsFragment,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    material.uniforms.uSun.value.copy(sunDirection);
    const state = useEarthStore.getState();
    const shell = reliefShell(reliefDisplacement(state.reliefMode, state.reliefExaggeration, state.layers.relief));
    if (mesh.current) mesh.current.scale.setScalar(shell.clouds / 1.02);
    const { reducedMotion, style } = state;
    if (!reducedMotion && style === "realistic") {
      material.uniforms.uTime.value = clock.elapsedTime;
      if (mesh.current) mesh.current.rotation.y = clock.elapsedTime * 0.002;
    }
  });

  if (!visible) return null;
  return <mesh ref={mesh} geometry={geometry} material={material} />;
}
