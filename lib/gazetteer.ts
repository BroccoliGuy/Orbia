import { WORLD_COUNTRIES, countryRecord, formatPeople } from "@/data/countries";
import { CITIES, LAKES, OCEANS, PEAKS, RELIEF, RIVERS, SEAS, cityHeadline, interiorPoint } from "@/data/features";
import type { GeoLocation } from "@/types";

export interface GazetteerHit {
  location: GeoLocation;
  zoom: number;
}

const PLACES: GazetteerHit[] = [];
const seen = new Set<string>();

function add(hit: GazetteerHit) {
  const key = `${hit.location.kind}:${hit.location.name.toLocaleLowerCase("fr")}`;
  if (seen.has(key)) return;
  seen.add(key);
  PLACES.push(hit);
}

for (const country of WORLD_COUNTRIES) {
  const record = countryRecord(country.id, country.name);
  add({
    zoom: 3,
    location: {
      id: country.id,
      kind: "country",
      name: record.name,
      subtitle: record.continent,
      lat: country.lat,
      lon: country.lon,
      countryId: country.id,
      primaryLabel: "Population",
      primaryValue: formatPeople(record.population),
    },
  });
}

for (const city of CITIES) {
  const headline = cityHeadline(city);
  add({
    zoom: 5,
    location: {
      id: city.id,
      kind: "city",
      name: city.name,
      subtitle: city.subtitle,
      lat: city.lat,
      lon: city.lon,
      countryId: city.countryId,
      primaryLabel: headline.primaryLabel,
      primaryValue: headline.primaryValue,
    },
  });
}

for (const country of WORLD_COUNTRIES) {
  const record = countryRecord(country.id, country.name);
  if (!record.capital) continue;
  add({
    zoom: 5,
    location: {
      id: `capital-${country.iso2.toLowerCase() || country.id}`,
      kind: "city",
      name: record.capital,
      subtitle: record.name,
      lat: country.capitalLat,
      lon: country.capitalLon,
      countryId: country.id,
      primaryLabel: "Capitale",
      primaryValue: "Capitale",
    },
  });
}

for (const place of [...RELIEF, ...SEAS, ...OCEANS, ...PEAKS]) {
  add({
    zoom: 5,
    location: {
      id: place.id,
      kind: "mountain",
      name: place.name,
      subtitle: place.subtitle,
      lat: place.lat,
      lon: place.lon,
      primaryLabel: "Altitude",
      primaryValue: place.value,
    },
  });
}

for (const lake of LAKES) {
  const inside = interiorPoint(lake.points);
  add({
    zoom: 5,
    location: {
      id: lake.id,
      kind: "lake",
      name: lake.name,
      subtitle: lake.subtitle,
      lat: inside.lat,
      lon: inside.lon,
      primaryLabel: "Étendue",
      primaryValue: lake.value,
    },
  });
}

const longestRivers = new Map<string, (typeof RIVERS)[number]>();
for (const river of RIVERS) {
  const key = river.name.toLocaleLowerCase("fr");
  const current = longestRivers.get(key);
  const length = Number(river.value.replace(/[^\d]/g, "")) || 0;
  const currentLength = current ? Number(current.value.replace(/[^\d]/g, "")) || 0 : -1;
  if (!current || length > currentLength) longestRivers.set(key, river);
}

for (const river of longestRivers.values()) {
  const middle = river.points[Math.floor(river.points.length / 2)] ?? river.points[0];
  if (!middle) continue;
  add({
    zoom: 3,
    location: {
      id: river.id,
      kind: "river",
      name: river.name,
      subtitle: river.subtitle,
      lat: middle[1],
      lon: middle[0],
      primaryLabel: "Longueur",
      primaryValue: river.value,
    },
  });
}

export function searchGazetteer(query: string) {
  const needle = fold(query.trim());
  if (needle.length < 2) return [];
  return PLACES.flatMap((place) => {
    const rank = matchRank(place, needle);
    return rank === null ? [] : [{ place, rank }];
  })
    .sort((a, b) => score(a.place, a.rank) - score(b.place, b.rank))
    .slice(0, 6)
    .map((item) => item.place);
}

function fold(text: string) {
  return text.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function words(text: string) {
  return fold(text).split(/[\s'’\-·]+/).filter(Boolean);
}

function matchRank(place: GazetteerHit, needle: string) {
  const name = fold(place.location.name);
  const nameWords = words(place.location.name);
  const subtitleWords = words(place.location.subtitle ?? "");
  if (name === needle) return 0;
  if (name.startsWith(needle)) return 1;
  if (nameWords.some((word) => word === needle) || subtitleWords.some((word) => word === needle)) return 2;
  if (nameWords.some((word) => word.startsWith(needle)) || subtitleWords.some((word) => word.startsWith(needle))) return 3;
  return null;
}

function score(place: GazetteerHit, text: number) {
  const relief = place.location.kind === "mountain" ? 0 : place.location.kind === "country" ? 2 : 1;
  return relief * 10 + text;
}

export function gazetteerPlaces() {
  return PLACES;
}
