"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { countryIdByCode, countryRecord, formatPeople, hasCountryData } from "@/data/countries";
import { countryFocus, findCountryById, loadCountries } from "@/lib/world";
import { useEarthStore } from "@/store/earthStore";
import type { Dataset, Projection, StyleMode } from "@/types";

const DATASETS = new Set<Dataset>([
  "population",
  "density",
  "growth",
  "medianAge",
  "temperature",
  "precipitation",
  "humidity",
  "koppen",
  "elevation",
]);

export function useViewUrl() {
  const params = useSearchParams();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const store = useEarthStore.getState();
    const style = params.get("style");
    const projection = params.get("projection");
    const data = params.get("data");
    const lat = Number(params.get("lat"));
    const lon = Number(params.get("lon"));
    const zoom = Number(params.get("zoom"));
    const country = params.get("country");
    if (style === "low-poly" || style === "realistic") store.setStyle(style as StyleMode);
    if (
      projection === "globe" ||
      projection === "mercator" ||
      projection === "robinson" ||
      projection === "mollweide" ||
      projection === "equirectangular"
    ) {
      store.setProjection(projection as Projection);
    }
    if (data && DATASETS.has(data as Dataset)) store.setDataset(data as Dataset);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      store.flyTo(lat, lon, Number.isFinite(zoom) ? zoom : 4);
    }
    if (country) {
      const id = countryIdByCode(country);
      if (id && hasCountryData(id)) {
        void loadCountries().then((features) => {
          const match = findCountryById(features, id);
          const focus = match ? countryFocus(match) : { lat: 0, lon: 0 };
          const focusLat = Number.isFinite(focus.lat) ? focus.lat : 0;
          const focusLon = Number.isFinite(focus.lon) ? focus.lon : 0;
          const record = countryRecord(id);
          store.selectLocation({
            id,
            kind: "country",
            name: record.name,
            subtitle: record.continent,
            lat: focusLat,
            lon: focusLon,
            countryId: id,
            primaryLabel: "Population",
            primaryValue: formatPeople(record.population),
          });
          if (!Number.isFinite(lat)) store.flyTo(focusLat, focusLon, Number.isFinite(zoom) ? zoom : 3);
        });
      }
    }
  }, [params]);

  useEffect(() => {
    let timer = 0;
    const write = () => {
      const state = useEarthStore.getState();
      const next = new URLSearchParams();
      if (state.projection !== "globe") next.set("projection", state.projection);
      if (state.style !== "realistic") next.set("style", state.style);
      if (state.dataset) next.set("data", state.dataset);
      if (state.selectedLocation?.kind === "country" && state.selectedLocation.countryId) {
        const code = countryRecord(state.selectedLocation.countryId).iso2.toLowerCase();
        if (code) next.set("country", code);
      }
      if (state.zoom > 0) {
        next.set("lat", state.viewLat.toFixed(4));
        next.set("lon", state.viewLon.toFixed(4));
        next.set("zoom", String(state.zoom));
      }
      const query = next.toString();
      const url = query ? `/explore?${query}` : "/explore";
      window.history.replaceState(null, "", url);
    };
    let previous = "";
    const unsubscribe = useEarthStore.subscribe((state) => {
      const key = [
        state.projection,
        state.style,
        state.dataset,
        state.zoom,
        state.viewLat.toFixed(2),
        state.viewLon.toFixed(2),
        state.selectedLocation?.id ?? "",
      ].join("|");
      if (key === previous) return;
      previous = key;
      window.clearTimeout(timer);
      timer = window.setTimeout(write, 250);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);
}
