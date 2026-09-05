import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  err: string | null;
}

/** Gdy WebGL nie wstanie — czytelny komunikat po polsku, bez stacka. */
export class WebGLFallback extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(error: Error): State {
    return { err: error.message || "Nie udało się uruchomić WebGL" };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Helioskop WebGL:", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.err) {
      return (
        <div className="flex h-full items-center justify-center p-6 text-center">
          <div className="max-w-sm">
            <p className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">Helioskop</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Silnik 3D nie wystartował. Odśwież podgląd albo włącz akcelerację grafiki (WebGL) w
              przeglądarce.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
