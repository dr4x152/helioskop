/**
 * Kosmos lokalny — pozycje SCHEMATYCZNE, dobrane tak, by Grupa Lokalna
 * mieściła się w jednym kadrze (poprzedni rozstaw chował M31/M33 poza FOV).
 */

export interface GalaxyDef {
  id: string;
  name: string;
  nameLat: string;
  position: [number, number, number];
  /** Promień dysku w jednostkach sceny. */
  radius: number;
  tilt: number;
  color: string;
  fact: string;
}

export const GALAXIES: GalaxyDef[] = [
  {
    id: "milkyway",
    name: "Droga Mleczna",
    nameLat: "Milky Way",
    position: [0, 0, 0],
    radius: 72,
    tilt: 0.52,
    color: "#dce6f8",
    fact: "Nasza galaktyka spiralna z poprzeczką. Słońce leży na obrzeżu ramienia Oriona.",
  },
  {
    id: "andromeda",
    name: "Andromeda",
    nameLat: "M31",
    position: [-195, 22, 75],
    radius: 88,
    tilt: -0.32,
    color: "#f0d8b0",
    fact: "Najbliższa wielka spiralna. Za ~4,5 mld lat zderzy się z Drogą Mleczną.",
  },
  {
    id: "triangulum",
    name: "Trójkąt",
    nameLat: "M33",
    position: [-118, -10, 138],
    radius: 34,
    tilt: 0.85,
    color: "#c8d8ec",
    fact: "Trzecia spiralna Grupy Lokalnej. Tu pokazujemy ją wyraźnie, nie jako plamkę.",
  },
];

export const GALAXY_BY_ID: Record<string, GalaxyDef> = Object.fromEntries(
  GALAXIES.map((g) => [g.id, g]),
);

/** Sgr A* — znacznik w centrum Drogi Mlecznej. */
export const SGR_A = {
  id: "sgr-a",
  name: "Sagittarius A*",
  nameLat: "Sgr A*",
  position: [2.2, 0.4, -1.4] as [number, number, number],
  fact: "Supermasywna czarna dziura w jądrze Drogi Mlecznej (~4 mln mas Słońca). Widok dysku akrecyjnego jest stylizowany.",
};

/** Przykładowy układ planetarny w galaktyce — nie N-body, tylko pinezki. */
export interface ProxySystem {
  id: string;
  galaxyId: string;
  name: string;
  nameLat: string;
  /** Offset od środka galaktyki. */
  offset: [number, number, number];
  starColor: string;
  planets: { name: string; color: string; radius: number }[];
  fact: string;
  /** Klik wraca do prawdziwego Układu Słonecznego. */
  isHome?: boolean;
}

export const PROXY_SYSTEMS: ProxySystem[] = [
  {
    id: "solar-home",
    galaxyId: "milkyway",
    name: "Układ Słoneczny",
    nameLat: "Sol",
    offset: [28, 2.4, 8],
    starColor: "#f3c56b",
    planets: [
      { name: "Ziemia", color: "#6ea8d6", radius: 0.9 },
      { name: "Jowisz", color: "#c9a36a", radius: 1.6 },
    ],
    fact: "Nasz układ — kliknięcie przenosi do skali planet.",
    isHome: true,
  },
  {
    id: "mw-orion",
    galaxyId: "milkyway",
    name: "Wzorzec Oriona",
    nameLat: "Orion Arm analog",
    offset: [42, -2, -16],
    starColor: "#ffe8b0",
    planets: [
      { name: "Aura", color: "#7ec8c0", radius: 0.85 },
      { name: "Kres", color: "#c47850", radius: 1.25 },
    ],
    fact: "Schematyczny układ w ramieniu Oriona. Nie jest to katalogowy system.",
  },
  {
    id: "mw-perseus",
    galaxyId: "milkyway",
    name: "Wzorzec Perseusza",
    nameLat: "Perseus Arm analog",
    offset: [-30, 3.5, 20],
    starColor: "#ffb080",
    planets: [
      { name: "Iskra", color: "#d0d8e8", radius: 0.7 },
      { name: "Żwir", color: "#9a7a58", radius: 1.1 },
    ],
    fact: "Przykładowy układ w ramieniu Perseusza — ilustracja, nie Gaia DR3.",
  },
  {
    id: "m31-alpha",
    galaxyId: "andromeda",
    name: "Andromeda α",
    nameLat: "M31-α",
    offset: [32, 5, -14],
    starColor: "#ffd0a0",
    planets: [
      { name: "Mir", color: "#6aa8c8", radius: 0.8 },
      { name: "Wata", color: "#d4a070", radius: 1.35 },
    ],
    fact: "Fikcyjny układ w M31. Andromeda ma miliardy gwiazd — tu jedna pinezka.",
  },
  {
    id: "m31-beta",
    galaxyId: "andromeda",
    name: "Andromeda β",
    nameLat: "M31-β",
    offset: [-28, -3, 22],
    starColor: "#c8e0ff",
    planets: [
      { name: "Lumen", color: "#b8d0e8", radius: 0.75 },
      { name: "Cis", color: "#8a6a4a", radius: 1.15 },
    ],
    fact: "Drugi wzorzec w M31. Kliknij, żeby podlecieć do mini-układu.",
  },
  {
    id: "m33-alpha",
    galaxyId: "triangulum",
    name: "Trójkąt α",
    nameLat: "M33-α",
    offset: [11, 2, 7],
    starColor: "#fff0d0",
    planets: [
      { name: "Rosa", color: "#e8a0b0", radius: 0.7 },
      { name: "Igła", color: "#88b8d0", radius: 1.05 },
    ],
    fact: "Jedyny pokazowy układ w M33. Galaktyka jest mniejsza — pinezek też mniej.",
  },
];

export const PROXY_BY_ID: Record<string, ProxySystem> = Object.fromEntries(
  PROXY_SYSTEMS.map((s) => [s.id, s]),
);

export function systemsForGalaxy(galaxyId: string): ProxySystem[] {
  return PROXY_SYSTEMS.filter((s) => s.galaxyId === galaxyId);
}

export function proxyWorld(sys: ProxySystem): [number, number, number] {
  const g = GALAXY_BY_ID[sys.galaxyId];
  if (!g) return sys.offset;
  return [g.position[0] + sys.offset[0], g.position[1] + sys.offset[1], g.position[2] + sys.offset[2]];
}

/** Kadr Grupy Lokalnej — wszystkie trzy galaktyki w FOV. */
export const LOCAL_GROUP_CAMERA = { x: 28, y: 168, z: 268 } as const;
export const LOCAL_GROUP_TARGET = { x: -92, y: 6, z: 58 } as const;

/** Zbliżenie na uniesiony dysk (kamera nad płaszczyzną). */
export function galaxyFocusCamera(g: GalaxyDef): { cam: [number, number, number]; target: [number, number, number] } {
  const d = g.radius * 2.15;
  return {
    cam: [g.position[0] + d * 0.55, g.position[1] + g.radius * 1.05, g.position[2] + d],
    target: [...g.position],
  };
}

export const BLACKHOLE_CAMERA = { x: 12, y: 7, z: 18 } as const;
/** Alias wsteczny — przegląd grupy, nie tylko MW. */
export const GALAXY_CAMERA = LOCAL_GROUP_CAMERA;

/** Kompatybilność: stara pinezka = nasz układ. */
export const SOLAR_PIN = proxyWorld(PROXY_SYSTEMS[0]);
