import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group, type Sprite, Vector3 } from "three";
import { readPosition } from "../lib/positions";
import { glowTexture, softDiscTexture } from "../lib/proceduralTextures";
import { useObservatory } from "../store/observatory";

/** Spadające gwiazdy + stożek CME + pulsy planet — tanie sprite'y. */
export function SceneFx() {
  const viewScale = useObservatory((s) => s.viewScale);
  if (viewScale !== "system") return <ShootingStars count={4} spread={900} />;
  return (
    <group>
      <ShootingStars count={7} spread={80} />
      <CmeBurst />
      <PlanetPulse bodyId="earth" token="aurora" color="#6cffb0" />
      <PlanetPulse bodyId="mars" token="mars" color="#ff7a3a" />
      <PlanetPulse bodyId="jupiter" token="jupiter" color="#ff5a2a" />
      <PlanetPulse bodyId="saturn" token="saturn" color="#ffe6b0" />
    </group>
  );
}

function ShootingStars({ count, spread }: { count: number; spread: number }) {
  const group = useRef<Group>(null);
  const disc = useMemo(() => softDiscTexture(), []);
  const streaks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        age: 10 + i,
        life: 0.7,
        from: new Vector3(),
        vel: new Vector3(),
      })),
    [count],
  );

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const playing = useObservatory.getState().started && !useObservatory.getState().paused;
    const shower = useObservatory.getState().fx.meteor;
    for (let i = 0; i < streaks.length; i += 1) {
      const s = streaks[i];
      s.age += dt;
      const child = g.children[i] as Sprite | undefined;
      if (!child) continue;
      if (s.age > s.life) {
        if (!playing && shower === 0) {
          child.visible = false;
          continue;
        }
        // Nowy bolid — częściej przy tokenie meteor.
        if (Math.random() > (shower > 0 ? 0.15 : 0.55)) {
          child.visible = false;
          s.age = s.life * Math.random();
          continue;
        }
        s.age = 0;
        s.life = 0.45 + Math.random() * 0.5;
        s.from.set((Math.random() - 0.5) * spread, 8 + Math.random() * 22, (Math.random() - 0.5) * spread);
        s.vel.set(-8 - Math.random() * 18, -4 - Math.random() * 8, 2 - Math.random() * 6);
        child.visible = true;
      }
      const t = s.age / s.life;
      child.position.copy(s.from).addScaledVector(s.vel, t);
      const mat = child.material;
      mat.opacity = t < 0.2 ? t * 4 : 1 - (t - 0.2) / 0.8;
      child.scale.setScalar(0.35 + (1 - t) * 0.55);
    }
  });

  return (
    <group ref={group}>
      {streaks.map((_, i) => (
        <sprite key={i} visible={false}>
          <spriteMaterial
            map={disc}
            color="#fff4d8"
            transparent
            opacity={0}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function CmeBurst() {
  const sprite = useRef<Sprite>(null);
  const age = useRef(99);
  const last = useRef(0);
  const map = useMemo(() => glowTexture(), []);

  useFrame((_, dt) => {
    const tok = useObservatory.getState().fx.cme;
    if (tok !== last.current) {
      last.current = tok;
      if (tok > 0) age.current = 0;
    }
    age.current += dt;
    const s = sprite.current;
    if (!s) return;
    const live = age.current < 1.6;
    s.visible = live;
    if (!live) return;
    const t = age.current / 1.6;
    s.scale.setScalar(6 + t * 55);
    s.material.opacity = Math.max(0, 0.55 * (1 - t));
  });

  return (
    <sprite ref={sprite} visible={false} position={[0, 0, 0]}>
      <spriteMaterial
        map={map}
        color="#ffb060"
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

function PlanetPulse({
  bodyId,
  token,
  color,
}: {
  bodyId: string;
  token: "aurora" | "mars" | "jupiter" | "saturn";
  color: string;
}) {
  const spr = useRef<Sprite>(null);
  const age = useRef(99);
  const last = useRef(0);
  const map = useMemo(() => glowTexture(), []);

  useFrame((_, dt) => {
    const tok = useObservatory.getState().fx[token];
    if (tok !== last.current) {
      last.current = tok;
      if (tok > 0) age.current = 0;
    }
    age.current += dt;
    const s = spr.current;
    if (!s) return;
    const p = readPosition(bodyId);
    if (!p) {
      s.visible = false;
      return;
    }
    s.position.copy(p);
    const live = age.current < 1.8;
    s.visible = live;
    if (!live) return;
    const t = age.current / 1.8;
    s.scale.setScalar(1.6 + t * 7);
    s.material.opacity = Math.max(0, 0.7 * (1 - t));
  });

  return (
    <sprite ref={spr} visible={false}>
      <spriteMaterial
        map={map}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}
