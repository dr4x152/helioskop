/**
 * Księżyce widoczne w Helioskopie.
 * Promienie i orbitRadius są schematyczne (czytelne przy zbliżeniu),
 * okresy synodyczne — katalogowe. Tryton: ruch wsteczny.
 */

export interface MoonDef {
  id: string;
  name: string;
  nameLat: string;
  parent: string;
  radius: number;
  /** Promień orbity wokół rodzica (jednostki sceny). */
  orbitRadius: number;
  periodDays: number;
  color: string;
  texture?: string;
  diameterKm: number;
  retrograde?: boolean;
}

export const MOONS: MoonDef[] = [
  {
    id: "moon",
    name: "Księżyc",
    nameLat: "Luna",
    parent: "earth",
    radius: 0.082,
    orbitRadius: 1.22,
    periodDays: 27.322,
    color: "#b0b0b0",
    texture: "/textures/2k_moon.jpg",
    diameterKm: 3474,
  },
  {
    id: "phobos",
    name: "Fobos",
    nameLat: "Phobos",
    parent: "mars",
    radius: 0.028,
    orbitRadius: 0.48,
    periodDays: 0.3189,
    color: "#8a7a70",
    diameterKm: 22,
  },
  {
    id: "deimos",
    name: "Deimos",
    nameLat: "Deimos",
    parent: "mars",
    radius: 0.02,
    orbitRadius: 0.78,
    periodDays: 1.263,
    color: "#9a8b7c",
    diameterKm: 12,
  },
  {
    id: "io",
    name: "Io",
    nameLat: "Io",
    parent: "jupiter",
    radius: 0.09,
    orbitRadius: 2.55,
    periodDays: 1.769,
    color: "#e6d36a",
    diameterKm: 3643,
  },
  {
    id: "europa",
    name: "Europa",
    nameLat: "Europa",
    parent: "jupiter",
    radius: 0.078,
    orbitRadius: 3.35,
    periodDays: 3.551,
    color: "#d8cbb0",
    diameterKm: 3122,
  },
  {
    id: "ganymede",
    name: "Ganimedes",
    nameLat: "Ganymede",
    parent: "jupiter",
    radius: 0.105,
    orbitRadius: 4.35,
    periodDays: 7.155,
    color: "#b9b0a4",
    diameterKm: 5268,
  },
  {
    id: "callisto",
    name: "Kallisto",
    nameLat: "Callisto",
    parent: "jupiter",
    radius: 0.095,
    orbitRadius: 5.55,
    periodDays: 16.689,
    color: "#7d7368",
    diameterKm: 4821,
  },
  {
    id: "mimas",
    name: "Mimas",
    nameLat: "Mimas",
    parent: "saturn",
    radius: 0.028,
    orbitRadius: 2.55,
    periodDays: 0.942,
    color: "#cfc9c0",
    diameterKm: 396,
  },
  {
    id: "enceladus",
    name: "Enceladus",
    nameLat: "Enceladus",
    parent: "saturn",
    radius: 0.032,
    orbitRadius: 2.95,
    periodDays: 1.37,
    color: "#e8eef2",
    diameterKm: 504,
  },
  {
    id: "dione",
    name: "Dione",
    nameLat: "Dione",
    parent: "saturn",
    radius: 0.036,
    orbitRadius: 3.45,
    periodDays: 2.737,
    color: "#d4d0c8",
    diameterKm: 1123,
  },
  {
    id: "rhea",
    name: "Rea",
    nameLat: "Rhea",
    parent: "saturn",
    radius: 0.042,
    orbitRadius: 4.05,
    periodDays: 4.518,
    color: "#cfc8bc",
    diameterKm: 1528,
  },
  {
    id: "titan",
    name: "Tytan",
    nameLat: "Titan",
    parent: "saturn",
    radius: 0.11,
    orbitRadius: 5.15,
    periodDays: 15.945,
    color: "#c4a066",
    diameterKm: 5149,
  },
  {
    id: "ariel",
    name: "Ariel",
    nameLat: "Ariel",
    parent: "uranus",
    radius: 0.034,
    orbitRadius: 1.35,
    periodDays: 2.52,
    color: "#c5d0d4",
    diameterKm: 1158,
  },
  {
    id: "umbriel",
    name: "Umbriel",
    nameLat: "Umbriel",
    parent: "uranus",
    radius: 0.034,
    orbitRadius: 1.7,
    periodDays: 4.144,
    color: "#6f6a68",
    diameterKm: 1169,
  },
  {
    id: "titania",
    name: "Tytania",
    nameLat: "Titania",
    parent: "uranus",
    radius: 0.044,
    orbitRadius: 2.15,
    periodDays: 8.706,
    color: "#b7c2c6",
    diameterKm: 1578,
  },
  {
    id: "oberon",
    name: "Oberon",
    nameLat: "Oberon",
    parent: "uranus",
    radius: 0.042,
    orbitRadius: 2.65,
    periodDays: 13.463,
    color: "#9aa3a8",
    diameterKm: 1523,
  },
  {
    id: "triton",
    name: "Tryton",
    nameLat: "Triton",
    parent: "neptune",
    radius: 0.07,
    orbitRadius: 1.55,
    periodDays: 5.877,
    color: "#c8d2d6",
    retrograde: true,
    diameterKm: 2707,
  },
  {
    id: "charon",
    name: "Charon",
    nameLat: "Charon",
    parent: "pluto",
    radius: 0.068,
    orbitRadius: 0.48,
    periodDays: 6.387,
    color: "#b7a090",
    diameterKm: 1212,
  },
];

export const MOON_BY_ID: Record<string, MoonDef> = Object.fromEntries(
  MOONS.map((moon) => [moon.id, moon]),
);

/** Księżyce pogrupowane po id rodzica — O(1) przy renderze. */
export const MOONS_BY_PARENT: Record<string, MoonDef[]> = {};
for (const moon of MOONS) {
  (MOONS_BY_PARENT[moon.parent] ??= []).push(moon);
}

/** Większe księżyce dostają proceduralną „skórkę”, gdy brak tekstury. */
export const DETAILED_MOONS = new Set([
  "titan",
  "io",
  "europa",
  "ganymede",
  "callisto",
  "charon",
  "triton",
]);
