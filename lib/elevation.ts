// Rivage lu dans earth-topology.png (2/255). Le pixel de l'Everest (234/255) vaut 8 849 m.
export const SEA_LEVEL = 2 / 255;
export const EVEREST_METERS = 8849;
export const EVEREST_SAMPLE = 234 / 255;
export const LAND_METERS = (EVEREST_METERS * (1 - SEA_LEVEL)) / (EVEREST_SAMPLE - SEA_LEVEL);
// Le pixel le plus sombre des Mariannes est le fond de l'image : −10 935 m.
export const TRENCH_METERS = 10935;
export const DEPTH_SCALE = TRENCH_METERS / EVEREST_METERS;
const PEAK_FRACTION = (1 - SEA_LEVEL) / (EVEREST_SAMPLE - SEA_LEVEL);

export function altitudeMeters(sample: number) {
  return ((sample - SEA_LEVEL) / (1 - SEA_LEVEL)) * LAND_METERS;
}

export function depthMeters(sample: number) {
  return -sample * TRENCH_METERS;
}

export const REAL_DISPLACEMENT = 0.02;
export const MAX_DISPLACEMENT = 0.045 * 3;

export function reliefDisplacement(mode: "off" | "normal" | "exaggerated", amount: number, enabled: boolean) {
  if (!enabled || mode === "off") return 0;
  if (mode === "exaggerated") return (MAX_DISPLACEMENT / 3) * amount;
  return REAL_DISPLACEMENT * amount;
}

export function reliefStrength(mode: "off" | "normal" | "exaggerated", amount: number, enabled = true) {
  return Math.min(1, reliefDisplacement(mode, amount, enabled) / MAX_DISPLACEMENT);
}

export function reliefShell(displacement: number) {
  const peak = 1 + PEAK_FRACTION * displacement;
  return { clouds: peak + 0.012, atmosphere: peak + 0.03 };
}

let grid: ImageData | null = null;
let bathy: ImageData | null = null;
let loading: Promise<void> | null = null;

function readImage(src: string) {
  return new Promise<ImageData | null>((resolve) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve(null);
        return;
      }
      context.drawImage(image, 0, 0);
      resolve(context.getImageData(0, 0, image.width, image.height));
    };
    image.onerror = () => resolve(null);
  });
}

export function loadElevationGrid() {
  if ((grid && bathy) || loading) return loading ?? Promise.resolve();
  loading = Promise.all([
    readImage("/textures/earth-topology.png"),
    readImage("/textures/earth-bathymetry.png"),
  ]).then(([land, depth]) => {
    grid = land;
    bathy = depth;
  });
  return loading;
}

function sampleGrid(image: ImageData, lat: number, lon: number) {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const x = u * (image.width - 1);
  const y = v * (image.height - 1);
  const x0 = Math.min(image.width - 1, Math.max(0, Math.floor(x)));
  const y0 = Math.min(image.height - 1, Math.max(0, Math.floor(y)));
  const x1 = Math.min(image.width - 1, x0 + 1);
  const y1 = Math.min(image.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const at = (px: number, py: number) => image.data[(py * image.width + px) * 4] / 255;
  const north = at(x0, y0) * (1 - tx) + at(x1, y0) * tx;
  const south = at(x0, y1) * (1 - tx) + at(x1, y1) * tx;
  return north * (1 - ty) + south * ty;
}

export function sampleAltitude(lat: number, lon: number) {
  if (!grid) return 0;
  const sample = sampleGrid(grid, lat, lon);
  const meters = sample >= SEA_LEVEL || !bathy ? altitudeMeters(sample) : depthMeters(sampleGrid(bathy, lat, lon));
  const rounded = Math.round(meters);
  return rounded === 0 ? 0 : rounded;
}
