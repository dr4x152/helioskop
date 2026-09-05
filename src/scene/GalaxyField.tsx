import { useEffect, useMemo } from "react";
import { DoubleSide, Vector3 } from "three";
import { GALAXIES, SGR_A, SOLAR_PIN } from "../data/galaxies";
import { galaxyDiskTexture } from "../lib/proceduralTextures";
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

  useEffect(() => {
    writePosition(id, world);
  }, [id, world]);

  return (
    <mesh
      position={position}
      rotation={[tilt, 0.4, 0.15]}
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
      <circleGeometry args={[radius, 48]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} side={DoubleSide} toneMapped={false} />
    </mesh>
  );
}

/** Drogę Mleczną, M31, M33 + znacznik Sgr A* i pinezkę Słońca. */
export function GalaxyField() {
  const select = useObservatory((s) => s.select);
  const closeup = useObservatory((s) => s.selectedId === SGR_A.id);
  const sgr = useMemo(() => new Vector3(...SGR_A.position), []);
  const pin = useMemo(() => new Vector3(...SOLAR_PIN), []);

  useEffect(() => {
    writePosition(SGR_A.id, sgr);
    writePosition("solar-pin", pin);
  }, [sgr, pin]);

  return (
    <group>
      {/* Przy zbliżeniu Sgr A* chowamy dysk MW — inaczej billboard zalewa kadr beżem. */}
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
            onPointerOver={() => {
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            <sphereGeometry args={[3.2, 16, 12]} />
            <meshBasicMaterial color="#111018" />
          </mesh>
          <mesh position={SGR_A.position} rotation={[1.15, 0.3, 0]}>
            <ringGeometry args={[4.2, 11, 64]} />
            <meshBasicMaterial color="#ffb36a" transparent opacity={0.55} side={DoubleSide} depthWrite={false} />
          </mesh>
        </>
      )}
      <mesh position={SOLAR_PIN}>
        <sphereGeometry args={[2.4, 10, 8]} />
        <meshBasicMaterial color="#f3c56b" toneMapped={false} />
      </mesh>
    </group>
  );
}
