import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Sprite } from "three";
import { yearsFromToday } from "../lib/clock";
import { glowTexture } from "../lib/proceduralTextures";
import { sunPhase } from "../lib/solarPhase";

interface SunGlowProps {
  radius: number;
}

/** Pulsująca poświata — kolor i skala zależą od fazy ewolucji Słońca. */
export function SunGlow({ radius }: SunGlowProps) {
  const inner = useRef<Sprite>(null);
  const outer = useRef<Sprite>(null);
  const map = glowTexture();

  useFrame(() => {
    const phase = sunPhase(yearsFromToday());
    const pulse = 1 + Math.sin(performance.now() * 0.00055) * 0.06;
    const mul = phase.glowMul * phase.scale;
    inner.current?.scale.setScalar(radius * 5.8 * pulse * mul);
    outer.current?.scale.setScalar(radius * 9.4 * (0.96 + pulse * 0.04) * mul);
    const im = inner.current?.material;
    const om = outer.current?.material;
    if (im) {
      im.color.set(phase.glow);
      im.opacity = phase.id === "whitedwarf" ? 0.28 : 0.62;
    }
    if (om) {
      om.color.set(phase.glow);
      om.opacity = phase.id === "whitedwarf" ? 0.1 : 0.22;
    }
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
