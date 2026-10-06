import { Vector3 } from "three";
import { latLonToVector3 } from "@/lib/geo";

export const FLIGHT_DURATION = 1100;

export const flightTrack = {
  token: -1,
  startedAt: 0,
  fromLat: 0,
  fromLon: 0,
  toLat: 0,
  toLon: 0,
  fromDistance: 3.35,
  toDistance: 3.35,
};

const from = new Vector3();
const to = new Vector3();

export function slerpDirection(fromLat: number, fromLon: number, toLat: number, toLon: number, t: number, out: Vector3) {
  const start = latLonToVector3(fromLat, fromLon, 1);
  const end = latLonToVector3(toLat, toLon, 1);
  from.set(start.x, start.y, start.z);
  to.set(end.x, end.y, end.z);
  const dot = Math.min(1, Math.max(-1, from.dot(to)));
  const theta = Math.acos(dot);
  const sin = Math.sin(theta);
  if (sin < 1e-4) return out.copy(to);
  const weightStart = Math.sin((1 - t) * theta) / sin;
  const weightEnd = Math.sin(t * theta) / sin;
  return out.set(
    from.x * weightStart + to.x * weightEnd,
    from.y * weightStart + to.y * weightEnd,
    from.z * weightStart + to.z * weightEnd,
  );
}

export function flightSample(now: number) {
  const raw = Math.min(1, Math.max(0, (now - flightTrack.startedAt) / FLIGHT_DURATION));
  const eased = raw * raw * (3 - 2 * raw);
  return { raw, eased };
}
