export const EARTH_RADIUS = 1;
export const KM_PER_UNIT = 6371;

export function distanceKm(latA: number, lonA: number, latB: number, lonB: number) {
  const toRad = Math.PI / 180;
  const dLat = (latB - latA) * toRad;
  const dLon = (lonB - lonA) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latA * toRad) * Math.cos(latB * toRad) * Math.sin(dLon / 2) ** 2;
  return KM_PER_UNIT * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function latLonToVector3(lat: number, lon: number, radius = EARTH_RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lon) * Math.PI) / 180;
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export function vector3ToLatLon(x: number, y: number, z: number) {
  const radius = Math.hypot(x, y, z) || 1;
  const lat = 90 - (Math.acos(Math.min(1, Math.max(-1, y / radius))) * 180) / Math.PI;
  const theta = Math.atan2(z, x);
  let lon = 90 - (theta * 180) / Math.PI;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return { lat, lon };
}

export function formatLat(lat: number) {
  const hemisphere = lat >= 0 ? "N" : "S";
  return `${Math.abs(lat).toFixed(4)}° ${hemisphere}`;
}

export function formatLon(lon: number) {
  const hemisphere = lon >= 0 ? "E" : "O";
  return `${Math.abs(lon).toFixed(4)}° ${hemisphere}`;
}

export function formatMeters(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} m`;
}

export function reliefWord(altitude: number) {
  if (altitude < -1000) return "Fosse";
  if (altitude < 0) return "Plateau";
  if (altitude < 1500) return "Plaine";
  return "Montagne";
}
