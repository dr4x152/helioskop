import { ObservatoryCanvas } from "./scene/ObservatoryCanvas";
import { Hud } from "./ui/Hud";
import { IntroOverlay } from "./ui/IntroOverlay";
import { WebGLFallback } from "./ui/WebGLFallback";

/** Korzeń: pełnoekranowe płótno + HUD + intro. */
export function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-void text-fg">
      <WebGLFallback>
        <ObservatoryCanvas />
      </WebGLFallback>
      <Hud />
      <IntroOverlay />
    </div>
  );
}
