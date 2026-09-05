/**
 * Stan obserwatorium (Zustand). Czas leci w `simClock`, tu flagi UI i wydarzenia.
 */

import { create } from "zustand";
import { SGR_A_VISIT, type TimelineEvent } from "../data/events";
import { DEFAULT_SPEED, DAYS_PER_YEAR } from "../data/speeds";
import { resetSimDays, simClock, startWarp } from "../lib/clock";
import { resetEventEngine } from "../lib/eventEngine";

export type ViewScale = "system" | "galaxy";

export interface ToastItem {
  uid: string;
  event: TimelineEvent;
}

export interface ObservatoryState {
  started: boolean;
  paused: boolean;
  speed: number;
  selectedId: string | null;
  follow: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showMoons: boolean;
  showComets: boolean;
  showEphemeris: boolean;
  warping: boolean;
  viewScale: ViewScale;
  solarScenario: boolean;
  toasts: ToastItem[];
  serious: TimelineEvent | null;
  supernovaToken: number;
  epoch: number;
  focusToken: number;
  start: () => void;
  togglePaused: () => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (daysPerSecond: number) => void;
  select: (id: string | null) => void;
  setFollow: (follow: boolean) => void;
  toggleOrbits: () => void;
  toggleLabels: () => void;
  toggleMoons: () => void;
  toggleComets: () => void;
  toggleEphemeris: () => void;
  setEphemeris: (open: boolean) => void;
  resetView: () => void;
  goToday: () => void;
  jumpYears: (years: number) => void;
  jumpToYearsFromNow: (years: number) => void;
  finishWarp: () => void;
  setViewScale: (scale: ViewScale) => void;
  startSolarEvolution: () => void;
  ingestEvents: (events: TimelineEvent[]) => void;
  dismissToast: (uid: string) => void;
  dismissSerious: () => void;
}

let toastSeq = 0;
/** Jednorazowy komunikat przy pierwszym kliknięciu Sgr A* w sesji. */
let sgrAnnounced = false;

export const useObservatory = create<ObservatoryState>((set) => ({
  started: false,
  paused: true,
  speed: DEFAULT_SPEED,
  selectedId: null,
  follow: true,
  showOrbits: true,
  showLabels: true,
  showMoons: true,
  showComets: true,
  showEphemeris: true,
  warping: false,
  viewScale: "system",
  solarScenario: false,
  toasts: [],
  serious: null,
  supernovaToken: 0,
  epoch: 0,
  focusToken: 0,

  start: () => {
    resetSimDays();
    resetEventEngine();
    sgrAnnounced = false;
    set((s) => ({
      started: true,
      paused: true,
      warping: false,
      showEphemeris: true,
      viewScale: "system",
      solarScenario: false,
      toasts: [],
      serious: null,
      epoch: s.epoch + 1,
    }));
  },
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setPaused: (paused) => set({ paused }),
  setSpeed: (speed) => set({ speed, paused: false }),
  select: (id) =>
    set((s) => {
      // Pinezka „Układ Słoneczny” na dysku MW wraca do skali planet.
      if (id === "solar-pin") {
        return {
          viewScale: "system" as const,
          selectedId: "sun",
          follow: true,
          focusToken: s.focusToken + 1,
        };
      }
      const next: Partial<ObservatoryState> = {
        selectedId: id,
        follow: id !== null,
        focusToken: id ? s.focusToken + 1 : s.focusToken,
      };
      // Pierwsze zbliżenie do Sgr A* — modal o czarnej dziurze.
      if (id === "sgr-a" && !sgrAnnounced) {
        sgrAnnounced = true;
        next.serious = SGR_A_VISIT;
        next.paused = true;
      }
      return next;
    }),
  setFollow: (follow) => set({ follow }),
  toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  toggleMoons: () => set((s) => ({ showMoons: !s.showMoons })),
  toggleComets: () => set((s) => ({ showComets: !s.showComets })),
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
    resetEventEngine();
    sgrAnnounced = false;
    set((s) => ({
      paused: true,
      warping: false,
      showEphemeris: true,
      solarScenario: false,
      toasts: [],
      serious: null,
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
      // Bez bumpa `epoch` — TimeTicker ma złapać toasty po drodze.
    }));
  },
  jumpToYearsFromNow: (years) => {
    const target = years * DAYS_PER_YEAR;
    startWarp(target - simClock.simDays, 1.85);
    set((s) => ({
      paused: true,
      warping: true,
      showEphemeris: false,
      selectedId: "sun",
      follow: true,
      viewScale: "system",
      focusToken: s.focusToken + 1,
    }));
  },
  finishWarp: () => {
    // Przy miliardach lat kalendarz JS kłamie — chowamy panel AU.
    const far = Math.abs(simClock.simDays / DAYS_PER_YEAR) >= 8_000;
    set({ warping: false, showEphemeris: !far, paused: true });
  },
  setViewScale: (viewScale) =>
    set((s) => ({
      viewScale,
      selectedId: viewScale === "galaxy" ? null : s.selectedId,
      follow: viewScale === "galaxy" ? false : s.follow,
      focusToken: s.focusToken + 1,
    })),
  startSolarEvolution: () => {
    set({
      solarScenario: true,
      viewScale: "system",
      selectedId: "sun",
      follow: true,
      paused: true,
      showEphemeris: false,
      serious: {
        id: "solar-scenario-intro",
        severity: "serious",
        title: "Scenariusz: Ewolucja Słońca",
        body: "To stylizowany łuk, nie model astrofizyczny. Kamienie milowe: zejście z ciągu głównego, czerwony olbrzym, biały karzeł. Czas skacze o miliardy lat.",
        atYears: 0,
        speculative: true,
      },
    });
  },
  ingestEvents: (events) =>
    set((s) => {
      let serious = s.serious;
      let supernovaToken = s.supernovaToken;
      const toasts = [...s.toasts];
      for (const ev of events) {
        if (ev.visual === "supernova") supernovaToken += 1;
        if (ev.severity === "serious") {
          serious = ev;
        } else {
          toastSeq += 1;
          toasts.push({ uid: `t${toastSeq}`, event: ev });
        }
      }
      return {
        toasts: toasts.slice(-4),
        serious,
        supernovaToken,
        paused: serious ? true : s.paused,
      };
    }),
  dismissToast: (uid) => set((s) => ({ toasts: s.toasts.filter((t) => t.uid !== uid) })),
  dismissSerious: () => set({ serious: null }),
}));
