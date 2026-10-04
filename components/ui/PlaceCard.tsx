"use client";

import { ChevronLeft, X } from "lucide-react";
import { formatLat, formatLon } from "@/lib/geo";
import { useEarthStore } from "@/store/earthStore";

export function PlaceCard() {
  const location = useEarthStore((state) => state.selectedLocation);
  const detailOpen = useEarthStore((state) => state.detailOpen);
  const setDetailOpen = useEarthStore((state) => state.setDetailOpen);
  const selectLocation = useEarthStore((state) => state.selectLocation);
  const visible = useEarthStore((state) => state.controlsVisible);

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
            <span
              className="h-12 w-12 shrink-0 rounded-xl"
              style={{ background: "linear-gradient(160deg, #1a4a62, #0c1c28 60%, #3a2a18)" }}
              aria-hidden
            />
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
            </div>
          </div>
          {detailOpen ? (
            <dl className="mt-3 space-y-2 border-t border-white/10 pt-3 text-[13px]">
              {location.subtitle ? (
                <div>
                  <dt className="text-[11px] text-secondary">Contexte</dt>
                  <dd>{location.subtitle}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[11px] text-secondary">{location.primaryLabel}</dt>
                <dd className="tabular">{location.primaryValue}</dd>
              </div>
              {location.details?.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-[11px] text-secondary">{detail.label}</dt>
                  <dd className="tabular">{detail.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </article>
      ) : null}
    </>
  );
}
