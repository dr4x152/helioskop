import type { ReactNode } from "react";
import { SPEED_PRESETS } from "../data/speeds";
import { simClock } from "../lib/clock";
import { useObservatory } from "../store/observatory";
import {
  IconFollow,
  IconLabelsOff,
  IconLabelsOn,
  IconMoons,
  IconOrbits,
  IconPause,
  IconPlay,
  IconReset,
  IconSkip,
  IconToday,
} from "./icons";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function Toggle({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "flex size-11 items-center justify-center rounded-md transition-colors duration-150 active:scale-[0.96]",
        active
          ? "bg-accent text-accent-fg shadow-[0_0_0_1px_rgba(232,210,160,.55)]"
          : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

/** Pasek: Wznów/Pauza, prędkości, Dziś, +100 lat, przełączniki, reset. */
export function Toolbar() {
  const paused = useObservatory((s) => s.paused);
  const speed = useObservatory((s) => s.speed);
  const follow = useObservatory((s) => s.follow);
  const selectedId = useObservatory((s) => s.selectedId);
  const showOrbits = useObservatory((s) => s.showOrbits);
  const showMoons = useObservatory((s) => s.showMoons);
  const showLabels = useObservatory((s) => s.showLabels);
  const warping = useObservatory((s) => s.warping);
  const togglePaused = useObservatory((s) => s.togglePaused);
  const setSpeed = useObservatory((s) => s.setSpeed);
  const goToday = useObservatory((s) => s.goToday);
  const jumpYears = useObservatory((s) => s.jumpYears);
  const toggleOrbits = useObservatory((s) => s.toggleOrbits);
  const toggleMoons = useObservatory((s) => s.toggleMoons);
  const toggleLabels = useObservatory((s) => s.toggleLabels);
  const setFollow = useObservatory((s) => s.setFollow);
  const resetView = useObservatory((s) => s.resetView);

  const atToday = Math.abs(simClock.simDays) < 0.5 && paused && !warping;

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-xl bg-surface/85 p-1.5 shadow-[0_0_0_1px_#2a3140]">
      <Toggle label={paused ? "Wznów" : "Pauza"} onClick={togglePaused}>
        {paused ? <IconPlay className="size-4" /> : <IconPause className="size-4" />}
      </Toggle>
      {SPEED_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          title={p.hint}
          onClick={() => setSpeed(p.daysPerSecond)}
          className={cx(
            "h-11 min-w-11 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
            "transition-colors duration-150 active:scale-[0.96]",
            speed === p.daysPerSecond && !paused
              ? "bg-accent text-accent-fg shadow-[0_0_0_1px_rgba(232,210,160,.55)]"
              : "text-muted hover:bg-surface-2 hover:text-fg",
          )}
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        title="Wróć do dzisiejszych pozycji"
        onClick={goToday}
        className={cx(
          "flex h-11 items-center gap-1 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
          "transition-colors duration-150 active:scale-[0.96]",
          atToday ? "bg-accent text-accent-fg shadow-[0_0_0_1px_rgba(232,210,160,.55)]" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        <IconToday className="size-3.5" />
        Dziś
      </button>
      <button
        type="button"
        title="Skocz o 100 lat naprzód"
        disabled={warping}
        onClick={() => jumpYears(100)}
        className={cx(
          "flex h-11 items-center gap-1 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
          "transition-colors duration-150 active:scale-[0.96]",
          warping ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        <IconSkip className="size-3.5" />
        +100 lat
      </button>
      <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
      <Toggle label="Orbity" active={showOrbits} onClick={toggleOrbits}>
        <IconOrbits className="size-4" />
      </Toggle>
      <Toggle label="Księżyce" active={showMoons} onClick={toggleMoons}>
        <IconMoons className="size-4" />
      </Toggle>
      <Toggle label="Etykiety" active={showLabels} onClick={toggleLabels}>
        {showLabels ? <IconLabelsOn className="size-4" /> : <IconLabelsOff className="size-4" />}
      </Toggle>
      <Toggle label="Śledź" active={follow && !!selectedId} onClick={() => setFollow(!follow)}>
        <IconFollow className="size-4" />
      </Toggle>
      <Toggle label="Reset kamery" onClick={resetView}>
        <IconReset className="size-4" />
      </Toggle>
    </div>
  );
}
