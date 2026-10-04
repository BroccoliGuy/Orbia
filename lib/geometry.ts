import { latLonToVector3 } from "@/lib/geo";
import { BufferGeometry, Float32BufferAttribute } from "three";

export function createEarthGeometry(widthSegments: number, heightSegments: number, radius = 1) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const projected: number[] = [];
  const latLon: number[] = [];
  const indices: number[] = [];
  const stride = widthSegments + 1;

  for (let y = 0; y <= heightSegments; y += 1) {
    const v = y / heightSegments;
    const lat = 90 - v * 180;
    for (let x = 0; x <= widthSegments; x += 1) {
      const u = x / widthSegments;
      const lon = u * 360 - 180;
      const point = latLonToVector3(lat, lon, radius);
      positions.push(point.x, point.y, point.z);
      const normal = latLonToVector3(lat, lon, 1);
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(u, 1 - v);
      projected.push(point.x, point.y, point.z);
      latLon.push(lat, lon);
    }
  }

  for (let y = 0; y < heightSegments; y += 1) {
    for (let x = 0; x < widthSegments; x += 1) {
      const a = y * stride + x + 1;
      const b = y * stride + x;
      const c = (y + 1) * stride + x;
      const d = (y + 1) * stride + x + 1;
      if (y !== 0) indices.push(a, b, d);
      if (y !== heightSegments - 1) indices.push(b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("aProj", new Float32BufferAttribute(projected, 3));
  geometry.setAttribute("aLatLon", new Float32BufferAttribute(latLon, 2));
  geometry.setIndex(indices);
  return geometry;
}
