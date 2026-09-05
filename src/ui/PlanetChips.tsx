import { BODIES } from "../data/bodies";
import { COMETS } from "../data/comets";
import { GALAXIES, SGR_A } from "../data/galaxies";
import { useObservatory } from "../store/observatory";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function Chip({
  id,
  name,
  color,
  on,
  onClick,
}: {
  id: string;
  name: string;
  color: string;
  on: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cx(
        "flex min-w-16 shrink-0 flex-col items-center gap-1.5 rounded-lg px-3 py-2",
        "font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
        on ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface/80",
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {name}
    </button>
  );
}

/** Pasek szybkiego wyboru — planety albo kosmos lokalny, plus komety. */
export function PlanetChips() {
  const selectedId = useObservatory((s) => s.selectedId);
  const select = useObservatory((s) => s.select);
  const viewScale = useObservatory((s) => s.viewScale);
  const showComets = useObservatory((s) => s.showComets);

  if (viewScale === "galaxy") {
    return (
      <nav
        aria-label="Kosmos lokalny"
        className="pointer-events-auto no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1"
      >
        {GALAXIES.map((g) => (
          <Chip key={g.id} id={g.id} name={g.name} color={g.color} on={selectedId === g.id} onClick={select} />
        ))}
        <Chip id={SGR_A.id} name="Sgr A*" color="#ff9a4a" on={selectedId === SGR_A.id} onClick={select} />
        <Chip id="solar-pin" name="Układ" color="#f3c56b" on={false} onClick={select} />
      </nav>
    );
  }

  return (
    <nav
      aria-label="Ciała Układu Słonecznego"
      className="pointer-events-auto no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1"
    >
      {BODIES.map((b) => (
        <Chip key={b.id} id={b.id} name={b.name} color={b.color} on={selectedId === b.id} onClick={select} />
      ))}
      {showComets &&
        COMETS.map((c) => (
          <Chip key={c.id} id={c.id} name={c.name} color={c.color} on={selectedId === c.id} onClick={select} />
        ))}
    </nav>
  );
}
