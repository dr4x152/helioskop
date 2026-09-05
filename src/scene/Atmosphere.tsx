import { BackSide } from "three";

interface AtmosphereProps {
  radius: number;
  color: string;
  scale: number;
  opacity: number;
}

/** Miękka otoczka — BackSide, żeby rim był widoczny na krawędzi tarczy. */
export function Atmosphere({ radius, color, scale, opacity }: AtmosphereProps) {
  return (
    <mesh scale={scale} renderOrder={1}>
      <sphereGeometry args={[radius, 32, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
