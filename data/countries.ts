import worldCountries from "@/data/world-countries.json";
import type { CountryRecord, Dataset } from "@/types";

export interface WorldCountry extends CountryRecord {
  capitalLat: number;
  capitalLon: number;
  lat: number;
  lon: number;
}

export const WORLD_COUNTRIES = worldCountries as WorldCountry[];

const GENERATED: Record<string, WorldCountry> = Object.fromEntries(WORLD_COUNTRIES.map((country) => [country.id, country]));

const KNOWN: Record<string, CountryRecord> = {
  "156": stat("156", "CN", "Chine", "Asie", "Pékin", 1412e6, 147, 0.0, 39, 9597000, 7.5, 645, 64, "Cwa", 0, 8849, 1840),
  "356": stat("356", "IN", "Inde", "Asie", "New Delhi", 1428e6, 435, 0.8, 28, 3287000, 24.0, 1083, 66, "Aw", 0, 8586, 160),
  "840": stat("840", "US", "États-Unis", "Amérique du Nord", "Washington", 340e6, 36, 0.5, 38, 9834000, 11.2, 715, 64, "Cfa", -86, 6190, 760),
  "360": stat("360", "ID", "Indonésie", "Asie", "Jakarta", 278e6, 145, 0.8, 30, 1911000, 25.8, 2702, 82, "Af", 0, 4884, 367),
  "586": stat("586", "PK", "Pakistan", "Asie", "Islamabad", 240e6, 287, 1.9, 22, 881900, 20.2, 494, 60, "BWh", 0, 8611, 900),
  "076": stat("076", "BR", "Brésil", "Amérique du Sud", "Brasilia", 212e6, 25, 0.5, 33, 8516000, 24.9, 1761, 75, "Aw", 0, 2995, 320),
  "566": stat("566", "NG", "Nigeria", "Afrique", "Abuja", 223e6, 241, 2.4, 18, 923800, 26.8, 1150, 74, "Aw", 0, 2419, 380),
  "050": stat("050", "BD", "Bangladesh", "Asie", "Dacca", 173e6, 1170, 1.0, 27, 148000, 25.2, 2666, 80, "Aw", 0, 1052, 85),
  "643": stat("643", "RU", "Russie", "Europe", "Moscou", 144e6, 9, -0.2, 40, 17098000, -5.1, 460, 72, "Dfb", -28, 5642, 600),
  "484": stat("484", "MX", "Mexique", "Amérique du Nord", "Mexico", 130e6, 66, 0.7, 29, 1964000, 21.0, 758, 62, "BSh", -10, 5636, 1110),
  "392": stat("392", "JP", "Japon", "Asie", "Tokyo", 124e6, 338, -0.5, 49, 377900, 11.2, 1668, 73, "Cfa", -10, 3776, 438),
  "231": stat("231", "ET", "Éthiopie", "Afrique", "Addis-Abeba", 126e6, 115, 2.5, 19, 1104000, 22.2, 848, 60, "Cwb", -125, 4550, 1330),
  "818": stat("818", "EG", "Égypte", "Afrique", "Le Caire", 112e6, 112, 1.6, 24, 1001000, 22.1, 51, 50, "BWh", -133, 2629, 321),
  "704": stat("704", "VN", "Viêt Nam", "Asie", "Hanoï", 99e6, 298, 0.7, 32, 331200, 24.3, 1821, 82, "Am", 0, 3143, 398),
  "276": stat("276", "DE", "Allemagne", "Europe", "Berlin", 84e6, 235, 0.0, 46, 357000, 9.4, 700, 78, "Cfb", -4, 2962, 263),
  "792": stat("792", "TR", "Turquie", "Asie", "Ankara", 85e6, 109, 0.6, 32, 783600, 13.2, 593, 64, "Csa", 0, 5137, 1132),
  "364": stat("364", "IR", "Iran", "Asie", "Téhéran", 89e6, 54, 0.7, 32, 1648000, 17.3, 228, 45, "BWh", -28, 5610, 1305),
  "764": stat("764", "TH", "Thaïlande", "Asie", "Bangkok", 72e6, 140, 0.1, 40, 513100, 26.3, 1622, 76, "Aw", 0, 2565, 287),
  "826": stat("826", "GB", "Royaume-Uni", "Europe", "Londres", 68e6, 279, 0.3, 40, 243600, 9.2, 1220, 81, "Cfb", -4, 1345, 162),
  "250": stat("250", "FR", "France", "Europe", "Paris", 68.4e6, 124, 0.3, 42, 551695, 12.1, 867, 77, "Cfb", -2, 4810, 375),
  "380": stat("380", "IT", "Italie", "Europe", "Rome", 59e6, 196, -0.3, 47, 301300, 13.5, 832, 72, "Csa", 0, 4810, 538),
  "710": stat("710", "ZA", "Afrique du Sud", "Afrique", "Pretoria", 60e6, 49, 0.9, 28, 1221000, 17.5, 495, 60, "Cwb", 0, 3450, 1034),
  "724": stat("724", "ES", "Espagne", "Europe", "Madrid", 48e6, 95, 0.2, 45, 505900, 15.2, 636, 66, "Csa", 0, 3718, 660),
  "032": stat("032", "AR", "Argentine", "Amérique du Sud", "Buenos Aires", 46e6, 16, 0.6, 32, 2780000, 14.8, 591, 64, "Cfa", -105, 6962, 595),
  "124": stat("124", "CA", "Canada", "Amérique du Nord", "Ottawa", 40e6, 4, 0.8, 41, 9985000, -4.4, 537, 72, "Dfb", 0, 5959, 487),
  "036": stat("036", "AU", "Australie", "Océanie", "Canberra", 26e6, 3, 1.1, 38, 7692000, 21.8, 534, 55, "BWh", -15, 2228, 330),
  "504": stat("504", "MA", "Maroc", "Afrique", "Rabat", 37e6, 83, 1.0, 29, 446500, 17.6, 346, 62, "Csa", 0, 4165, 909),
  "616": stat("616", "PL", "Pologne", "Europe", "Varsovie", 38e6, 122, -0.3, 42, 312700, 8.2, 600, 78, "Dfb", -2, 2499, 173),
  "804": stat("804", "UA", "Ukraine", "Europe", "Kyiv", 38e6, 63, -0.6, 41, 603500, 8.5, 565, 74, "Dfb", 0, 2061, 175),
  "404": stat("404", "KE", "Kenya", "Afrique", "Nairobi", 55e6, 94, 1.9, 20, 580400, 24.0, 630, 68, "Aw", 0, 5199, 762),
  "170": stat("170", "CO", "Colombie", "Amérique du Sud", "Bogota", 52e6, 46, 0.6, 31, 1142000, 24.5, 3240, 80, "Af", 0, 5775, 593),
  "410": stat("410", "KR", "Corée du Sud", "Asie", "Séoul", 52e6, 521, -0.1, 44, 100200, 12.5, 1274, 68, "Dwa", 0, 1950, 282),
  "012": stat("012", "DZ", "Algérie", "Afrique", "Alger", 45e6, 19, 1.5, 28, 2382000, 22.5, 89, 48, "BWh", -40, 2918, 800),
  "682": stat("682", "SA", "Arabie saoudite", "Asie", "Riyad", 36e6, 17, 1.3, 30, 2149700, 25.2, 59, 38, "BWh", 0, 3000, 665),
};

function stat(
  id: string,
  iso2: string,
  name: string,
  continent: string,
  capital: string,
  population: number,
  density: number,
  growthRate: number,
  medianAge: number,
  area: number,
  temperature: number,
  precipitation: number,
  humidity: number,
  climateClass: string,
  minElevation: number,
  maxElevation: number,
  averageElevation: number,
): CountryRecord {
  return {
    id,
    iso2,
    name,
    continent,
    capital,
    population,
    density,
    growthRate,
    medianAge,
    area,
    temperature,
    precipitation,
    humidity,
    climateClass,
    minElevation,
    maxElevation,
    averageElevation,
  };
}

export function countryRecord(id: string, fallbackName = "Région") {
  return (
    KNOWN[id] ??
    GENERATED[id] ?? {
      ...stat(id, "", fallbackName, "", "", 0, 0, 0, 0, 0, 0, 0, 0, "", 0, 0, 0),
      name: fallbackName,
    }
  );
}

export function hasCountryData(id: string) {
  return Boolean(KNOWN[id] || GENERATED[id]);
}

export function countryIdByCode(code: string) {
  const needle = code.toLowerCase();
  return WORLD_COUNTRIES.find((country) => country.iso2.toLowerCase() === needle)?.id ?? null;
}

const DATASET_META: Record<Dataset, { title: string; unit: string }> = {
  population: { title: "Population", unit: "habitants" },
  density: { title: "Densité", unit: "hab. / km²" },
  growth: { title: "Croissance", unit: "% / an" },
  medianAge: { title: "Âge médian", unit: "années" },
  temperature: { title: "Température", unit: "°C" },
  precipitation: { title: "Précipitations", unit: "mm / an" },
  humidity: { title: "Humidité", unit: "%" },
  koppen: { title: "Köppen", unit: "classe" },
  elevation: { title: "Altitude", unit: "m" },
};

export const KOPPEN_GROUPS = [
  { id: "A", label: "Tropical", color: "#ff5a4a" },
  { id: "B", label: "Sec", color: "#e2b15a" },
  { id: "C", label: "Tempéré", color: "#3dbe7a" },
  { id: "D", label: "Continental", color: "#20bfff" },
  { id: "E", label: "Polaire", color: "#d5e7f5" },
] as const;

export type KoppenGroup = (typeof KOPPEN_GROUPS)[number]["id"];

export function datasetTitle(dataset: Dataset) {
  return DATASET_META[dataset].title;
}

export function datasetUnit(dataset: Dataset) {
  return DATASET_META[dataset].unit;
}

export function climateGroup(record: CountryRecord): KoppenGroup | null {
  const letter = record.climateClass.trim().charAt(0).toUpperCase();
  if (letter === "A" || letter === "B" || letter === "C" || letter === "D" || letter === "E") return letter;
  return null;
}

export function presentKoppenGroups() {
  const present = new Set(
    WORLD_COUNTRIES.map((country) => climateGroup(countryRecord(country.id))).filter((group) => group !== null),
  );
  return KOPPEN_GROUPS.filter((group) => present.has(group.id));
}

export function datasetValue(record: CountryRecord, dataset: Dataset) {
  switch (dataset) {
    case "population":
      return record.population;
    case "density":
      return record.density;
    case "growth":
      return record.growthRate;
    case "medianAge":
      return record.medianAge;
    case "temperature":
      return record.temperature;
    case "precipitation":
      return record.precipitation;
    case "humidity":
      return record.humidity;
    case "elevation":
      return record.averageElevation;
    case "koppen":
      return 0;
    default:
      return 0;
  }
}

export function datasetNumbers(dataset: Dataset) {
  if (dataset === "koppen") return [];
  return WORLD_COUNTRIES.map((country) => datasetValue(countryRecord(country.id), dataset)).filter((value) => value !== 0);
}

function formatDatasetNumber(dataset: Dataset, value: number, withUnit: boolean) {
  const number = (digits: number) => value.toLocaleString("fr-FR", { maximumFractionDigits: digits });
  switch (dataset) {
    case "population":
      return formatPeople(Math.round(value));
    case "density":
      return withUnit ? `${Math.round(value).toLocaleString("fr-FR")} hab./km²` : Math.round(value).toLocaleString("fr-FR");
    case "growth":
      return withUnit ? `${number(1)} %` : number(1);
    case "medianAge":
      return withUnit ? `${Math.round(value).toLocaleString("fr-FR")} ans` : Math.round(value).toLocaleString("fr-FR");
    case "temperature":
      return withUnit ? `${number(1)} °C` : number(1);
    case "precipitation":
      return withUnit ? `${Math.round(value).toLocaleString("fr-FR")} mm` : Math.round(value).toLocaleString("fr-FR");
    case "humidity":
      return withUnit ? `${Math.round(value).toLocaleString("fr-FR")} %` : Math.round(value).toLocaleString("fr-FR");
    case "elevation":
      return withUnit ? `${Math.round(value).toLocaleString("fr-FR")} m` : Math.round(value).toLocaleString("fr-FR");
    default:
      return "";
  }
}

export function formatDataset(record: CountryRecord, dataset: Dataset) {
  if (dataset === "koppen") return record.climateClass || "—";
  return formatDatasetNumber(dataset, datasetValue(record, dataset), true);
}

export function datasetScale(dataset: Dataset, values: number[]) {
  const numbers = values.filter((value) => Number.isFinite(value));
  const unit = datasetUnit(dataset);
  if (numbers.length === 0) {
    return { min: 0, max: 0, low: "—", mid: "—", high: "—", unit };
  }
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const span = max - min || 1;
  const logarithmic = dataset === "population" || dataset === "precipitation";
  const at = (t: number) => {
    if (logarithmic) return 10 ** (t * Math.log10(Math.max(10, max)));
    return min + t * span;
  };
  return {
    min,
    max,
    low: formatDatasetNumber(dataset, at(0), false),
    mid: formatDatasetNumber(dataset, at(0.5), false),
    high: formatDatasetNumber(dataset, at(1), false),
    unit,
  };
}

export function datasetPosition(dataset: Dataset, value: number, scale: { min: number; max: number }) {
  if (dataset === "population" || dataset === "precipitation") {
    return Math.log10(Math.max(1, value)) / Math.log10(Math.max(10, scale.max));
  }
  const span = scale.max - scale.min || 1;
  return (value - scale.min) / span;
}

export function formatPeople(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} Md`;
  if (value >= 1e6) return `${(value / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (value <= 0) return "—";
  return value.toLocaleString("fr-FR");
}
