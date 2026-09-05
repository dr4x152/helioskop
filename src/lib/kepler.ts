/**
 * Schematyczny Kepler: elipsa + inklinacja + lekko ściśnięta skala AU.
 * Nie jest to VSOP87 — wystarcza do czytelnego przeglądu i idle-time.
 */

import { Vector3 } from "three";
import type { BodyDef } from "../data/bodies";

/** JD południa 1 stycznia 2000 (epoka elementów średnich). */
const JD_J2000 = 2_451_545.0;
const MS_PER_DAY = 86_400_000;

/** Domyślna kamera przeglądu — musi objąć Plutona (~58 j.). */
export const OVERVIEW_CAMERA = { x: 0, y: 28, z: 72 } as const;

/**
 * AU → jednostki sceny.
 * Lekka potęga < 1 rozsuwa wewnętrzne planety od tarczy Słońca
 * i jednocześnie trzyma Neptuna/Plutona w kadrze przeglądu.
 */
export function auToScene(au: number): number {
  if (au <= 0) return 0;
  return 3.55 + 6.35 * au ** 0.58;
}

/** Dni juliańskie z daty UTC. */
export function dateToJd(date: Date): number {
  return date.getTime() / MS_PER_DAY + 2_440_587.5;
}

/** Dni od J2000 do podanej daty. */
export function daysSinceJ2000(date: Date): number {
  return dateToJd(date) - JD_J2000;
}

/**
 * Równanie Keplera: M = E − e sin E, iteracja Newtona.
 * Dla e < 0.3 (nawet Pluton 0.25) zbiega w 4–5 krokach.
 */
export function solveEccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
  let E = meanAnomaly;
  if (eccentricity > 0.15) {
    E = meanAnomaly + eccentricity * Math.sin(meanAnomaly);
  }
  for (let i = 0; i < 8; i += 1) {
    const dE = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

export interface KeplerState {
  /** Pozycja w jednostkach sceny. */
  x: number;
  y: number;
  z: number;
  /** Aktualna odległość od Słońca w AU (do panelu efemeryd). */
  au: number;
}

/**
 * Pozycja heliocentryczna ciała w epoce `date`.
 * Długość średnia: L0 + n·Δt, potem Kepler → r, ν, inklinacja.
 */
export function keplerPosition(body: BodyDef, date: Date, target?: Vector3): KeplerState {
  if (body.au <= 0) {
    target?.set(0, 0, 0);
    return { x: 0, y: 0, z: 0, au: 0 };
  }

  const days = daysSinceJ2000(date);
  const meanLongDeg = body.meanLongitudeJ2000 + body.meanMotionDegPerDay * days;
  const M = ((meanLongDeg % 360) * Math.PI) / 180;
  const e = body.eccentricity;
  const E = solveEccentricAnomaly(M, e);
  // Odległość w AU (elipsa).
  const rAu = body.au * (1 - e * Math.cos(E));
  const trueAnomaly =
    2 *
    Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = auToScene(rAu);
  const incl = (body.inclinationDeg * Math.PI) / 180;
  const x = r * Math.cos(trueAnomaly);
  const z = r * Math.sin(trueAnomaly) * Math.cos(incl);
  const y = r * Math.sin(trueAnomaly) * Math.sin(incl);
  target?.set(x, y, z);
  return { x, y, z, au: rAu };
}

/** Próbki elipsy do Line — 128 punktów wystarcza przy dashed Pluto. */
export function orbitPoints(body: BodyDef, samples = 128): Vector3[] {
  const points: Vector3[] = [];
  const e = body.eccentricity;
  const a = body.au;
  const incl = (body.inclinationDeg * Math.PI) / 180;
  for (let i = 0; i <= samples; i += 1) {
    const nu = (i / samples) * Math.PI * 2;
    const rAu = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
    const r = auToScene(rAu);
    points.push(
      new Vector3(
        r * Math.cos(nu),
        r * Math.sin(nu) * Math.sin(incl),
        r * Math.sin(nu) * Math.cos(incl),
      ),
    );
  }
  return points;
}

/** Odległość kamery od celu przy „Śledź” — nie zasłania UI. */
export function followDistance(bodyRadius: number, moonSpan = 0): number {
  return Math.max(bodyRadius * 9, moonSpan * 2.15 + bodyRadius * 1.25, 2.6);
}

/** Minimalny dolly — tarcza nie wypełnia całego kadru. */
export function clampMinDistance(bodyRadius: number): number {
  return Math.max(bodyRadius * 3.2, 1.2);
}
