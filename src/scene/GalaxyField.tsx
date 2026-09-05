import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, type Group, Vector3 } from "three";
import {
  GALAXIES,
  PROXY_SYSTEMS,
  SGR_A,
  proxyWorld,
  type ProxySystem,
} from "../data/galaxies";
import { simClock } from "../lib/clock";
import { galaxyDiskTexture, glowTexture, softDiscTexture } from "../lib/proceduralTextures";
import { writePosition } from "../lib/positions";
import { useObservatory } from "../store/observatory";

function GalaxySprite({
  id,
  position,
  radius,
  tilt,
  color,
  onPick,
}: {
  id: string;
  position: [number, number, number];
  radius: number;
  tilt: number;
  color: string;
  onPick: (id: string) => void;
}) {
  const map = useMemo(() => galaxyDiskTexture(id, color), [id, color]);
  const world = useMemo(() => new Vector3(...position), [position]);
  const spin = useRef<Group>(null);

  useEffect(() => {
    writePosition(id, world);
  }, [id, world]);

  // Powolny dryf ramion — tanie, ożywia kadr Grupy Lokalnej.
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * 0.012;
  });

  return (
    <group position={position} rotation={[tilt, 0.35, 0.1]}>
      <group ref={spin}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onPick(id);
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <circleGeometry args={[radius, 56]} />
          <meshBasicMaterial map={map} transparent depthWrite={false} side={DoubleSide} toneMapped={false} />
        </mesh>
        <mesh>
          <circleGeometry args={[radius * 1.18, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={DoubleSide}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/** Mini-układ: gwiazda + 2–3 planety na orbitach (schemat). */
function ProxySystemMark({ sys, emphasized }: { sys: ProxySystem; emphasized: boolean }) {
  const group = useRef<Group>(null);
  const world = useMemo(() => new Vector3(...proxyWorld(sys)), [sys]);
  const glow = useMemo(() => glowTexture(), []);
  const disc = useMemo(() => softDiscTexture(), []);
  const select = useObservatory((s) => s.select);

  useEffect(() => {
    writePosition(sys.id, world);
  }, [sys.id, world]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = simClock.simDays * 0.035;
    for (let i = 0; i < sys.planets.length; i += 1) {
      const child = g.children[i + 2];
      if (!child) continue;
      const r = 2.1 + i * 1.55;
      const a = t / (i + 1.2);
      child.position.set(Math.cos(a) * r, Math.sin(a * 0.3) * 0.15, Math.sin(a) * r);
    }
  });

  const star = emphasized ? 2.4 : 1.35;

  return (
    <group
      ref={group}
      position={world}
      onClick={(e) => {
        e.stopPropagation();
        select(sys.id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh>
        <sphereGeometry args={[emphasized ? 0.55 : 0.32, 12, 10]} />
        <meshBasicMaterial color={sys.starColor} toneMapped={false} />
      </mesh>
      <sprite scale={[star, star, 1]}>
        <spriteMaterial
          map={glow}
          color={sys.starColor}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      {sys.planets.map((p) => (
        <mesh key={p.name}>
          <sphereGeometry args={[emphasized ? 0.22 : 0.12, 8, 6]} />
          <meshBasicMaterial color={p.color} toneMapped={false} />
        </mesh>
      ))}
      {emphasized &&
        sys.planets.map((_, i) => (
          <mesh key={`orb-${i}`} rotation={[1.2, 0, 0]}>
            <ringGeometry args={[2.05 + i * 1.55, 2.12 + i * 1.55, 48]} />
            <meshBasicMaterial
              map={disc}
              color="#c8d0dc"
              transparent
              opacity={0.28}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
    </group>
  );
}

/**
 * Grupa Lokalna: trzy jasne dyski + Sgr A* + przykładowe układy
 * przy zaznaczonej galaktyce.
 */
export function GalaxyField() {
  const select = useObservatory((s) => s.select);
  const selectedId = useObservatory((s) => s.selectedId);
  const closeup = selectedId === SGR_A.id;
  const sgr = useMemo(() => new Vector3(...SGR_A.position), []);
  const flare = useObservatory((s) => s.fx.sgr);

  useEffect(() => {
    writePosition(SGR_A.id, sgr);
    writePosition("solar-pin", new Vector3(...proxyWorld(PROXY_SYSTEMS[0])));
    writePosition("solar-home", new Vector3(...proxyWorld(PROXY_SYSTEMS[0])));
  }, [sgr]);

  const focusedGalaxy =
    selectedId && (selectedId === "milkyway" || selectedId === "andromeda" || selectedId === "triangulum")
      ? selectedId
      : PROXY_SYSTEMS.find((p) => p.id === selectedId)?.galaxyId;

  const systems = PROXY_SYSTEMS.filter((p) => {
    if (closeup) return false;
    if (!focusedGalaxy) return p.isHome;
    return p.galaxyId === focusedGalaxy;
  });

  return (
    <group>
      {GALAXIES.filter((g) => !(closeup && g.id === "milkyway")).map((g) => (
        <GalaxySprite
          key={g.id}
          id={g.id}
          position={g.position}
          radius={g.radius}
          tilt={g.tilt}
          color={g.color}
          onPick={select}
        />
      ))}
      {!closeup && (
        <>
          <mesh
            position={SGR_A.position}
            onClick={(e) => {
              e.stopPropagation();
              select(SGR_A.id);
            }}
          >
            <sphereGeometry args={[2.4, 16, 12]} />
            <meshBasicMaterial color="#111018" />
          </mesh>
          <mesh position={SGR_A.position} rotation={[1.15, 0.3, 0]}>
            <ringGeometry args={[3.2, 8.5, 64]} />
            <meshBasicMaterial
              color={flare > 0 ? "#ffc878" : "#ffb36a"}
              transparent
              opacity={0.6}
              side={DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      {systems.map((sys) => (
        <ProxySystemMark key={sys.id} sys={sys} emphasized={selectedId === sys.id || selectedId === sys.galaxyId} />
      ))}
    </group>
  );
}
