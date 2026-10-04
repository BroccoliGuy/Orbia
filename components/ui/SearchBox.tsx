"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { searchGazetteer, type GazetteerHit } from "@/lib/gazetteer";
import { useEarthStore } from "@/store/earthStore";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const flyTo = useEarthStore((state) => state.flyTo);
  const selectLocation = useEarthStore((state) => state.selectLocation);
  const results = useMemo(() => (query.trim().length < 2 ? [] : searchGazetteer(query)), [query]);

  function choose(hit: GazetteerHit) {
    selectLocation(hit.location);
    flyTo(hit.location.lat, hit.location.lon, hit.zoom);
    setQuery(hit.location.name);
    setOpen(false);
  }

  return (
    <div className="pointer-events-auto relative hidden w-full max-w-[420px] flex-1 md:block">
      <label className="glass flex items-center gap-2 rounded-full px-4 py-2 text-secondary">
        <Search size={15} strokeWidth={1.5} aria-hidden />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un pays, une ville, une région..."
          className="w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-secondary/80"
          aria-label="Rechercher un pays, une ville, une région"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="search-results"
        />
      </label>
      {open && results.length > 0 ? (
        <ul id="search-results" role="listbox" className="glass absolute top-12 left-0 z-40 w-full overflow-hidden rounded-2xl py-1">
          {results.map((hit) => (
            <li key={hit.location.id}>
              <button
                type="button"
                role="option"
                className="flex w-full items-baseline justify-between px-4 py-2 text-left text-[13px] hover:bg-white/5"
                onClick={() => choose(hit)}
              >
                <span>{hit.location.name}</span>
                <span className="text-[11px] text-secondary">{hit.location.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
