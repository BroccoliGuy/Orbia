import type { GeoLocation } from "@/types";

export interface GazetteerHit {
  location: GeoLocation;
  zoom: number;
}

const PLACES: GazetteerHit[] = [
  { zoom: 3, location: { id: "country-fr", kind: "country", name: "France", subtitle: "Europe", lat: 46.6, lon: 2.5, countryId: "250", primaryLabel: "Population", primaryValue: "68,4 M" } },
  { zoom: 5, location: { id: "city-paris", kind: "city", name: "Paris", subtitle: "France · Île-de-France", lat: 48.8566, lon: 2.3522, countryId: "250", primaryLabel: "Population", primaryValue: "2,1 M" } },
  { zoom: 5, location: { id: "mountain-mont-blanc", kind: "mountain", name: "Mont Blanc", subtitle: "Alpes", lat: 45.8326, lon: 6.8652, countryId: "250", primaryLabel: "Altitude", primaryValue: "4 810 m" } },
  { zoom: 3, location: { id: "river-amazone", kind: "river", name: "Amazone", subtitle: "Amazonie", lat: -3.1, lon: -60.0, primaryLabel: "Longueur", primaryValue: "6 400 km" } },
  { zoom: 3, location: { id: "country-us", kind: "country", name: "États-Unis", subtitle: "Amérique du Nord", lat: 39.8, lon: -98.5, countryId: "840", primaryLabel: "Population", primaryValue: "340 M" } },
  { zoom: 5, location: { id: "city-new-york", kind: "city", name: "New York", subtitle: "États-Unis", lat: 40.7128, lon: -74.006, countryId: "840", primaryLabel: "Population", primaryValue: "8,3 M" } },
  { zoom: 3, location: { id: "country-cn", kind: "country", name: "Chine", subtitle: "Asie", lat: 35.9, lon: 104.2, countryId: "156", primaryLabel: "Population", primaryValue: "1,41 Md" } },
  { zoom: 3, location: { id: "country-br", kind: "country", name: "Brésil", subtitle: "Amérique du Sud", lat: -10.8, lon: -52.9, countryId: "076", primaryLabel: "Population", primaryValue: "212 M" } },
  { zoom: 3, location: { id: "country-jp", kind: "country", name: "Japon", subtitle: "Asie", lat: 36.2, lon: 138.3, countryId: "392", primaryLabel: "Population", primaryValue: "124 M" } },
  { zoom: 5, location: { id: "city-tokyo", kind: "city", name: "Tokyo", subtitle: "Japon", lat: 35.6762, lon: 139.6503, countryId: "392", primaryLabel: "Population", primaryValue: "14 M" } },
  { zoom: 5, location: { id: "mountain-everest", kind: "mountain", name: "Everest", subtitle: "Himalaya", lat: 27.9881, lon: 86.925, primaryLabel: "Altitude", primaryValue: "8 849 m" } },
  { zoom: 3, location: { id: "river-nil", kind: "river", name: "Nil", subtitle: "Afrique", lat: 15.6, lon: 32.5, primaryLabel: "Longueur", primaryValue: "6 650 km" } },
  { zoom: 3, location: { id: "country-ma", kind: "country", name: "Maroc", subtitle: "Afrique", lat: 31.8, lon: -7.1, countryId: "504", primaryLabel: "Population", primaryValue: "37 M" } },
  { zoom: 3, location: { id: "country-de", kind: "country", name: "Allemagne", subtitle: "Europe", lat: 51.2, lon: 10.4, countryId: "276", primaryLabel: "Population", primaryValue: "84 M" } },
  { zoom: 5, location: { id: "city-london", kind: "city", name: "Londres", subtitle: "Royaume-Uni", lat: 51.5074, lon: -0.1278, countryId: "826", primaryLabel: "Population", primaryValue: "8,9 M" } },
];

export function searchGazetteer(query: string) {
  const needle = query.trim().toLocaleLowerCase("fr");
  if (needle.length < 2) return [];
  return PLACES.filter((place) => {
    const haystack = `${place.location.name} ${place.location.subtitle ?? ""}`.toLocaleLowerCase("fr");
    return haystack.includes(needle);
  }).slice(0, 6);
}

export function gazetteerPlaces() {
  return PLACES;
}
