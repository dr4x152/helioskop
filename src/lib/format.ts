/**
 * Formatowanie liczb i dat po polsku (UTC) — panel ciała i nagłówek.
 */

const DATE_FMT = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const NUM_FMT = new Intl.NumberFormat("pl-PL");

export function formatUtc(date: Date): string {
  return DATE_FMT.format(date);
}

export function formatKm(km: number): string {
  return `${NUM_FMT.format(km)} km`;
}

/** Okres obiegu: godziny / dni / lata w zależności od skali. */
export function formatPeriod(days: number): string {
  const t = Math.abs(days);
  if (t < 1) return `${(t * 24).toFixed(1)} h`;
  if (t < 40) return `${t.toFixed(t < 10 ? 2 : 1)} d`;
  if (t < 400) return `${t.toFixed(0)} d`;
  return `${(t / 365.25).toFixed(2)} lat`;
}

/** Doba gwiazdowa; ujemna = obrót wsteczny. */
export function formatDay(hours: number): string {
  const suffix = hours < 0 ? " (wsteczna)" : "";
  const n = Math.abs(hours);
  if (n >= 48) return `${(n / 24).toFixed(1)} d${suffix}`;
  return `${n.toFixed(1)} h${suffix}`;
}

export function formatAu(au: number): string {
  return `${au.toFixed(3)} AU`;
}
