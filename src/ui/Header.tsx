import { simClock, yearsFromToday } from "../lib/clock";
import { formatEpoch } from "../lib/format";
import { sunPhase } from "../lib/solarPhase";
import { useObservatory } from "../store/observatory";

interface HeaderProps {
  date: Date;
}

/** Tytuł + zegar UTC albo oś miliardów lat. Żadnego „Created with Grok”. */
export function Header({ date }: HeaderProps) {
  const speed = useObservatory((s) => s.speed);
  const warping = useObservatory((s) => s.warping);
  const viewScale = useObservatory((s) => s.viewScale);
  const solarScenario = useObservatory((s) => s.solarScenario);
  const atToday = Math.abs(simClock.simDays) < 0.5;
  const years = yearsFromToday();
  const phase = sunPhase(years);

  let kicker = "Epoka UTC";
  if (viewScale === "galaxy") kicker = "Grupa Lokalna · schemat";
  else if (warping) kicker = "Przeskok · oś czasu";
  else if (Math.abs(years) >= 8_000) kicker = "Oś czasu · schemat";
  else if (atToday) kicker = "Teraz · UTC";

  let sub = `1 s = ${speed} d`;
  if (viewScale === "galaxy") sub = "M31 · M33 · Droga Mleczna · układy wzorcowe";
  else if (warping) sub = "ciała jadą na nowe pozycje";
  else if (solarScenario) sub = `Ewolucja Słońca · ${phase.label}`;
  else if (atToday) sub = "pozycje z tej chwili";
  else if (Math.abs(years) >= 0.95) sub = formatEpoch(date, years);
  else if (speed >= 365) sub = `1 s = ${speed / 365} lat`;

  return (
    <header className="pointer-events-auto flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-medium tracking-[0.22em] text-subtle uppercase">
          Obserwatorium
        </p>
        <h1 className="text-lg font-medium tracking-tight text-balance text-fg sm:text-xl">
          Helioskop
        </h1>
      </div>
      <div className="rounded-lg bg-surface/80 px-3 py-2 shadow-[0_0_0_1px_#2a3140]">
        <p className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">{kicker}</p>
        <p className="font-mono text-sm tabular-nums text-fg">{formatEpoch(date, years)}</p>
        <p className="font-mono text-[11px] tabular-nums text-muted">{sub}</p>
      </div>
    </header>
  );
}
