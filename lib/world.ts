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

export function countryFocus(item: CountryFeature) {
  const [lon, lat] = geoCentroid(item);
  return { lat, lon };
}
