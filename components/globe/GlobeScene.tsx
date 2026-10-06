"use client";

import { Canvas } from "@react-three/fiber";
import { LinearSRGBColorSpace, NoToneMapping } from "three";
import { latLonToVector3 } from "@/lib/geo";
import { subsolar } from "@/lib/sun";
import { useEarthStore } from "@/store/earthStore";
import { Atmosphere } from "./Atmosphere";
import { CameraRig, useGlobeShift } from "./CameraRig";
import { Clouds } from "./Clouds";
import { Earth } from "./Earth";
import { PlacePin } from "./PlacePin";
import { SelectedRiver } from "./SelectedRiver";
import { ProjectionMorph } from "./ProjectionMorph";

function GlobeContents() {
  const globe = useEarthStore((state) => state.projection) === "globe";
  useGlobeShift();
  return (
    <>
      <group name="globe-root">
        <Earth />
        {globe ? <Clouds /> : null}
        {globe ? <Atmosphere /> : null}
        <PlacePin />
        <SelectedRiver />
      </group>
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
        alpha: true,
        toneMapping: NoToneMapping,
        outputColorSpace: LinearSRGBColorSpace,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <GlobeContents />
    </Canvas>
  );
}
