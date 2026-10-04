let grid: ImageData | null = null;
let loading: Promise<void> | null = null;

export function loadElevationGrid() {
  if (grid || loading) return loading ?? Promise.resolve();
  loading = new Promise((resolve) => {
    const image = new Image();
    image.src = "/textures/earth-topology.png";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve();
        return;
      }
      context.drawImage(image, 0, 0);
      grid = context.getImageData(0, 0, image.width, image.height);
      resolve();
    };
    image.onerror = () => resolve();
  });
  return loading;
}

export function sampleAltitude(lat: number, lon: number) {
  if (!grid) return 0;
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const x = Math.min(grid.width - 1, Math.max(0, Math.floor(u * (grid.width - 1))));
  const y = Math.min(grid.height - 1, Math.max(0, Math.floor(v * (grid.height - 1))));
  const sample = grid.data[(y * grid.width + x) * 4] / 255;
  return Math.round((sample - 0.42) * 14000);
}
