import { useEffect } from "react";
import { useObservatory } from "../store/observatory";

/**
 * Kanał obserwatorium — stos toastów.
 * Ambient i oś czasu dzielą ten sam feed.
 */
export function EventToasts() {
  const toasts = useObservatory((s) => s.toasts);
  const dismiss = useObservatory((s) => s.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const last = toasts[toasts.length - 1];
    const id = window.setTimeout(() => dismiss(last.uid), 8000);
    return () => window.clearTimeout(id);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none flex w-[min(100%,22rem)] flex-col gap-1.5">
      <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Kanał</p>
      {toasts.map((t) => (
        <article
          key={t.uid}
          className="pointer-events-auto rounded-lg bg-surface/92 px-3 py-2 shadow-[0_0_0_1px_#2a3140]"
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
          <h3 className="mt-0.5 text-sm font-medium text-fg">{t.event.title}</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-muted">{t.event.body}</p>
        </article>
      ))}
    </div>
  );
}
