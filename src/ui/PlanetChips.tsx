import { BODIES } from "../data/bodies";
import { useObservatory } from "../store/observatory";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Pasek szybkiego wyboru ciał — kolorowa kropka + nazwa. */
export function PlanetChips() {
  const selectedId = useObservatory((s) => s.selectedId);
  const select = useObservatory((s) => s.select);

  return (
    <nav
      aria-label="Ciała Układu Słonecznego"
      className="pointer-events-auto no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1"
    >
      {BODIES.map((b) => {
        const on = selectedId === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => select(b.id)}
            className={cx(
              "flex min-w-16 shrink-0 flex-col items-center gap-1.5 rounded-lg px-3 py-2",
              "font-mono text-[10px] tracking-[0.14em] uppercase transition-colors",
              on ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface/80",
            )}
          >
            <span className="size-1.5 rounded-full" style={{ background: b.color }} />
            {b.name}
          </button>
        );
      })}
    </nav>
  );
}
