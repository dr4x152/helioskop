import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, Vector3 } from "three";
import { DETAILED_MOONS, type MoonDef } from "../data/moons";
import { simClock } from "../lib/clock";
import { writePosition } from "../lib/positions";
import { moonTexture } from "../lib/proceduralTextures";
import { useSafeTexture } from "./useSafeTexture";

interface MoonBodyProps {
  def: MoonDef;
  visRef: MutableRefObject<boolean>;
  onPick: (id: string) => void;
}

const _world = new Vector3();

/** Księżyc na okręgu wokół rodzica (grupa rodzica jest już w świecie). */
export function MoonBody({ def, visRef, onPick }: MoonBodyProps) {
  const group = useRef<Group>(null);
  const fileMap = useSafeTexture(def.texture);
  const fallback = useMemo(
    () => (DETAILED_MOONS.has(def.id) && !def.texture ? moonTexture(def.id, def.color) : null),
    [def.id, def.color, def.texture],
  );
  const map = fileMap ?? fallback;

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const show = visRef.current;
    g.visible = show;
    if (!show) return;
    const sign = def.retrograde ? -1 : 1;
    const angle = (simClock.simDays / def.periodDays) * Math.PI * 2 * sign;
    g.position.set(Math.cos(angle) * def.orbitRadius, 0, Math.sin(angle) * def.orbitRadius);
    g.getWorldPosition(_world);
    writePosition(def.id, _world);
  });

  return (
    <group ref={group} visible={false}>
      <mesh
        userData={{ pickId: def.id }}
        onClick={(ev) => {
          ev.stopPropagation();
          onPick(def.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[def.radius, 24, 18]} />
        <meshStandardMaterial
          map={map}
          color={map ? "#ffffff" : def.color}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>
      {/* Większy hitbox — Fobos nie wymaga pikselowej precyzji. */}
      <mesh userData={{ pickId: def.id }}>
        <sphereGeometry args={[Math.max(def.radius * 3.2, 0.16), 10, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

interface MoonOrbitProps {
  radius: number;
  visRef: MutableRefObject<boolean>;
}

export function MoonOrbit({ radius, visRef }: MoonOrbitProps) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = visRef.current;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.992, radius * 1.008, 64]} />
        <meshBasicMaterial color="#9aa4b0" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </group>
  );
}
