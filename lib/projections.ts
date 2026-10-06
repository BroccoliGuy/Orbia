import { geoEquirectangular, geoMercator, type GeoProjection } from "d3-geo";
import { geoMollweide, geoRobinson } from "d3-geo-projection";
import { BufferAttribute, BufferGeometry } from "three";
import { latLonToVector3 } from "@/lib/geo";
import type { Projection } from "@/types";

function makeProjection(name: Exclude<Projection, "globe">): GeoProjection {
  if (name === "mercator") return geoMercator();
  if (name === "robinson") return geoRobinson();
  if (name === "mollweide") return geoMollweide();
  return geoEquirectangular();
}

const layouts = new Map<Exclude<Projection, "globe">, { projection: GeoProjection; scale: number }>();

function layout(name: Exclude<Projection, "globe">) {
  const cached = layouts.get(name);
  if (cached) return cached;
  const projection = makeProjection(name).translate([0, 0]).scale(1);
  let max = 0;
  for (let lat = -85; lat <= 85; lat += 1) {
    for (let lon = -180; lon <= 180; lon += 1) {
      const point = projection([lon, lat]);
      if (!point) continue;
      max = Math.max(max, Math.abs(point[0]), Math.abs(point[1]));
    }
  }
  const value = { projection, scale: max > 0 ? 1.6 / max : 1 };
  layouts.set(name, value);
  return value;
}

export function projectLatLon(lat: number, lon: number, name: Exclude<Projection, "globe">) {
  const { projection, scale } = layout(name);
  const point = projection([lon, Math.max(-85, Math.min(85, lat))]) ?? [0, 0];
  return { x: point[0] * scale, y: -point[1] * scale, z: 0 };
}

export function placedPoint(lat: number, lon: number, radius: number, projection: Projection, mix: number) {
  const sphere = latLonToVector3(lat, lon, radius);
  if (projection === "globe" || mix <= 0.001) return sphere;
  const flat = projectLatLon(lat, lon, projection);
  if (mix >= 0.999) return flat;
  return {
    x: sphere.x + (flat.x - sphere.x) * mix,
    y: sphere.y + (flat.y - sphere.y) * mix,
    z: sphere.z + (flat.z - sphere.z) * mix,
  };
}

export function writeProjectedPositions(geometry: BufferGeometry, name: Exclude<Projection, "globe">) {
  const latLon = geometry.getAttribute("aLatLon");
  const target = geometry.getAttribute("aProj") as BufferAttribute;
  for (let index = 0; index < latLon.count; index += 1) {
    const point = projectLatLon(latLon.getX(index), latLon.getY(index), name);
    target.setXYZ(index, point.x, point.y, point.z);
  }
  target.needsUpdate = true;
}
