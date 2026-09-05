import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { ACESFilmicToneMapping, Color, SRGBColorSpace } from "three";
import { BODIES } from "../data/bodies";
import { MOON_BY_ID } from "../data/moons";
import { useObservatory } from "../store/observatory";
import { AsteroidBelt } from "./AsteroidBelt";
import { BodyLabel } from "./BodyLabel";
import { CameraRig } from "./CameraRig";
import { CelestialBody } from "./CelestialBody";
import { OrbitLine } from "./OrbitLine";
import { TimeTicker } from "./TimeTicker";

const CLEAR = new Color("#07080c");

function Lights() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#9aabbd", "#0a0c12", 0.16]} />
      {/* Słońce jako punktowe — decay 0, żeby Uran nie był czarny. */}
      <pointLight color="#fff6e0" intensity={8} distance={0} decay={0} position={[0, 0, 0]} />
    </>
  );
}

function SolarSystem() {
  const select = useObservatory((s) => s.select);
  const showOrbits = useObservatory((s) => s.showOrbits);
  const showLabels = useObservatory((s) => s.showLabels);
  const started = useObservatory((s) => s.started);
  const selectedId = useObservatory((s) => s.selectedId);
  const selectedMoon = selectedId ? MOON_BY_ID[selectedId] : undefined;
  const labelMoons = selectedMoon
    ? [selectedMoon]
    : selectedId
      ? Object.values(MOON_BY_ID).filter((m) => m.parent === selectedId)
      : [];

  return (
    <group>
      {showOrbits &&
        BODIES.filter((b) => b.id !== "sun").map((b) => <OrbitLine key={b.id} def={b} />)}
      {BODIES.map((b) => (
        <CelestialBody key={b.id} def={b} onPick={select} />
      ))}
      <AsteroidBelt />
      {showLabels && started && (
        <>
          {BODIES.map((b) => (
            <BodyLabel key={b.id} id={b.id} name={b.name} kind={b.kind} />
          ))}
          {labelMoons.map((m) => (
            <BodyLabel key={m.id} id={m.id} name={m.name} kind="moon" />
          ))}
        </>
      )}
    </group>
  );
}

export function ObservatoryCanvas() {
  const started = useObservatory((s) => s.started);
  const isPhone = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <Canvas
      dpr={isPhone ? [1, 1.25] : [1, 1.5]}
      gl={{
        antialias: !isPhone,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ fov: 42, near: 0.08, far: 2800, position: [0, 28, 72] }}
      style={{
        touchAction: "none",
        width: "100%",
        height: "100%",
        pointerEvents: started ? "auto" : "none",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(CLEAR);
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      <TimeTicker />
      <Lights />
      <Stars
        radius={420}
        depth={80}
        count={isPhone ? 1100 : 2800}
        factor={2.8}
        saturation={0.04}
        fade
        speed={0}
      />
      <SolarSystem />
      <CameraRig />
    </Canvas>
  );
}
