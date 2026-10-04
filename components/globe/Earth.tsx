"use client";

import { useTexture } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
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
} from "three";
import { countryRecord, formatPeople, hasCountryData } from "@/data/countries";
import { earthRefs, HEAT_HEIGHT, HEAT_WIDTH, heatPixels } from "@/lib/earthRefs";
import { loadElevationGrid, sampleAltitude } from "@/lib/elevation";
import { createEarthGeometry } from "@/lib/geometry";
import { vector3ToLatLon } from "@/lib/geo";
import { sunDirection } from "@/lib/sun";
import { countryFocus, findCountry, loadCountries, type CountryFeature } from "@/lib/world";
import { lodSegments } from "@/lib/zoom";
import { earthFragment, earthVertex } from "@/shaders/earth";
import { useEarthStore } from "@/store/earthStore";

function displacementOf(mode: "off" | "normal" | "exaggerated", amount: number, enabled: boolean) {
  if (!enabled || mode === "off") return 0;
  if (mode === "exaggerated") return 0.045 * amount;
  return 0.028;
}

export function Earth() {
  const [day, night, elevation] = useTexture([
    "/textures/earth-day.jpg",
    "/textures/earth-night.jpg",
    "/textures/earth-topology.png",
  ]);
  const mesh = useRef<Mesh>(null);
  const countries = useRef<CountryFeature[]>([]);
  const zoom = useEarthStore((state) => state.zoom);
  const style = useEarthStore((state) => state.style);
  const segments = style === "low-poly" ? { width: 28, height: 16 } : lodSegments(zoom);

  useEffect(() => {
    for (const texture of [day, night, elevation]) {
      texture.colorSpace = LinearSRGBColorSpace;
      texture.anisotropy = 8;
    }
    void loadElevationGrid();
    void loadCountries().then((features) => {
      countries.current = features;
    });
  }, [day, night, elevation]);

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
      if (earthRefs.geometry === geometry) earthRefs.geometry = null;
    };
  }, [geometry]);

  const material = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uDay: { value: day },
        uNight: { value: night },
        uElevation: { value: elevation },
        uHeat: { value: heat },
        uSun: { value: new Vector3(1, 0, 0) },
        uNightLights: { value: 1 },
        uDisplacement: { value: 0.028 },
        uMorph: { value: 0 },
        uLowPoly: { value: 0 },
        uHeatMix: { value: 0 },
      },
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
      side: DoubleSide,
    });
  }, [day, night, elevation, heat, earthFragment]);

  useEffect(() => {
    earthRefs.material = material;
  }, [material]);

  useFrame((_, delta) => {
    const state = useEarthStore.getState();
    material.uniforms.uSun.value.copy(sunDirection);
    material.uniforms.uNightLights.value = state.layers.nightLights ? 1 : 0;
    material.uniforms.uDisplacement.value = displacementOf(
      state.reliefMode,
      state.reliefExaggeration,
      state.layers.relief,
    );
    const lowTarget = state.style === "low-poly" ? 1 : 0;
    material.uniforms.uLowPoly.value = state.reducedMotion
      ? lowTarget
      : MathUtils.damp(material.uniforms.uLowPoly.value as number, lowTarget, 3, delta);
    material.uniforms.uHeat.value = heat;
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
    return { lat, lon, match: findCountry(countries.current, lon, lat) };
  }

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      onPointerMove={(event) => {
        const { match } = readPointer(event);
        if (!match) {
          useEarthStore.getState().setHover(null);
          return;
        }
        const id = String(match.id ?? "");
        const name = match.properties?.name ?? "Région";
        const record = countryRecord(id, name);
        useEarthStore.getState().setHover({
          name: record.name,
          detail: hasCountryData(id) ? formatPeople(record.population) : "",
          x: event.nativeEvent.clientX,
          y: event.nativeEvent.clientY,
        });
      }}
      onClick={(event) => {
        const { lat, lon, match } = readPointer(event);
        if (!match) return;
        const id = String(match.id ?? "");
        const name = match.properties?.name ?? "Région";
        const record = countryRecord(id, name);
        const focus = countryFocus(match);
        useEarthStore.getState().selectLocation({
          id,
          kind: "country",
          name: record.name,
          subtitle: record.continent || name,
          lat: Number.isFinite(focus.lat) ? focus.lat : lat,
          lon: Number.isFinite(focus.lon) ? focus.lon : lon,
          countryId: id,
          primaryLabel: "Population",
          primaryValue: formatPeople(record.population),
          details: hasCountryData(id)
            ? [
                { label: "Capitale", value: record.capital },
                { label: "Superficie", value: `${record.area.toLocaleString("fr-FR")} km²` },
                { label: "Altitude moyenne", value: `${Math.round(record.averageElevation).toLocaleString("fr-FR")} m` },
                { label: "Climat", value: `${record.temperature.toLocaleString("fr-FR")} °C` },
              ]
            : [],
        });
        useEarthStore.getState().flyTo(Number.isFinite(focus.lat) ? focus.lat : lat, Number.isFinite(focus.lon) ? focus.lon : lon, 3);
      }}
      onPointerOut={() => {
        useEarthStore.setState({ pointerOverGlobe: false, hover: null });
      }}
    />
  );
}
