import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import { countryRecord, datasetValue, hasCountryData } from "@/data/countries";
import type { Dataset } from "@/types";

type CountryFeature = Feature<Geometry, { name?: string }> & { id?: string | number };

function colorAt(t: number) {
  const stops = [
    [20, 50, 74],
    [32, 191, 255],
    [255, 176, 32],
    [255, 90, 74],
  ];
  const scaled = Math.min(0.999, Math.max(0, t)) * (stops.length - 1);
  const index = Math.floor(scaled);
  const local = scaled - index;
  const a = stops[index];
  const b = stops[index + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * local),
    Math.round(a[1] + (b[1] - a[1]) * local),
    Math.round(a[2] + (b[2] - a[2]) * local),
  ];
}

function drawRing(
  context: CanvasRenderingContext2D,
  ring: number[][],
  width: number,
  height: number,
) {
  if (ring.length < 3) return;
  context.beginPath();
  let open = false;
  for (let index = 0; index < ring.length; index += 1) {
    const [lon, lat] = ring[index];
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    if (!open) {
      context.moveTo(x, y);
      open = true;
      continue;
    }
    const [prevLon] = ring[index - 1];
    const previousX = ((prevLon + 180) / 360) * width;
    if (Math.abs(x - previousX) > width * 0.5) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.closePath();
  context.fill();
}

export function paintHeatmap(
  canvas: HTMLCanvasElement,
  topology: Topology,
  dataset: Dataset,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  const collection = feature(
    topology,
    topology.objects.countries as GeometryCollection,
  ) as unknown as FeatureCollection;
  const valued = collection.features
    .map((item) => {
      const id = String((item as CountryFeature).id ?? "");
      const name = item.properties?.name ?? id;
      const record = countryRecord(id, name);
      return { item, id, value: hasCountryData(id) ? datasetValue(record, dataset) : null };
    })
    .filter((item) => item.value !== null && item.value !== 0);
  const numbers = valued.map((item) => item.value as number);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const span = max - min || 1;

  for (const entry of valued) {
    const t = dataset === "population" || dataset === "precipitation"
      ? Math.log10(Math.max(1, entry.value as number)) / Math.log10(Math.max(10, max))
      : ((entry.value as number) - min) / span;
    const [r, g, b] = colorAt(t);
    context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.72)`;
    const geometry = entry.item.geometry;
    if (!geometry) continue;
    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) drawRing(context, ring, width, height);
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) drawRing(context, ring, width, height);
      }
    }
  }
}
