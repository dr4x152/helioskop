import { useEffect, useState } from "react";
import { BODIES } from "../data/bodies";
import { SPEED_PRESETS } from "../data/speeds";
import { simClock } from "../lib/clock";
import { useObservatory } from "../store/observatory";
import { BodyPanel } from "./BodyPanel";
import { EphemerisPanel } from "./EphemerisPanel";
import { EventToasts } from "./EventToasts";
import { Header } from "./Header";
import { PlanetChips } from "./PlanetChips";
import { ScenarioBar } from "./ScenarioBar";
import { Toolbar } from "./Toolbar";

/**
 * Nakładka HUD: klawiatura, zegar daty, wydarzenia, panel ciała, pasek.
 * Space = pauza, R = reset kamery, Esc = zamknij modal / odznacz.
 */
export function Hud() {
  const started = useObservatory((s) => s.started);
  const paused = useObservatory((s) => s.paused);
  const speed = useObservatory((s) => s.speed);
  const warping = useObservatory((s) => s.warping);
  const togglePaused = useObservatory((s) => s.togglePaused);
  const setSpeed = useObservatory((s) => s.setSpeed);
  const select = useObservatory((s) => s.select);
  const resetView = useObservatory((s) => s.resetView);
  const dismissSerious = useObservatory((s) => s.dismissSerious);

  const running = started && !paused && !warping;
  const [date, setDate] = useState(() => simClock.getDate());

  useEffect(() => {
    const id = window.setInterval(() => setDate(simClock.getDate()), running || warping ? 180 : 800);
    return () => window.clearInterval(id);
  }, [running, warping]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        // Przy otwartym modalu Space nie wznawia — najpierw Kontynuuj / Esc.
        if (useObservatory.getState().serious) return;
        togglePaused();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        resetView();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        const i = SPEED_PRESETS.findIndex((p) => p.daysPerSecond === speed);
        const next = SPEED_PRESETS[Math.min(SPEED_PRESETS.length - 1, i + 1)];
        if (next) setSpeed(next.daysPerSecond);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        const i = SPEED_PRESETS.findIndex((p) => p.daysPerSecond === speed);
        const prev = SPEED_PRESETS[Math.max(0, i - 1)];
        if (prev) setSpeed(prev.daysPerSecond);
        return;
      }
      if (e.key === "0") {
        select("sun");
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        const body = BODIES[Number(e.key)];
        if (body) select(body.id);
        return;
      }
      if (e.key === "Escape") {
        if (useObservatory.getState().serious) {
          dismissSerious();
          return;
        }
        select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speed, togglePaused, setSpeed, select, resetView, dismissSerious]);

  if (!started) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5">
      <div className="flex flex-col gap-3">
        <Header date={date} />
        <ScenarioBar />
        <EventToasts />
        <EphemerisPanel date={date} />
        <BodyPanel date={date} />
      </div>
      <div className="flex flex-col gap-2">
        <Toolbar />
        <PlanetChips />
      </div>
    </div>
  );
}
