"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { LinearFilter, LinearSRGBColorSpace, ShaderMaterial, Texture, Vector4 } from "three";
import { detailFrame, framesClose, frameUv, gibsMapUrl, type DetailFrame } from "@/lib/detailFrame";
import { useEarthStore } from "@/store/earthStore";

const DAY_LAYER = "BlueMarble_NextGeneration";
const NIGHT_LAYER = "VIIRS_Black_Marble";
const SETTLE_SECONDS = 0.4;

function loadDetail(url: string, anisotropy: number) {
  return new Promise<Texture>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const texture = new Texture(image);
      texture.colorSpace = LinearSRGBColorSpace;
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearFilter;
      texture.generateMipmaps = false;
      texture.anisotropy = anisotropy;
      texture.flipY = true;
      texture.needsUpdate = true;
      resolve(texture);
    };
    image.onerror = () => reject(new Error("detail"));
    image.src = url;
  });
}

export function useDetailImagery(material: ShaderMaterial) {
  const gl = useThree((state) => state.gl);
  const shown = useRef<DetailFrame | null>(null);
  const attempted = useRef<DetailFrame | null>(null);
  const waiting = useRef<DetailFrame | null>(null);
  const waitingSince = useRef(0);
  const serial = useRef(0);
  const loaded = useRef<Texture[]>([]);

  useEffect(() => {
    return () => {
      for (const texture of loaded.current) texture.dispose();
      loaded.current = [];
    };
  }, []);

  function paint(frame: DetailFrame, mix: number) {
    const uv = frameUv(frame);
    (material.uniforms.uDetailBounds.value as Vector4).set(uv.minU, uv.minV, uv.maxU, uv.maxV);
    material.uniforms.uDetailMix.value = mix;
  }

  useFrame((state) => {
    const earth = useEarthStore.getState();
    const frame = earth.projection === "globe" ? detailFrame(earth.viewLat, earth.viewLon, earth.cameraDistance) : null;
    if (!frame) {
      material.uniforms.uDetailMix.value = 0;
      waiting.current = null;
      return;
    }
    if (shown.current && framesClose(shown.current, frame)) {
      paint(shown.current, 1);
      waiting.current = null;
      return;
    }
    if (attempted.current && framesClose(attempted.current, frame)) {
      if (shown.current) paint(shown.current, 1);
      else material.uniforms.uDetailMix.value = 0;
      return;
    }
    if (shown.current) paint(shown.current, 1);
    if (!waiting.current || !framesClose(waiting.current, frame)) {
      waiting.current = frame;
      waitingSince.current = state.clock.elapsedTime;
      return;
    }
    if (state.clock.elapsedTime - waitingSince.current < SETTLE_SECONDS) return;

    const request = waiting.current;
    waiting.current = null;
    attempted.current = request;
    const id = serial.current + 1;
    serial.current = id;
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    void Promise.all([
      loadDetail(gibsMapUrl(DAY_LAYER, request), anisotropy),
      loadDetail(gibsMapUrl(NIGHT_LAYER, request), anisotropy),
    ])
      .then(([day, night]) => {
        if (serial.current !== id) {
          day.dispose();
          night.dispose();
          return;
        }
        const previous = loaded.current;
        loaded.current = [day, night];
        material.uniforms.uDetailDay.value = day;
        material.uniforms.uDetailNight.value = night;
        shown.current = request;
        paint(request, 1);
        for (const texture of previous) texture.dispose();
      })
      .catch(() => {
        if (serial.current !== id) return;
        if (!shown.current) material.uniforms.uDetailMix.value = 0;
      });
  });
}
