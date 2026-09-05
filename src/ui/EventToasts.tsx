import { useEffect } from "react";
import { useObservatory } from "../store/observatory";

/**
 * Lekkie wydarzenia (koniunkcje, wiek, peryhelium).
 * Znikają po 7 s albo po „Ok”. Poważne rzeczy idą do SeriousEventModal.
 */
export function EventToasts() {
  const toasts = useObservatory((s) => s.toasts);
  const dismiss = useObservatory((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];
    const id = window.setTimeout(() => dismiss(last.uid), 7000);
    return () => window.clearTimeout(id);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none flex w-[min(100%,22rem)] flex-col gap-2">
      {toasts.map((t) => (
        <article
          key={t.uid}
          className="pointer-events-auto rounded-lg bg-surface/92 px-3 py-2.5 shadow-[0_0_0_1px_#2a3140]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">Wydarzenie</p>
            <button
              type="button"
              onClick={() => dismiss(t.uid)}
              className="font-mono text-[10px] tracking-wider text-muted uppercase hover:text-fg"
            >
              Ok
            </button>
          </div>
          <h3 className="mt-1 text-sm font-medium text-fg">{t.event.title}</h3>
          <p className="mt-1 text-[12px] leading-snug text-muted">{t.event.body}</p>
        </article>
      ))}
    </div>
  );
}
