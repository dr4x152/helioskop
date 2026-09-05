import type { SyntheticEvent } from "react";
import { useObservatory } from "../store/observatory";

/**
 * Ekran startowy — bez brandingu Grok.
 * Klik w tło albo przycisk uruchamia pauzę na dzisiejszej epoce.
 */
export function IntroOverlay() {
  const started = useObservatory((s) => s.started);
  const start = useObservatory((s) => s.start);
  if (started) return null;

  const begin = (ev: SyntheticEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    start();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-void/55 sm:items-center sm:justify-center"
      role="dialog"
      aria-label="Helioskop"
      onPointerUp={begin}
    >
      <section
        className="m-3 w-full max-w-md rounded-xl bg-surface/95 p-6 shadow-[0_0_0_1px_#2a3140,0_24px_60px_rgba(0,0,0,.45)] sm:m-0"
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] font-medium tracking-[0.22em] text-subtle uppercase">
          Obserwatorium Układu Słonecznego
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight text-balance text-fg">Helioskop</h1>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">
          Schematyczny model Keplera: Słońce, osiem planet, Pluton i główne księżyce. Skala
          odległości jest lekko ściśnięta, żeby zewnętrzne orbity były czytelne; rozmiary ciał
          powiększone.
        </p>
        <ul className="mt-4 space-y-1.5 font-mono text-[12px] text-muted">
          <li>Przeciągnij, aby obracać</li>
          <li>Szczypnij lub przewiń, aby przybliżyć</li>
          <li>Dotknij planety — zobaczysz księżyce na orbicie</li>
          <li>Start od dzisiejszych pozycji; idle: 1 s = 10 dni</li>
        </ul>
        <p className="mt-4 text-[11px] leading-snug text-subtle">
          Pluton jest planetą karłowatą (IAU 2006). Tekstury: Solar System Scope / NASA, CC BY 4.0.
        </p>
        <button
          type="button"
          onPointerUp={begin}
          onClick={begin}
          className="relative z-50 mt-5 flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg active:scale-[0.99]"
          style={{ touchAction: "manipulation" }}
        >
          Rozpocznij obserwację
        </button>
      </section>
    </div>
  );
}
