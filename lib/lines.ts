import { latLonToVector3 } from "@/lib/geo";
import { BufferGeometry, Float32BufferAttribute } from "three";

export function polylinePositions(lines: [number, number][][], radius = 1.006) {
  const positions: number[] = [];
  for (const line of lines) {
    for (let index = 1; index < line.length; index += 1) {
      const [lonA, latA] = line[index - 1];
      const [lonB, latB] = line[index];
      if (Math.abs(lonA - lonB) > 180) continue;
      const a = latLonToVector3(latA, lonA, radius);
      const b = latLonToVector3(latB, lonB, radius);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return new Float32Array(positions);
}

export function geometryFromPositions(positions: Float32Array) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

export function topoLinesToPositions(
  coordinates: number[][][],
  radius = 1.004,
) {
  const lines = coordinates.map((line) => line.map(([lon, lat]) => [lon, lat] as [number, number]));
  return polylinePositions(lines, radius);
}
