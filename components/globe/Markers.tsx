"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D, SphereGeometry, MeshBasicMaterial } from "three";
import { CITIES, LAKES, PEAKS, RIVERS } from "@/data/features";
import { latLonToVector3 } from "@/lib/geo";
import { geometryFromPositions, polylinePositions } from "@/lib/lines";
import { useEarthStore } from "@/store/earthStore";
import type { GeoLocation } from "@/types";

function MarkerCloud({
  items,
  color,
  radius,
}: {
  items: { lat: number; lon: number; scale: number }[];
  color: string;
  radius: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const { camera } = useThree();
  const geometry = useMemo(() => new SphereGeometry(radius, 8, 8), [radius]);
  const material = useMemo(() => new MeshBasicMaterial({ color }), [color]);

  useFrame(() => {
    if (!mesh.current) return;
    const zoomScale = Math.max(0.12, Math.min(1, (camera.position.length() - 1.02) / 2.2));
    items.forEach((item, index) => {
      const point = latLonToVector3(item.lat, item.lon, 1.012);
      dummy.position.set(point.x, point.y, point.z);
      dummy.scale.setScalar(item.scale * zoomScale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (items.length === 0) return null;
  return <instancedMesh ref={mesh} args={[geometry, material, items.length]} />;
}

export function Markers() {
  const layers = useEarthStore((state) => state.layers);
  const zoom = useEarthStore((state) => state.zoom);
  const showPeaks = useEarthStore((state) => state.showPeaks);
  const selectLocation = useEarthStore((state) => state.selectLocation);
  const flyTo = useEarthStore((state) => state.flyTo);

  const cities = CITIES.filter((city) => {
    if (city.capital && layers.capitals) return true;
    if (!layers.cities) return false;
    if (zoom < 2) return city.rank === 1;
    return true;
  }).map((city) => ({ lat: city.lat, lon: city.lon, scale: city.capital ? 1.15 : 0.8 }));

  const peaks = layers.mountains && showPeaks
    ? PEAKS.filter((peak) => zoom >= 2 || peak.rank === 1).map((peak) => ({
        lat: peak.lat,
        lon: peak.lon,
        scale: 1.3,
      }))
    : [];

  const riverGeometry = useMemo(
    () => geometryFromPositions(polylinePositions(RIVERS.map((river) => river.points), 1.008)),
    [],
  );
  const lakeGeometry = useMemo(
    () => geometryFromPositions(polylinePositions(LAKES.map((lake) => lake.points), 1.008)),
    [],
  );

  function choose(location: GeoLocation, zoomLevel: number) {
    selectLocation(location);
    flyTo(location.lat, location.lon, zoomLevel);
  }

  return (
    <>
      <MarkerCloud items={cities} color="#f5f7fa" radius={0.008} />
      <MarkerCloud items={peaks} color="#ffb020" radius={0.01} />
      {layers.rivers ? (
        <lineSegments
          geometry={riverGeometry}
          onClick={(event) => {
            event.stopPropagation();
            const river = RIVERS[0];
            choose(
              {
                id: river.id,
                kind: "river",
                name: river.name,
                subtitle: river.subtitle,
                lat: river.points[2][1],
                lon: river.points[2][0],
                primaryLabel: "Longueur",
                primaryValue: river.value,
              },
              3,
            );
          }}
        >
          <lineBasicMaterial color="#7ec8ff" transparent opacity={0.85} />
        </lineSegments>
      ) : null}
      {layers.lakes ? (
        <lineSegments geometry={lakeGeometry}>
          <lineBasicMaterial color="#49b7ff" transparent opacity={0.7} />
        </lineSegments>
      ) : null}
      {CITIES.filter((city) => layers.cities || (city.capital && layers.capitals)).map((city) => (
        <mesh
          key={city.id}
          position={[
            latLonToVector3(city.lat, city.lon, 1.012).x,
            latLonToVector3(city.lat, city.lon, 1.012).y,
            latLonToVector3(city.lat, city.lon, 1.012).z,
          ]}
          onClick={(event) => {
            event.stopPropagation();
            choose(
              {
                id: city.id,
                kind: "city",
                name: city.name,
                subtitle: city.subtitle,
                lat: city.lat,
                lon: city.lon,
                primaryLabel: "Population",
                primaryValue: city.value,
              },
              5,
            );
          }}
        >
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      {layers.mountains && showPeaks
        ? PEAKS.map((peak) => (
            <mesh
              key={peak.id}
              position={[
                latLonToVector3(peak.lat, peak.lon, 1.016).x,
                latLonToVector3(peak.lat, peak.lon, 1.016).y,
                latLonToVector3(peak.lat, peak.lon, 1.016).z,
              ]}
              onClick={(event) => {
                event.stopPropagation();
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
                );
              }}
            >
              <sphereGeometry args={[0.016, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          ))
        : null}
    </>
  );
}
