import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { orbitPoints, type OrbitalElements } from "../lib/kepler";
import { useObservatory } from "../store/observatory";

interface OrbitLineProps {
  def: OrbitalElements & { id: string; kind?: string };
}

/** Eliptyczna orbita Keplera. Pluton i komety — przerywane. */
export function OrbitLine({ def }: OrbitLineProps) {
  const selectedId = useObservatory((s) => s.selectedId);
  const points = useMemo(() => orbitPoints(def, 140), [def]);
  const selected = selectedId === def.id;
  const dashed = def.kind === "dwarf" || def.kind === undefined;

  return (
    <Line
      points={points}
      color={dashed ? "#9aa4b0" : "#8b939e"}
      lineWidth={selected ? 1.45 : dashed ? 1 : 0.85}
      transparent
      opacity={selected ? 0.55 : dashed ? 0.3 : 0.22}
      dashed={dashed}
      dashSize={1.8}
      gapSize={1.2}
    />
  );
}
