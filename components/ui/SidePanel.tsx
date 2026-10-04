"use client";

import { X } from "lucide-react";
import type { Dataset, LayerKey, Projection } from "@/types";
import { RadioRow, Switch } from "@/components/ui/controls";
import { useCompact } from "@/components/ui/useChrome";
import { useEarthStore } from "@/store/earthStore";

const LAYER_ITEMS: { key: LayerKey; label: string }[] = [
  { key: "borders", label: "Frontières" },
  { key: "coasts", label: "Côtes" },
  { key: "rivers", label: "Fleuves" },
  { key: "lakes", label: "Lacs" },
  { key: "mountains", label: "Montagnes" },
  { key: "cities", label: "Villes" },
  { key: "capitals", label: "Capitales" },
  { key: "relief", label: "Relief" },
  { key: "clouds", label: "Nuages" },
  { key: "nightLights", label: "Lumières nocturnes" },
];

const PROJECTIONS: { id: Projection; label: string }[] = [
  { id: "globe", label: "Globe" },
  { id: "mercator", label: "Mercator" },
  { id: "robinson", label: "Robinson" },
  { id: "mollweide", label: "Mollweide" },
  { id: "equirectangular", label: "Équirectangulaire" },
];

const TITLES = {
  globe: "GLOBE",
  layers: "COUCHES",
  data: "DONNÉES",
  terrain: "RELIEF",
  climate: "CLIMAT",
  temperature: "TEMPÉRATURE",
  population: "POPULATION",
  hydro: "HYDROGRAPHIE",
} as const;

function DatasetButton({ id, label }: { id: Dataset; label: string }) {
  const dataset = useEarthStore((state) => state.dataset);
  const setDataset = useEarthStore((state) => state.setDataset);
  const active = dataset === id;
  return (
    <button
      type="button"
      onClick={() => setDataset(id)}
      className={`w-full rounded-xl px-3 py-2 text-left text-[13px] ${active ? "bg-accent/20 text-accent" : "hover:bg-white/5"}`}
    >
      {label}
    </button>
  );
}

export function SidePanel() {
  const panel = useEarthStore((state) => state.activePanel);
  const closePanel = useEarthStore((state) => state.closePanel);
  const layers = useEarthStore((state) => state.layers);
  const setLayer = useEarthStore((state) => state.setLayer);
  const projection = useEarthStore((state) => state.projection);
  const setProjection = useEarthStore((state) => state.setProjection);
  const style = useEarthStore((state) => state.style);
  const setStyle = useEarthStore((state) => state.setStyle);
  const reliefMode = useEarthStore((state) => state.reliefMode);
  const setReliefMode = useEarthStore((state) => state.setReliefMode);
  const exaggeration = useEarthStore((state) => state.reliefExaggeration);
  const setReliefExaggeration = useEarthStore((state) => state.setReliefExaggeration);
  const showAltitude = useEarthStore((state) => state.showAltitude);
  const showPeaks = useEarthStore((state) => state.showPeaks);
  const showDepths = useEarthStore((state) => state.showDepths);
  const setShowAltitude = useEarthStore((state) => state.setShowAltitude);
  const setShowPeaks = useEarthStore((state) => state.setShowPeaks);
  const setShowDepths = useEarthStore((state) => state.setShowDepths);
  const compact = useCompact();

  if (!panel) return null;

  return (
    <aside
      aria-label={TITLES[panel]}
      className={
        compact
          ? "glass absolute inset-x-3 bottom-20 z-40 max-h-[55dvh] overflow-auto rounded-3xl p-4"
          : "glass absolute top-24 left-[84px] z-40 w-[300px] rounded-3xl p-4"
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] tracking-[0.16em] text-secondary">{TITLES[panel]}</p>
        <button type="button" aria-label="Fermer le panneau" onClick={closePanel}>
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {panel === "globe" ? (
        <div role="radiogroup" aria-label="Projection">
          {PROJECTIONS.map((item) => (
            <RadioRow key={item.id} checked={projection === item.id} label={item.label} onSelect={() => setProjection(item.id)} />
          ))}
        </div>
      ) : null}

      {panel === "layers" ? (
        <>
          {LAYER_ITEMS.map((item) => (
            <Switch key={item.key} checked={layers[item.key]} label={item.label} onChange={(value) => {
              if (item.key === "relief") setReliefMode(value ? "normal" : "off");
              else setLayer(item.key, value);
            }} />
          ))}
          <p className="mt-4 mb-1 text-[11px] tracking-[0.14em] text-secondary">STYLE</p>
          <div role="radiogroup" aria-label="Style">
            <RadioRow checked={style === "realistic"} label="Réaliste" onSelect={() => setStyle("realistic")} />
            <RadioRow checked={style === "low-poly"} label="Low poly" onSelect={() => setStyle("low-poly")} />
          </div>
        </>
      ) : null}

      {panel === "data" || panel === "population" ? (
        <div className="space-y-1">
          <DatasetButton id="population" label="Population" />
          <DatasetButton id="density" label="Densité" />
          <DatasetButton id="growth" label="Croissance" />
          <DatasetButton id="medianAge" label="Âge médian" />
          {panel === "data" ? (
            <>
              <DatasetButton id="temperature" label="Température" />
              <DatasetButton id="precipitation" label="Précipitations" />
              <DatasetButton id="elevation" label="Altitude" />
            </>
          ) : null}
        </div>
      ) : null}

      {panel === "climate" ? (
        <div className="space-y-1">
          <DatasetButton id="temperature" label="Température" />
          <DatasetButton id="precipitation" label="Précipitations" />
          <DatasetButton id="humidity" label="Humidité" />
          <DatasetButton id="koppen" label="Classification Köppen" />
        </div>
      ) : null}

      {panel === "temperature" ? (
        <div className="space-y-1">
          <DatasetButton id="temperature" label="Température moyenne" />
          <p className="px-3 pt-2 text-[12px] leading-5 text-secondary">
            Moyenne annuelle par pays. La légende apparaît lorsque le jeu de données est actif.
          </p>
        </div>
      ) : null}

      {panel === "terrain" ? (
        <>
          <div role="radiogroup" aria-label="Relief">
            <RadioRow checked={reliefMode === "off"} label="Désactivé" onSelect={() => setReliefMode("off")} />
            <RadioRow checked={reliefMode === "normal"} label="Normal" onSelect={() => setReliefMode("normal")} />
            <RadioRow checked={reliefMode === "exaggerated"} label="Exagéré" onSelect={() => setReliefMode("exaggerated")} />
          </div>
          <label className="mt-3 block text-[12px] text-secondary">
            Exagération
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={exaggeration}
              aria-label="Exagération du relief"
              onChange={(event) => setReliefExaggeration(Number(event.target.value))}
              className="mt-2 w-full accent-[#20bfff]"
            />
          </label>
          <div className="mt-3">
            <Switch checked={showAltitude} label="Afficher l'altitude" onChange={setShowAltitude} />
            <Switch checked={showPeaks} label="Afficher les sommets" onChange={setShowPeaks} />
            <Switch checked={showDepths} label="Afficher les profondeurs" onChange={setShowDepths} />
          </div>
        </>
      ) : null}

      {panel === "hydro" ? (
        <>
          <Switch checked={layers.rivers} label="Fleuves" onChange={(value) => setLayer("rivers", value)} />
          <Switch checked={layers.lakes} label="Lacs" onChange={(value) => setLayer("lakes", value)} />
          <Switch checked={layers.coasts} label="Côtes" onChange={(value) => setLayer("coasts", value)} />
        </>
      ) : null}
    </aside>
  );
}
