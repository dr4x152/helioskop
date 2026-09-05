import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, type Mesh } from "three";
import { SGR_A } from "../data/galaxies";

/** Zbliżenie Sgr A* — ciemna sfera + wirujący dysk (schemat). */
export function BlackHoleCloseup() {
  const disk = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.35;
  });

  return (
    <group position={SGR_A.position}>
      <mesh>
        <sphereGeometry args={[2.4, 24, 18]} />
        <meshBasicMaterial color="#05050a" />
      </mesh>
      <mesh ref={disk} rotation={[1.2, 0.2, 0]}>
        <ringGeometry args={[3.1, 9.5, 80]} />
        <meshBasicMaterial
          color="#ff9a4a"
          transparent
          opacity={0.7}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[1.2, 0.2, 0.4]}>
        <ringGeometry args={[4.8, 6.2, 64]} />
        <meshBasicMaterial color="#ffe6b0" transparent opacity={0.35} side={DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
