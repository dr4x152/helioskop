import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, type Group, type Sprite, Vector3 } from "three";
import { type CometDef } from "../data/comets";
import { simClock } from "../lib/clock";
import { keplerPosition } from "../lib/kepler";
import { glowTexture, softDiscTexture } from "../lib/proceduralTextures";
import { writePosition } from "../lib/positions";
import { useObservatory } from "../store/observatory";

interface CometBodyProps {
  def: CometDef;
  onPick: (id: string) => void;
}

const _pos = new Vector3();
const _away = new Vector3();
const PUFFS = 9;

/**
 * Kometa: małe jądro + koma + ogon z miękkich krążków (zawsze do kamery).
 * Płaszczyzna-wstęga wyglądała jak prostokąt — Encke „dziwnie”.
 */
export function CometBody({ def, onPick }: CometBodyProps) {
  const group = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const coma = useRef<Sprite>(null);
  const color = useMemo(() => new Color(def.color), [def.color]);
  const glow = useMemo(() => glowTexture(), []);
  const disc = useMemo(() => softDiscTexture(), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const state = keplerPosition(def, simClock.getDate(), _pos);
    g.position.copy(_pos);
    writePosition(def.id, g.position);

    const len = _pos.length() || 1;
    _away.copy(_pos).multiplyScalar(1 / len);

    const peri = def.au * (1 - def.eccentricity);
    const near = Math.min(1.4, Math.max(0.32, (peri * 1.85) / Math.max(state.au, peri)));
    const store = useObservatory.getState();
    const burst = store.fx.cometBurstId === def.id ? 1.65 : 1;
    const selected = store.selectedId === def.id ? 1.15 : 1;
    const tailLen = def.tailLength * near * burst * selected;
    const width = (def.nucleus * 5 + 0.16) * (0.75 + near * 0.45);

    if (coma.current) {
      const c = def.nucleus * (11 + near * 5) * burst;
      coma.current.scale.set(c, c, 1);
    }

    const kids = tail.current?.children;
    if (!kids) return;
    for (let i = 0; i < kids.length; i += 1) {
      const spr = kids[i] as Sprite;
      const t = i / Math.max(1, kids.length - 1);
      const fade = (0.12 + t * 0.88) * tailLen;
      spr.position.set(_away.x * fade, _away.y * fade, _away.z * fade);
      const s = width * (1.35 - t * 0.85) * (i === 0 ? 1.15 : 1);
      spr.scale.set(s * 1.8, s, 1);
      spr.material.opacity = (0.55 - t * 0.42) * (0.65 + near * 0.4);
    }
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
        <sphereGeometry args={[def.nucleus, 14, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onPick(def.id);
        }}
      >
        <sphereGeometry args={[Math.max(def.nucleus * 7, 0.4), 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <sprite ref={coma}>
        <spriteMaterial
          map={glow}
          color={color}
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <group ref={tail}>
        {Array.from({ length: PUFFS }, (_, i) => (
          <sprite key={i}>
            <spriteMaterial
              map={i < 2 ? glow : disc}
              color={def.color}
              transparent
              opacity={0.4}
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
        ))}
      </group>
    </group>
  );
}
