"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { latLonToVector3, vector3ToLatLon } from "@/lib/geo";
import { updateSun } from "@/lib/sun";
import { distanceToZoom, ZOOM_DISTANCES } from "@/lib/zoom";
import { useEarthStore } from "@/store/earthStore";

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const destination = useRef<Vector3 | null>(null);
  const token = useRef(0);
  const stamp = useRef(0);

  useFrame((_, delta) => {
    updateSun();
    const state = useEarthStore.getState();
    const orbit = controls.current;

    if (state.projection !== "globe") {
      if (orbit) orbit.enabled = false;
      destination.current = null;
      const framed = new Vector3(0, 0, 3.2);
      const mix = state.reducedMotion ? 1 : 1 - Math.pow(0.02, delta);
      camera.position.lerp(framed, Math.min(1, mix));
    } else {
      if (state.flyTarget) {
        const flightDistance = ZOOM_DISTANCES[state.flyTarget.zoom] ?? ZOOM_DISTANCES[0];
        const point = latLonToVector3(state.flyTarget.lat, state.flyTarget.lon, flightDistance);
        destination.current = new Vector3(point.x, point.y, point.z);
      }
      if (destination.current) {
        if (orbit) {
          orbit.enableRotate = false;
          orbit.enableZoom = false;
        }
        const mix = state.reducedMotion ? 1 : 1 - Math.pow(0.015, delta);
        camera.position.lerp(destination.current, Math.min(1, mix));
        orbit?.update();
        if (camera.position.distanceTo(destination.current) < 0.02) {
          camera.position.copy(destination.current);
          orbit?.update();
          destination.current = null;
          if (orbit) {
            orbit.enableRotate = true;
            orbit.enableZoom = true;
          }
          state.clearFlyTarget();
        }
      } else if (orbit) {
        orbit.enableDamping = !state.reducedMotion;
        orbit.enabled = true;
      }
    }

    const now = performance.now();
    if (now - stamp.current < 80) return;
    stamp.current = now;
    const distance = camera.position.length();
    const zoom = distanceToZoom(distance);
    const north = new Vector3(0, 1, 0).project(camera);
    const heading = Math.atan2(north.x, north.y);
    const view = vector3ToLatLon(camera.position.x, camera.position.y, camera.position.z);
    if (Math.abs(state.cameraDistance - distance) > 0.015) state.setCameraDistance(distance);
    if (state.zoom !== zoom) state.setZoom(zoom);
    if (Math.abs(state.heading - heading) > 0.012) state.setHeading(heading);
    if (Math.abs(state.viewLat - view.lat) > 0.05 || Math.abs(state.viewLon - view.lon) > 0.05) {
      state.setView(view.lat, view.lon);
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.085}
      minDistance={1.08}
      maxDistance={5.4}
      rotateSpeed={0.42}
      zoomSpeed={0.55}
      target={[0, 0, 0]}
    />
  );
}

export function useGlobeShift() {
  const shift = useRef(0);
  const { camera, scene } = useThree();
  useFrame((_, delta) => {
    const state = useEarthStore.getState();
    const closeness = Math.min(1, Math.max(0.12, (camera.position.length() - 1.05) / 2.3));
    const target = state.selectedLocation ? -0.24 * closeness : 0;
    const mix = state.reducedMotion ? 1 : 1 - Math.pow(0.05, delta);
    shift.current = MathUtils.lerp(shift.current, target, mix);
    const globe = scene.getObjectByName("globe-root");
    if (globe) globe.position.x = shift.current;
  });
}
