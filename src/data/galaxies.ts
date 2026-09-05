/**
 * Kosmos lokalny — pozycje schematyczne (nie w skali parseków).
 * Jednostki sceny są dobrane tak, by Droga Mleczna, M31 i M33
 * mieściły się w jednym kadrze po skoku skali.
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
    radius: 240,
    tilt: 0.55,
    color: "#c8d4e8",
    fact: "Nasza galaktyka spiralna z poprzeczką. Słońce leży na obrzeżu ramienia Oriona.",
  },
  {
    id: "andromeda",
    name: "Andromeda",
    nameLat: "M31",
    position: [-640, 70, 260],
    radius: 260,
    tilt: -0.35,
    color: "#d4c4a8",
    fact: "Najbliższa wielka spiralna. Za ~4,5 mld lat zderzy się z Drogą Mleczną.",
  },
  {
    id: "triangulum",
    name: "Trójkąt",
    nameLat: "M33",
    position: [-390, -40, 430],
    radius: 78,
    tilt: 0.9,
    color: "#b8c8d8",
    fact: "Trzecia spiralna Grupy Lokalnej. Widoczna jako rozmyta plamka na ciemnym niebie.",
  },
];

/** Sgr A* — znacznik w centrum Drogi Mlecznej. */
export const SGR_A = {
  id: "sgr-a",
  name: "Sagittarius A*",
  nameLat: "Sgr A*",
  position: [6, 0, -4] as [number, number, number],
  fact: "Supermasywna czarna dziura w jądrze Drogi Mlecznej (~4 mln mas Słońca). Widok dysku akrecyjnego jest stylizowany.",
};

/** Gdzie na dysku MW stawiamy pinezkę Układu Słonecznego. */
export const SOLAR_PIN: [number, number, number] = [92, 6, 18];

export const GALAXY_BY_ID: Record<string, GalaxyDef> = Object.fromEntries(
  GALAXIES.map((g) => [g.id, g]),
);

export const GALAXY_CAMERA = { x: 160, y: 380, z: 820 } as const;
export const BLACKHOLE_CAMERA = { x: 14, y: 8, z: 22 } as const;
