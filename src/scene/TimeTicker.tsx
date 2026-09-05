import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type TimelineEvent } from "../data/events";
import { advanceSim, stepWarp, timeWarp, yearsFromToday } from "../lib/clock";
import { collapseHits, scanTimeline } from "../lib/eventEngine";
import { useObservatory } from "../store/observatory";

/**
 * Zegar + skan wydarzeń.
 * W trakcie warpa zbieramy trafienia i pokazujemy je dopiero na końcu —
 * skok do „Karzeł” ma dać modal białego karła, nie supernowej z połowy drogi.
 */
export function TimeTicker() {
  const prevYears = useRef(0);
  const lastEpoch = useRef(-1);
  const pending = useRef<TimelineEvent[]>([]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1);
    const store = useObservatory.getState();

    if (store.epoch !== lastEpoch.current) {
      lastEpoch.current = store.epoch;
      prevYears.current = yearsFromToday();
      pending.current = [];
    }

    if (timeWarp.active) {
      const done = stepWarp(step);
      const y = yearsFromToday();
      pending.current.push(...scanTimeline(prevYears.current, y));
      prevYears.current = y;
      if (done) {
        store.finishWarp();
        const hits = collapseHits(pending.current);
        pending.current = [];
        if (hits.length) store.ingestEvents(hits);
      }
      return;
    }

    if (store.started && !store.paused && !store.serious) {
      advanceSim(step, store.speed);
    }
    const y = yearsFromToday();
    const hits = scanTimeline(prevYears.current, y);
    prevYears.current = y;
    if (hits.length) store.ingestEvents(hits);
  });
  return null;
}
