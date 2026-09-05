/**
 * Prędkości upływu czasu — 1 s czasu rzeczywistego = N dni symulacji.
 * Wartości jak w live app (1 d / 10 d / 1 mies. / 1 rok / 10 lat).
 */
export interface SpeedPreset {
  id: string;
  label: string;
  daysPerSecond: number;
  hint: string;
}

export const SPEED_PRESETS: SpeedPreset[] = [
  { id: "1d", label: "1 d", daysPerSecond: 1, hint: "1 sekunda = 1 dzień" },
  { id: "10d", label: "10 d", daysPerSecond: 10, hint: "1 sekunda = 10 dni" },
  { id: "30d", label: "1 mies.", daysPerSecond: 30, hint: "1 sekunda ≈ miesiąc" },
  { id: "365d", label: "1 rok", daysPerSecond: 365, hint: "1 sekunda = 1 rok" },
  { id: "3650d", label: "10 lat", daysPerSecond: 3650, hint: "1 sekunda = dekada" },
  { id: "1ky", label: "1 tys.", daysPerSecond: 365_250, hint: "1 sekunda = 1000 lat" },
  { id: "1my", label: "1 mln", daysPerSecond: 365_250_000, hint: "1 sekunda = milion lat (scenariusz)" },
];

export const DEFAULT_SPEED = 10;
export const DAYS_PER_YEAR = 365.25;
