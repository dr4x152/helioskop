import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { type Group, Vector3 } from "three";
import { BODY_BY_ID } from "../data/bodies";
import { MOON_BY_ID } from "../data/moons";
import { yearsFromToday } from "../lib/clock";
import { readPosition } from "../lib/positions";
import { sunPhase } from "../lib/solarPhase";
import { useObservatory } from "../store/observatory";

interface BodyLabelProps {
  id: string;
  name: string;
  kind: "star" | "planet" | "dwarf" | "moon" | "comet" | "galaxy" | "system";
}

const _cam = new Vector3();
const INNER = new Set(["mercury", "venus", "earth", "mars"]);
const OUTER = new Set(["jupiter", "saturn", "uranus", "neptune", "pluto"]);

/**
 * Etykiety w przestrzeni ekranu.
 * Przy przeglądzie chowamy Merkurego–Marsa (zachodziły na Słońce),
 * a Słońce odsuwamy nad tarczę zamiast kłaść tekst na fotosferze.
 */
export function BodyLabel({ id, name, kind }: BodyLabelProps) {
  const group = useRef<Group>(null);
  const el = useRef<HTMLDivElement>(null);
  const camera = useThree((s) => s.camera);
  const selectedId = useObservatory((s) => s.selectedId);
  const parentId = kind === "moon" ? MOON_BY_ID[id]?.parent : undefined;

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const pos = readPosition(id);
    if (!pos) {
      g.visible = false;
      return;
    }
    // Olbrzym / karzeł „połyka” Merkurego i Wenus — etykiety też chowamy.
    const swallowed = sunPhase(yearsFromToday()).swallowInner;
    if (swallowed && (id === "mercury" || id === "venus")) {
      g.visible = false;
      return;
    }

    camera.getWorldPosition(_cam);
    const camDist = _cam.length();
    const toBody = _cam.distanceTo(pos);

    // Offset świata: od Słońca na zewnątrz + lekko „w górę”,
    // żeby napis nie siedział na tarczy.
    const body = BODY_BY_ID[id];
    const r = body?.radius ?? 0.12;
    const radial = pos.lengthSq() > 1e-6 ? pos.clone().normalize() : new Vector3(0, 1, 0);
    const lift = kind === "star" ? r * 1.55 : r * 1.35 + 0.18;
    g.position.copy(pos).addScaledVector(radial, lift);
    g.position.y += kind === "star" ? 0.85 : kind === "galaxy" ? 6 : kind === "system" ? 1.4 : 0.22;

    let show = false;
    if (kind === "galaxy") {
      // Zawsze czytelne w Grupie Lokalnej — wcześniej znikały za blisko / za daleko.
      show = toBody > 8 && toBody < 800;
    } else if (kind === "system") {
      show = toBody > 2 && toBody < 120;
    } else if (kind === "comet") {
      show = toBody > 1.2 && toBody < 80;
    } else if (kind === "moon") {
      show = toBody < 16 && toBody > 0.45;
      if (selectedId && selectedId !== id && selectedId !== parentId) {
        show = show && toBody < 8;
      }
    } else if (kind === "star") {
      // Z bliska napis tonie w poświacie; z daleka jest zbędny.
      show = camDist > 20 && camDist < 120 && toBody > 8;
    } else if (INNER.has(id)) {
      // Kluczowa poprawka vs. oryginał: w przeglądzie chowamy wewnętrzne.
      show = camDist < 38 && toBody > 1.8 && toBody < 90;
    } else if (OUTER.has(id)) {
      show = toBody > 2.2 && toBody < 220;
    } else {
      show = toBody > 2 && toBody < 150;
    }

    if (selectedId === id) {
      show = kind === "galaxy" ? toBody > 6 : toBody > 1.4;
    }

    g.visible = show;
    if (el.current) el.current.style.opacity = show ? "1" : "0";
  });

  const cls =
    kind === "galaxy"
      ? "helio-label helio-label-galaxy"
      : kind === "system"
        ? "helio-label helio-label-system"
        : kind === "moon" || kind === "comet"
          ? "helio-label helio-label-moon"
          : kind === "dwarf"
            ? "helio-label helio-label-dwarf"
            : "helio-label";

  return (
    <group ref={group} visible={false}>
      <Html center wrapperClass="pointer-events-none" style={{ pointerEvents: "none" }} zIndexRange={[2, 1]}>
        <div ref={el} className={cls} style={{ opacity: 0, transition: "opacity 160ms linear" }}>
          {name}
        </div>
      </Html>
    </group>
  );
}
