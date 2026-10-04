export type Projection =
  | "globe"
  | "mercator"
  | "robinson"
  | "mollweide"
  | "equirectangular";

export type StyleMode = "realistic" | "low-poly";

export type Dataset =
  | "population"
  | "density"
  | "growth"
  | "medianAge"
  | "temperature"
  | "precipitation"
  | "humidity"
  | "koppen"
  | "elevation";

export type PanelId =
  | "globe"
  | "layers"
  | "data"
  | "terrain"
  | "climate"
  | "population"
  | "hydro";

export type LocationKind = "country" | "city" | "mountain" | "river" | "lake";

export type LayerKey =
  | "borders"
  | "coasts"
  | "rivers"
  | "lakes"
  | "mountains"
  | "cities"
  | "capitals"
  | "relief"
  | "clouds"
  | "nightLights";

export interface Layers {
  borders: boolean;
  coasts: boolean;
  rivers: boolean;
  lakes: boolean;
  mountains: boolean;
  cities: boolean;
  capitals: boolean;
  relief: boolean;
  clouds: boolean;
  nightLights: boolean;
}

export interface CursorState {
  lat: number;
  lon: number;
  altitude: number;
}

export interface GeoLocation {
  id: string;
  kind: LocationKind;
  name: string;
  subtitle?: string;
  lat: number;
  lon: number;
  countryId?: string;
  primaryLabel: string;
  primaryValue: string;
  details?: { label: string; value: string }[];
}

export interface FlyTarget {
  lat: number;
  lon: number;
  zoom: number;
  token: number;
}

export interface CountryRecord {
  id: string;
  iso2: string;
  name: string;
  continent: string;
  capital: string;
  population: number;
  density: number;
  growthRate: number;
  medianAge: number;
  area: number;
  temperature: number;
  precipitation: number;
  humidity: number;
  climateClass: string;
  minElevation: number;
  maxElevation: number;
  averageElevation: number;
}

export interface EarthExplorerState {
  selectedLocation: GeoLocation | null;
  detailOpen: boolean;
  projection: Projection;
  style: StyleMode;
  dataset: Dataset | null;
  layers: Layers;
  reliefMode: "off" | "normal" | "exaggerated";
  reliefExaggeration: number;
  showAltitude: boolean;
  showPeaks: boolean;
  showDepths: boolean;
  zoom: number;
  cameraDistance: number;
  heading: number;
  cursor: CursorState;
  pointerOverGlobe: boolean;
  activePanel: PanelId | null;
  cinematic: boolean;
  railCollapsed: boolean;
  controlsVisible: boolean;
  reducedMotion: boolean;
  flyTarget: FlyTarget | null;
  projectionMix: number;
}
