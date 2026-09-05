/**
 * Silnik wydarzeń: wykrywa przekroczenie progów na osi lat.
 * Stan „już odpalone” żyje poza Reactem, reset przy Dziś / starcie.
 * Przy skoku o miliardy lat zostawiamy ostatni serious + jeden toast,
 * żeby nie zasypać HUD-u kolejką modalów.
 */

import { TIMELINE, type TimelineEvent } from "../data/events";

const fired = new Set<string>();

export function resetEventEngine(): void {
  fired.clear();
}

/** Z wielu trafień zostaw ostatni serious + max jeden toast — HUD nie tonie. */
export function collapseHits(hit: TimelineEvent[]): TimelineEvent[] {
  if (hit.length <= 1) return hit;
  const serious = hit.filter((e) => e.severity === "serious");
  const toasts = hit.filter((e) => e.severity === "toast");
  if (serious.length > 0) {
    return [...toasts.slice(-1), serious[serious.length - 1]];
  }
  return toasts.slice(-2);
}

export function scanTimeline(prevYears: number, nextYears: number): TimelineEvent[] {
  if (nextYears === prevYears) return [];
  const lo = Math.min(prevYears, nextYears);
  const hi = Math.max(prevYears, nextYears);
  const hit: TimelineEvent[] = [];
  for (const ev of TIMELINE) {
    if (fired.has(ev.id)) continue;
    if (ev.atYears > lo && ev.atYears <= hi) {
      fired.add(ev.id);
      hit.push(ev);
    }
  }
  return collapseHits(hit);
}
