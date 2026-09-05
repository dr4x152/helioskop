/**
 * Katalog ciał Układu Słonecznego — typy i dane źródłowe Helioskopu.
 * Odległości (au) i okresy są katalogowe; pozycje w scenie liczy
 * schematyczny Kepler (src/lib/kepler.ts), nie VSOP87.
 *
 * Fakty po polsku pochodzą z oryginalnej aplikacji grok.me,
 * uzupełnione o spójne etykiety UI.
 */

/** Rodzaj ciała — steruje etykietą w panelu i stylem chipa. */
export type BodyKind = "star" | "planet" | "dwarf" | "moon";

/** Miękka otoczka atmosferyczna (półprzezroczysta sfera). */
export interface AtmosphereDef {
  color: string;
  /** Mnożnik promienia względem ciała. */
  scale: number;
  opacity: number;
}

/** Pierścienie Saturna / Urana — w jednostkach promienia planety. */
export interface RingsDef {
  inner: number;
  outer: number;
  opacity: number;
  color: string;
}

/** Ciało główne (Słońce, planeta, planeta karłowata). */
export interface BodyDef {
  id: string;
  name: string;
  nameLat: string;
  kind: BodyKind;
  /** Promień w jednostkach sceny (powiększony jak w oryginale). */
  radius: number;
  color: string;
  /** Ścieżka tekstury albo null = fallback proceduralny / kolor. */
  texture: string | null;
  clouds?: string;
  roughness: number;
  metalness: number;
  emissive?: string;
  periodDays: number;
  diameterKm: number;
  /** Ujemne = obrót wsteczny. */
  dayHours: number;
  au: number;
  /** Mimośród orbity — schematyczny, dla czytelnej elipsy. */
  eccentricity: number;
  /** Długość średnia w epoce J2000 [deg] — start „dzisiejszej” pozycji. */
  meanLongitudeJ2000: number;
  /** Ruch średni [deg / dzień] przy J2000. */
  meanMotionDegPerDay: number;
  moonCount: number;
  inclinationDeg: number;
  fact: string;
  atmosphere?: AtmosphereDef;
  rings?: RingsDef;
}

/**
 * Ciała w kolejności od Słońca. Promienie i kolory jak w live app.
 * Jupiter i Pluton: texture = null (pasma / plamy z canvasu).
 */
export const BODIES: BodyDef[] = [
  {
    id: "sun",
    name: "Słońce",
    nameLat: "Sol",
    kind: "star",
    radius: 2.55,
    color: "#f3c56b",
    texture: "/textures/2k_sun.jpg",
    roughness: 1,
    metalness: 0,
    emissive: "#ffb347",
    periodDays: 25.38,
    diameterKm: 1_392_700,
    dayHours: 609.12,
    au: 0,
    eccentricity: 0,
    meanLongitudeJ2000: 0,
    meanMotionDegPerDay: 0,
    moonCount: 0,
    inclinationDeg: 7.25,
    fact: "Gwiazda ciągu głównego. Ponad 99,8% masy Układu Słonecznego.",
  },
  {
    id: "mercury",
    name: "Merkury",
    nameLat: "Mercury",
    kind: "planet",
    radius: 0.16,
    color: "#9a9086",
    texture: "/textures/2k_mercury.jpg",
    roughness: 0.92,
    metalness: 0.08,
    periodDays: 87.969,
    diameterKm: 4879,
    dayHours: 1407.6,
    au: 0.387,
    eccentricity: 0.2056,
    meanLongitudeJ2000: 252.251,
    meanMotionDegPerDay: 4.092317,
    moonCount: 0,
    inclinationDeg: 7,
    fact: "Najbliżej Słońca. Doba trwa dłużej niż rok.",
  },
  {
    id: "venus",
    name: "Wenus",
    nameLat: "Venus",
    kind: "planet",
    radius: 0.28,
    color: "#c9b089",
    texture: "/textures/2k_venus_surface.jpg",
    roughness: 0.7,
    metalness: 0.04,
    atmosphere: { color: "#ead7a8", scale: 1.045, opacity: 0.22 },
    periodDays: 224.701,
    diameterKm: 12_104,
    dayHours: -5832.5,
    au: 0.723,
    eccentricity: 0.0068,
    meanLongitudeJ2000: 181.98,
    meanMotionDegPerDay: 1.60213,
    moonCount: 0,
    inclinationDeg: 3.39,
    fact: "Obraca się wstecznie. Gęsta atmosfera zakrywa powierzchnię.",
  },
  {
    id: "earth",
    name: "Ziemia",
    nameLat: "Earth",
    kind: "planet",
    radius: 0.3,
    color: "#4d7cae",
    texture: "/textures/2k_earth_daymap.jpg",
    clouds: "/textures/2k_earth_clouds.jpg",
    roughness: 0.55,
    metalness: 0.12,
    atmosphere: { color: "#7eb6ff", scale: 1.038, opacity: 0.18 },
    periodDays: 365.256,
    diameterKm: 12_742,
    dayHours: 23.93,
    au: 1,
    eccentricity: 0.0167,
    meanLongitudeJ2000: 100.464,
    meanMotionDegPerDay: 0.985609,
    moonCount: 1,
    inclinationDeg: 0,
    fact: "Jedyna znana planeta z ciekłą wodą na powierzchni.",
  },
  {
    id: "mars",
    name: "Mars",
    nameLat: "Mars",
    kind: "planet",
    radius: 0.2,
    color: "#b45a3c",
    texture: "/textures/2k_mars.jpg",
    roughness: 0.88,
    metalness: 0.04,
    atmosphere: { color: "#d48a6a", scale: 1.03, opacity: 0.08 },
    periodDays: 686.98,
    diameterKm: 6779,
    dayHours: 24.62,
    au: 1.524,
    eccentricity: 0.0934,
    meanLongitudeJ2000: 355.453,
    meanMotionDegPerDay: 0.524033,
    moonCount: 2,
    inclinationDeg: 1.85,
    fact: "Dwa małe księżyce: Fobos i Deimos — prawdopodobnie schwytane asteroidy.",
  },
  {
    id: "jupiter",
    name: "Jowisz",
    nameLat: "Jupiter",
    kind: "planet",
    radius: 1.12,
    color: "#d7c09a",
    texture: null,
    roughness: 0.62,
    metalness: 0.02,
    atmosphere: { color: "#e6d2b0", scale: 1.028, opacity: 0.12 },
    periodDays: 4332.589,
    diameterKm: 139_820,
    dayHours: 9.93,
    au: 5.203,
    eccentricity: 0.0484,
    meanLongitudeJ2000: 34.404,
    meanMotionDegPerDay: 0.083085,
    moonCount: 95,
    inclinationDeg: 1.3,
    fact: "Największa planeta. Cztery księżyce galileuszowe widać po przybliżeniu.",
  },
  {
    id: "saturn",
    name: "Saturn",
    nameLat: "Saturn",
    kind: "planet",
    radius: 0.95,
    color: "#e4d2a8",
    texture: "/textures/2k_saturn.jpg",
    roughness: 0.58,
    metalness: 0.04,
    atmosphere: { color: "#efe0bc", scale: 1.03, opacity: 0.1 },
    rings: { inner: 1.35, outer: 2.35, opacity: 0.85, color: "#d8c9a4" },
    periodDays: 10759.22,
    diameterKm: 116_460,
    dayHours: 10.66,
    au: 9.537,
    eccentricity: 0.0539,
    meanLongitudeJ2000: 49.944,
    meanMotionDegPerDay: 0.03346,
    moonCount: 146,
    inclinationDeg: 2.49,
    fact: "Pierścienie to lód i pył. Tytan ma gęstą atmosferę azotową.",
  },
  {
    id: "uranus",
    name: "Uran",
    nameLat: "Uranus",
    kind: "planet",
    radius: 0.52,
    color: "#9fd4d2",
    texture: "/textures/2k_uranus.jpg",
    roughness: 0.5,
    metalness: 0.08,
    atmosphere: { color: "#b7e4e2", scale: 1.032, opacity: 0.14 },
    rings: { inner: 1.4, outer: 1.85, opacity: 0.22, color: "#c5d4d8" },
    periodDays: 30688.5,
    diameterKm: 50_724,
    dayHours: -17.24,
    au: 19.191,
    eccentricity: 0.0472,
    meanLongitudeJ2000: 313.232,
    meanMotionDegPerDay: 0.01173,
    moonCount: 28,
    inclinationDeg: 0.77,
    fact: "Oś obrotu nachylona o 98° — toczy się niemal na boku.",
  },
  {
    id: "neptune",
    name: "Neptun",
    nameLat: "Neptune",
    kind: "planet",
    radius: 0.5,
    color: "#3f74c8",
    texture: "/textures/2k_neptune.jpg",
    roughness: 0.48,
    metalness: 0.1,
    atmosphere: { color: "#6ea0e6", scale: 1.032, opacity: 0.16 },
    periodDays: 60182,
    diameterKm: 49_244,
    dayHours: 16.11,
    au: 30.07,
    eccentricity: 0.0086,
    meanLongitudeJ2000: 304.88,
    meanMotionDegPerDay: 0.005981,
    moonCount: 16,
    inclinationDeg: 1.77,
    fact: "Tryton krąży wstecznie — najpewniej schwytany obiekt pasa Kuipera.",
  },
  {
    id: "pluto",
    name: "Pluton",
    nameLat: "Pluto",
    kind: "dwarf",
    radius: 0.13,
    color: "#cbb39a",
    texture: null,
    roughness: 0.86,
    metalness: 0.06,
    periodDays: 90560,
    diameterKm: 2377,
    dayHours: -153.3,
    au: 39.48,
    eccentricity: 0.2488,
    meanLongitudeJ2000: 238.929,
    meanMotionDegPerDay: 0.003975,
    moonCount: 5,
    inclinationDeg: 17.16,
    fact: "Planeta karłowata od 2006 r. Orbita nachylona o 17° i wyraźnie eliptyczna. Charon jest tak duży, że układ jest niemal podwójny.",
  },
];

export const BODY_BY_ID: Record<string, BodyDef> = Object.fromEntries(
  BODIES.map((body) => [body.id, body]),
);

/** Planety + Pluton (bez Słońca) — orbity i lista efemeryd. */
export const ORBITING_BODIES = BODIES.filter((body) => body.id !== "sun");

export function kindLabel(kind: BodyKind): string {
  switch (kind) {
    case "star":
      return "Gwiazda";
    case "planet":
      return "Planeta";
    case "dwarf":
      return "Planeta karłowata";
    case "moon":
      return "Księżyc";
  }
}
