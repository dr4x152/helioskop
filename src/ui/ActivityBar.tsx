import { ACTIVITY_LABEL, type ActivityMode } from "../data/ambientEvents";
import { ambientRate } from "../lib/ambientEngine";
import { useObservatory } from "../store/observatory";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const MODES: ActivityMode[] = ["quiet", "normal", "chaos"];

/**
 * Tempo wydarzeń ambient: Cicha / Normalna / Chaos
 * + ostatni komunikat i szacowane tempo.
 */
export function ActivityBar() {
  const mode = useObservatory((s) => s.activityMode);
  const setMode = useObservatory((s) => s.setActivityMode);
  const last = useObservatory((s) => s.lastEventTitle);
  const speed = useObservatory((s) => s.speed);
  const paused = useObservatory((s) => s.paused);
  const rate = ambientRate(speed, mode);
  const every = rate > 0.01 ? Math.max(1, Math.round(1 / rate)) : 99;

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-xl bg-surface/80 p-1.5 shadow-[0_0_0_1px_#2a3140]">
      <span className="px-1.5 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Aktywność</span>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={cx(
            "h-9 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
            mode === m ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
          )}
        >
          {ACTIVITY_LABEL[m]}
        </button>
      ))}
      <span className="px-2 font-mono text-[10px] text-muted">
        {paused ? "pauza" : `~1 / ${every} s`}
        {last ? ` · ${last}` : ""}
      </span>
    </div>
  );
}
