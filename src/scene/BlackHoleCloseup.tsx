import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, type Mesh } from "three";
import { SGR_A } from "../data/galaxies";

/**
 * Zbliżenie Sgr A* — ciemna sfera + wirujący dysk (schemat, nie GR).
 * Osobna grupa, bez billboardu Drogi Mlecznej w kadrze.
 */
export function BlackHoleCloseup() {
  const disk = useRef<Mesh>(null);
  const hot = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.28;
    if (hot.current) hot.current.rotation.z -= dt * 0.45;
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
    </group>
  );
}
