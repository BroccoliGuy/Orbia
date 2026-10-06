import { geoCentroid, geoContains } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

export type CountryFeature = Feature<Geometry, { name?: string }> & { id?: string | number };

let loading: Promise<CountryFeature[]> | null = null;

export function loadCountries() {
  if (!loading) {
    loading = fetch("/data/countries-110m.json")
      .then((response) => response.json())
      .then((topology: Topology) => {
        const collection = feature(
          topology,
          topology.objects.countries as GeometryCollection,
        ) as unknown as FeatureCollection;
        return collection.features as CountryFeature[];
      });
  }
  return loading;
}

export function findCountry(features: CountryFeature[], lon: number, lat: number) {
  return features.find((item) => geoContains(item, [lon, lat])) ?? null;
}

function ringArea(ring: number[][]) {
  let sum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [lon, lat] = ring[index];
    const [nextLon, nextLat] = ring[index + 1];
    sum += lon * nextLat - nextLon * lat;
  }
  return Math.abs(sum);
}

function largestOuterRing(geometry: Geometry | null) {
  if (!geometry) return null;
  if (geometry.type === "Polygon") return geometry.coordinates[0] ?? null;
  if (geometry.type !== "MultiPolygon") return null;
  let best: number[][] | null = null;
  let bestArea = -1;
  for (const polygon of geometry.coordinates) {
    const ring = polygon[0];
    if (!ring) continue;
    const area = ringArea(ring);
    if (area > bestArea) {
      best = ring;
      bestArea = area;
    }
  }
  return best;
}

export function findCountryById(features: CountryFeature[], id: string) {
  const numeric = Number(id);
  return (
    features.find((item) => {
      const raw = String(item.id ?? "");
      return raw === id || (Number.isFinite(numeric) && Number(raw) === numeric);
    }) ?? null
  );
}

export function countryFocus(item: CountryFeature) {
  const ring = largestOuterRing(item.geometry);
  if (ring && ring.length >= 3) {
    const [lon, lat] = geoCentroid({ type: "Polygon", coordinates: [ring] });
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  }
  const [lon, lat] = geoCentroid(item);
  return { lat, lon };
}
