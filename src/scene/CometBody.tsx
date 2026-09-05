import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  type Group,
  Line as ThreeLine,
  LineBasicMaterial,
  type Points,
  Vector3,
} from "three";
import { type CometDef } from "../data/comets";
import { simClock } from "../lib/clock";
import { keplerPosition } from "../lib/kepler";
import { writePosition } from "../lib/positions";

interface CometBodyProps {
  def: CometDef;
  onPick: (id: string) => void;
}

const _pos = new Vector3();
const TAIL_LINE = 22;
const TAIL_DUST = 28;

/**
 * Kometa: jądro + ogon (linia jonowa + chmura pyłu).
 * Ogon zawsze „od Słońca” — wektor radialny od początku układu.
 */
export function CometBody({ def, onPick }: CometBodyProps) {
  const group = useRef<Group>(null);
  const dust = useRef<Points>(null);
  const color = useMemo(() => new Color(def.color), [def.color]);

  // Geometrie mutowane w klatce — drei <Line> nie odświeża tablicy Vector3.
  const lineGeom = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(TAIL_LINE * 3), 3));
    return g;
  }, []);
  const dustGeom = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(TAIL_DUST * 3), 3));
    return g;
  }, []);
  // `line` w JSX koliduje z SVG — budujemy THREE.Line ręcznie.
  const ionTail = useMemo(
    () =>
      new ThreeLine(
        lineGeom,
        new LineBasicMaterial({ color: "#d8eeff", transparent: true, opacity: 0.72, depthWrite: false }),
      ),
    [lineGeom],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    keplerPosition(def, simClock.getDate(), _pos);
    g.position.copy(_pos);
    writePosition(def.id, g.position);

    const len = _pos.length() || 1;
    const ax = _pos.x / len;
    const ay = _pos.y / len;
    const az = _pos.z / len;

    const line = lineGeom.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < TAIL_LINE; i += 1) {
      const t = i / (TAIL_LINE - 1);
      const fade = t * def.tailLength;
      line.setXYZ(i, ax * fade, ay * fade + Math.sin(t * 5) * 0.06, az * fade);
    }
    line.needsUpdate = true;
    lineGeom.computeBoundingSphere();

    const pts = dustGeom.getAttribute("position") as BufferAttribute;
    for (let i = 0; i < TAIL_DUST; i += 1) {
      const t = (i + 0.35) / TAIL_DUST;
      const fade = t * def.tailLength * 0.92;
      const wobble = Math.sin(i * 1.7 + t * 8) * (0.12 + t * 0.35);
      const side = Math.cos(i * 2.3) * (0.1 + t * 0.28);
      pts.setXYZ(i, ax * fade + side, ay * fade + wobble, az * fade - side * 0.4);
    }
    pts.needsUpdate = true;
    dustGeom.computeBoundingSphere();
  });

  return (
    <group ref={group}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick(def.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Większy hitbox — jądro jest małe. */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick(def.id);
        }}
      >
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <sprite scale={[0.85, 0.85, 1]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.6}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <primitive object={ionTail} />
      <points ref={dust} geometry={dustGeom}>
        <pointsMaterial
          color={def.color}
          size={0.28}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
