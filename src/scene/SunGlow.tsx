import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Sprite } from "three";
import { yearsFromToday } from "../lib/clock";
import { glowTexture } from "../lib/proceduralTextures";
import { sunPhase } from "../lib/solarPhase";
import { useObservatory } from "../store/observatory";

interface SunGlowProps {
  radius: number;
}

/** Pulsująca korona + krótki rozbłysk przy tokenie flare/CME. */
export function SunGlow({ radius }: SunGlowProps) {
  const inner = useRef<Sprite>(null);
  const outer = useRef<Sprite>(null);
  const flare = useRef<Sprite>(null);
  const lastFlare = useRef(0);
  const flareAge = useRef(99);
  const map = glowTexture();

  useFrame((_, dt) => {
    const phase = sunPhase(yearsFromToday());
    const tok = useObservatory.getState().fx.flare;
    if (tok !== lastFlare.current) {
      lastFlare.current = tok;
      if (tok > 0) flareAge.current = 0;
    }
    flareAge.current += dt;
    const shimmer = 1 + Math.sin(performance.now() * 0.0018) * 0.045 + Math.sin(performance.now() * 0.0041) * 0.025;
    const pulse = shimmer;
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
    const fl = flare.current;
    if (fl) {
      const live = flareAge.current < 0.85;
      fl.visible = live;
      if (live) {
        const t = flareAge.current / 0.85;
        fl.scale.setScalar(radius * (8 + t * 14) * phase.scale);
        fl.material.opacity = Math.max(0, 0.75 * (1 - t));
      }
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
      <sprite ref={flare} visible={false} scale={[radius * 8, radius * 8, 1]}>
        <spriteMaterial
          map={map}
          color="#fff1c8"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </>
  );
}
