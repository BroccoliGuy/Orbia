import { countryRecord } from "@/data/countries";
import { nearestNamedPlace, type PointFeature } from "@/data/features";
import { formatMeters, reliefWord } from "@/lib/geo";
import type { CountryFeature } from "@/lib/world";
import type { GeoLocation } from "@/types";

export function describePlace(lat: number, lon: number, altitude: number, match: CountryFeature | null) {
  const id = match ? String(match.id ?? "") : "";
  const record = match ? countryRecord(id, match.properties?.name ?? "Région") : null;
  const near = nearestNamedPlace(lat, lon, altitude);
  const kind = near?.subtitle.split("·")[0]?.trim() ?? "";
  const openWater = kind === "Mer" || kind === "Golfe" || kind === "Océan";
  const named = near && !(record && openWater) ? near : null;
  const ocean = named !== null && kind === "Océan";
  const meters = named ? formatMeters(altitude) : `${formatMeters(altitude)} · ${reliefWord(altitude)}`;
  return {
    id,
    record,
    named,
    name: ocean ? `Océan ${named.name}` : (named?.name ?? record?.name ?? "Océan"),
    subtitle: ocean ? "" : named ? (record?.name ?? kind) : record ? record.continent || record.name : reliefWord(altitude),
    meters,
  };
}

export function selectionFromPlace(
  lat: number,
  lon: number,
  place: { id: string; record: unknown; named: PointFeature | null; name: string; subtitle: string; meters: string },
): GeoLocation {
  const card = {
    name: place.name,
    subtitle: place.subtitle,
    lat,
    lon,
    primaryLabel: "Altitude",
    primaryValue: place.meters,
  };
  const subtitle = place.named?.subtitle ?? "";
  if (subtitle.startsWith("Cours d'eau")) {
    return { ...card, id: place.named?.id ?? "river", kind: "river" };
  }
  if (subtitle.startsWith("Lac")) {
    return { ...card, id: place.named?.id ?? "lake", kind: "lake", countryId: place.record ? place.id : undefined };
  }
  if (place.record) {
    return { ...card, id: place.id, kind: "country", countryId: place.id };
  }
  return { ...card, id: place.named?.id ?? "ocean", kind: "mountain" };
}
