import { DoubleSide } from "three";
import { ringTexture } from "../lib/proceduralTextures";
import { useMemo } from "react";

interface PlanetRingsProps {
  radius: number;
  inner: number;
  outer: number;
  opacity: number;
  color: string;
}

/** Pierścienie Saturna / Urana — płaska obręcz w płaszczyźnie XZ. */
export function PlanetRings({ radius, inner, outer, opacity, color }: PlanetRingsProps) {
  // Tekstura generowana raz i współdzielona.
  const map = useMemo(() => ringTexture(), []);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
      <ringGeometry args={[radius * inner, radius * outer, 96]} />
      <meshBasicMaterial
        map={map}
        color={color}
        transparent
        opacity={opacity}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
