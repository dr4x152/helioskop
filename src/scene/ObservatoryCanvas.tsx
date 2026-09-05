import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { ACESFilmicToneMapping, Color, type PointLight, SRGBColorSpace } from "three";
import { BODIES } from "../data/bodies";
import { COMETS } from "../data/comets";
import { MOON_BY_ID } from "../data/moons";
import { yearsFromToday } from "../lib/clock";
import { sunPhase } from "../lib/solarPhase";
import { useObservatory } from "../store/observatory";
import { AsteroidBelt } from "./AsteroidBelt";
import { BlackHoleCloseup } from "./BlackHoleCloseup";
import { BodyLabel } from "./BodyLabel";
import { CameraRig } from "./CameraRig";
import { CelestialBody } from "./CelestialBody";
import { CometBody } from "./CometBody";
import { GalaxyField } from "./GalaxyField";
import { OrbitLine } from "./OrbitLine";
import { SupernovaFlash } from "./SupernovaFlash";
import { TimeTicker } from "./TimeTicker";

const CLEAR = new Color("#07080c");

function Lights() {
  const sun = useRef<PointLight>(null);
  useFrame(() => {
    const { viewScale } = useObservatory.getState();
    const phase = sunPhase(yearsFromToday());
    if (sun.current) {
      // W skali galaktycznej gasimy lampę Słońca — nie rozświetla billboardów.
      sun.current.intensity = viewScale === "galaxy" ? 0.2 : phase.light;
      sun.current.color.set(phase.id === "whitedwarf" ? "#c8d6ff" : phase.id === "redgiant" ? "#ff7a30" : "#fff6e0");
    }
  });
  return (
    <>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#9aabbd", "#0a0c12", 0.16]} />
      <pointLight ref={sun} color="#fff6e0" intensity={8} distance={0} decay={0} position={[0, 0, 0]} />
    </>
  );
}

function SolarSystem() {
  const select = useObservatory((s) => s.select);
  const showOrbits = useObservatory((s) => s.showOrbits);
  const showLabels = useObservatory((s) => s.showLabels);
  const showComets = useObservatory((s) => s.showComets);
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
      {showComets &&
        COMETS.map((c) => (
          <group key={c.id}>
            {showOrbits && <OrbitLine def={c} />}
            <CometBody def={c} onPick={select} />
          </group>
        ))}
      {showLabels && started && (
        <>
          {BODIES.map((b) => (
            <BodyLabel key={b.id} id={b.id} name={b.name} kind={b.kind} />
          ))}
          {labelMoons.map((m) => (
            <BodyLabel key={m.id} id={m.id} name={m.name} kind="moon" />
          ))}
          {showComets &&
            COMETS.map((c) => (
              <BodyLabel key={c.id} id={c.id} name={c.name} kind="comet" />
            ))}
        </>
      )}
      <SupernovaFlash />
    </group>
  );
}

function SceneSwitch() {
  const viewScale = useObservatory((s) => s.viewScale);
  const selectedId = useObservatory((s) => s.selectedId);
  const showLabels = useObservatory((s) => s.showLabels);

  if (viewScale === "galaxy") {
    return (
      <group>
        <GalaxyField />
        {selectedId === "sgr-a" && <BlackHoleCloseup />}
        {showLabels && (
          <>
            <BodyLabel id="milkyway" name="Droga Mleczna" kind="galaxy" />
            <BodyLabel id="andromeda" name="Andromeda" kind="galaxy" />
            <BodyLabel id="triangulum" name="Trójkąt" kind="galaxy" />
            <BodyLabel id="sgr-a" name="Sgr A*" kind="galaxy" />
            <BodyLabel id="solar-pin" name="Układ Słoneczny" kind="galaxy" />
          </>
        )}
      </group>
    );
  }
  return <SolarSystem />;
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
      camera={{ fov: 42, near: 0.08, far: 12000, position: [0, 28, 72] }}
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
        radius={viewScaleStars(isPhone)}
        depth={80}
        count={isPhone ? 1100 : 2800}
        factor={2.8}
        saturation={0.04}
        fade
        speed={0}
      />
      <SceneSwitch />
      <CameraRig />
    </Canvas>
  );
}

function viewScaleStars(isPhone: boolean): number {
  return isPhone ? 900 : 1600;
}
