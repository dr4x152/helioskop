import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Sprite } from "three";
import { glowTexture } from "../lib/proceduralTextures";

interface SunGlowProps {
  radius: number;
}

/** Pulsująca poświata — dwa sprite'y, żeby tarcza nie była „gołą kulą”. */
export function SunGlow({ radius }: SunGlowProps) {
  const inner = useRef<Sprite>(null);
  const outer = useRef<Sprite>(null);
  const map = glowTexture();

  useFrame(() => {
    const pulse = 1 + Math.sin(performance.now() * 0.00055) * 0.06;
    inner.current?.scale.setScalar(radius * 5.8 * pulse);
    outer.current?.scale.setScalar(radius * 9.4 * (0.96 + pulse * 0.04));
  });

  return (
    <>
      <sprite ref={inner} scale={[radius * 5.8, radius * 5.8, 1]}>
        <spriteMaterial
          map={map}
          color="#ffd7a0"
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
      <sprite ref={outer} scale={[radius * 9.4, radius * 9.4, 1]}>
        <spriteMaterial
          map={map}
          color="#ffb978"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </sprite>
    </>
  );
}
