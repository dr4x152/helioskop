import { SOLAR_MILESTONES } from "../data/events";
import { useObservatory } from "../store/observatory";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Drugi rząd HUD: przełącznik skali (Układ ↔ Kosmos lokalny)
 * oraz scenariusz „Ewolucja Słońca” z kamieniami milowymi.
 * Milestony wołają `jumpToYearsFromNow` — TimeTicker odpala wtedy modale.
 */
export function ScenarioBar() {
  const viewScale = useObservatory((s) => s.viewScale);
  const setViewScale = useObservatory((s) => s.setViewScale);
  const solarScenario = useObservatory((s) => s.solarScenario);
  const startSolarEvolution = useObservatory((s) => s.startSolarEvolution);
  const jumpToYearsFromNow = useObservatory((s) => s.jumpToYearsFromNow);
  const warping = useObservatory((s) => s.warping);

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-xl bg-surface/80 p-1.5 shadow-[0_0_0_1px_#2a3140]">
      <button
        type="button"
        onClick={() => setViewScale("system")}
        className={cx(
          "h-10 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
          viewScale === "system" ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        Układ
      </button>
      <button
        type="button"
        title="Grupa Lokalna: Droga Mleczna, Andromeda, Trójkąt"
        onClick={() => setViewScale("galaxy")}
        className={cx(
          "h-10 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
          viewScale === "galaxy" ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        Grupa Lokalna
      </button>
      <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
      <button
        type="button"
        title="Stylizowany łuk ewolucji Słońca"
        onClick={startSolarEvolution}
        className={cx(
          "h-10 rounded-md px-2.5 font-mono text-[11px] tracking-wide uppercase",
          solarScenario ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
        )}
      >
        Ewolucja Słońca
      </button>
      {solarScenario &&
        SOLAR_MILESTONES.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={warping}
            onClick={() => jumpToYearsFromNow(m.years)}
            className="h-10 rounded-md px-2 font-mono text-[11px] tracking-wide text-muted uppercase hover:bg-surface-2 hover:text-fg disabled:opacity-40"
          >
            {m.label}
          </button>
        ))}
    </div>
  );
}
