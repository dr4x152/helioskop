import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { type Group, type MeshBasicMaterial, Vector3 } from "three";
import { type BodyDef } from "../data/bodies";
import { MOONS_BY_PARENT } from "../data/moons";
import { simClock, yearsFromToday } from "../lib/clock";
import { keplerPosition } from "../lib/kepler";
import { readPosition, writePosition } from "../lib/positions";
import { jupiterTexture, plutoTexture } from "../lib/proceduralTextures";
import { sunPhase } from "../lib/solarPhase";
import { useObservatory } from "../store/observatory";
import { Atmosphere } from "./Atmosphere";
import { MoonBody, MoonOrbit } from "./MoonBody";
import { PlanetRings } from "./PlanetRings";
import { SunGlow } from "./SunGlow";
import { useSafeTexture } from "./useSafeTexture";

interface CelestialBodyProps {
  def: BodyDef;
  onPick: (id: string) => void;
}

const _scratch = new Vector3();
const _cam = new Vector3();

/**
 * Słońce / planeta / Pluton: Kepler → pozycja, obrót wokół osi Y,
 * opcjonalnie chmury, atmosfera, pierścienie i księżyce.
 */
export function CelestialBody({ def, onPick }: CelestialBodyProps) {
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const clouds = useRef<Group>(null);
  const sunMat = useRef<MeshBasicMaterial>(null);
  const isSun = def.id === "sun";
  const segs = def.radius > 0.7 ? 48 : 32;

  const fileMap = useSafeTexture(def.texture);
  const cloudMap = useSafeTexture(def.clouds);
  const procedural = useMemo(() => {
    if (def.id === "jupiter") return jupiterTexture();
    if (def.id === "pluto") return plutoTexture();
    return null;
  }, [def.id]);
  const map = fileMap ?? procedural;

  useFrame(() => {
    const g = root.current;
    if (!g) return;
    const date = simClock.getDate();
    const phase = sunPhase(yearsFromToday());
    if (isSun) {
      g.position.set(0, 0, 0);
      g.scale.setScalar(phase.scale);
      writePosition("sun", g.position);
      if (spin.current) {
        spin.current.rotation.y = (simClock.simDays / def.periodDays) * Math.PI * 2;
      }
      if (sunMat.current) sunMat.current.color.set(phase.tint);
      return;
    }
    // Czerwony olbrzym / karzeł: Merkury i Wenus znikają z kadru.
    if (phase.swallowInner && (def.id === "mercury" || def.id === "venus")) {
      g.visible = false;
      return;
    }
    g.visible = true;
    keplerPosition(def, date, _scratch);
    g.position.copy(_scratch);
    writePosition(def.id, g.position);
    if (spin.current) {
      const hours = Math.abs(def.dayHours) || 24;
      const sign = def.dayHours < 0 ? -1 : 1;
      spin.current.rotation.y = (simClock.simDays * 24 * sign * Math.PI * 2) / hours;
    }
    if (clouds.current) {
      clouds.current.rotation.y = (spin.current?.rotation.y ?? 0) * 1.15;
    }
  });

  return (
    <group ref={root}>
      <group ref={spin}>
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
          <sphereGeometry args={[def.radius, segs, segs]} />
          {isSun ? (
            <meshBasicMaterial ref={sunMat} map={map} color={map ? "#ffffff" : def.color} toneMapped={false} />
          ) : def.id === "uranus" || def.id === "neptune" ? (
            <meshStandardMaterial map={map} color={map ? "#ffffff" : def.color} roughness={0.38} metalness={0.18} />
          ) : (
            <meshStandardMaterial
              map={map}
              color={map ? "#ffffff" : def.color}
              roughness={def.roughness}
              metalness={def.metalness}
            />
          )}
        </mesh>
        {/* Większy hitbox — Merkury nie znika pod kursorem. */}
        <mesh userData={{ pickId: def.id }}>
          <sphereGeometry args={[isSun ? def.radius * 1.15 : Math.max(def.radius * 3.6, 0.85), 12, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {cloudMap && (
          <group ref={clouds} scale={1.018}>
            <mesh>
              <sphereGeometry args={[def.radius, 32, 24]} />
              <meshStandardMaterial
                map={cloudMap}
                transparent
                opacity={0.52}
                depthWrite={false}
                roughness={1}
                metalness={0}
              />
            </mesh>
          </group>
        )}
      </group>
      {def.atmosphere && !isSun && (
        <Atmosphere
          radius={def.radius}
          color={def.atmosphere.color}
          scale={def.atmosphere.scale}
          opacity={def.atmosphere.opacity}
        />
      )}
      {def.rings && (
        <PlanetRings
          radius={def.radius}
          inner={def.rings.inner}
          outer={def.rings.outer}
          opacity={def.rings.opacity}
          color={def.rings.color}
        />
      )}
      {isSun && <SunGlow radius={def.radius} />}
      <MoonFamily parentId={def.id} onPick={onPick} />
    </group>
  );
}

/**
 * Księżyce rodzica: widać je, gdy włączony przełącznik
 * i (zbliżenie LUB rodzic/księżyc zaznaczony).
 */
function MoonFamily({ parentId, onPick }: { parentId: string; onPick: (id: string) => void }) {
  const moons = MOONS_BY_PARENT[parentId];
  const showMoons = useObservatory((s) => s.showMoons);
  const selectedId = useObservatory((s) => s.selectedId);
  const camera = useThree((s) => s.camera);
  const vis = useRef(false);

  useFrame(() => {
    if (!showMoons || !moons) {
      vis.current = false;
      return;
    }
    const p = readPosition(parentId);
    if (!p) {
      vis.current = false;
      return;
    }
    camera.getWorldPosition(_cam);
    const dist = _cam.distanceTo(p);
    const related = selectedId === parentId || moons.some((m) => m.id === selectedId);
    vis.current = dist < 22 || related;
  });

  if (!moons) return null;

  return (
    <>
      {moons.map((moon) => (
        <group key={moon.id}>
          <MoonOrbit radius={moon.orbitRadius} visRef={vis} />
          <MoonBody def={moon} visRef={vis} onPick={onPick} />
        </group>
      ))}
    </>
  );
}
