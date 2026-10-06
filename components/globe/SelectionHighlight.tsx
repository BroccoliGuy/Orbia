"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Vector3 } from "three";
import { hasCountryData } from "@/data/countries";
import { polylinePositions } from "@/lib/lines";
import { vector3ToLatLon } from "@/lib/geo";
import { placedPoint } from "@/lib/projections";
import { findCountryById, loadCountries, type CountryFeature } from "@/lib/world";
import { useEarthStore } from "@/store/earthStore";
import type { Projection } from "@/types";

function outlineOf(feature: CountryFeature) {
  const lines: [number, number][][] = [];
  const geometry = feature.geometry;
  if (!geometry) return new Float32Array();
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) lines.push(ring as [number, number][]);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) lines.push(ring as [number, number][]);
    }
  }
  return polylinePositions(lines, 1.02);
}

function useProjectedLine(source: Float32Array | null, radius: number) {
  const geometry = useMemo(() => new BufferGeometry(), []);
  const signature = useRef("");
  const flat = useRef<Exclude<Projection, "globe">>("mercator");

  useEffect(() => {
    signature.current = "";
  }, [source]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    if (!source || source.length < 6) {
      geometry.setDrawRange(0, 0);
      return;
    }
    const state = useEarthStore.getState();
    if (state.projection !== "globe") flat.current = state.projection;
    const key = `${source.length}:${flat.current}:${state.projectionMix.toFixed(3)}`;
    if (key === signature.current && geometry.getAttribute("position")) return;
    signature.current = key;
    const projection = state.projection === "globe" ? flat.current : state.projection;
    let attribute = geometry.getAttribute("position") as Float32BufferAttribute | null;
    if (!attribute || attribute.count * 3 < source.length) {
      attribute = new Float32BufferAttribute(new Float32Array(source.length), 3);
      geometry.setAttribute("position", attribute);
    }
    for (let index = 0; index < source.length; index += 3) {
      const { lat, lon } = vector3ToLatLon(source[index], source[index + 1], source[index + 2]);
      const point = placedPoint(lat, lon, radius, projection, state.projectionMix);
      attribute.setXYZ(index / 3, point.x, point.y, point.z);
    }
    attribute.needsUpdate = true;
    geometry.setDrawRange(0, source.length / 3);
    geometry.computeBoundingSphere();
  });

  return geometry;
}

function FocusRing({ lat, lon }: { lat: number; lon: number }) {
  const geometry = useMemo(() => {
    const next = new BufferGeometry();
    next.setAttribute("position", new Float32BufferAttribute(new Float32Array(33 * 3), 3));
    return next;
  }, []);
  const material = useMemo(
    () => new LineBasicMaterial({ color: "#9fd7ff", transparent: true, opacity: 0.95, depthWrite: false }),
    [],
  );
  const center = useRef(new Vector3());
  const east = useRef(new Vector3());
  const north = useRef(new Vector3());
  const point = useRef(new Vector3());
  const flat = useRef<Exclude<Projection, "globe">>("mercator");

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    const state = useEarthStore.getState();
    if (state.projection !== "globe") flat.current = state.projection;
    const projection = state.projection === "globe" ? flat.current : state.projection;
    const span = 0.02 + Math.sin(clock.elapsedTime * 3.2) * 0.006;
    const origin = center.current;
    const radial = east.current;
    const tangent = north.current;
    const placedCenter = placedPoint(lat, lon, 1, "globe", 0);
    origin.set(placedCenter.x, placedCenter.y, placedCenter.z).normalize();
    radial.set(0, 1, 0).cross(origin);
    if (radial.lengthSq() < 1e-6) radial.set(1, 0, 0);
    radial.normalize();
    tangent.crossVectors(origin, radial);
    const attribute = geometry.getAttribute("position");
    for (let index = 0; index <= 32; index += 1) {
      const angle = (index / 32) * Math.PI * 2;
      point.current
        .copy(origin)
        .addScaledVector(radial, Math.cos(angle) * span)
        .addScaledVector(tangent, Math.sin(angle) * span);
      const polar = vector3ToLatLon(point.current.x, point.current.y, point.current.z);
      const placed = placedPoint(polar.lat, polar.lon, 1.025, projection, state.projectionMix);
      attribute.setXYZ(index, placed.x, placed.y, placed.z);
    }
    attribute.needsUpdate = true;
    geometry.computeBoundingSphere();
  });

  const line = useMemo(() => {
    const object = new Line(geometry, material);
    object.frustumCulled = false;
    object.renderOrder = 3;
    object.raycast = () => {};
    return object;
  }, [geometry, material]);

  return <primitive object={line} />;
}

function sameCountry(left: string, right: string) {
  if (!left || !right) return false;
  if (left === right) return true;
  const a = Number(left);
  const b = Number(right);
  return Number.isFinite(a) && Number.isFinite(b) && a === b;
}

function CountryOutline({ countryId, opacity, renderOrder }: { countryId: string; opacity: number; renderOrder: number }) {
  const [outline, setOutline] = useState<Float32Array | null>(null);
  const geometry = useProjectedLine(outline, 1.02);
  const material = useMemo(
    () => new LineBasicMaterial({ color: "#d5e7f5", transparent: true, opacity, depthWrite: false }),
    [opacity],
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useEffect(() => {
    let alive = true;
    void loadCountries().then((features) => {
      if (!alive) return;
      const match = findCountryById(features, countryId);
      setOutline(match ? outlineOf(match) : null);
    });
    return () => {
      alive = false;
    };
  }, [countryId]);

  if (!outline || outline.length === 0) return null;
  return <lineSegments geometry={geometry} material={material} raycast={() => {}} frustumCulled={false} renderOrder={renderOrder} />;
}

export function SelectionHighlight() {
  const location = useEarthStore((state) => state.selectedLocation);
  const hover = useEarthStore((state) => state.hover);
  const linkedId = location?.countryId || (location?.kind === "country" ? location.id : "");
  const hoverId = hover?.countryId && hasCountryData(hover.countryId) ? hover.countryId : "";
  const comparedId = hoverId && !sameCountry(hoverId, linkedId) ? hoverId : "";
  if (!location && !comparedId) return null;
  return (
    <>
      {comparedId ? <CountryOutline countryId={comparedId} opacity={0.35} renderOrder={2} /> : null}
      {linkedId ? <CountryOutline countryId={linkedId} opacity={0.95} renderOrder={3} /> : null}
      {location && location.kind !== "country" ? <FocusRing lat={location.lat} lon={location.lon} /> : null}
    </>
  );
}
