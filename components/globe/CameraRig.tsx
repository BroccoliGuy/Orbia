"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { flightSample, flightTrack, slerpDirection } from "@/lib/flight";
import { vector3ToLatLon } from "@/lib/geo";
import { updateSun } from "@/lib/sun";
import { distanceToZoom, ZOOM_DISTANCES } from "@/lib/zoom";
import { useEarthStore } from "@/store/earthStore";

const MIN_DISTANCE = 1.08;
const MAX_DISTANCE = 5.4;
const DAMPING = 0.085;
const POLAR_LIMIT = 1e-6;

function rotateSpeed(distance: number) {
  const span = Math.max(0.05, distance - 1);
  return 0.42 * (span / (ZOOM_DISTANCES[0] - 1));
}

export function CameraRig() {
  const { camera, size, gl } = useThree();
  const direction = useRef(new Vector3());
  const gaze = useRef(new Vector3());
  const offset = useRef(new Vector3());
  const north = useRef(new Vector3(0, 1, 0));
  const steadyUp = useRef(new Vector3(0, 1, 0));
  const dragging = useRef(false);
  const token = useRef(-1);
  const stamp = useRef(0);
  const pendingTheta = useRef(0);
  const pendingPhi = useRef(0);
  const zoomScale = useRef(1);
  const basePosition = useRef(new Vector3());
  const baseUp = useRef(new Vector3(0, 1, 0));
  const hasBase = useRef(false);

  function place(dTheta: number, dPhi: number) {
    const length = Math.max(camera.position.length(), 1e-6);
    const theta = Math.atan2(camera.position.x, camera.position.z) + dTheta;
    const rawPhi = Math.acos(Math.max(-1, Math.min(1, camera.position.y / length))) + dPhi;
    const phi = Math.max(POLAR_LIMIT, Math.min(Math.PI - POLAR_LIMIT, rawPhi));
    const upright = camera.up.x === 0 && camera.up.y === 1 && camera.up.z === 0;
    if (Math.abs(dTheta) < 1e-8 && Math.abs(dPhi) < 1e-8 && phi === rawPhi && upright) return;
    const sinPhi = Math.sin(phi);
    camera.position.set(length * sinPhi * Math.sin(theta), length * Math.cos(phi), length * sinPhi * Math.cos(theta));
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
  }

  function rememberBase() {
    basePosition.current.copy(camera.position);
    baseUp.current.copy(camera.up);
    hasBase.current = true;
  }

  function restoreBase() {
    if (!hasBase.current) return;
    camera.position.copy(basePosition.current);
    camera.up.copy(baseUp.current);
  }

  function applyTilt() {
    const tilt = useEarthStore.getState().viewTilt;
    if (!(camera instanceof PerspectiveCamera) || tilt <= 0) {
      camera.lookAt(0, 0, 0);
      return;
    }
    const distance = Math.max(camera.position.length(), 1.001);
    const halfFov = (camera.fov * Math.PI) / 360;
    const limb = Math.asin(Math.min(0.999, 1 / distance));
    const closeness = Math.min(1, Math.max(0, (limb - halfFov) / 0.35));
    const alpha = tilt * closeness * 0.9;
    if (alpha <= 0) {
      camera.lookAt(0, 0, 0);
      return;
    }
    const pivot = gaze.current.copy(camera.position).normalize();
    const right = offset.current.copy(camera.up).cross(pivot);
    if (right.lengthSq() < 1e-8) {
      camera.lookAt(0, 0, 0);
      return;
    }
    right.normalize();
    camera.position.sub(pivot).applyAxisAngle(right, alpha).add(pivot);
    camera.up.applyAxisAngle(right, alpha);
    camera.lookAt(pivot);
  }

  useEffect(() => {
    const element = gl.domElement;
    element.style.touchAction = "none";
    let lastX = 0;
    let lastY = 0;
    let pinch = 0;
    const points = new Map<number, { x: number; y: number }>();

    const pairDistance = () => {
      const [a, b] = [...points.values()];
      if (!a || !b) return 0;
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const stopFlight = () => {
      const state = useEarthStore.getState();
      if (!state.flyTarget) return;
      state.clearFlyTarget();
      pendingTheta.current = 0;
      pendingPhi.current = 0;
      zoomScale.current = 1;
    };

    const capture = (pointerId: number) => {
      try {
        element.setPointerCapture(pointerId);
      } catch {
        // Pointeur déjà relâché, ou événement sans pointeur actif.
      }
    };

    const release = (pointerId: number) => {
      try {
        if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
      } catch {
        // Rien à relâcher.
      }
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (useEarthStore.getState().projection !== "globe") return;
      points.set(event.pointerId, { x: event.clientX, y: event.clientY });
      capture(event.pointerId);
      stopFlight();
      if (points.size >= 2) {
        dragging.current = false;
        pinch = pairDistance();
        return;
      }
      dragging.current = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onMove = (event: PointerEvent) => {
      if (!points.has(event.pointerId)) return;
      points.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (points.size >= 2) {
        const next = pairDistance();
        if (pinch > 0 && next > 0) {
          const ratio = pinch / next;
          zoomScale.current *= Math.pow(ratio, 0.55);
          pinch = next;
        }
        return;
      }
      if (!dragging.current) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      const height = element.clientHeight || 1;
      const speed = rotateSpeed(camera.position.length());
      pendingTheta.current -= (2 * Math.PI * speed * dx) / height;
      pendingPhi.current -= (2 * Math.PI * speed * dy) / height;
    };

    const onUp = (event: PointerEvent) => {
      points.delete(event.pointerId);
      release(event.pointerId);
      if (points.size === 1) {
        const only = [...points.values()][0];
        dragging.current = true;
        lastX = only.x;
        lastY = only.y;
        pinch = 0;
        return;
      }
      dragging.current = false;
      pinch = 0;
    };

    const onWheel = (event: WheelEvent) => {
      const state = useEarthStore.getState();
      if (state.projection !== "globe") return;
      event.preventDefault();
      const dolly = Math.pow(0.95, 0.55 * Math.abs(event.deltaY * 0.01));
      zoomScale.current *= event.deltaY < 0 ? dolly : 1 / dolly;
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
      element.removeEventListener("wheel", onWheel);
    };
  }, [camera, gl]);

  function faceOrigin() {
    const radial = offset.current.copy(camera.position).normalize();
    const lifted = north.current.set(0, 1, 0).addScaledVector(radial, -radial.y);
    if (lifted.lengthSq() < 1e-8) {
      lifted.copy(steadyUp.current).addScaledVector(radial, -steadyUp.current.dot(radial));
    }
    if (lifted.lengthSq() < 1e-8) lifted.set(0, 0, 1);
    camera.up.copy(lifted.normalize());
    steadyUp.current.copy(camera.up);
    camera.lookAt(0, 0, 0);
  }

  function applyZoom() {
    const length = camera.position.length() || 1;
    const next = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, length * zoomScale.current));
    camera.position.multiplyScalar(next / length);
    zoomScale.current = 1;
  }

  useFrame((_, delta) => {
    if (camera instanceof PerspectiveCamera) {
      const drop = size.height * 0.075;
      camera.setViewOffset(size.width, size.height, 0, -drop, size.width, size.height);
    }
    updateSun();
    const state = useEarthStore.getState();

    if (state.projection !== "globe") {
      hasBase.current = false;
      pendingTheta.current = 0;
      pendingPhi.current = 0;
      camera.up.set(0, 1, 0);
      const mix = state.reducedMotion ? 1 : 1 - Math.pow(0.02, delta);
      camera.position.lerp(direction.current.set(0, 0, 3.2), Math.min(1, mix));
      camera.lookAt(0, 0, 0);
    } else if (state.flyTarget) {
      const target = state.flyTarget;
      if (token.current !== target.token) {
        token.current = target.token;
        pendingTheta.current = 0;
        pendingPhi.current = 0;
        zoomScale.current = 1;
        const posed = hasBase.current ? basePosition.current : camera.position;
        const origin = vector3ToLatLon(posed.x, posed.y, posed.z);
        const currentDistance = posed.length();
        flightTrack.token = target.token;
        flightTrack.startedAt = performance.now();
        flightTrack.fromLat = origin.lat;
        flightTrack.fromLon = origin.lon;
        flightTrack.toLat = target.lat;
        flightTrack.toLon = target.lon;
        flightTrack.fromDistance = currentDistance;
        flightTrack.toDistance = target.keepDistance
          ? currentDistance
          : (ZOOM_DISTANCES[target.zoom] ?? ZOOM_DISTANCES[0]);
      }
      const { raw, eased } = flightSample(performance.now());
      slerpDirection(flightTrack.fromLat, flightTrack.fromLon, flightTrack.toLat, flightTrack.toLon, eased, direction.current);
      let distance = flightTrack.fromDistance + (flightTrack.toDistance - flightTrack.fromDistance) * eased;
      if (zoomScale.current !== 1 && distance > 1e-6) {
        const next = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, distance * zoomScale.current));
        const factor = next / distance;
        flightTrack.fromDistance = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, flightTrack.fromDistance * factor));
        flightTrack.toDistance = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, flightTrack.toDistance * factor));
        distance = Math.min(
          MAX_DISTANCE,
          Math.max(MIN_DISTANCE, flightTrack.fromDistance + (flightTrack.toDistance - flightTrack.fromDistance) * eased),
        );
        zoomScale.current = 1;
      }
      camera.position.copy(direction.current).multiplyScalar(distance);
      faceOrigin();
      rememberBase();
      applyTilt();
      if (raw >= 1) state.clearFlyTarget();
    } else {
      const fraction = state.reducedMotion ? 1 : DAMPING;
      const dTheta = pendingTheta.current * fraction;
      const dPhi = pendingPhi.current * fraction;
      pendingTheta.current = state.reducedMotion ? 0 : pendingTheta.current * (1 - DAMPING);
      pendingPhi.current = state.reducedMotion ? 0 : pendingPhi.current * (1 - DAMPING);
      restoreBase();
      place(dTheta, dPhi);
      applyZoom();
      rememberBase();
      applyTilt();
    }

    const now = performance.now();
    if (now - stamp.current < 80) return;
    stamp.current = now;
    const posed = hasBase.current ? basePosition.current : camera.position;
    const distance = posed.length();
    const zoom = distanceToZoom(distance);
    const screenNorth = north.current.set(0, 1, 0).project(camera);
    const heading = Math.atan2(screenNorth.x, screenNorth.y);
    const view = vector3ToLatLon(posed.x, posed.y, posed.z);
    if (Math.abs(state.cameraDistance - distance) > 0.015) state.setCameraDistance(distance);
    if (state.zoom !== zoom) state.setZoom(zoom);
    if (Math.abs(state.heading - heading) > 0.012) state.setHeading(heading);
    if (Math.abs(state.viewLat - view.lat) > 0.05 || Math.abs(state.viewLon - view.lon) > 0.05) {
      state.setView(view.lat, view.lon);
    }
  });

  return null;
}

export function useGlobeShift() {
  const { scene } = useThree();
  useFrame(() => {
    const globe = scene.getObjectByName("globe-root");
    if (globe) globe.position.x = 0;
  });
}
