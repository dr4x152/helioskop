import { BODIES } from "../data/bodies";
import { COMETS } from "../data/comets";
import { GALAXIES, PROXY_BY_ID, PROXY_SYSTEMS, SGR_A, systemsForGalaxy } from "../data/galaxies";
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

/** Pasek: planety / komety albo galaktyki + ich układy wzorcowe. */
export function PlanetChips() {
  const selectedId = useObservatory((s) => s.selectedId);
  const select = useObservatory((s) => s.select);
  const resetView = useObservatory((s) => s.resetView);
  const viewScale = useObservatory((s) => s.viewScale);
  const showComets = useObservatory((s) => s.showComets);

  if (viewScale === "galaxy") {
    const focused =
      selectedId && GALAXIES.some((g) => g.id === selectedId)
        ? selectedId
        : selectedId
          ? PROXY_BY_ID[selectedId]?.galaxyId
          : undefined;
    // W przeglądzie pokazujemy wszystkie wzorce — inaczej „nie ma układów”.
    const systems = focused ? systemsForGalaxy(focused) : PROXY_SYSTEMS;

    return (
      <nav
        aria-label="Grupa Lokalna"
        className="pointer-events-auto no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1"
      >
        <Chip id="overview" name="Przegląd" color="#9aa3b2" on={!selectedId} onClick={() => resetView()} />
        {GALAXIES.map((g) => (
          <Chip key={g.id} id={g.id} name={g.name} color={g.color} on={selectedId === g.id} onClick={select} />
        ))}
        <Chip id={SGR_A.id} name="Sgr A*" color="#ff9a4a" on={selectedId === SGR_A.id} onClick={select} />
        {systems.length > 0 && (
          <span className="self-center px-1 font-mono text-[10px] tracking-wider text-subtle uppercase">
            Układy
          </span>
        )}
        {systems.map((p) => (
          <Chip
            key={p.id}
            id={p.id}
            name={p.name}
            color={p.starColor}
            on={selectedId === p.id}
            onClick={select}
          />
        ))}
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
