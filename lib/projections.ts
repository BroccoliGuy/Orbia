import { geoEquirectangular, geoMercator, type GeoProjection } from "d3-geo";
import { geoMollweide, geoRobinson } from "d3-geo-projection";
import { BufferAttribute, BufferGeometry } from "three";
import type { Projection } from "@/types";

function makeProjection(name: Exclude<Projection, "globe">): GeoProjection {
  if (name === "mercator") return geoMercator();
  if (name === "robinson") return geoRobinson();
  if (name === "mollweide") return geoMollweide();
  return geoEquirectangular();
}

export function writeProjectedPositions(geometry: BufferGeometry, name: Exclude<Projection, "globe">) {
  const latLon = geometry.getAttribute("aLatLon");
  const target = geometry.getAttribute("aProj") as BufferAttribute;
  const projection = makeProjection(name).translate([0, 0]).scale(1);
  const raw: { x: number; y: number }[] = [];
  let max = 0;
  for (let index = 0; index < latLon.count; index += 1) {
    const lat = Math.max(-85, Math.min(85, latLon.getX(index)));
    const lon = latLon.getY(index);
    const point = projection([lon, lat]) ?? [0, 0];
    raw.push({ x: point[0], y: -point[1] });
    max = Math.max(max, Math.abs(point[0]), Math.abs(point[1]));
  }
  const scale = max > 0 ? 1.6 / max : 1;
  for (let index = 0; index < raw.length; index += 1) {
    target.setXYZ(index, raw[index].x * scale, raw[index].y * scale, 0);
  }
  target.needsUpdate = true;
}
