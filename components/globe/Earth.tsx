"use client";

import { useTexture } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  LinearSRGBColorSpace,
  MathUtils,
  Mesh,
  NoColorSpace,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
  Vector4,
} from "three";
import { hasCountryData } from "@/data/countries";
import { earthRefs, HEAT_HEIGHT, HEAT_WIDTH, heatPixels } from "@/lib/earthRefs";
import { loadElevationGrid, reliefDisplacement, sampleAltitude, SEA_LEVEL, EVEREST_SAMPLE, DEPTH_SCALE } from "@/lib/elevation";
import { createEarthGeometry } from "@/lib/geometry";
import { vector3ToLatLon } from "@/lib/geo";
import { describePlace, selectionFromPlace } from "@/lib/place";
import { sunDirection } from "@/lib/sun";
import { findCountry, loadCountries, type CountryFeature } from "@/lib/world";
import { lodSegments } from "@/lib/zoom";
import { earthFragment, earthVertex } from "@/shaders/earth";
import { useEarthStore } from "@/store/earthStore";
import { useDetailImagery } from "./useDetailImagery";

export function Earth() {
  const [day, night, elevation, bathymetry] = useTexture([
    "/textures/earth-day.jpg",
    "/textures/earth-night.jpg",
    "/textures/earth-topology.png",
    "/textures/earth-bathymetry.png",
  ]);
  const gl = useThree((state) => state.gl);
  const mesh = useRef<Mesh>(null);
  const countries = useRef<CountryFeature[]>([]);
  const zoom = useEarthStore((state) => state.zoom);
  const style = useEarthStore((state) => state.style);
  const segments = style === "low-poly" ? { width: 28, height: 16 } : lodSegments(zoom);

  useEffect(() => {
    const anisotropy = gl.capabilities.getMaxAnisotropy();
    for (const texture of [day, night]) {
      texture.colorSpace = LinearSRGBColorSpace;
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    }
    elevation.colorSpace = NoColorSpace;
    elevation.anisotropy = 1;
    elevation.needsUpdate = true;
    bathymetry.colorSpace = NoColorSpace;
    bathymetry.anisotropy = 1;
    bathymetry.needsUpdate = true;
    void loadElevationGrid();
    void loadCountries().then((features) => {
      countries.current = features;
    });
  }, [day, night, elevation, bathymetry, gl]);

  const heat = useMemo(() => {
    const texture = new DataTexture(heatPixels, HEAT_WIDTH, HEAT_HEIGHT, RGBAFormat);
    texture.colorSpace = NoColorSpace;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;
    texture.flipY = false;
    texture.needsUpdate = true;
    earthRefs.heat = texture;
    return texture;
  }, []);

  const geometry = useMemo(
    () => createEarthGeometry(segments.width, segments.height),
    [segments.width, segments.height, createEarthGeometry],
  );

  useEffect(() => {
    earthRefs.geometry = geometry;
    return () => {
      geometry.dispose();
      if (earthRefs.geometry === geometry) earthRefs.geometry = null;
    };
  }, [geometry]);

  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uDay: { value: day },
        uNight: { value: night },
        uElevation: { value: elevation },
        uBathymetry: { value: bathymetry },
        uHeat: { value: heat },
        uSun: { value: new Vector3(1, 0, 0) },
        uNightLights: { value: 1 },
        uDisplacement: { value: 0.028 },
        uSea: { value: SEA_LEVEL },
        uEverest: { value: EVEREST_SAMPLE },
        uDepthScale: { value: DEPTH_SCALE },
        uMorph: { value: 0 },
        uLowPoly: { value: 0 },
        uHeatMix: { value: 0 },
        uDetailDay: { value: heat },
        uDetailNight: { value: heat },
        uDetailBounds: { value: new Vector4(0, 0, 1, 1) },
        uDetailMix: { value: 0 },
      },
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
      side: DoubleSide,
    });
  }, [day, night, elevation, bathymetry, heat, earthFragment]);

  useEffect(() => {
    earthRefs.material = material;
  }, [material]);

  useDetailImagery(material);

  useFrame((_, delta) => {
    const state = useEarthStore.getState();
    material.uniforms.uSun.value.copy(sunDirection);
    material.uniforms.uNightLights.value = state.layers.nightLights ? 1 : 0;
    material.uniforms.uDisplacement.value = reliefDisplacement(
      state.reliefMode,
      state.reliefExaggeration,
      state.layers.relief,
    );
    const lowTarget = state.style === "low-poly" ? 1 : 0;
    material.uniforms.uLowPoly.value = state.reducedMotion
      ? lowTarget
      : MathUtils.damp(material.uniforms.uLowPoly.value as number, lowTarget, 3, delta);
    material.uniforms.uHeat.value = heat;
    if (material.userData.heatEpoch !== earthRefs.heatEpoch) {
      heat.needsUpdate = true;
      material.userData.heatEpoch = earthRefs.heatEpoch;
    }
    material.uniforms.uHeatMix.value = state.dataset ? 1 : 0;
  });

  function readPointer<T extends MouseEvent>(event: ThreeEvent<T>) {
    event.stopPropagation();
    const local = event.object.worldToLocal(event.point.clone());
    const { lat, lon } = vector3ToLatLon(local.x, local.y, local.z);
    const store = useEarthStore.getState();
    let altitude = sampleAltitude(lat, lon);
    if (!store.showAltitude || (!store.showDepths && altitude < 0)) altitude = 0;
    store.setCursor({ lat, lon, altitude }, true);
    return { lat, lon, altitude, store };
  }

  function placeAt(lat: number, lon: number, altitude: number, match: ReturnType<typeof findCountry>) {
    return describePlace(lat, lon, altitude, match);
  }

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      onPointerMove={(event) => {
        const { lat, lon, altitude, store } = readPointer(event);
        if (!store.showHover) return;
        const match = findCountry(countries.current, lon, lat);
        const place = placeAt(lat, lon, altitude, match);
        store.setHover({
          name: place.name,
          countryId: place.record && hasCountryData(place.id) ? place.id : undefined,
          detail: place.meters,
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
        });
      }}
      onClick={(event) => {
        if (event.delta > 6) return;
        const { lat, lon, altitude, store } = readPointer(event);
        const match = findCountry(countries.current, lon, lat);
        const place = placeAt(lat, lon, altitude, match);
        store.selectLocation(selectionFromPlace(lat, lon, place));
        store.flyTo(lat, lon, store.zoom, true);
      }}
      onPointerOut={() => {
        useEarthStore.setState({ pointerOverGlobe: false, hover: null });
      }}
    />
  );
}
