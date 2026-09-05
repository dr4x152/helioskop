import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Sprite } from "three";
import { glowTexture } from "../lib/proceduralTextures";
import { useObservatory } from "../store/observatory";

/** Krótki błysk na Słońcu — hipotetyczna pobliska supernowa. */
export function SupernovaFlash() {
  const token = useObservatory((s) => s.supernovaToken);
  const sprite = useRef<Sprite>(null);
  const age = useRef(99);

  useEffect(() => {
    if (token > 0) age.current = 0;
  }, [token]);

  const map = glowTexture();

  useFrame((_, dt) => {
    age.current += dt;
    const s = sprite.current;
    if (!s) return;
    const live = age.current < 2.4;
    s.visible = live;
    if (!live) return;
    const t = age.current / 2.4;
    const k = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    s.scale.setScalar(8 + k * 90);
    const mat = s.material;
    mat.opacity = Math.max(0, k * 0.85);
  });

  return (
    <sprite ref={sprite} visible={false} position={[0, 0, 0]}>
      <spriteMaterial
        map={map}
        color="#fff4d8"
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}
