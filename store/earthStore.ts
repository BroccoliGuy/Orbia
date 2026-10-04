"use client";

import { create } from "zustand";
import type {
  Dataset,
  EarthExplorerState,
  GeoLocation,
  LayerKey,
  PanelId,
  Projection,
  StyleMode,
} from "@/types";

const initialLayers: EarthExplorerState["layers"] = {
  borders: true,
  coasts: true,
  rivers: false,
  lakes: false,
  mountains: false,
  cities: false,
  capitals: true,
  relief: true,
  clouds: true,
  nightLights: true,
};

type Actions = {
  setCursor: (cursor: EarthExplorerState["cursor"], over?: boolean) => void;
  setHover: (hover: EarthExplorerState["hover"]) => void;
  setZoom: (zoom: number) => void;
  setCameraDistance: (cameraDistance: number) => void;
  setHeading: (heading: number) => void;
  setView: (lat: number, lon: number) => void;
  setLayer: (key: LayerKey, value: boolean) => void;
  togglePanel: (panel: PanelId) => void;
  closePanel: () => void;
  setProjection: (projection: Projection) => void;
  setProjectionMix: (projectionMix: number) => void;
  setStyle: (style: StyleMode) => void;
  setDataset: (dataset: Dataset | null) => void;
  setReliefMode: (reliefMode: EarthExplorerState["reliefMode"]) => void;
  setReliefExaggeration: (reliefExaggeration: number) => void;
  setShowAltitude: (showAltitude: boolean) => void;
  setShowPeaks: (showPeaks: boolean) => void;
  setShowDepths: (showDepths: boolean) => void;
  selectLocation: (location: GeoLocation | null) => void;
  setDetailOpen: (detailOpen: boolean) => void;
  flyTo: (lat: number, lon: number, zoom?: number) => void;
  clearFlyTarget: () => void;
  setCinematic: (cinematic: boolean) => void;
  toggleCinematic: () => void;
  setRailCollapsed: (railCollapsed: boolean) => void;
  setControlsVisible: (controlsVisible: boolean) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  resetView: () => void;
};

export const useEarthStore = create<EarthExplorerState & Actions>((set, get) => ({
  selectedLocation: null,
  detailOpen: false,
  projection: "globe",
  style: "realistic",
  dataset: null,
  layers: initialLayers,
  reliefMode: "normal",
  reliefExaggeration: 1.4,
  showAltitude: true,
  showPeaks: true,
  showDepths: true,
  zoom: 0,
  cameraDistance: 3.35,
  heading: 0,
  viewLat: 16,
  viewLon: 18,
  cursor: { lat: 0, lon: 0, altitude: 0 },
  pointerOverGlobe: false,
  hover: null,
  activePanel: null,
  cinematic: false,
  railCollapsed: false,
  controlsVisible: true,
  reducedMotion: false,
  flyTarget: null,
  projectionMix: 0,

  setCursor: (cursor, over) =>
    set({ cursor, pointerOverGlobe: over ?? true }),
  setHover: (hover) => set({ hover }),
  setZoom: (zoom) => set({ zoom }),
  setCameraDistance: (cameraDistance) => set({ cameraDistance }),
  setHeading: (heading) => set({ heading }),
  setView: (viewLat, viewLon) => set({ viewLat, viewLon }),
  setLayer: (key, value) =>
    set((state) => ({ layers: { ...state.layers, [key]: value } })),
  togglePanel: (panel) =>
    set((state) => ({
      activePanel: state.activePanel === panel ? null : panel,
    })),
  closePanel: () => set({ activePanel: null }),
  setProjection: (projection) => set({ projection }),
  setProjectionMix: (projectionMix) => set({ projectionMix }),
  setStyle: (style) => set({ style }),
  setDataset: (dataset) =>
    set((state) => ({
      dataset: state.dataset === dataset ? null : dataset,
    })),
  setReliefMode: (reliefMode) =>
    set((state) => ({
      reliefMode,
      layers: {
        ...state.layers,
        relief: reliefMode !== "off",
      },
    })),
  setReliefExaggeration: (reliefExaggeration) => set({ reliefExaggeration }),
  setShowAltitude: (showAltitude) => set({ showAltitude }),
  setShowPeaks: (showPeaks) => set({ showPeaks }),
  setShowDepths: (showDepths) => set({ showDepths }),
  selectLocation: (selectedLocation) =>
    set({ selectedLocation, detailOpen: false }),
  setDetailOpen: (detailOpen) => set({ detailOpen }),
  flyTo: (lat, lon, zoom = 4) =>
    set((state) => ({
      flyTarget: {
        lat,
        lon,
        zoom,
        token: (state.flyTarget?.token ?? 0) + 1,
      },
    })),
  clearFlyTarget: () => set({ flyTarget: null }),
  setCinematic: (cinematic) => set({ cinematic, activePanel: cinematic ? null : get().activePanel }),
  toggleCinematic: () => {
    const cinematic = !get().cinematic;
    set({ cinematic, activePanel: cinematic ? null : get().activePanel });
  },
  setRailCollapsed: (railCollapsed) => set({ railCollapsed }),
  setControlsVisible: (controlsVisible) => set({ controlsVisible }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  resetView: () =>
    set((state) => ({
      projection: "globe",
      zoom: 0,
      flyTarget: {
        lat: 15,
        lon: 10,
        zoom: 0,
        token: (state.flyTarget?.token ?? 0) + 1,
      },
      selectedLocation: null,
      detailOpen: false,
      dataset: null,
    })),
}));
