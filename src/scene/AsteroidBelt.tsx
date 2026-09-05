import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { auToScene } from "../lib/kepler";
import { simClock } from "../lib/clock";

/**
 * Lekki pas planetoid (Mars–Jowisz). 180 instancji — tanie, ożywia przegląd.
 */
export function AsteroidBelt() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const inner = auToScene(2.15);
  const outer = auToScene(3.3);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < 180; i += 1) {
      const r = inner + Math.random() * (outer - inner);
      const a = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.55;
      dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      dummy.scale.setScalar(0.012 + Math.random() * 0.03);
      dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [dummy, inner, outer]);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.y = (simClock.simDays / (4.6 * 365)) * Math.PI * 2;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 180]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#7a7468" roughness={0.95} metalness={0.05} />
    </instancedMesh>
  );
}
