import { BODY_BY_ID, kindLabel } from "../data/bodies";
import { MOON_BY_ID } from "../data/moons";
import { formatAu, formatDay, formatKm, formatPeriod } from "../lib/format";
import { keplerPosition } from "../lib/kepler";
import { useObservatory } from "../store/observatory";

interface BodyPanelProps {
  date: Date;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-wider text-subtle uppercase">{label}</dt>
      <dd className="text-[13px] text-fg">{value}</dd>
    </div>
  );
}

/** Karta zaznaczonego ciała — średnica, AU, rok, doba, inklinacja, księżyce, fakt. */
export function BodyPanel({ date }: BodyPanelProps) {
  const selectedId = useObservatory((s) => s.selectedId);
  const select = useObservatory((s) => s.select);
  if (!selectedId) return null;

  const moon = MOON_BY_ID[selectedId];
  const body = moon ? BODY_BY_ID[moon.parent] : BODY_BY_ID[selectedId];
  if (!body && !moon) return null;

  if (moon) {
    return (
      <article className="pointer-events-auto w-[min(100%,20rem)] rounded-xl bg-surface/90 p-4 shadow-[0_0_0_1px_#2a3140]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-subtle uppercase">Księżyc</p>
            <h2 className="text-lg font-medium tracking-tight text-fg">{moon.name}</h2>
            <p className="font-mono text-[11px] text-muted">
              wokół {BODY_BY_ID[moon.parent]?.name ?? moon.parent}
              {moon.retrograde ? " · wsteczny" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => select(null)}
            className="rounded-sm px-2 py-1 font-mono text-[11px] tracking-wider text-muted uppercase hover:text-fg"
          >
            Zamknij
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <Stat label="Średnica" value={formatKm(moon.diameterKm)} />
          <Stat label="Okres" value={formatPeriod(moon.periodDays)} />
        </dl>
      </article>
    );
  }

  const liveAu = body.id === "sun" ? null : keplerPosition(body, date).au;

  return (
    <article className="pointer-events-auto w-[min(100%,20rem)] rounded-xl bg-surface/90 p-4 shadow-[0_0_0_1px_#2a3140]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-subtle uppercase">
            {kindLabel(body.kind)}
          </p>
          <h2 className="text-lg font-medium tracking-tight text-fg">{body.name}</h2>
          <p className="font-mono text-[11px] text-muted">{body.nameLat}</p>
        </div>
        <button
          type="button"
          onClick={() => select(null)}
          className="rounded-sm px-2 py-1 font-mono text-[11px] tracking-wider text-muted uppercase hover:text-fg"
        >
          Zamknij
        </button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <Stat label="Średnica" value={formatKm(body.diameterKm)} />
        <Stat label="Odległość" value={liveAu == null ? (body.au ? formatAu(body.au) : "—") : formatAu(liveAu)} />
        <Stat label="Rok" value={formatPeriod(body.periodDays)} />
        <Stat label="Doba" value={formatDay(body.dayHours)} />
        {body.inclinationDeg > 0 && (
          <Stat label="Inklinacja" value={`${body.inclinationDeg.toFixed(2)}°`} />
        )}
        <Stat label="Księżyce" value={String(body.moonCount)} />
      </dl>
      <p className="mt-3 text-sm leading-snug text-pretty text-muted">{body.fact}</p>
    </article>
  );
}
