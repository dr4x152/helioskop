import { useFrame } from "@react-three/fiber";
import { advanceSim, stepWarp, timeWarp } from "../lib/clock";
import { useObservatory } from "../store/observatory";

/** Jedyny zegar w pętli renderu — dt clamp, żeby tab w tle nie skakał latami. */
export function TimeTicker() {
  useFrame((_, dt) => {
    const step = Math.min(dt, 0.1);
    if (timeWarp.active) {
      if (stepWarp(step)) useObservatory.getState().finishWarp();
      return;
    }
    const { started, paused, speed } = useObservatory.getState();
    if (!started || paused) return;
    advanceSim(step, speed);
  });
  return null;
}
