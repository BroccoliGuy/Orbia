"use client";

import { ChevronLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { countryRecord, datasetTitle, formatDataset, hasCountryData } from "@/data/countries";
import { formatLat, formatLon } from "@/lib/geo";
import { useEarthStore } from "@/store/earthStore";
import type { CountryRecord, Dataset } from "@/types";

const COUNTRY_SHEET: { dataset?: Dataset; label: string }[] = [
  { label: "Capitale" },
  { label: "Superficie" },
  { dataset: "population", label: "Population" },
  { dataset: "density", label: "Densité" },
  { dataset: "growth", label: "Croissance" },
  { dataset: "medianAge", label: "Âge médian" },
  { dataset: "temperature", label: "Température" },
  { dataset: "precipitation", label: "Précipitations" },
  { dataset: "humidity", label: "Humidité" },
  { dataset: "koppen", label: "Köppen" },
  { dataset: "elevation", label: "Altitude moyenne" },
];

function sheetValue(record: CountryRecord, row: (typeof COUNTRY_SHEET)[number]) {
  if (row.label === "Capitale") return record.capital || "—";
  if (row.label === "Superficie") return `${Math.round(record.area).toLocaleString("fr-FR")} km²`;
  return row.dataset ? formatDataset(record, row.dataset) : "—";
}

function PlaceThumb({ lat, lon }: { lat: number; lon: number }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let alive = true;
    const source = new Image();
    source.src = "/textures/earth-day.jpg";
    source.onload = () => {
      if (!alive) return;
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext("2d");
      if (!context) return;
      const crop = source.width * 0.04;
      const sx = ((lon + 180) / 360) * source.width - crop / 2;
      const sy = ((90 - lat) / 180) * source.height - crop / 2;
      context.drawImage(source, sx, sy, crop, crop, 0, 0, 96, 96);
      setImage(canvas.toDataURL("image/jpeg", 0.82));
    };
    return () => {
      alive = false;
    };
  }, [lat, lon]);

  return (
    <span
      className="h-12 w-12 shrink-0 rounded-xl bg-[#10202c]"
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: "cover" } : undefined}
      aria-hidden
    />
  );
}

export function PlaceCard() {
  const location = useEarthStore((state) => state.selectedLocation);
  const detailOpen = useEarthStore((state) => state.detailOpen);
  const setDetailOpen = useEarthStore((state) => state.setDetailOpen);
  const selectLocation = useEarthStore((state) => state.selectLocation);
  const visible = useEarthStore((state) => state.controlsVisible);
  const dataset = useEarthStore((state) => state.dataset);
  const countryId = location?.countryId || (location?.kind === "country" ? location.id : "");
  const linked = countryId && hasCountryData(countryId) ? countryRecord(countryId) : null;
  const record = location?.kind === "country" ? linked : null;
  const datasetLine = dataset && linked
    ? { label: datasetTitle(dataset), value: formatDataset(linked, dataset) }
    : null;

  return (
    <>
      <button
        type="button"
        aria-label={detailOpen ? "Replier le détail" : "Ouvrir le détail"}
        onClick={() => location && setDetailOpen(!detailOpen)}
        className="glass absolute top-1/2 right-3 z-20 grid h-14 w-7 -translate-y-1/2 place-items-center rounded-full text-secondary transition-opacity"
        style={{ opacity: visible ? 0.85 : 0.15 }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} className={detailOpen ? "" : "rotate-180"} />
      </button>

      {location ? (
        <article className="glass absolute right-12 bottom-16 z-30 w-[250px] rounded-2xl p-3 max-md:right-3 max-md:bottom-24">
          <div className="flex gap-3">
            <PlaceThumb lat={location.lat} lon={location.lon} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[14px] font-medium">{location.name}</h2>
                <button type="button" aria-label="Fermer la fiche" onClick={() => selectLocation(null)}>
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
              <p className="text-[12px] text-secondary">{location.primaryValue}</p>
              <p className="tabular mt-1 text-[11px] text-secondary">
                {formatLat(location.lat)} {formatLon(location.lon)}
              </p>
              {datasetLine ? (
                <p className="mt-1 text-[12px]">
                  <span className="text-secondary">{datasetLine.label}</span> {datasetLine.value}
                </p>
              ) : null}
            </div>
          </div>
          {detailOpen ? (
            <dl className="mt-3 max-h-[min(420px,46vh)] space-y-1 overflow-auto border-t border-white/10 pt-3 text-[13px]">
              {record ? (
                COUNTRY_SHEET.map((row) => {
                  const active = row.dataset !== undefined && row.dataset === dataset;
                  return (
                    <div key={row.label} className={active ? "rounded-lg bg-accent/20 px-2 py-1 text-accent" : "px-2 py-1"}>
                      <dt className={`text-[11px] ${active ? "text-accent" : "text-secondary"}`}>{row.label}</dt>
                      <dd className="tabular">{sheetValue(record, row)}</dd>
                    </div>
                  );
                })
              ) : (
                <>
                  {location.subtitle ? (
                    <div className="px-2 py-1">
                      <dt className="text-[11px] text-secondary">Contexte</dt>
                      <dd>{location.subtitle}</dd>
                    </div>
                  ) : null}
                  <div className="px-2 py-1">
                    <dt className="text-[11px] text-secondary">{location.primaryLabel}</dt>
                    <dd className="tabular">{location.primaryValue}</dd>
                  </div>
                  {location.details?.map((detail) => (
                    <div key={detail.label} className="px-2 py-1">
                      <dt className="text-[11px] text-secondary">{detail.label}</dt>
                      <dd className="tabular">{detail.value}</dd>
                    </div>
                  ))}
                </>
              )}
            </dl>
          ) : null}
        </article>
      ) : null}
    </>
  );
}
