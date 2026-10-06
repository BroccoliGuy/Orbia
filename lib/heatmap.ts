import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import {
  climateGroup,
  countryRecord,
  datasetNumbers,
  datasetPosition,
  datasetScale,
  datasetValue,
  hasCountryData,
  KOPPEN_GROUPS,
} from "@/data/countries";
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
  const features = collection.features.map((item) => {
    const id = String((item as CountryFeature).id ?? "");
    const name = item.properties?.name ?? id;
    const record = hasCountryData(id) ? countryRecord(id, name) : null;
    return { item, record };
  });

  if (dataset === "koppen") {
    for (const entry of features) {
      if (!entry.record) continue;
      const group = climateGroup(entry.record);
      const swatch = KOPPEN_GROUPS.find((item) => item.id === group);
      if (!swatch) continue;
      context.fillStyle = `${swatch.color}b8`;
      paintGeometry(context, entry.item.geometry, width, height);
    }
    return;
  }

  const scale = datasetScale(dataset, datasetNumbers(dataset));
  for (const entry of features) {
    if (!entry.record) continue;
    const value = datasetValue(entry.record, dataset);
    if (value === 0) continue;
    const [r, g, b] = colorAt(datasetPosition(dataset, value, scale));
    context.fillStyle = `rgba(${r}, ${g}, ${b}, 0.72)`;
    paintGeometry(context, entry.item.geometry, width, height);
  }
}

function paintGeometry(
  context: CanvasRenderingContext2D,
  geometry: Geometry | null,
  width: number,
  height: number,
) {
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) drawRing(context, ring, width, height);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) drawRing(context, ring, width, height);
    }
  }
}
