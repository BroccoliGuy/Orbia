const FOV = (38 * Math.PI) / 180;

export const DETAIL_DISTANCE = 1.8;

export interface DetailFrame {
  south: number;
  west: number;
  north: number;
  east: number;
}

export function detailFrame(lat: number, lon: number, distance: number): DetailFrame | null {
  if (distance >= DETAIL_DISTANCE) return null;
  const half = Math.tan(FOV / 2) * Math.max(0.02, distance - 1);
  const span = half * (180 / Math.PI);
  const south = Math.max(-85, lat - span);
  const north = Math.min(85, lat + span);
  const cos = Math.max(0.15, Math.cos((lat * Math.PI) / 180));
  const lonSpan = span / cos;
  const west = lon - lonSpan;
  const east = lon + lonSpan;
  if (west < -180 || east > 180 || north - south < 0.15) return null;
  return { south, west, north, east };
}

export function framesClose(a: DetailFrame, b: DetailFrame) {
  const latSpan = Math.max(0.2, a.north - a.south);
  const lonSpan = Math.max(0.2, a.east - a.west);
  return (
    Math.abs(a.south - b.south) < latSpan * 0.2 &&
    Math.abs(a.north - b.north) < latSpan * 0.2 &&
    Math.abs(a.west - b.west) < lonSpan * 0.2 &&
    Math.abs(a.east - b.east) < lonSpan * 0.2
  );
}

export function frameUv(frame: DetailFrame) {
  return {
    minU: (frame.west + 180) / 360,
    minV: (frame.south + 90) / 180,
    maxU: (frame.east + 180) / 360,
    maxV: (frame.north + 90) / 180,
  };
}

export function gibsMapUrl(layer: string, frame: DetailFrame) {
  const latSpan = frame.north - frame.south;
  const lonSpan = frame.east - frame.west;
  const aspect = lonSpan / Math.max(latSpan, 0.01);
  let width = 1024;
  let height = 1024;
  if (aspect >= 1) height = Math.max(128, Math.round(1024 / aspect));
  else width = Math.max(128, Math.round(1024 * aspect));
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.3.0",
    REQUEST: "GetMap",
    LAYERS: layer,
    FORMAT: "image/jpeg",
    CRS: "EPSG:4326",
    BBOX: `${frame.south},${frame.west},${frame.north},${frame.east}`,
    WIDTH: String(width),
    HEIGHT: String(height),
    STYLES: "",
  });
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params}`;
}
