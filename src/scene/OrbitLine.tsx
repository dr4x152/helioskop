import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { type BodyDef } from "../data/bodies";
import { orbitPoints } from "../lib/kepler";
import { useObservatory } from "../store/observatory";

interface OrbitLineProps {
  def: BodyDef;
}

/** Eliptyczna orbita Keplera. Pluton — przerywana i ciemniejsza. */
export function OrbitLine({ def }: OrbitLineProps) {
  const selectedId = useObservatory((s) => s.selectedId);
  const points = useMemo(() => orbitPoints(def, 140), [def]);
  const selected = selectedId === def.id;
  const dwarf = def.kind === "dwarf";

  return (
    <Line
      points={points}
      color={dwarf ? "#9aa4b0" : "#8b939e"}
      lineWidth={selected ? 1.45 : dwarf ? 1 : 0.85}
      transparent
      opacity={selected ? 0.55 : dwarf ? 0.3 : 0.22}
      dashed={dwarf}
      dashSize={1.8}
      gapSize={1.2}
    />
  );
}
