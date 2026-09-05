/**
 * Silnik ambient: Poisson w czasie rzeczywistym.
 * Tempo rośnie z prędkością symulacji i mnożnikiem Cicha / Normalna / Chaos.
 * Serious leci rzadko i z osobnym cooldownem — bez spamu modalów.
 */

import { AMBIENT_KINDS, ACTIVITY_MUL, ambientToTimeline, type ActivityMode } from "../data/ambientEvents";
import { COMETS } from "../data/comets";
import type { TimelineEvent } from "../data/events";
import { yearsFromToday } from "./clock";

export interface AmbientTickCtx {
  dt: number;
  speed: number;
  mode: ActivityMode;
  viewScale: "system" | "galaxy";
  /** Czy wolno otworzyć modal (nie gdy już wisi). */
  allowSerious: boolean;
}

let acc = 0;
let seriousCool = 0;
const kindCool = new Map<string, number>();

export function resetAmbientEngine(): void {
  acc = 0;
  seriousCool = 12;
  kindCool.clear();
}

/** Oczekiwane eventy / sekundę rzeczywistą. */
export function ambientRate(speed: number, mode: ActivityMode): number {
  // 1 d → ~0.45, 10 d → 1, 1 rok → ~2.3 (log, żeby 1 mln nie eksplodował).
  const speedF = Math.min(2.6, Math.log10(1 + speed) / Math.log10(11));
  return 0.085 * speedF * ACTIVITY_MUL[mode];
}

function pickKind(viewScale: "system" | "galaxy", allowSerious: boolean): (typeof AMBIENT_KINDS)[number] | null {
  const pool = AMBIENT_KINDS.filter((k) => {
    if (k.scale !== "any" && k.scale !== viewScale) return false;
    if (k.severity === "serious" && !allowSerious) return false;
    const cool = kindCool.get(k.id) ?? 0;
    if (cool > 0) return false;
    return true;
  });
  if (pool.length === 0) return null;
  let sum = 0;
  for (const k of pool) sum += k.weight;
  let r = Math.random() * sum;
  for (const k of pool) {
    r -= k.weight;
    if (r <= 0) return k;
  }
  return pool[pool.length - 1] ?? null;
}

export function tickAmbient(ctx: AmbientTickCtx): TimelineEvent | null {
  const step = Math.min(ctx.dt, 0.12);
  acc += step;
  seriousCool = Math.max(0, seriousCool - step);
  for (const [id, t] of kindCool) {
    const next = t - step;
    if (next <= 0) kindCool.delete(id);
    else kindCool.set(id, next);
  }

  const rate = ambientRate(ctx.speed, ctx.mode);
  // P(co najmniej 1) ≈ 1 − e^{−λΔt}
  const p = 1 - Math.exp(-rate * acc);
  if (Math.random() > p) return null;
  acc = 0;

  const allowSerious = ctx.allowSerious && seriousCool <= 0 && Math.random() < 0.08;
  const kind = pickKind(ctx.viewScale, allowSerious);
  if (!kind) return null;

  const cool = ctx.mode === "chaos" ? 3.2 : ctx.mode === "quiet" ? 14 : 7;
  kindCool.set(kind.id, cool);
  if (kind.severity === "serious") seriousCool = 40;

  let cometName: string | undefined;
  if (kind.visual === "outburst") {
    cometName = COMETS[Math.floor(Math.random() * COMETS.length)]?.name;
  }
  return ambientToTimeline(kind, yearsFromToday(), cometName);
}

/** Która kometa dostała wybuch — po tytule „Wybuch pyłu — Halley”. */
export function cometIdFromBurstTitle(title: string): string | null {
  const name = title.split("—")[1]?.trim();
  if (!name) return COMETS[0]?.id ?? null;
  const hit = COMETS.find((c) => c.name === name);
  return hit?.id ?? null;
}
