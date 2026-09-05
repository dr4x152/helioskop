import { ORBITING_BODIES } from "../data/bodies";
import { yearsFromToday } from "../lib/clock";
import { formatUtc } from "../lib/format";
import { keplerPosition } from "../lib/kepler";
import { useObservatory } from "../store/observatory";

interface EphemerisPanelProps {
  date: Date;
}

/** Opcjonalna lista AU — Kepler, nie VSOP87 (uczciwy podpis). */
export function EphemerisPanel({ date }: EphemerisPanelProps) {
  const open = useObservatory((s) => s.showEphemeris);
  const hide = useObservatory((s) => s.setEphemeris);
  const selectedId = useObservatory((s) => s.selectedId);
  const viewScale = useObservatory((s) => s.viewScale);
  // W kosmosie lokalnym i na osi miliardów lat lista AU nie ma sensu.
  if (!open || selectedId || viewScale === "galaxy" || Math.abs(yearsFromToday()) >= 8_000) return null;

  const rows = ORBITING_BODIES.map((b) => ({
    id: b.id,
    name: b.name,
    color: b.color,
    dwarf: b.kind === "dwarf",
    au: keplerPosition(b, date).au,
  }));

  return (
    <article className="pointer-events-auto w-[min(100%,22rem)] rounded-xl bg-surface/90 p-4 shadow-[0_0_0_1px_#2a3140]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-subtle uppercase">
            Ephemeris · Kepler
          </p>
          <h2 className="text-lg font-medium tracking-tight text-fg">Pozycje z tej chwili</h2>
          <p className="font-mono text-[11px] tabular-nums text-muted">{formatUtc(date)} UTC</p>
        </div>
        <button
          type="button"
          onClick={() => hide(false)}
          className="rounded-sm px-2 py-1 font-mono text-[11px] tracking-wider text-muted uppercase hover:text-fg"
        >
          Ukryj
        </button>
      </div>
      <ul className="mt-2.5 columns-1 gap-x-6 sm:columns-2">
        {rows.map((e) => (
          <li key={e.id} className="flex items-baseline gap-2 break-inside-avoid py-0.5 font-mono text-[11px]">
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: e.color }} />
            <span className={`w-14 shrink-0 ${e.dwarf ? "text-accent" : ""}`}>{e.name}</span>
            <span className="flex-1 tabular-nums text-fg">{e.au.toFixed(3)} AU</span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[11px] leading-snug text-pretty text-muted">
        Pauza na dzisiejszej epoce. Wznów — czas poleci jak w grze idle.
      </p>
    </article>
  );
}
