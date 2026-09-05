/**
 * Stan obserwatorium (Zustand). Czas leci w `simClock`, tu tylko flagi UI.
 */

import { create } from "zustand";
import { DEFAULT_SPEED, DAYS_PER_YEAR } from "../data/speeds";
import { resetSimDays, startWarp } from "../lib/clock";

export interface ObservatoryState {
  started: boolean;
  paused: boolean;
  speed: number;
  selectedId: string | null;
  follow: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showMoons: boolean;
  showEphemeris: boolean;
  warping: boolean;
  /** Bump przy skoku czasu / resecie — kamera i orbity mogą zareagować. */
  epoch: number;
  focusToken: number;
  start: () => void;
  togglePaused: () => void;
  setSpeed: (daysPerSecond: number) => void;
  select: (id: string | null) => void;
  setFollow: (follow: boolean) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  toggleMoons: () => void;
  toggleEphemeris: () => void;
  setEphemeris: (open: boolean) => void;
  resetView: () => void;
  goToday: () => void;
  jumpYears: (years: number) => void;
  finishWarp: () => void;
}

export const useObservatory = create<ObservatoryState>((set) => ({
  started: false,
  paused: true,
  speed: DEFAULT_SPEED,
  selectedId: null,
  follow: true,
  showOrbits: true,
  showLabels: true,
  showMoons: true,
  showEphemeris: true,
  warping: false,
  epoch: 0,
  focusToken: 0,

  start: () => {
    resetSimDays();
    set((s) => ({
      started: true,
      paused: true,
      warping: false,
      showEphemeris: true,
      epoch: s.epoch + 1,
    }));
  },
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed, paused: false }),
  select: (id) =>
    set((s) => ({
      selectedId: id,
      follow: id !== null,
      focusToken: id ? s.focusToken + 1 : s.focusToken,
    })),
  setFollow: (follow) => set({ follow }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleMoons: () => set((s) => ({ showMoons: !s.showMoons })),
  toggleEphemeris: () => set((s) => ({ showEphemeris: !s.showEphemeris })),
  setEphemeris: (showEphemeris) => set({ showEphemeris }),
  resetView: () =>
    set((s) => ({
      selectedId: null,
      follow: false,
      focusToken: s.focusToken + 1,
    })),
  goToday: () => {
    resetSimDays();
    set((s) => ({
      paused: true,
      warping: false,
      showEphemeris: true,
      epoch: s.epoch + 1,
    }));
  },
  jumpYears: (years) => {
    startWarp(years * DAYS_PER_YEAR, 1.5);
    set((s) => ({
      paused: true,
      warping: true,
      showEphemeris: false,
      selectedId: null,
      follow: false,
      focusToken: s.focusToken + 1,
      epoch: s.epoch + 1,
    }));
  },
  finishWarp: () => set({ warping: false, showEphemeris: true, paused: true }),
}));
