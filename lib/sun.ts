import { latLonToVector3 } from "@/lib/geo";
import { Vector3 } from "three";

export const sunDirection = new Vector3(1, 0, 0.2).normalize();

export function subsolar(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86400000;
  const declination = -23.44 * Math.cos((2 * Math.PI * (day + 10)) / 365);
  const hours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let lon = (12 - hours) * 15;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return { lat: declination, lon };
}

export function updateSun(date = new Date()) {
  const { lat, lon } = subsolar(date);
  const point = latLonToVector3(lat, lon, 1);
  sunDirection.set(point.x, point.y, point.z).normalize();
  return { lat, lon };
}
