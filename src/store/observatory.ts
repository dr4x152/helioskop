/**
 * Stan obserwatorium (Zustand). Czas leci w `simClock`, tu flagi UI, FX i wydarzenia.
 */

import { create } from "zustand";
import { type ActivityMode } from "../data/ambientEvents";
import { SGR_A_VISIT, type TimelineEvent } from "../data/events";
import { PROXY_BY_ID } from "../data/galaxies";
import { DEFAULT_SPEED, DAYS_PER_YEAR } from "../data/speeds";
import { resetAmbientEngine, cometIdFromBurstTitle } from "../lib/ambientEngine";
import { resetSimDays, simClock, startWarp } from "../lib/clock";
import { resetEventEngine } from "../lib/eventEngine";

export type ViewScale = "system" | "galaxy";

export interface ToastItem {
  uid: string;
  event: TimelineEvent;
}

/** Liczniki efektów — scena czyta token i odpala krótki beat. */
export interface FxState {
  flare: number;
  cme: number;
  meteor: number;
  shake: number;
  cometBurst: number;
  cometBurstId: string | null;
  jupiter: number;
  saturn: number;
  sgr: number;
  mars: number;
  aurora: number;
}

export const EMPTY_FX: FxState = {
  flare: 0,
  cme: 0,
  meteor: 0,
  shake: 0,
  cometBurst: 0,
  cometBurstId: null,
  jupiter: 0,
  saturn: 0,
  sgr: 0,
  mars: 0,
  aurora: 0,
};

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
  activityMode: ActivityMode;
  lastEventTitle: string;
  toasts: ToastItem[];
  serious: TimelineEvent | null;
  supernovaToken: number;
  fx: FxState;
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
  setActivityMode: (mode: ActivityMode) => void;
  startSolarEvolution: () => void;
  ingestEvents: (events: TimelineEvent[]) => void;
  dismissToast: (uid: string) => void;
  dismissSerious: () => void;
}

let toastSeq = 0;
let sgrAnnounced = false;

function applyVisual(fx: FxState, ev: TimelineEvent): FxState {
  const next = { ...fx };
  switch (ev.visual) {
    case "supernova":
    case "flare":
      next.flare += 1;
      break;
    case "cme":
      next.cme += 1;
      next.flare += 1;
      break;
    case "meteor":
      next.meteor += 1;
      break;
    case "aurora":
      next.aurora += 1;
      break;
    case "mars":
      next.mars += 1;
      break;
    case "jupiter":
      next.jupiter += 1;
      break;
    case "saturn":
      next.saturn += 1;
      break;
    case "sgr":
      next.sgr += 1;
      break;
    case "asteroid":
      next.shake += 1;
      next.meteor += 1;
      break;
    case "outburst":
    case "comet":
      next.cometBurst += 1;
      next.cometBurstId = cometIdFromBurstTitle(ev.title);
      break;
    default:
      break;
  }
  if (ev.severity === "serious") next.shake += 1;
  return next;
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
  showComets: true,
  showEphemeris: true,
  warping: false,
  viewScale: "system",
  solarScenario: false,
  activityMode: "normal",
  lastEventTitle: "",
  toasts: [],
  serious: null,
  supernovaToken: 0,
  fx: { ...EMPTY_FX },
  epoch: 0,
  focusToken: 0,

  start: () => {
    resetSimDays();
    resetEventEngine();
    resetAmbientEngine();
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
      lastEventTitle: "",
      fx: { ...EMPTY_FX },
      epoch: s.epoch + 1,
    }));
  },
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setPaused: (paused) => set({ paused }),
  setSpeed: (speed) => set({ speed, paused: false }),
  select: (id) =>
    set((s) => {
      // Nasz układ — zejście ze skali galaktycznej.
      if (id === "solar-pin" || id === "solar-home") {
        return {
          viewScale: "system" as const,
          selectedId: "sun",
          follow: true,
          focusToken: s.focusToken + 1,
        };
      }
      const proxy = id ? PROXY_BY_ID[id] : undefined;
      if (proxy?.isHome) {
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
        viewScale: s.viewScale,
        // Zawsze bump — „Przegląd” wraca kamerą do Grupy Lokalnej.
        focusToken: s.focusToken + 1,
      };
      if (id === "sgr-a" && !sgrAnnounced) {
        sgrAnnounced = true;
        next.serious = SGR_A_VISIT;
        next.paused = true;
        next.fx = { ...s.fx, sgr: s.fx.sgr + 1, shake: s.fx.shake + 1 };
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
    resetAmbientEngine();
    sgrAnnounced = false;
    set((s) => ({
      paused: true,
      warping: false,
      showEphemeris: true,
      solarScenario: false,
      toasts: [],
      serious: null,
      lastEventTitle: "",
      fx: { ...EMPTY_FX },
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
    const far = Math.abs(simClock.simDays / DAYS_PER_YEAR) >= 8_000;
    set({ warping: false, showEphemeris: !far, paused: true });
  },
  setViewScale: (viewScale) =>
    set((s) => ({
      viewScale,
      selectedId: null,
      follow: false,
      focusToken: s.focusToken + 1,
    })),
  setActivityMode: (activityMode) => set({ activityMode }),
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
      let fx = s.fx;
      let lastEventTitle = s.lastEventTitle;
      const toasts = [...s.toasts];
      for (const ev of events) {
        lastEventTitle = ev.title;
        fx = applyVisual(fx, ev);
        if (ev.visual === "supernova") supernovaToken += 1;
        if (ev.severity === "serious") {
          serious = ev;
        } else {
          toastSeq += 1;
          toasts.push({ uid: `t${toastSeq}`, event: ev });
        }
      }
      return {
        toasts: toasts.slice(-6),
        serious,
        supernovaToken,
        fx,
        lastEventTitle,
        paused: serious ? true : s.paused,
      };
    }),
  dismissToast: (uid) => set((s) => ({ toasts: s.toasts.filter((t) => t.uid !== uid) })),
  dismissSerious: () => set({ serious: null }),
}));
