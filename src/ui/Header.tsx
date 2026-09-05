import { simClock, yearsFromToday } from "../lib/clock";
import { formatUtc } from "../lib/format";
import { useObservatory } from "../store/observatory";

interface HeaderProps {
  date: Date;
}

/** Tytuł + zegar UTC. Żadnego „Created with Grok”. */
export function Header({ date }: HeaderProps) {
  const speed = useObservatory((s) => s.speed);
  const warping = useObservatory((s) => s.warping);
  const atToday = Math.abs(simClock.simDays) < 0.5;
  const years = yearsFromToday();

  let kicker = "Epoka UTC";
  if (warping) kicker = "Przeskok · UTC";
  else if (atToday) kicker = "Teraz · UTC";

  let sub = `1 s = ${speed} d`;
  if (warping) sub = "planety jadą na nowe pozycje";
  else if (atToday) sub = "pozycje z tej chwili";
  else if (Math.abs(years) >= 0.95) sub = `${years > 0 ? "+" : ""}${Math.round(years)} lat od dziś`;
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
        <p className="font-mono text-sm tabular-nums text-fg">{formatUtc(date)}</p>
        <p className="font-mono text-[11px] tabular-nums text-muted">{sub}</p>
      </div>
    </header>
  );
}
