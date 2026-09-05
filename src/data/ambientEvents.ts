/**
 * Katalog wydarzeń ambient — losowane w czasie rzeczywistym,
 * nie tylko kamienie milowe osi lat.
 */

import type { EventSeverity, EventVisual, TimelineEvent } from "./events";

export type ActivityMode = "quiet" | "normal" | "chaos";

export const ACTIVITY_LABEL: Record<ActivityMode, string> = {
  quiet: "Cicha",
  normal: "Normalna",
  chaos: "Chaos",
};

/** Mnożnik tempa: Cicha = spokojnie, Chaos = gęsty kanał. */
export const ACTIVITY_MUL: Record<ActivityMode, number> = {
  quiet: 0.34,
  normal: 1,
  chaos: 2.55,
};

export type AmbientScale = "system" | "galaxy" | "any";

export interface AmbientKind {
  id: string;
  weight: number;
  severity: EventSeverity;
  visual: EventVisual;
  scale: AmbientScale;
  title: string;
  body: string;
  speculative?: boolean;
}

export const AMBIENT_KINDS: AmbientKind[] = [
  {
    id: "flare",
    weight: 20,
    severity: "toast",
    visual: "flare",
    scale: "system",
    title: "Rozbłysk na Słońcu",
    body: "Krótki impuls w koronie. Helioskop pokazuje to jako poświatę — nie jest to prognoza NOAA.",
  },
  {
    id: "cme",
    weight: 9,
    severity: "toast",
    visual: "cme",
    scale: "system",
    title: "Wyrzut koronalny (CME)",
    body: "Obłok plazmy odchodzi od tarczy. Schematyczny stożek, nie model MHD.",
  },
  {
    id: "meteor",
    weight: 14,
    severity: "toast",
    visual: "meteor",
    scale: "system",
    title: "Rój meteorów przy Ziemi",
    body: "Zaznacz Ziemię, jeśli chcesz kadr z bliska. To ozdobne bolidy, nie efemeryda roju.",
  },
  {
    id: "aurora",
    weight: 8,
    severity: "toast",
    visual: "aurora",
    scale: "system",
    title: "Zorza nad Ziemią",
    body: "Wiatr słoneczny podświetla bieguny w tym schemacie. Najlepiej widać po zaznaczeniu Ziemi.",
  },
  {
    id: "asteroid",
    weight: 2.2,
    severity: "serious",
    visual: "asteroid",
    scale: "system",
    title: "Bliski przelot planetoidy",
    body: "Rzadki, stylizowany gość z pasa. Nie liczymy impaktu — tylko widowisko i pauza.",
    speculative: true,
  },
  {
    id: "mars-dust",
    weight: 6,
    severity: "toast",
    visual: "mars",
    scale: "system",
    title: "Pióropusz pyłu na Marsie",
    body: "Lokalna burza pyłowa. Na tarczy widać krótki błysk ochry — smaczek, nie GCM.",
  },
  {
    id: "jupiter-grs",
    weight: 8,
    severity: "toast",
    visual: "jupiter",
    scale: "system",
    title: "Turbulencja Wielkiej Czerwonej Plamy",
    body: "Jowisz „oddycha” plamą. Puls jest czysto wizualny.",
  },
  {
    id: "saturn-spoke",
    weight: 7,
    severity: "toast",
    visual: "saturn",
    scale: "system",
    title: "Szprychy w pierścieniach Saturna",
    body: "Krótki błysk pyłu w pierścieniach. Zjawisko rzeczywiste, tu mocno uproszczone.",
  },
  {
    id: "comet-burst",
    weight: 9,
    severity: "toast",
    visual: "outburst",
    scale: "system",
    title: "Wybuch pyłu na komecie",
    body: "Ogon jaśnieje na chwilę. Włącz Komety, jeśli jądro zniknęło z kadru.",
  },
  {
    id: "conj-inner",
    weight: 11,
    severity: "toast",
    visual: "none",
    scale: "system",
    title: "Koniunkcja planet wewnętrznych",
    body: "Merkury, Wenus i Ziemia zbiegają się w rzucie. To alert schematu, nie almanach.",
  },
  {
    id: "opposition",
    weight: 8,
    severity: "toast",
    visual: "none",
    scale: "system",
    title: "Opozycja — Mars naprzeciw Słońca",
    body: "W tym modelu Keplerowym planeta jest po przeciwnej stronie niż Słońce. Dobre zbliżenie.",
  },
  {
    id: "sgr-flare",
    weight: 16,
    severity: "toast",
    visual: "sgr",
    scale: "galaxy",
    title: "Rozbłysk Sagittarius A*",
    body: "Dżety i dysk mrugają. Stylizacja — Sgr A* w rzeczywistości jest dość spokojny.",
    speculative: true,
  },
  {
    id: "microlens",
    weight: 7,
    severity: "toast",
    visual: "sgr",
    scale: "galaxy",
    title: "Mikrosoczewkowanie w tle",
    body: "Odległa gwiazda na chwilę jaśnieje za sprawą soczewki grawitacyjnej. Czysty smaczek.",
    speculative: true,
  },
];

export function ambientToTimeline(kind: AmbientKind, years: number, cometName?: string): TimelineEvent {
  const title =
    kind.visual === "outburst" && cometName ? `Wybuch pyłu — ${cometName}` : kind.title;
  return {
    id: `amb-${kind.id}-${Math.round(years * 1e6)}-${Math.random().toString(36).slice(2, 6)}`,
    severity: kind.severity,
    title,
    body: kind.body,
    atYears: years,
    speculative: kind.speculative,
    visual: kind.visual,
  };
}
