import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { advanceSim, stepWarp, timeWarp, yearsFromToday } from "../lib/clock";
import { scanTimeline } from "../lib/eventEngine";
import { useObservatory } from "../store/observatory";

/** Zegar + skan wydarzeń. Przy poważnym modalu czas stoi (paused). */
export function TimeTicker() {
  const prevYears = useRef(0);
  // epoch rośnie przy Dziś / starcie — wtedy nie skanujemy wstecz (unikamy lawiny toastów).
  const lastEpoch = useRef(-1);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1);
    const store = useObservatory.getState();
    if (timeWarp.active) {
      if (stepWarp(step)) store.finishWarp();
    } else if (store.started && !store.paused && !store.serious) {
      advanceSim(step, store.speed);
    }
    const y = yearsFromToday();
    if (store.epoch !== lastEpoch.current) {
      lastEpoch.current = store.epoch;
      prevYears.current = y;
      return;
    }
    const hits = scanTimeline(prevYears.current, y);
    prevYears.current = y;
    if (hits.length) store.ingestEvents(hits);
  });
  return null;
}
