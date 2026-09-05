import { ObservatoryCanvas } from "./scene/ObservatoryCanvas";
import { Hud } from "./ui/Hud";
import { IntroOverlay } from "./ui/IntroOverlay";
import { SeriousEventModal } from "./ui/SeriousEventModal";
import { WebGLFallback } from "./ui/WebGLFallback";

/** Korzeń: pełnoekranowe płótno + HUD + intro + poważne wydarzenia. */
export function App() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-void text-fg">
      <WebGLFallback>
        <ObservatoryCanvas />
      </WebGLFallback>
      <Hud />
      <SeriousEventModal />
      <IntroOverlay />
    </div>
  );
}
