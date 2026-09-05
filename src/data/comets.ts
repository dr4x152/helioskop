/**
 * Komety — schematyczny Kepler z dużym mimośrodem.
 * Ogon rysujemy w runtime (od Słońca na zewnątrz).
 */

export interface CometDef {
  id: string;
  name: string;
  nameLat: string;
  /** Półoś wielka [AU]. */
  au: number;
  eccentricity: number;
  periodDays: number;
  inclinationDeg: number;
  meanLongitudeJ2000: number;
  meanMotionDegPerDay: number;
  color: string;
  /** Bazowa długość ogona w jednostkach sceny (skalowana peryhelium). */
  tailLength: number;
  /** Promień jądra — Encke ma być wyraźnie mniejszy. */
  nucleus: number;
  fact: string;
  fictional?: boolean;
}

export const COMETS: CometDef[] = [
  {
    id: "halley",
    name: "Halley",
    nameLat: "1P/Halley",
    au: 17.8,
    eccentricity: 0.967,
    periodDays: 27509,
    inclinationDeg: 162.3,
    meanLongitudeJ2000: 112.0,
    meanMotionDegPerDay: 0.01309,
    color: "#cfe6ff",
    tailLength: 5.4,
    nucleus: 0.07,
    fact: "Okres ~76 lat. Kolejne peryhelium: 2061. Orbita wsteczna.",
  },
  {
    id: "encke",
    name: "Encke",
    nameLat: "2P/Encke",
    au: 2.21,
    eccentricity: 0.85,
    periodDays: 1204,
    inclinationDeg: 11.8,
    meanLongitudeJ2000: 186.0,
    meanMotionDegPerDay: 0.299,
    color: "#d8e6f4",
    tailLength: 2.15,
    nucleus: 0.05,
    fact: "Najkrótszy okres wśród komet okresowych (~3,3 roku).",
  },
  {
    id: "helioskop",
    name: "Helioskop-1",
    nameLat: "C/Helioskop",
    au: 62,
    eccentricity: 0.992,
    periodDays: 178_000,
    inclinationDeg: 48,
    meanLongitudeJ2000: 18,
    meanMotionDegPerDay: 0.00202,
    color: "#b8f0d8",
    tailLength: 8.2,
    nucleus: 0.08,
    fact: "Kometa długookresowa — fikcyjna, na potrzeby obserwatorium.",
    fictional: true,
  },
];

export const COMET_BY_ID: Record<string, CometDef> = Object.fromEntries(
  COMETS.map((c) => [c.id, c]),
);
