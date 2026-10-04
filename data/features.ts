export interface PointFeature {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lon: number;
  value: string;
  capital?: boolean;
  rank: number;
}

export interface LineFeature {
  id: string;
  name: string;
  subtitle: string;
  value: string;
  points: [number, number][];
}

export const CITIES: PointFeature[] = [
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

export const PEAKS: PointFeature[] = [
  { id: "mont-blanc", name: "Mont Blanc", subtitle: "Alpes · France / Italie", lat: 45.8326, lon: 6.8652, value: "4 810 m", rank: 1 },
  { id: "everest", name: "Everest", subtitle: "Himalaya · Népal / Chine", lat: 27.9881, lon: 86.925, value: "8 849 m", rank: 1 },
  { id: "kilimanjaro", name: "Kilimandjaro", subtitle: "Tanzanie", lat: -3.0674, lon: 37.3556, value: "5 895 m", rank: 1 },
  { id: "aconcagua", name: "Aconcagua", subtitle: "Andes · Argentine", lat: -32.6532, lon: -70.0109, value: "6 961 m", rank: 1 },
  { id: "denali", name: "Denali", subtitle: "Alaska", lat: 63.0692, lon: -151.007, value: "6 190 m", rank: 1 },
  { id: "elbrus", name: "Elbrouz", subtitle: "Caucase", lat: 43.355, lon: 42.4392, value: "5 642 m", rank: 1 },
  { id: "fuji", name: "Fuji", subtitle: "Japon", lat: 35.3606, lon: 138.7274, value: "3 776 m", rank: 2 },
];

export const RIVERS: LineFeature[] = [
  { id: "amazone", name: "Amazone", subtitle: "Amazonie", value: "6 400 km", points: [[-73.5, -4.4], [-70, -4], [-65, -3.5], [-60, -3.1], [-55, -2.2], [-51.5, -0.5]] },
  { id: "nil", name: "Nil", subtitle: "Afrique", value: "6 650 km", points: [[32.5, 3.5], [32.2, 9], [33, 15.6], [32.5, 20], [31.2, 25.5], [31.2, 30.0]] },
  { id: "yangtze", name: "Yangtsé", subtitle: "Chine", value: "6 300 km", points: [[91, 33], [100, 30], [106, 29.5], [112, 30.5], [118, 32], [121.5, 31.5]] },
  { id: "mississippi", name: "Mississippi", subtitle: "États-Unis", value: "3 730 km", points: [[-95, 47], [-94, 45], [-93, 41], [-91, 38], [-90.2, 35], [-90.1, 32], [-89.3, 29.2]] },
  { id: "danube", name: "Danube", subtitle: "Europe", value: "2 850 km", points: [[8.2, 47.9], [11.6, 48.2], [16.4, 48.2], [19, 47.5], [21.2, 45.2], [25, 44.2], [28.8, 45.2]] },
];

export const LAKES: LineFeature[] = [
  { id: "caspienne", name: "Caspienne", subtitle: "Asie", value: "371 000 km²", points: [[50.5, 46.5], [54, 46], [53, 41], [49, 37.5], [48.5, 40], [47, 45], [50.5, 46.5]] },
  { id: "victoria", name: "Victoria", subtitle: "Afrique", value: "68 800 km²", points: [[31.8, -0.2], [33.5, -0.5], [34, -1.5], [32.8, -2.4], [31.7, -1.5], [31.8, -0.2]] },
  { id: "superieur", name: "Supérieur", subtitle: "Amérique du Nord", value: "82 100 km²", points: [[-92, 46.6], [-88, 47.5], [-84.5, 46.8], [-85, 46.5], [-90, 46.5], [-92, 46.6]] },
  { id: "baikal", name: "Baïkal", subtitle: "Russie", value: "31 700 km²", points: [[108.5, 55.5], [109.5, 54], [109, 52], [107, 51.7], [104, 52.5], [105.5, 54.5], [108.5, 55.5]] },
];
