import hydro from "@/data/hydro.json";
import { WORLD_COUNTRIES, countryRecord } from "@/data/countries";
import { distanceKm } from "@/lib/geo";

export interface PointFeature {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lon: number;
  value: string;
  capital?: boolean;
  rank: number;
  countryId?: string;
  points?: [number, number][];
  reachKm?: number;
}

export interface LineFeature {
  id: string;
  name: string;
  subtitle: string;
  value: string;
  points: [number, number][];
}

const CURATED_CITIES: PointFeature[] = [
  { id: "paris", name: "Paris", subtitle: "France · Île-de-France", lat: 48.8566, lon: 2.3522, value: "2,1 M", capital: true, rank: 1 },
  { id: "london", name: "Londres", subtitle: "Royaume-Uni", lat: 51.5074, lon: -0.1278, value: "8,9 M", capital: true, rank: 1 },
  { id: "berlin", name: "Berlin", subtitle: "Allemagne", lat: 52.52, lon: 13.405, value: "3,7 M", capital: true, rank: 1 },
  { id: "madrid", name: "Madrid", subtitle: "Espagne", lat: 40.4168, lon: -3.7038, value: "3,3 M", capital: true, rank: 1 },
  { id: "rome", name: "Rome", subtitle: "Italie", lat: 41.9028, lon: 12.4964, value: "2,8 M", capital: true, rank: 1 },
  { id: "washington", name: "Washington", subtitle: "États-Unis", lat: 38.9072, lon: -77.0369, value: "0,7 M", capital: true, rank: 1 },
  { id: "newyork", name: "New York", subtitle: "États-Unis", lat: 40.7128, lon: -74.006, value: "8,3 M", rank: 1 },
  { id: "tokyo", name: "Tokyo", subtitle: "Japon", lat: 35.6762, lon: 139.6503, value: "14 M", capital: true, rank: 1 },
  { id: "beijing", name: "Pékin", subtitle: "Chine", lat: 39.9042, lon: 116.4074, value: "21 M", capital: true, rank: 1 },
  { id: "delhi", name: "New Delhi", subtitle: "Inde", lat: 28.6139, lon: 77.209, value: "32 M", capital: true, rank: 1 },
  { id: "cairo", name: "Le Caire", subtitle: "Égypte", lat: 30.0444, lon: 31.2357, value: "21 M", capital: true, rank: 1 },
  { id: "brasilia", name: "Brasilia", subtitle: "Brésil", lat: -15.7939, lon: -47.8828, value: "3,1 M", capital: true, rank: 1 },
  { id: "saopaulo", name: "São Paulo", subtitle: "Brésil", lat: -23.5558, lon: -46.6396, value: "12 M", rank: 2 },
  { id: "lagos", name: "Lagos", subtitle: "Nigeria", lat: 6.5244, lon: 3.3792, value: "15 M", rank: 1 },
  { id: "moscow", name: "Moscou", subtitle: "Russie", lat: 55.7558, lon: 37.6173, value: "13 M", capital: true, rank: 1 },
  { id: "canberra", name: "Canberra", subtitle: "Australie", lat: -35.2809, lon: 149.13, value: "0,5 M", capital: true, rank: 2 },
  { id: "sydney", name: "Sydney", subtitle: "Australie", lat: -33.8688, lon: 151.2093, value: "5,3 M", rank: 1 },
  { id: "rabat", name: "Rabat", subtitle: "Maroc", lat: 34.0209, lon: -6.8416, value: "0,6 M", capital: true, rank: 2 },
  { id: "casablanca", name: "Casablanca", subtitle: "Maroc", lat: 33.5731, lon: -7.5898, value: "3,7 M", rank: 1 },
  { id: "ottawa", name: "Ottawa", subtitle: "Canada", lat: 45.4215, lon: -75.6972, value: "1,0 M", capital: true, rank: 2 },
  { id: "mexico", name: "Mexico", subtitle: "Mexique", lat: 19.4326, lon: -99.1332, value: "22 M", capital: true, rank: 1 },
];

function lerpLon(from: number, to: number, t: number) {
  let delta = to - from;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  let lon = from + delta * t;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  return lon;
}

function densify(points: [number, number][], maxGapKm: number) {
  const axis: [number, number][] = [[points[0][0], points[0][1]]];
  for (let index = 1; index < points.length; index += 1) {
    const [lat0, lon0] = points[index - 1];
    const [lat1, lon1] = points[index];
    const steps = Math.max(1, Math.ceil(distanceKm(lat0, lon0, lat1, lon1) / maxGapKm));
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      axis.push([lat0 + (lat1 - lat0) * t, lerpLon(lon0, lon1, t)]);
    }
  }
  return axis;
}

export const RELIEF: PointFeature[] = [
  { id: "alpes", name: "Alpes", subtitle: "Chaîne · Europe", lat: 46.5, lon: 9.5, value: "4 810 m", rank: 1, reachKm: 85, points: [[44.2, 7.2], [44.9, 6.6], [45.5, 7.0], [45.9, 7.6], [46.4, 8.2], [46.5, 9.5], [46.8, 10.6], [46.9, 11.8], [47.1, 12.8], [47.2, 13.8], [47.1, 14.7], [46.4, 13.6]] },
  { id: "pyrenees", name: "Pyrénées", subtitle: "Chaîne · Europe", lat: 42.7, lon: 0.6, value: "3 404 m", rank: 1, reachKm: 50, points: [[43.05, -1.5], [42.85, -0.2], [42.7, 0.6], [42.6, 1.5], [42.45, 2.2]] },
  { id: "carpates", name: "Carpates", subtitle: "Chaîne · Europe", lat: 45.6, lon: 25.5, value: "2 655 m", rank: 1, reachKm: 80, points: [[49.2, 19.6], [49.0, 20.8], [48.2, 24.2], [47.2, 25.2], [45.6, 25.5], [45.3, 24.0], [45.4, 22.7]] },
  { id: "caucase", name: "Caucase", subtitle: "Chaîne · Europe", lat: 43.35, lon: 42.44, value: "5 642 m", rank: 1, reachKm: 70, points: [[43.6, 40.2], [43.35, 42.44], [42.8, 44.2], [42.4, 45.8], [41.6, 47.2]] },
  { id: "oural", name: "Oural", subtitle: "Chaîne · Europe", lat: 60, lon: 59, value: "1 895 m", rank: 1, reachKm: 70, points: [[68, 65], [64, 60], [60, 59], [56, 58.5], [52, 58]] },
  { id: "scandinaves", name: "Alpes scandinaves", subtitle: "Chaîne · Europe", lat: 62, lon: 8, value: "2 469 m", rank: 1, reachKm: 80, points: [[69, 20], [67, 16], [64, 13], [62, 8], [60, 6.5]] },
  { id: "atlas", name: "Atlas", subtitle: "Chaîne · Afrique", lat: 31.06, lon: -7.92, value: "4 167 m", rank: 1, reachKm: 75, points: [[31.06, -7.92], [31.6, -6.2], [32.4, -4.2], [33.8, -2.2], [35.2, 1.2], [36.3, 4.5], [35.6, 8.2]] },
  { id: "drakensberg", name: "Drakensberg", subtitle: "Chaîne · Afrique", lat: -29.5, lon: 29.2, value: "3 482 m", rank: 1, reachKm: 70, points: [[-28.6, 28.8], [-29.5, 29.2], [-30.6, 28.6]] },
  { id: "himalaya", name: "Himalaya", subtitle: "Chaîne · Asie", lat: 28, lon: 86.9, value: "8 849 m", rank: 1, reachKm: 120, points: [[35.2, 74.6], [33.5, 76.8], [31.5, 79.5], [29.5, 82.5], [28.5, 84], [28, 86.9], [27.8, 89.5], [27.7, 92.5], [27.8, 95.5]] },
  { id: "hindou-kouch", name: "Hindu Kush", subtitle: "Chaîne · Asie", lat: 36.2, lon: 71.8, value: "7 708 m", rank: 1, reachKm: 80, points: [[36.4, 72.2], [35.6, 70.6], [34.6, 68.8], [33.6, 67.2]] },
  { id: "tian-shan", name: "Tian Shan", subtitle: "Chaîne · Asie", lat: 42.2, lon: 80.1, value: "7 439 m", rank: 1, reachKm: 100, points: [[43.1, 75], [42.5, 78], [42.2, 80.1], [42.8, 84], [43.2, 88]] },
  { id: "zagros", name: "Zagros", subtitle: "Chaîne · Asie", lat: 32, lon: 50, value: "4 409 m", rank: 1, reachKm: 100, points: [[36.5, 45.5], [34.5, 47.5], [32, 50], [29.5, 52], [27.5, 55]] },
  { id: "altai", name: "Altaï", subtitle: "Chaîne · Asie", lat: 49.8, lon: 86.6, value: "4 506 m", rank: 1, reachKm: 90, points: [[50.5, 85], [49.8, 86.6], [49.2, 88.5], [48.5, 90]] },
  { id: "andes", name: "Andes", subtitle: "Chaîne · Amérique du Sud", lat: -20, lon: -67, value: "6 961 m", rank: 1, reachKm: 100, points: [[8, -73], [2, -78], [-4, -78], [-10, -76], [-15, -72], [-20, -67], [-25, -67], [-30, -70], [-32.7, -70], [-36, -71], [-42, -72], [-48, -73], [-54, -70]] },
  { id: "rocheuses", name: "Rocheuses", subtitle: "Chaîne · Amérique du Nord", lat: 45, lon: -110, value: "4 401 m", rank: 1, reachKm: 140, points: [[62, -140], [55, -125], [50, -116], [45, -110], [40, -106], [35, -106], [32, -108]] },
  { id: "appalaches", name: "Appalaches", subtitle: "Chaîne · Amérique du Nord", lat: 37.5, lon: -81.5, value: "2 037 m", rank: 1, reachKm: 80, points: [[34.8, -84], [36.5, -82], [38.5, -80], [41, -76], [44, -71], [46.5, -69]] },
  { id: "sierra-nevada", name: "Sierra Nevada", subtitle: "Chaîne · Amérique du Nord", lat: 36.6, lon: -118.3, value: "4 421 m", rank: 1, reachKm: 55, points: [[35.8, -118.2], [36.6, -118.3], [37.7, -119.3], [38.8, -120.2]] },
  { id: "sierra-madre", name: "Sierra Madre", subtitle: "Chaîne · Amérique du Nord", lat: 26, lon: -107, value: "3 300 m", rank: 1, reachKm: 90, points: [[29, -108.5], [26, -107], [23, -105], [20, -103.5]] },
  { id: "alpes-du-sud", name: "Alpes du Sud", subtitle: "Chaîne · Océanie", lat: -43.6, lon: 170.1, value: "3 724 m", rank: 1, reachKm: 60, points: [[-43.6, 170.1], [-44.4, 169.2], [-45.2, 168]] },
  { id: "mariannes", name: "Fosse des Mariannes", subtitle: "Fosse · Pacifique", lat: 11.35, lon: 142.2, value: "−10 034 m", rank: 1, reachKm: 160, points: [[12.8, 144.5], [12.1, 143.4], [11.35, 142.2], [11.0, 141.2], [10.9, 140.2], [11.4, 139.2]] },
  { id: "tonga", name: "Fosse des Tonga", subtitle: "Fosse · Pacifique", lat: -21, lon: -174.5, value: "−10 800 m", rank: 1, reachKm: 140, points: [[-15.5, -172.5], [-18, -173.2], [-21, -174.5], [-24, -175.3]] },
  { id: "japon", name: "Fosse du Japon", subtitle: "Fosse · Pacifique", lat: 38, lon: 144, value: "−8 020 m", rank: 1, reachKm: 140, points: [[41.2, 145], [39, 144.3], [37.2, 143.6], [35.8, 142.6]] },
  { id: "kouriles", name: "Fosse des Kouriles", subtitle: "Fosse · Pacifique", lat: 47, lon: 155, value: "−10 542 m", rank: 1, reachKm: 140, points: [[50.5, 157.5], [48, 156], [45.5, 153], [43.5, 150.5]] },
  { id: "philippines", name: "Fosse des Philippines", subtitle: "Fosse · Pacifique", lat: 10, lon: 126.5, value: "−10 540 m", rank: 1, reachKm: 140, points: [[14.5, 126], [11.5, 126.2], [8.5, 127], [5.5, 127.8]] },
  { id: "java", name: "Fosse de Java", subtitle: "Fosse · Indien", lat: -10, lon: 110, value: "−7 450 m", rank: 1, reachKm: 140, points: [[-4, 100], [-7, 105], [-10, 110], [-11, 115], [-10.5, 119]] },
  { id: "porto-rico", name: "Fosse de Porto Rico", subtitle: "Fosse · Atlantique", lat: 19.5, lon: -66, value: "−8 376 m", rank: 1, reachKm: 120, points: [[19.8, -68.5], [19.5, -66], [19.1, -63.5], [18.4, -61.5]] },
  { id: "perou-chili", name: "Fosse du Pérou-Chili", subtitle: "Fosse · Pacifique", lat: -20, lon: -71.5, value: "−8 065 m", rank: 1, reachKm: 140, points: [[-5, -82], [-12, -79], [-18, -72.5], [-23, -71.5], [-30, -72.5], [-36, -74.5], [-42, -76]] },
  { id: "dorsale", name: "Dorsale médio-atlantique", subtitle: "Dorsale · Atlantique", lat: 0, lon: -30, value: "−5 660 m", rank: 1, reachKm: 220, points: [[70, -15], [62, -27], [52, -32], [42, -29], [32, -40], [22, -45], [12, -42], [0, -30], [-10, -15], [-20, -12], [-32, -14], [-42, -16], [-52, -6]] },
  { id: "dorsale-pacifique", name: "Dorsale est-pacifique", subtitle: "Dorsale · Pacifique", lat: -10, lon: -110, value: "−2 500 m", rank: 1, reachKm: 220, points: [[15, -105], [8, -104], [0, -108], [-8, -110], [-18, -114], [-28, -114], [-40, -112], [-50, -118]] },
  { id: "tibet", name: "Plateau tibétain", subtitle: "Plateau · Asie", lat: 32, lon: 88, value: "4 500 m", rank: 1, reachKm: 320, points: [[33, 82], [34, 88], [32, 88], [32, 94], [30, 90], [35, 92]] },
  { id: "deccan", name: "Deccan", subtitle: "Plateau · Asie", lat: 18, lon: 77, value: "600 m", rank: 1, reachKm: 320, points: [[20, 76], [18, 77], [15, 76], [17, 79]] },
  { id: "massif-central", name: "Massif central", subtitle: "Plateau · Europe", lat: 45.1, lon: 3, value: "1 886 m", rank: 1, reachKm: 90, points: [[45.7, 2.8], [45.1, 3], [44.5, 3.6]] },
  { id: "grandes-plaines", name: "Grandes Plaines", subtitle: "Plaine · Amérique du Nord", lat: 42, lon: -100, value: "600 m", rank: 1, reachKm: 320, points: [[48, -104], [44, -102], [40, -100], [36, -100]] },
  { id: "amazonie", name: "Amazonie", subtitle: "Plaine · Amérique du Sud", lat: -3, lon: -62, value: "100 m", rank: 1, reachKm: 480, points: [[-1, -68], [-3, -62], [-6, -65], [-8, -72]] },
  { id: "sahara", name: "Sahara", subtitle: "Désert · Afrique", lat: 23, lon: 8, value: "400 m", rank: 1, reachKm: 450, points: [[28, 8], [24, 0], [23, 8], [22, 15], [18, 5], [19, -5]] },
  { id: "gobi", name: "Gobi", subtitle: "Désert · Asie", lat: 43, lon: 105, value: "1 000 m", rank: 1, reachKm: 380, points: [[45, 100], [43, 105], [42, 110], [44, 95]] },
  { id: "congo", name: "Bassin du Congo", subtitle: "Bassin · Afrique", lat: 0, lon: 22, value: "400 m", rank: 1, reachKm: 420, points: [[2, 18], [0, 22], [-2, 20], [-3, 16]] },
];

export const SEAS: PointFeature[] = [
  { id: "mediterranee", name: "Méditerranée", subtitle: "Mer · Europe", lat: 36, lon: 18, value: "−1 500 m", rank: 2, reachKm: 220, points: [[36, -2], [38.2, 5], [39, 12.5], [35.8, 18], [34.5, 25], [34, 31], [36.2, 25.5]] },
  { id: "mer-noire", name: "Mer Noire", subtitle: "Mer · Europe", lat: 43.3, lon: 34, value: "−2 200 m", rank: 2, reachKm: 180, points: [[43.2, 30], [43.3, 34], [43.5, 37.5], [42.8, 38.5]] },
  { id: "mer-rouge", name: "Mer Rouge", subtitle: "Mer · Afrique", lat: 20, lon: 38.5, value: "−2 000 m", rank: 2, reachKm: 120, points: [[27, 34.2], [23.5, 36.5], [20, 38.5], [16.5, 40.8], [13.8, 42.6]] },
  { id: "mer-du-nord", name: "Mer du Nord", subtitle: "Mer · Europe", lat: 56, lon: 3.5, value: "−90 m", rank: 2, reachKm: 160, points: [[58, 2], [56, 3.5], [54.5, 4.5]] },
  { id: "baltique", name: "Baltique", subtitle: "Mer · Europe", lat: 58, lon: 20, value: "−200 m", rank: 2, reachKm: 150, points: [[60, 20], [58, 20], [56, 18], [55, 16]] },
  { id: "caraibes", name: "Caraïbes", subtitle: "Mer · Amérique", lat: 15, lon: -75, value: "−4 000 m", rank: 2, reachKm: 280, points: [[18, -80], [16, -76], [14, -72], [13, -68]] },
  { id: "golfe-mexique", name: "Golfe du Mexique", subtitle: "Golfe · Amérique", lat: 25, lon: -90, value: "−3 750 m", rank: 2, reachKm: 280, points: [[26, -93], [25, -90], [23.5, -87]] },
  { id: "golfe-guinee", name: "Golfe de Guinée", subtitle: "Golfe · Afrique", lat: 2, lon: 2, value: "−4 000 m", rank: 2, reachKm: 420, points: [[4, -2], [2, 2], [2, 6], [0, 1]] },
  { id: "mer-chine", name: "Mer de Chine méridionale", subtitle: "Mer · Asie", lat: 12, lon: 114, value: "−4 000 m", rank: 2, reachKm: 350, points: [[16, 115], [12, 114], [8, 111]] },
  { id: "mer-arabie", name: "Mer d'Arabie", subtitle: "Mer · Asie", lat: 15, lon: 64, value: "−4 000 m", rank: 2, reachKm: 350, points: [[18, 64], [14, 64], [10, 60]] },
  { id: "manche", name: "Manche", subtitle: "Mer · Europe", lat: 50.2, lon: -0.5, value: "−60 m", rank: 2, reachKm: 70, points: [[49.6, -2.2], [50.2, -0.5], [50.8, 1.2]] },
  { id: "adriatique", name: "Adriatique", subtitle: "Mer · Europe", lat: 42.5, lon: 16, value: "−250 m", rank: 2, reachKm: 90, points: [[44.8, 13.4], [42.8, 15.5], [41.2, 18.2]] },
  { id: "egee", name: "Égée", subtitle: "Mer · Europe", lat: 38, lon: 25.2, value: "−500 m", rank: 2, reachKm: 110, points: [[39.8, 24.5], [38, 25.2], [36.4, 26.2]] },
  { id: "caspienne", name: "Caspienne", subtitle: "Mer · Asie", lat: 42, lon: 50.5, value: "−1 000 m", rank: 2, reachKm: 180, points: [[45.5, 50], [42, 50.5], [39, 51]] },
  { id: "persique", name: "Persique", subtitle: "Golfe · Asie", lat: 26.5, lon: 51.5, value: "−50 m", rank: 2, reachKm: 140, points: [[28.5, 49.5], [26.5, 51.5], [24.5, 54]] },
  { id: "bengale", name: "Bengale", subtitle: "Golfe · Asie", lat: 15, lon: 88, value: "−2 600 m", rank: 2, reachKm: 380, points: [[20, 88], [15, 88], [10, 86]] },
  { id: "japon", name: "Japon", subtitle: "Mer · Asie", lat: 39, lon: 135, value: "−1 700 m", rank: 2, reachKm: 240, points: [[42, 136], [39, 135], [36, 134]] },
  { id: "bering", name: "Béring", subtitle: "Mer · Pacifique", lat: 58, lon: -178, value: "−1 500 m", rank: 2, reachKm: 320, points: [[60, -175], [57, -178], [55, 175]] },
  { id: "corail", name: "Corail", subtitle: "Mer · Pacifique", lat: -18, lon: 155, value: "−2 000 m", rank: 2, reachKm: 320, points: [[-14, 150], [-18, 155], [-22, 156]] },
  { id: "tasman", name: "Tasman", subtitle: "Mer · Pacifique", lat: -40, lon: 160, value: "−3 000 m", rank: 2, reachKm: 340, points: [[-34, 158], [-40, 160], [-46, 162]] },
  { id: "okhotsk", name: "Okhotsk", subtitle: "Mer · Pacifique", lat: 54, lon: 149, value: "−800 m", rank: 2, reachKm: 260, points: [[57, 148], [54, 149], [51, 150]] },
];

const OCEAN_REACH_KM = 6200;

export const OCEANS: PointFeature[] = [
  { id: "atlantique", name: "Atlantique", subtitle: "Océan", lat: 10, lon: -30, value: "−3 600 m", rank: 3, reachKm: OCEAN_REACH_KM, points: [[62, -30], [45, -35], [25, -40], [5, -30], [-15, -20], [-35, -15], [-50, -20]] },
  { id: "pacifique", name: "Pacifique", subtitle: "Océan", lat: 0, lon: -150, value: "−4 000 m", rank: 3, reachKm: OCEAN_REACH_KM, points: [[50, -160], [25, -150], [0, -140], [-25, -130], [-45, -140], [-40, 170], [-15, 165], [20, 160], [45, 170]] },
  { id: "indien", name: "Indien", subtitle: "Océan", lat: -15, lon: 75, value: "−3 700 m", rank: 3, reachKm: OCEAN_REACH_KM, points: [[15, 65], [-5, 75], [-25, 80], [-45, 75]] },
  { id: "arctique", name: "Arctique", subtitle: "Océan", lat: 85, lon: 0, value: "−1 200 m", rank: 3, reachKm: OCEAN_REACH_KM, points: [[82, 0], [82, 90], [82, 180], [82, -90]] },
  { id: "austral", name: "Austral", subtitle: "Océan", lat: -60, lon: 0, value: "−4 000 m", rank: 3, reachKm: OCEAN_REACH_KM, points: [[-58, 0], [-58, 90], [-58, 180], [-58, -90]] },
];

export const PEAKS: PointFeature[] = [
  { id: "mont-blanc", name: "Mont Blanc", subtitle: "Alpes · France / Italie", lat: 45.8326, lon: 6.8652, value: "4 810 m", rank: 1 },
  { id: "everest", name: "Everest", subtitle: "Himalaya · Népal / Chine", lat: 27.9881, lon: 86.925, value: "8 849 m", rank: 1 },
  { id: "kilimanjaro", name: "Kilimandjaro", subtitle: "Tanzanie", lat: -3.0674, lon: 37.3556, value: "5 895 m", rank: 1 },
  { id: "aconcagua", name: "Aconcagua", subtitle: "Andes · Argentine", lat: -32.6532, lon: -70.0109, value: "6 961 m", rank: 1 },
  { id: "denali", name: "Denali", subtitle: "Alaska", lat: 63.0692, lon: -151.007, value: "6 190 m", rank: 1 },
  { id: "elbrus", name: "Elbrouz", subtitle: "Caucase", lat: 43.355, lon: 42.4392, value: "5 642 m", rank: 1 },
  { id: "fuji", name: "Fuji", subtitle: "Japon", lat: 35.3606, lon: 138.7274, value: "3 776 m", rank: 2 },
];

function asLines(items: { id: string; name: string; subtitle: string; value: string; points: number[][] }[]): LineFeature[] {
  return items.map((item) => ({
    ...item,
    points: item.points as [number, number][],
  }));
}

const COUNTRY_NAMES = WORLD_COUNTRIES
  .map((country) => ({ id: country.id, name: countryRecord(country.id, country.name).name.toLocaleLowerCase("fr") }))
  .sort((a, b) => b.name.length - a.name.length);

function countryIdFromSubtitle(subtitle: string) {
  const text = subtitle.trim().toLocaleLowerCase("fr");
  return COUNTRY_NAMES.find((item) => text === item.name || text.startsWith(`${item.name} ·`) || text.startsWith(`${item.name} `))?.id;
}

const curatedNames = new Set(CURATED_CITIES.map((city) => city.name.toLocaleLowerCase("fr")));

export const CITIES: PointFeature[] = [
  ...CURATED_CITIES.map((city) => ({ ...city, countryId: countryIdFromSubtitle(city.subtitle) })),
  ...WORLD_COUNTRIES.filter((country) => {
    if (!country.capital || curatedNames.has(country.capital.toLocaleLowerCase("fr"))) return false;
    return !CURATED_CITIES.some((city) => Math.abs(city.lat - country.capitalLat) < 0.8 && Math.abs(city.lon - country.capitalLon) < 0.8);
  }).map((country) => ({
    id: `capital-${country.iso2.toLowerCase() || country.id}`,
    name: country.capital,
    subtitle: country.name,
    lat: country.capitalLat,
    lon: country.capitalLon,
    value: "",
    capital: true,
    rank: 3,
    countryId: country.id,
  })),
];

export function cityHeadline(city: PointFeature) {
  if (city.value) return { primaryLabel: "Population", primaryValue: city.value };
  return { primaryLabel: "Capitale", primaryValue: "Capitale" };
}

const POINT_PLACES = [...CITIES, ...PEAKS];
const POINT_REACH_KM = 40;

const CORRIDORS = [...RELIEF, ...SEAS, ...OCEANS].map((place) => ({
  place,
  reachKm: place.reachKm ?? POINT_REACH_KM,
  axis: densify(place.points?.length ? place.points : [[place.lat, place.lon]], Math.max(30, Math.min(400, (place.reachKm ?? POINT_REACH_KM) * 0.5))),
}));

function corridorFits(place: PointFeature, altitude: number) {
  const kind = place.subtitle.split("·")[0]?.trim() ?? "";
  if (kind === "Chaîne") return altitude >= 800;
  if (kind === "Fosse") return altitude < -1000;
  if (kind === "Océan" || kind === "Mer" || kind === "Golfe") return altitude < 0;
  return true;
}

export function nearestNamedPlace(lat: number, lon: number, altitude: number) {
  let best: PointFeature | null = null;
  let bestKm = POINT_REACH_KM;
  for (const place of POINT_PLACES) {
    const km = distanceKm(lat, lon, place.lat, place.lon);
    if (km < bestKm) {
      best = place;
      bestKm = km;
    }
  }
  if (best) return best;

  const lake = lakeAt(lat, lon);
  if (lake) return lake;

  const river = riverAt(lat, lon);
  if (river) return river;

  let region: PointFeature | null = null;
  let regionReach = Infinity;
  let regionKm = Infinity;
  for (const relief of CORRIDORS) {
    if (!corridorFits(relief.place, altitude)) continue;
    let km = Infinity;
    for (const [placeLat, placeLon] of relief.axis) {
      const distance = distanceKm(lat, lon, placeLat, placeLon);
      if (distance < km) km = distance;
    }
    if (km >= relief.reachKm) continue;
    if (relief.reachKm < regionReach || (relief.reachKm === regionReach && km < regionKm)) {
      region = relief.place;
      regionReach = relief.reachKm;
      regionKm = km;
    }
  }
  return region;
}

export const RIVERS: LineFeature[] = asLines(hydro.rivers);
export const LAKES: LineFeature[] = asLines(hydro.lakes);

const LAKE_RINGS = LAKES.map((lake) => ({
  place: {
    id: lake.id,
    name: lake.name,
    subtitle: lake.subtitle.startsWith("Lac") ? lake.subtitle : `Lac · ${lake.subtitle}`,
    lat: lake.points.reduce((sum, point) => sum + point[1], 0) / (lake.points.length || 1),
    lon: lake.points.reduce((sum, point) => sum + point[0], 0) / (lake.points.length || 1),
    value: lake.value,
    rank: 2,
  } satisfies PointFeature,
  ring: lake.points,
  area: ringArea(lake.points),
}));

function ringArea(ring: [number, number][]) {
  let sum = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [lon, lat] = ring[index];
    const [previousLon, previousLat] = ring[previous];
    sum += (previousLon - lon) * (lat + previousLat);
  }
  return Math.abs(sum);
}

function ringContains(ring: [number, number][], lon: number, lat: number) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [lonI, latI] = ring[index];
    const [lonJ, latJ] = ring[previous];
    if ((latI > lat) === (latJ > lat)) continue;
    const cross = ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI;
    if (lon < cross) inside = !inside;
  }
  return inside;
}

export function interiorPoint(ring: [number, number][]) {
  let lon = 0;
  let lat = 0;
  for (const point of ring) {
    lon += point[0];
    lat += point[1];
  }
  const count = ring.length || 1;
  lon /= count;
  lat /= count;
  if (ringContains(ring, lon, lat)) return { lon, lat };
  for (let index = 1; index < ring.length; index += 1) {
    const midLon = (ring[index - 1][0] + ring[index][0]) / 2;
    const midLat = (ring[index - 1][1] + ring[index][1]) / 2;
    for (const step of [0.25, 0.5, 0.75]) {
      const probeLon = midLon + (lon - midLon) * step;
      const probeLat = midLat + (lat - midLat) * step;
      if (ringContains(ring, probeLon, probeLat)) return { lon: probeLon, lat: probeLat };
    }
  }
  return { lon, lat };
}

function lakeAt(lat: number, lon: number) {
  let best: PointFeature | null = null;
  let bestArea = Infinity;
  for (const lake of LAKE_RINGS) {
    if (lake.area >= bestArea || !ringContains(lake.ring, lon, lat)) continue;
    best = lake.place;
    bestArea = lake.area;
  }
  return best;
}

const RIVER_REACH_KM = 25;

const RIVER_COURSES = RIVERS.map((river) => ({
  place: {
    id: river.id,
    name: river.name,
    subtitle: river.subtitle.startsWith("Cours d'eau") ? river.subtitle : `Cours d'eau · ${river.subtitle}`,
    lat: river.points.reduce((sum, point) => sum + point[1], 0) / (river.points.length || 1),
    lon: river.points.reduce((sum, point) => sum + point[0], 0) / (river.points.length || 1),
    value: river.value,
    rank: 2,
  } satisfies PointFeature,
  points: river.points,
}));

function distanceToSegmentKm(lat: number, lon: number, lat1: number, lon1: number, lat2: number, lon2: number) {
  const fromStart = distanceKm(lat, lon, lat1, lon1);
  const fromEnd = distanceKm(lat, lon, lat2, lon2);
  const span = distanceKm(lat1, lon1, lat2, lon2);
  if (span < 0.001) return fromStart;
  const along = (fromStart * fromStart + span * span - fromEnd * fromEnd) / (2 * span);
  if (along <= 0) return fromStart;
  if (along >= span) return fromEnd;
  const cross = fromStart * fromStart - along * along;
  return cross <= 0 ? 0 : Math.sqrt(cross);
}

function courseKm(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

function riverAt(lat: number, lon: number) {
  let best: PointFeature | null = null;
  let bestKm = Infinity;
  let bestLength = -1;
  for (const river of RIVER_COURSES) {
    let km = Infinity;
    const points = river.points;
    for (let index = 1; index < points.length; index += 1) {
      const distance = distanceToSegmentKm(lat, lon, points[index - 1][1], points[index - 1][0], points[index][1], points[index][0]);
      if (distance < km) km = distance;
    }
    if (km >= RIVER_REACH_KM) continue;
    const length = courseKm(river.place.value);
    if (length > bestLength || (length === bestLength && km < bestKm)) {
      best = river.place;
      bestLength = length;
      bestKm = km;
    }
  }
  return best;
}
