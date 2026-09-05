/**
 * Zegar symulacji poza Reactem — useFrame czyta go bez re-renderu UI.
 * `simDays` = przesunięcie względem „teraz” (Date.now()).
 */

import { DAYS_PER_YEAR } from "../data/speeds";

export interface TimeWarp {
  active: boolean;
  from: number;
  to: number;
  t: number;
  dur: number;
}

export const simClock = {
  simDays: 0,
  getDate(): Date {
    // Date.js pęka przy miliardach lat — wtedy zwracamy „teraz” jako atrapę.
    const ms = Date.now() + this.simDays * 86_400_000;
    if (!Number.isFinite(ms) || Math.abs(this.simDays) > 2_500_000) {
      return new Date();
    }
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  },
};

export const timeWarp: TimeWarp = {
  active: false,
  from: 0,
  to: 0,
  t: 0,
  dur: 1.4,
};

/** Idle: dodaj `dt * daysPerSecond`, o ile nie trwa skok +100 lat. */
export function advanceSim(dt: number, daysPerSecond: number): void {
  if (!timeWarp.active) {
    simClock.simDays += dt * daysPerSecond;
  }
}

/** Płynny skok o `deltaDays` (ease-in-out). */
export function startWarp(deltaDays: number, duration = 1.45): void {
  timeWarp.active = true;
  timeWarp.from = simClock.simDays;
  timeWarp.to = simClock.simDays + deltaDays;
  timeWarp.t = 0;
  timeWarp.dur = duration;
}

/** Zwraca true, gdy animacja skoku właśnie się skończyła. */
export function stepWarp(dt: number): boolean {
  if (!timeWarp.active) return false;
  timeWarp.t += dt;
  const u = Math.min(1, timeWarp.t / timeWarp.dur);
  const ease = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
  simClock.simDays = timeWarp.from + (timeWarp.to - timeWarp.from) * ease;
  if (u >= 1) {
    simClock.simDays = timeWarp.to;
    timeWarp.active = false;
    return true;
  }
  return false;
}

export function resetSimDays(): void {
  timeWarp.active = false;
  simClock.simDays = 0;
}

export function yearsFromToday(): number {
  return simClock.simDays / DAYS_PER_YEAR;
}
