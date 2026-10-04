export const ZOOM_LABELS = [
  "Vue globale",
  "Hémisphère",
  "Continent",
  "Pays",
  "Région",
  "Ville",
  "Zone locale",
] as const;

export const ZOOM_DISTANCES = [3.35, 2.7, 2.2, 1.82, 1.52, 1.3, 1.12];

export function distanceToZoom(distance: number) {
  if (distance >= ZOOM_DISTANCES[0]) return 0;
  for (let index = 0; index < ZOOM_DISTANCES.length - 1; index += 1) {
    const far = ZOOM_DISTANCES[index];
    const near = ZOOM_DISTANCES[index + 1];
    if (distance <= far && distance >= near) {
      const t = (far - distance) / (far - near);
      return t >= 0.5 ? index + 1 : index;
    }
  }
  return ZOOM_DISTANCES.length - 1;
}

export function lodSegments(zoom: number) {
  if (zoom <= 1) return { width: 96, height: 48 };
  if (zoom <= 3) return { width: 144, height: 72 };
  return { width: 192, height: 96 };
}

export function scaleBar(distance: number, fovDeg: number, viewportHeight: number) {
  const fov = (fovDeg * Math.PI) / 180;
  const worldPerPixel =
    (2 * Math.tan(fov / 2) * Math.max(0.08, distance - 1)) / Math.max(viewportHeight, 1);
  const rawKm = worldPerPixel * 112 * 6371;
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  let km = steps[0];
  for (const step of steps) {
    if (step <= rawKm * 1.2) km = step;
  }
  const px = Math.max(40, Math.min(168, km / (worldPerPixel * 6371)));
  return { km, px };
}
