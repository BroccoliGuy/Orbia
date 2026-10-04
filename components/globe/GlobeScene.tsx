"use client";

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LinearSRGBColorSpace, NoToneMapping } from "three";
import { latLonToVector3 } from "@/lib/geo";
import { subsolar } from "@/lib/sun";
import { useEarthStore } from "@/store/earthStore";
import { Atmosphere } from "./Atmosphere";
import { Borders } from "./Borders";
import { CameraRig, useGlobeShift } from "./CameraRig";
import { Clouds } from "./Clouds";
import { Earth } from "./Earth";
import { HeatmapLayer } from "./HeatmapLayer";
import { Markers } from "./Markers";
import { ProjectionMorph } from "./ProjectionMorph";

function GlobeContents() {
  const reducedMotion = useEarthStore((state) => state.reducedMotion);
  const globe = useEarthStore((state) => state.projection) === "globe";
  useGlobeShift();
  return (
    <>
      <color attach="background" args={["#02050a"]} />
      <Stars
        radius={50}
        depth={30}
        count={1800}
        factor={2.2}
        fade
        speed={reducedMotion ? 0 : 0.15}
      />
      <group name="globe-root">
        <Earth />
        {globe ? <Clouds /> : null}
        {globe ? <Atmosphere /> : null}
        {globe ? <Borders /> : null}
        {globe ? <Markers /> : null}
      </group>
      <HeatmapLayer />
      <ProjectionMorph />
      <CameraRig />
    </>
  );
}

const sun = subsolar();
const start = latLonToVector3(Math.max(-25, Math.min(35, sun.lat)), sun.lon + 42, 3.35);

export default function GlobeScene() {
  return (
    <Canvas
      camera={{ position: [start.x, start.y, start.z], fov: 38, near: 0.01, far: 100 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: NoToneMapping,
        outputColorSpace: LinearSRGBColorSpace,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <GlobeContents />
    </Canvas>
  );
}
