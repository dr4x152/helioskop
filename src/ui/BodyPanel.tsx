import type { ReactNode } from "react";
import { BODY_BY_ID, kindLabel } from "../data/bodies";
import { COMET_BY_ID } from "../data/comets";
import { GALAXY_BY_ID, PROXY_BY_ID, SGR_A, systemsForGalaxy } from "../data/galaxies";
import { MOON_BY_ID } from "../data/moons";
import { yearsFromToday } from "../lib/clock";
import { formatAu, formatDay, formatKm, formatPeriod } from "../lib/format";
import { keplerPosition } from "../lib/kepler";
import { sunPhase } from "../lib/solarPhase";
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

function Card({
  kicker,
  title,
  subtitle,
  children,
  onClose,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <article className="pointer-events-auto w-[min(100%,20rem)] rounded-xl bg-surface/90 p-4 shadow-[0_0_0_1px_#2a3140]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-subtle uppercase">{kicker}</p>
          <h2 className="text-lg font-medium tracking-tight text-fg">{title}</h2>
          {subtitle && <p className="font-mono text-[11px] text-muted">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm px-2 py-1 font-mono text-[11px] tracking-wider text-muted uppercase hover:text-fg"
        >
          Zamknij
        </button>
      </div>
      {children}
    </article>
  );
}

/** Karta zaznaczonego ciała — planety, komety, galaktyki, Sgr A*. */
export function BodyPanel({ date }: BodyPanelProps) {
  const selectedId = useObservatory((s) => s.selectedId);
  const select = useObservatory((s) => s.select);
  if (!selectedId) return null;

  const close = () => select(null);

  const comet = COMET_BY_ID[selectedId];
  if (comet) {
    const live = keplerPosition(comet, date);
    return (
      <Card
        kicker={comet.fictional ? "Kometa · fikcyjna" : "Kometa okresowa"}
        title={comet.name}
        subtitle={comet.nameLat}
        onClose={close}
      >
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <Stat label="Półoś" value={formatAu(comet.au)} />
          <Stat label="Odległość" value={formatAu(live.au)} />
          <Stat label="Okres" value={formatPeriod(comet.periodDays)} />
          <Stat label="Mimośród" value={comet.eccentricity.toFixed(3)} />
        </dl>
        <p className="mt-3 text-sm leading-snug text-pretty text-muted">{comet.fact}</p>
      </Card>
    );
  }

  if (selectedId === SGR_A.id) {
    return (
      <Card kicker="Czarna dziura · schemat" title={SGR_A.name} subtitle={SGR_A.nameLat} onClose={close}>
        <p className="mt-3 text-sm leading-snug text-pretty text-muted">{SGR_A.fact}</p>
      </Card>
    );
  }

  const galaxy = GALAXY_BY_ID[selectedId];
  if (galaxy) {
    const systems = systemsForGalaxy(galaxy.id);
    return (
      <Card kicker="Galaktyka · schemat" title={galaxy.name} subtitle={galaxy.nameLat} onClose={close}>
        <p className="mt-3 text-sm leading-snug text-pretty text-muted">{galaxy.fact}</p>
        <p className="mt-2 text-[11px] leading-snug text-subtle">
          Układy poniżej są wzorcami, nie pełną galaktyką.
        </p>
        <ul className="mt-2 space-y-1">
          {systems.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => select(p.id)}
                className="font-mono text-[12px] text-accent hover:text-fg"
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  const proxy = PROXY_BY_ID[selectedId];
  if (proxy) {
    return (
      <Card
        kicker={proxy.isHome ? "Nasz układ" : "Układ wzorcowy · fikcja"}
        title={proxy.name}
        subtitle={proxy.nameLat}
        onClose={close}
      >
        <p className="mt-3 text-sm leading-snug text-pretty text-muted">{proxy.fact}</p>
        <ul className="mt-2 font-mono text-[11px] text-muted">
          {proxy.planets.map((p) => (
            <li key={p.name}>planeta {p.name}</li>
          ))}
        </ul>
      </Card>
    );
  }

  const moon = MOON_BY_ID[selectedId];
  const body = moon ? BODY_BY_ID[moon.parent] : BODY_BY_ID[selectedId];
  if (!body && !moon) return null;

  if (moon) {
    return (
      <Card
        kicker="Księżyc"
        title={moon.name}
        subtitle={`wokół ${BODY_BY_ID[moon.parent]?.name ?? moon.parent}${moon.retrograde ? " · wsteczny" : ""}`}
        onClose={close}
      >
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <Stat label="Średnica" value={formatKm(moon.diameterKm)} />
          <Stat label="Okres" value={formatPeriod(moon.periodDays)} />
        </dl>
      </Card>
    );
  }

  const liveAu = body.id === "sun" ? null : keplerPosition(body, date).au;
  const phase = body.id === "sun" ? sunPhase(yearsFromToday()) : null;

  return (
    <Card
      kicker={phase ? `Gwiazda · ${phase.label}` : kindLabel(body.kind)}
      title={body.name}
      subtitle={body.nameLat}
      onClose={close}
    >
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <Stat label="Średnica" value={formatKm(body.diameterKm)} />
        <Stat label="Odległość" value={liveAu == null ? (body.au ? formatAu(body.au) : "—") : formatAu(liveAu)} />
        <Stat label="Rok" value={formatPeriod(body.periodDays)} />
        <Stat label="Doba" value={formatDay(body.dayHours)} />
        {body.inclinationDeg > 0 && <Stat label="Inklinacja" value={`${body.inclinationDeg.toFixed(2)}°`} />}
        <Stat label="Księżyce" value={String(body.moonCount)} />
      </dl>
      <p className="mt-3 text-sm leading-snug text-pretty text-muted">{body.fact}</p>
      {phase && phase.id !== "main" && (
        <p className="mt-2 text-[11px] leading-snug text-subtle">
          Faza jest stylizowana (schemat), nie modelem astrofizycznym.
        </p>
      )}
    </Card>
  );
}
