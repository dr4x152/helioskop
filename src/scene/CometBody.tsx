import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  type Group,
  type Mesh,
  type Sprite,
  Vector3,
} from "three";
import { type CometDef } from "../data/comets";
import { simClock } from "../lib/clock";
import { keplerPosition } from "../lib/kepler";
import { cometTailTexture, glowTexture, softDiscTexture } from "../lib/proceduralTextures";
import { writePosition } from "../lib/positions";
import { useObservatory } from "../store/observatory";

interface CometBodyProps {
  def: CometDef;
  onPick: (id: string) => void;
}

const _pos = new Vector3();
const _away = new Vector3();
const _up = new Vector3(0, 1, 0);

/**
 * Kometa: małe jądro + miękka koma + wstęga ogona przeciwsłoneczna.
 * Bez kwadratowych Points — to psuło Encke (wyglądał jak chmura pikseli).
 */
export function CometBody({ def, onPick }: CometBodyProps) {
  const group = useRef<Group>(null);
  const dust = useRef<Group>(null);
  const tail = useRef<Mesh>(null);
  const ion = useRef<Mesh>(null);
  const coma = useRef<Sprite>(null);
  const color = useMemo(() => new Color(def.color), [def.color]);
  const tailMap = useMemo(() => cometTailTexture(), []);
  const disc = useMemo(() => softDiscTexture(), []);
  const glow = useMemo(() => glowTexture(), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const state = keplerPosition(def, simClock.getDate(), _pos);
    g.position.copy(_pos);
    writePosition(def.id, g.position);

    const len = _pos.length() || 1;
    _away.copy(_pos).multiplyScalar(1 / len);

    // Bliżej Słońca ogon dłuższy i jaśniejszy; wybuch pyłu z silnika ambient.
    const peri = def.au * (1 - def.eccentricity);
    const near = Math.min(1.35, Math.max(0.28, (peri * 1.8) / Math.max(state.au, peri)));
    const store = useObservatory.getState();
    const burst = store.fx.cometBurstId === def.id ? 1.7 : 1;
    const selected = store.selectedId === def.id ? 1.12 : 1;
    const tailLen = def.tailLength * near * burst * selected;
    const width = (def.nucleus * 4.2 + 0.14) * (0.7 + near * 0.5);

    if (tail.current) {
      tail.current.quaternion.setFromUnitVectors(_up, _away);
      tail.current.position.copy(_away).multiplyScalar(tailLen * 0.52);
      tail.current.scale.set(width, tailLen, 1);
    }
    if (ion.current) {
      ion.current.quaternion.setFromUnitVectors(_up, _away);
      ion.current.position.copy(_away).multiplyScalar(tailLen * 0.62);
      ion.current.scale.set(width * 0.38, tailLen * 1.12, 1);
    }
    if (coma.current) {
      const c = def.nucleus * (9 + near * 6) * burst;
      coma.current.scale.set(c, c, 1);
    }
    if (dust.current) {
      // Kilka miękkich krążków wzdłuż ogona — nie Points (kwadraty).
      const children = dust.current.children;
      for (let i = 0; i < children.length; i += 1) {
        const spr = children[i] as Sprite;
        const t = (i + 0.4) / children.length;
        const fade = t * tailLen;
        spr.position.set(
          _away.x * fade,
          _away.y * fade + Math.sin(i * 2.1 + t * 3) * width * 0.18,
          _away.z * fade,
        );
        const s = width * (1.15 - t * 0.7);
        spr.scale.set(s, s, 1);
        const mat = spr.material;
        mat.opacity = 0.22 * (1 - t) * (0.7 + near * 0.4);
      }
    }
  });

  const dustCount = 7;

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
        <sphereGeometry args={[Math.max(def.nucleus * 6, 0.35), 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <sprite ref={coma} scale={[def.nucleus * 10, def.nucleus * 10, 1]}>
        <spriteMaterial
          map={glow}
          color={color}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <mesh ref={tail}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={tailMap}
          color={def.color}
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ion}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={tailMap}
          color="#cfe8ff"
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <group ref={dust}>
        {Array.from({ length: dustCount }, (_, i) => (
          <sprite key={i}>
            <spriteMaterial
              map={disc}
              color={def.color}
              transparent
              opacity={0.2}
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
