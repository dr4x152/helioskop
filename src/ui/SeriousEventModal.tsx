import { useObservatory } from "../store/observatory";

/**
 * Poważne wydarzenie — pauzuje czas, wymaga potwierdzenia.
 * Używane m.in. do śmierci Słońca.
 */
export function SeriousEventModal() {
  const ev = useObservatory((s) => s.serious);
  const dismiss = useObservatory((s) => s.dismissSerious);
  if (!ev) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-void/65 p-4">
      <article
        role="dialog"
        aria-modal
        aria-label={ev.title}
        className="w-[min(100%,28rem)] rounded-xl bg-surface p-5 shadow-[0_0_0_1px_#2a3140,0_24px_60px_rgba(0,0,0,.5)]"
      >
        <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">
          {ev.speculative ? "Scenariusz · schemat" : "Wydarzenie poważne"}
        </p>
        <h2 className="mt-2 text-xl font-medium tracking-tight text-balance text-fg">{ev.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">{ev.body}</p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg"
        >
          Kontynuuj obserwację
        </button>
      </article>
    </div>
  );
}
