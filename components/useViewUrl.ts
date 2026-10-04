"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { countryRecord, formatPeople, hasCountryData } from "@/data/countries";
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
      const match = Object.values({
        fr: "250",
        us: "840",
        cn: "156",
        br: "076",
        jp: "392",
        de: "276",
        ma: "504",
      })[0];
      const id = {
        fr: "250",
        us: "840",
        cn: "156",
        br: "076",
        jp: "392",
        de: "276",
        ma: "504",
        in: "356",
        ru: "643",
        gb: "826",
      }[country.toLowerCase()];
      if (id && hasCountryData(id)) {
        const record = countryRecord(id);
        store.selectLocation({
          id,
          kind: "country",
          name: record.name,
          subtitle: record.continent,
          lat: record.name === "France" ? 46.6 : lat || 20,
          lon: record.name === "France" ? 2.5 : lon || 10,
          countryId: id,
          primaryLabel: "Population",
          primaryValue: formatPeople(record.population),
          details: [
            { label: "Capitale", value: record.capital },
            { label: "Superficie", value: `${record.area.toLocaleString("fr-FR")} km²` },
            { label: "Altitude moyenne", value: `${record.averageElevation.toLocaleString("fr-FR")} m` },
            { label: "Climat", value: `${record.temperature.toLocaleString("fr-FR")} °C` },
          ],
        });
        if (!Number.isFinite(lat)) store.flyTo(record.name === "France" ? 46.6 : 20, record.name === "France" ? 2.5 : 10, 3);
      }
      void match;
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
      if (state.selectedLocation?.countryId === "250") next.set("country", "fr");
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
