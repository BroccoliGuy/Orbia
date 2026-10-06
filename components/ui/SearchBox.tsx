"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchGazetteer, type GazetteerHit } from "@/lib/gazetteer";
import { loadElevationGrid, sampleAltitude } from "@/lib/elevation";
import { describePlace, selectionFromPlace } from "@/lib/place";
import { countryFocus, findCountry, findCountryById, loadCountries } from "@/lib/world";
import { useEarthStore } from "@/store/earthStore";
import type { GeoLocation } from "@/types";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const shown = useRef(0);
  const flyTo = useEarthStore((state) => state.flyTo);
  const selectLocation = useEarthStore((state) => state.selectLocation);
  const results = useMemo(() => (query.trim().length < 2 ? [] : searchGazetteer(query)), [query]);

  useEffect(() => {
    if (expanded) input.current?.focus();
  }, [expanded]);

  useEffect(() => {
    const node = clip.current;
    const inner = node?.firstElementChild;
    if (!node || !(inner instanceof HTMLElement)) return;
    const from = shown.current;
    const to = expanded ? inner.getBoundingClientRect().width : 0;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 420);
      const eased = 1 - (1 - t) ** 3;
      const width = from + (to - from) * eased;
      shown.current = width;
      node.style.width = `${width}px`;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setExpanded(false);
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      setExpanded(false);
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [expanded]);

  function usesClickCard(location: GeoLocation) {
    if (location.kind === "river" || location.kind === "lake") return true;
    const kind = location.subtitle?.split("·")[0]?.trim() ?? "";
    return kind === "Mer" || kind === "Golfe" || kind === "Océan" || kind === "Chaîne" || kind === "Fosse" || kind === "Dorsale" || kind === "Plateau" || kind === "Plaine" || kind === "Désert" || kind === "Bassin";
  }

  function collapse() {
    setExpanded(false);
    setOpen(false);
  }

  async function choose(hit: GazetteerHit) {
    let location: GeoLocation = hit.location;
    if (location.kind === "country") {
      const features = await loadCountries();
      const match = findCountryById(features, location.id);
      if (match) {
        const focus = countryFocus(match);
        location = { ...location, lat: focus.lat, lon: focus.lon };
      }
    }
    if (usesClickCard(location) || location.kind === "city" || location.kind === "country") {
      await loadElevationGrid();
      const features = await loadCountries();
      const match = findCountry(features, location.lon, location.lat);
      const altitude = sampleAltitude(location.lat, location.lon);
      location = selectionFromPlace(location.lat, location.lon, describePlace(location.lat, location.lon, altitude, match));
    }
    selectLocation(location);
    flyTo(location.lat, location.lon, useEarthStore.getState().zoom, true);
    setQuery(location.name);
    collapse();
  }

  return (
    <div ref={root} className="pointer-events-auto absolute top-4 left-4 z-30 sm:left-5">
      <div className="flex h-9 items-center text-foreground">
        <button
          type="button"
          aria-label="Rechercher un relief, un océan, un lac, un fleuve..."
          aria-expanded={expanded}
          onClick={() => (expanded ? collapse() : setExpanded(true))}
          className="grid h-9 w-9 shrink-0 place-items-center [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.9))]"
        >
          <Search size={16} strokeWidth={1.5} />
        </button>
        <div ref={clip} className="overflow-hidden" style={{ width: 0 }}>
          <div className="w-[min(22rem,calc(100vw-7.75rem))] border-b border-white/45">
            <input
              ref={input}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Rechercher un relief, un océan, un lac, un fleuve..."
              className="w-full bg-transparent py-2 text-[13px] text-foreground outline-none placeholder:text-foreground/80 [text-shadow:0_1px_3px_rgb(0_0_0),0_0_8px_rgb(0_0_0/0.85)]"
              aria-label="Rechercher un relief, un océan, un lac, un fleuve..."
              role="combobox"
              aria-expanded={expanded && open && results.length > 0}
              aria-controls="search-results"
              tabIndex={expanded ? 0 : -1}
            />
          </div>
        </div>
      </div>
      {expanded && open && results.length > 0 ? (
        <ul
          id="search-results"
          role="listbox"
          className="absolute top-12 left-9 z-40 w-[min(22rem,calc(100vw-7.75rem))] text-[13px] [text-shadow:0_1px_2px_rgb(0_0_0/0.9)]"
        >
          {results.map((hit) => (
            <li key={hit.location.id} className="border-b border-white/20">
              <button
                type="button"
                role="option"
                className="flex w-full items-baseline justify-between gap-3 py-1.5 text-left hover:text-foreground"
                onClick={() => choose(hit)}
              >
                <span>{hit.location.name}</span>
                <span className="text-[11px] text-foreground">
                  {hit.location.kind === "country" || hit.location.kind === "city" ? hit.location.subtitle : hit.location.primaryValue}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
