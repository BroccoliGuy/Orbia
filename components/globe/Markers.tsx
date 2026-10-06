"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D, SphereGeometry, MeshBasicMaterial, LineBasicMaterial } from "three";
import { CITIES, LAKES, PEAKS, RIVERS, cityHeadline, type LineFeature, type PointFeature } from "@/data/features";
import { polylinePositions } from "@/lib/lines";
import { placedPoint } from "@/lib/projections";
import { useEarthStore } from "@/store/earthStore";
import type { GeoLocation, Projection } from "@/types";
import { MorphedLines } from "./MorphedLines";

function MarkerCloud({
  items,
  color,
  radius,
  onPick,
}: {
  items: (PointFeature & { scale: number })[];
  color: string;
  radius: number;
  onPick: (item: PointFeature) => void;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const { camera } = useThree();
  const geometry = useMemo(() => new SphereGeometry(radius, 8, 8), [radius]);
  const material = useMemo(() => new MeshBasicMaterial({ color }), [color]);
  const signature = useRef("");
  const flat = useRef<Exclude<Projection, "globe">>("mercator");

  useFrame(() => {
    if (!mesh.current) return;
    const state = useEarthStore.getState();
    if (state.projection !== "globe") flat.current = state.projection;
    const distance = camera.position.length();
    let identity = "";
    for (const item of items) identity += item.id;
    const key = `${flat.current}:${state.projectionMix.toFixed(3)}:${distance.toFixed(3)}:${identity}`;
    if (key === signature.current) return;
    signature.current = key;
    const zoomScale = Math.max(0.12, Math.min(1, (distance - 1.02) / 2.2));
    const projection = state.projection === "globe" ? flat.current : state.projection;
    items.forEach((item, index) => {
      const point = placedPoint(item.lat, item.lon, 1.012, projection, state.projectionMix);
      dummy.position.set(point.x, point.y, point.z);
      dummy.scale.setScalar(item.scale * zoomScale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (items.length === 0) return null;
  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, items.length]}
      onClick={(event) => {
        if (event.delta > 6) return;
        const item = items[event.instanceId ?? -1];
        if (!item) return;
        event.stopPropagation();
        onPick(item);
      }}
    />
  );
}

function nearestFeature(features: LineFeature[], event: ThreeEvent<MouseEvent>) {
  const state = useEarthStore.getState();
  const projection = state.projection === "globe" ? "mercator" : state.projection;
  const mix = state.projection === "globe" ? 0 : state.projectionMix;
  const local = event.object.worldToLocal(event.point.clone());
  let best = features[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  let lat = best.points[0]?.[1] ?? 0;
  let lon = best.points[0]?.[0] ?? 0;
  for (const feature of features) {
    for (const [featureLon, featureLat] of feature.points) {
      const placed = placedPoint(featureLat, featureLon, 1.008, state.projection === "globe" ? projection : state.projection, mix);
      const distance = (placed.x - local.x) ** 2 + (placed.y - local.y) ** 2 + (placed.z - local.z) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = feature;
        lat = featureLat;
        lon = featureLon;
      }
    }
  }
  return { feature: best, lat, lon };
}

export function Markers() {
  const layers = useEarthStore((state) => state.layers);
  const zoom = useEarthStore((state) => state.zoom);
  const showPeaks = useEarthStore((state) => state.showPeaks);
  const selectLocation = useEarthStore((state) => state.selectLocation);
  const flyTo = useEarthStore((state) => state.flyTo);

  const cities = CITIES.filter((city) => {
    if (city.capital && layers.capitals && (city.rank <= 2 || zoom >= 2)) return true;
    if (!layers.cities) return false;
    if (zoom < 2) return city.rank === 1;
    return true;
  }).map((city) => ({ ...city, scale: city.capital ? 1.15 : 0.8 }));

  const peaks = layers.mountains && showPeaks
    ? PEAKS.filter((peak) => zoom >= 2 || peak.rank === 1).map((peak) => ({ ...peak, scale: 1.3 }))
    : [];

  const riverPositions = useMemo(() => polylinePositions(RIVERS.map((river) => river.points), 1.008), []);
  const lakePositions = useMemo(() => polylinePositions(LAKES.map((lake) => lake.points), 1.008), []);
  const riverMaterial = useMemo(() => new LineBasicMaterial({ color: "#7ec8ff", transparent: true, opacity: 0.85 }), []);
  const lakeMaterial = useMemo(() => new LineBasicMaterial({ color: "#49b7ff", transparent: true, opacity: 0.7 }), []);

  function choose(location: GeoLocation, zoomLevel: number) {
    selectLocation(location);
    flyTo(location.lat, location.lon, zoomLevel);
  }

  function pickLine(features: LineFeature[], event: ThreeEvent<MouseEvent>, kind: GeoLocation["kind"], label: string) {
    if (event.delta > 6 || features.length === 0) return;
    event.stopPropagation();
    const { feature, lat, lon } = nearestFeature(features, event);
    choose(
      {
        id: feature.id,
        kind,
        name: feature.name,
        subtitle: feature.subtitle,
        lat,
        lon,
        primaryLabel: label,
        primaryValue: feature.value,
      },
      3,
    );
  }

  return (
    <>
      <MarkerCloud
        items={cities}
        color="#f5f7fa"
        radius={0.008}
        onPick={(city) => {
          const headline = cityHeadline(city);
          choose(
            {
              id: city.id,
              kind: "city",
              name: city.name,
              subtitle: city.subtitle,
              lat: city.lat,
              lon: city.lon,
              countryId: city.countryId,
              primaryLabel: headline.primaryLabel,
              primaryValue: headline.primaryValue,
            },
            5,
          );
        }}
      />
      <MarkerCloud
        items={peaks}
        color="#ffb020"
        radius={0.01}
        onPick={(peak) =>
          choose(
            {
              id: peak.id,
              kind: "mountain",
              name: peak.name,
              subtitle: peak.subtitle,
              lat: peak.lat,
              lon: peak.lon,
              primaryLabel: "Altitude",
              primaryValue: peak.value,
            },
            5,
          )
        }
      />
      {layers.rivers ? (
        <MorphedLines
          positions={riverPositions}
          material={riverMaterial}
          onClick={(event) => pickLine(RIVERS, event, "river", "Longueur")}
        />
      ) : null}
      {layers.lakes ? (
        <MorphedLines
          positions={lakePositions}
          material={lakeMaterial}
          onClick={(event) => pickLine(LAKES, event, "lake", "Étendue")}
        />
      ) : null}
    </>
  );
}
