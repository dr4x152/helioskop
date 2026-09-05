import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import { BODY_BY_ID } from "../data/bodies";
import { MOON_BY_ID, MOONS_BY_PARENT } from "../data/moons";
import { clampMinDistance, followDistance, OVERVIEW_CAMERA } from "../lib/kepler";
import { readPosition } from "../lib/positions";
import { useObservatory } from "../store/observatory";

const _offset = new Vector3();
const _prev = new Vector3();
const _goalCam = new Vector3();
const _goalTarget = new Vector3();

function focusDistance(id: string | null): number {
  if (!id) return 78;
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
  return MOON_BY_ID[id]?.radius ?? BODY_BY_ID[id]?.radius ?? 0.3;
}

/**
 * OrbitControls + śledzenie celu.
 * Przy zmianie focusToken wjeżdżamy do ciała / wracamy do przeglądu.
 * minDistance rośnie wraz z tarczą, żeby UI nie tonęło w zbliżeniu.
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const selectedId = useObservatory((s) => s.selectedId);
  const follow = useObservatory((s) => s.follow);
  const focusToken = useObservatory((s) => s.focusToken);
  const flying = useRef(false);
  const flyT = useRef(0);
  const fromCam = useRef(new Vector3());
  const fromTarget = useRef(new Vector3());

  const { camera } = useThree();

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    flying.current = true;
    flyT.current = 0;
    fromCam.current.copy(camera.position);
    fromTarget.current.copy(c.target);

    const id = useObservatory.getState().selectedId;
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
  }, [focusToken, camera]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;

    const minD = clampMinDistance(bodyRadius(selectedId));
    c.minDistance = minD;

    if (flying.current) {
      flyT.current = Math.min(1, flyT.current + dt / 0.85);
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

    if (selectedId && follow) {
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
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={220}
      maxPolarAngle={Math.PI * 0.92}
    />
  );
}
