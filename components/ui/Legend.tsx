"use client";

import {
  climateGroup,
  countryRecord,
  datasetNumbers,
  datasetPosition,
  datasetScale,
  datasetTitle,
  datasetValue,
  formatDataset,
  hasCountryData,
  presentKoppenGroups,
} from "@/data/countries";
import { useEarthStore } from "@/store/earthStore";
import type { CountryRecord, Dataset } from "@/types";

function sameCountry(left: string, right: string) {
  if (!left || !right) return false;
  if (left === right) return true;
  const a = Number(left);
  const b = Number(right);
  return Number.isFinite(a) && Number.isFinite(b) && a === b;
}

function placed(dataset: Dataset, record: CountryRecord, scale: { min: number; max: number }) {
  return {
    label: formatDataset(record, dataset),
    percent: Math.min(100, Math.max(0, datasetPosition(dataset, datasetValue(record, dataset), scale) * 100)),
  };
}

export function Legend() {
  const dataset = useEarthStore((state) => state.dataset);
  const location = useEarthStore((state) => state.selectedLocation);
  const hover = useEarthStore((state) => state.hover);
  if (!dataset) return null;
  const countryId = location?.countryId || (location?.kind === "country" ? location.id : "");
  const record = countryId && hasCountryData(countryId) ? countryRecord(countryId) : null;
  const hoverId = hover?.countryId ?? "";
  const hoverRecord =
    hoverId && hasCountryData(hoverId) && !sameCountry(hoverId, countryId) ? countryRecord(hoverId) : null;

  if (dataset === "koppen") {
    const groups = presentKoppenGroups();
    const active = record ? climateGroup(record) : null;
    const hovered = hoverRecord ? climateGroup(hoverRecord) : null;
    return (
      <aside className="glass absolute bottom-28 left-1/2 z-20 w-[210px] -translate-x-1/2 rounded-2xl p-3">
        <p className="text-[12px] tracking-[0.12em] text-secondary uppercase">{datasetTitle(dataset)}</p>
        <ul className="mt-2 space-y-1">
          {groups.map((group) => {
            const marked = group.id === active || (!active && group.id === hovered);
            const compared = Boolean(active) && group.id === hovered && hovered !== active;
            return (
              <li
                key={group.id}
                className={
                  marked
                    ? "flex items-center gap-2 rounded-lg bg-accent/20 px-2 py-1 text-[12px] text-accent"
                    : compared
                      ? "flex items-center gap-2 px-2 py-1 text-[12px] text-foreground"
                      : "flex items-center gap-2 px-2 py-1 text-[12px] text-secondary"
                }
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: group.color }} />
                {group.label}
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  const scale = datasetScale(dataset, datasetNumbers(dataset));
  const mark = record ? placed(dataset, record, scale) : null;
  const compared = hoverRecord ? placed(dataset, hoverRecord, scale) : null;
  const labeled = mark ?? compared;
  const labelShift = !labeled ? "0" : labeled.percent < 18 ? "0" : labeled.percent > 82 ? "-100%" : "-50%";

  return (
    <aside className="glass absolute bottom-28 left-1/2 z-20 w-[210px] -translate-x-1/2 rounded-2xl p-3">
      <p className="text-[12px] tracking-[0.12em] text-secondary uppercase">{datasetTitle(dataset)}</p>
      <div className="relative mt-5">
        {labeled ? (
          <span
            className="tabular absolute bottom-full mb-1 text-[11px] whitespace-nowrap text-accent"
            style={{ left: `${labeled.percent}%`, transform: `translateX(${labelShift})` }}
          >
            {labeled.label}
          </span>
        ) : null}
        <div className="relative h-2 rounded-full" style={{ background: "linear-gradient(90deg, #14324a, #20bfff 45%, #ffb020 75%, #ff5a4a)" }}>
          {compared ? (
            <span
              className="absolute top-1/2 h-2 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45"
              style={{ left: `${compared.percent}%` }}
            />
          ) : null}
          {mark ? (
            <span
              className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
              style={{ left: `${mark.percent}%` }}
            />
          ) : null}
        </div>
      </div>
      <div className="mt-1 flex justify-between gap-2 text-[11px] text-secondary">
        <span>{scale.low}</span>
        <span>{scale.mid}</span>
        <span>{scale.high}</span>
      </div>
      <p className="mt-1 text-[11px] text-secondary">{scale.unit}</p>
    </aside>
  );
}
