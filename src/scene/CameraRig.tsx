import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import { BODY_BY_ID } from "../data/bodies";
import { COMET_BY_ID } from "../data/comets";
import {
  BLACKHOLE_CAMERA,
  GALAXIES,
  GALAXY_BY_ID,
  LOCAL_GROUP_CAMERA,
  LOCAL_GROUP_TARGET,
  PROXY_BY_ID,
  SGR_A,
  galaxyFocusCamera,
  proxyWorld,
} from "../data/galaxies";
import { MOON_BY_ID, MOONS_BY_PARENT } from "../data/moons";
import { clampMinDistance, followDistance, OVERVIEW_CAMERA } from "../lib/kepler";
import { readPosition } from "../lib/positions";
import { useObservatory } from "../store/observatory";

const _offset = new Vector3();
const _prev = new Vector3();
const _goalCam = new Vector3();
const _goalTarget = new Vector3();
const _shake = new Vector3();

const GALAXY_IDS = new Set([...GALAXIES.map((g) => g.id), SGR_A.id, "solar-pin", "solar-home"]);

function focusDistance(id: string | null): number {
  if (!id) return 78;
  if (id === SGR_A.id) return 18;
  if (PROXY_BY_ID[id]) return 14;
  if (GALAXY_BY_ID[id]) return GALAXY_BY_ID[id].radius * 2.4;
  if (COMET_BY_ID[id]) return 5.2;
  const moon = MOON_BY_ID[id];
  if (moon) return followDistance(moon.radius, moon.orbitRadius);
  const body = BODY_BY_ID[id];
  if (!body) return 16;
  if (body.id === "sun") return 16;
  const moons = MOONS_BY_PARENT[id];
  const span = moons?.length ? Math.max(...moons.map((m) => m.orbitRadius)) : 0;
  return followDistance(body.radius, span);
}

function bodyRadius(id: string | null): number {
  if (!id) return 2.55;
  if (id === SGR_A.id) return 3;
  if (PROXY_BY_ID[id]) return 0.6;
  if (COMET_BY_ID[id]) return 0.12;
  return MOON_BY_ID[id]?.radius ?? BODY_BY_ID[id]?.radius ?? 0.3;
}

/**
 * OrbitControls + śledzenie + kadr Grupy Lokalnej / wybranej galaktyki.
 * Delikatny wstrząs przy poważnych FX (token shake).
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const selectedId = useObservatory((s) => s.selectedId);
  const follow = useObservatory((s) => s.follow);
  const focusToken = useObservatory((s) => s.focusToken);
  const viewScale = useObservatory((s) => s.viewScale);
  const flying = useRef(false);
  const flyT = useRef(0);
  const fromCam = useRef(new Vector3());
  const fromTarget = useRef(new Vector3());
  const lastShake = useRef(0);
  const shakeAge = useRef(99);

  const { camera } = useThree();

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    flying.current = true;
    flyT.current = 0;
    fromCam.current.copy(camera.position);
    fromTarget.current.copy(c.target);

    const scale = useObservatory.getState().viewScale;
    const id = useObservatory.getState().selectedId;

    if (scale === "galaxy") {
      if (id === SGR_A.id) {
        _goalCam.set(BLACKHOLE_CAMERA.x, BLACKHOLE_CAMERA.y, BLACKHOLE_CAMERA.z);
        _goalTarget.set(...SGR_A.position);
        return;
      }
      const proxy = id ? PROXY_BY_ID[id] : undefined;
      if (proxy) {
        const w = proxyWorld(proxy);
        _goalTarget.set(...w);
        _goalCam.set(w[0] + 8, w[1] + 6, w[2] + 12);
        return;
      }
      const g = id ? GALAXY_BY_ID[id] : undefined;
      if (g) {
        const { cam, target } = galaxyFocusCamera(g);
        _goalCam.set(...cam);
        _goalTarget.set(...target);
        return;
      }
      _goalCam.set(LOCAL_GROUP_CAMERA.x, LOCAL_GROUP_CAMERA.y, LOCAL_GROUP_CAMERA.z);
      _goalTarget.set(LOCAL_GROUP_TARGET.x, LOCAL_GROUP_TARGET.y, LOCAL_GROUP_TARGET.z);
      return;
    }

    if (!id) {
      _goalCam.set(OVERVIEW_CAMERA.x, OVERVIEW_CAMERA.y, OVERVIEW_CAMERA.z);
      _goalTarget.set(0, 0, 0);
      return;
    }

    const aim = () => {
      const p = readPosition(id);
      if (!p) {
        requestAnimationFrame(aim);
        return;
      }
      _offset.copy(camera.position).sub(c.target);
      if (_offset.lengthSq() < 1e-6) _offset.set(0.45, 0.32, 1);
      _offset.normalize().multiplyScalar(focusDistance(id));
      _goalCam.copy(p).add(_offset);
      _goalTarget.copy(p);
    };
    aim();
  }, [focusToken, camera, viewScale]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;

    c.minDistance = viewScale === "galaxy" ? 6 : clampMinDistance(bodyRadius(selectedId));
    c.maxDistance = viewScale === "galaxy" ? 900 : 220;

    const shakeTok = useObservatory.getState().fx.shake;
    if (shakeTok !== lastShake.current) {
      lastShake.current = shakeTok;
      if (shakeTok > 0) shakeAge.current = 0;
    }
    shakeAge.current += dt;

    if (flying.current) {
      flyT.current = Math.min(1, flyT.current + dt / 0.95);
      const u = flyT.current;
      const ease = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
      camera.position.lerpVectors(fromCam.current, _goalCam, ease);
      c.target.lerpVectors(fromTarget.current, _goalTarget, ease);
      c.update();
      if (u >= 1) flying.current = false;
      if (selectedId) {
        const p = readPosition(selectedId);
        if (p) _prev.copy(p);
      }
      return;
    }

    if (viewScale === "system" && selectedId && follow && !GALAXY_IDS.has(selectedId) && !PROXY_BY_ID[selectedId]) {
      const p = readPosition(selectedId);
      if (p) {
        if (_prev.lengthSq() > 0) {
          _offset.copy(p).sub(_prev);
          camera.position.add(_offset);
          c.target.add(_offset);
        }
        _prev.copy(p);
        c.update();
      }
    } else {
      _prev.set(0, 0, 0);
    }

    // Mikro-wstrząs — tani, tylko przy serious / asteroidzie.
    if (shakeAge.current < 0.38) {
      const k = (1 - shakeAge.current / 0.38) * 0.11;
      _shake.set((Math.random() - 0.5) * k, (Math.random() - 0.5) * k, (Math.random() - 0.5) * k);
      camera.position.add(_shake);
      c.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={900}
      maxPolarAngle={Math.PI * 0.92}
    />
  );
}
