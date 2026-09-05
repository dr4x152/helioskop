import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, type Mesh, type Sprite } from "three";
import { SGR_A } from "../data/galaxies";
import { glowTexture } from "../lib/proceduralTextures";
import { useObservatory } from "../store/observatory";

/**
 * Zbliżenie Sgr A* — dysk + para dżetów (schemat).
 * Token fx.sgr jaśni dżety.
 */
export function BlackHoleCloseup() {
  const disk = useRef<Mesh>(null);
  const hot = useRef<Mesh>(null);
  const jetA = useRef<Sprite>(null);
  const jetB = useRef<Sprite>(null);
  const last = useRef(0);
  const flareAge = useRef(99);
  const map = glowTexture();

  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.28;
    if (hot.current) hot.current.rotation.z -= dt * 0.45;
    const tok = useObservatory.getState().fx.sgr;
    if (tok !== last.current) {
      last.current = tok;
      if (tok > 0) flareAge.current = 0;
    }
    flareAge.current += dt;
    const pulse = 0.55 + Math.sin(performance.now() * 0.003) * 0.12;
    const burst = flareAge.current < 1.2 ? 1 + (1 - flareAge.current / 1.2) * 1.4 : 1;
    for (const jet of [jetA.current, jetB.current]) {
      if (!jet) continue;
      jet.scale.set(3.2 * burst, 14 * pulse * burst, 1);
      jet.material.opacity = 0.28 * pulse * burst;
    }
  });

  return (
    <group position={SGR_A.position}>
      <mesh>
        <sphereGeometry args={[2.35, 28, 20]} />
        <meshBasicMaterial color="#020208" />
      </mesh>
      <mesh ref={disk} rotation={[1.22, 0.18, 0]}>
        <ringGeometry args={[3.05, 10.2, 96]} />
        <meshBasicMaterial
          color="#ff7a28"
          transparent
          opacity={0.82}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={hot} rotation={[1.22, 0.18, 0.5]}>
        <ringGeometry args={[3.2, 5.4, 80]} />
        <meshBasicMaterial
          color="#ffe7b0"
          transparent
          opacity={0.55}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <sprite ref={jetA} position={[0, 9, 0]} scale={[3.2, 14, 1]}>
        <spriteMaterial
          map={map}
          color="#9ad0ff"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <sprite ref={jetB} position={[0, -9, 0]} scale={[3.2, 14, 1]}>
        <spriteMaterial
          map={map}
          color="#9ad0ff"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}
