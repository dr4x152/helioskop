/**
 * Rejestr pozycji światowych ciał — kamera i etykiety czytają go w useFrame
 * bez szukania obiektów w grafie sceny.
 */

import { Vector3 } from "three";

const registry = new Map<string, Vector3>();

export function writePosition(id: string, world: Vector3): void {
  let slot = registry.get(id);
  if (!slot) {
    slot = new Vector3();
    registry.set(id, slot);
  }
  slot.copy(world);
}

export function readPosition(id: string): Vector3 | undefined {
  return registry.get(id);
}
