/**
 * Faza Słońca z osi czasu — stylizowana, nie model MESA.
 * Używana przez mesh, poświatę i światło punktowe.
 */

export type SunPhaseId = "main" | "bright" | "subgiant" | "redgiant" | "whitedwarf";

export interface SunPhase {
  id: SunPhaseId;
  /** Mnożnik promienia tarczy. */
  scale: number;
  tint: string;
  glow: string;
  glowMul: number;
  light: number;
  /** Merkury / Wenus „połknięte”. */
  swallowInner: boolean;
  label: string;
}

export function sunPhase(yearsFromNow: number): SunPhase {
  if (yearsFromNow >= 6.8e9) {
    return {
      id: "whitedwarf",
      scale: 0.32,
      tint: "#d8e4ff",
      glow: "#8aa4ff",
      glowMul: 0.28,
      light: 1.1,
      swallowInner: true,
      label: "Biały karzeł",
    };
  }
  if (yearsFromNow >= 5.4e9) {
    return {
      id: "redgiant",
      scale: 3.55,
      tint: "#ff6a28",
      glow: "#ff3d00",
      glowMul: 2.6,
      light: 16,
      swallowInner: true,
      label: "Czerwony olbrzym",
    };
  }
  if (yearsFromNow >= 5.0e9) {
    return {
      id: "subgiant",
      scale: 1.52,
      tint: "#ffb060",
      glow: "#ff8a3a",
      glowMul: 1.55,
      light: 11,
      swallowInner: false,
      label: "Podolbrzym",
    };
  }
  if (yearsFromNow >= 1.0e9) {
    return {
      id: "bright",
      scale: 1.1,
      tint: "#ffe29a",
      glow: "#ffc878",
      glowMul: 1.12,
      light: 9,
      swallowInner: false,
      label: "Ciąg główny (jaśniejszy)",
    };
  }
  return {
    id: "main",
    scale: 1,
    tint: "#ffffff",
    glow: "#ffd7a0",
    glowMul: 1,
    light: 8,
    swallowInner: false,
    label: "Ciąg główny",
  };
}
