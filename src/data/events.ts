/**
 * Katalog wydarzeń osi czasu.
 * `atYears` = lata od „dziś” (2026). Treści spekulatywne mają flagę.
 */

export type EventSeverity = "toast" | "serious";

export type EventVisual = "none" | "redgiant" | "whitedwarf" | "supernova" | "comet";

export interface TimelineEvent {
  id: string;
  severity: EventSeverity;
  title: string;
  body: string;
  atYears: number;
  speculative?: boolean;
  visual?: EventVisual;
}

/** Wizyta przy Sgr A* — odpalana z HUD, nie z osi lat. */
export const SGR_A_VISIT: TimelineEvent = {
  id: "sgr-a-visit",
  severity: "serious",
  title: "Sagittarius A* — jądro Drogi Mlecznej",
  body: "Supermasywna czarna dziura (~4 mln mas Słońca). Dysk akrecyjny jest stylizowany — Helioskop nie liczy ogólnej teorii względności.",
  atYears: 0,
  speculative: true,
};

/** Stałe kamienie milowe — wieki, koniunkcje i łuk Słońca. */
export const TIMELINE: TimelineEvent[] = [
  {
    id: "moon-highlight",
    severity: "toast",
    title: "Tranzyt Księżyca — zbliżenie",
    body: "Zaznacz Ziemię i włącz Księżyce: Luna okrąża planetę w tym samym kadrze. To podkreślenie schematu, nie efemeryda zaćmienia.",
    atYears: 3,
  },
  {
    id: "venus-earth-conj",
    severity: "toast",
    title: "Koniunkcja Wenus–Ziemia",
    body: "Wewnętrzne planety zbiegają się w rzucie na płaszczyznę ekliptyki. Helioskop pokazuje to jako komunikat, nie jako precyzyjny almanach.",
    atYears: 8,
  },
  {
    id: "jup-sat-conj",
    severity: "toast",
    title: "Koniunkcja Jowisz–Saturn",
    body: "Dwa gazowe olbrzymy mijają się na niebie w tym modelu Keplera. Kolejna wielka koniunkcja w rzeczywistości: ok. 2040.",
    atYears: 14,
  },
  {
    id: "halley-2061",
    severity: "toast",
    title: "Peryhelium komety Halleya",
    body: "1P/Halley wraca w wewnętrzny Układ. Ogon pyłowy ciągnie się od Słońca — włącz Komety, jeśli ich nie widać.",
    atYears: 35,
    visual: "comet",
  },
  {
    id: "century-2100",
    severity: "toast",
    title: "Wchodzimy w XXII wiek",
    body: "Symulacja przekroczyła 1 stycznia 2100 UTC. Planety jadą dalej jak w grze idle.",
    atYears: 74,
  },
  {
    id: "ikarus-flyby",
    severity: "serious",
    title: "Bliski przelot komety Helioskop-1",
    body: "Długookresowa kometa (fikcyjna) mija wewnętrzny Układ. To schematyczny „bliski przelot” — nie jest to impakt.",
    atYears: 220,
    speculative: true,
    visual: "comet",
  },
  {
    id: "supernova-nearby",
    severity: "serious",
    title: "Błysk pobliskiej supernowej",
    body: "Hipotetyczny wybuch masywnej gwiazdy w sąsiedztwie Słońca. Na Ziemi byłby widowiskiem na niebie, nie końcem świata — tu pokazujemy tylko stylizowany błysk.",
    atYears: 120_000,
    speculative: true,
    visual: "supernova",
  },
  {
    id: "sun-brighter",
    severity: "toast",
    title: "Słońce jaśnieje",
    body: "Za ok. miliard lat Słońce będzie wyraźnie jaśniejsze. To wciąż ciąg główny — jeszcze nie olbrzym.",
    atYears: 1_000_000_000,
    speculative: true,
  },
  {
    id: "sun-leaves-ms",
    severity: "serious",
    title: "Słońce schodzi z ciągu głównego",
    body: "Kończy się wodór w jądrze. Gwiazda puchnie w podolbrzyma. To scenariusz schematyczny, nie precyzyjny model ewolucji gwiazdowej.",
    atYears: 5_000_000_000,
    speculative: true,
    visual: "redgiant",
  },
  {
    id: "sun-red-giant",
    severity: "serious",
    title: "Słońce staje się czerwonym olbrzymem",
    body: "Fotosfera sięga orbit Merkurego i Wenus. Ziemia — jeśli jeszcze istnieje — jest sterylna. Widok jest celowo przesadzony, żeby był czytelny.",
    atYears: 5_400_000_000,
    speculative: true,
    visual: "redgiant",
  },
  {
    id: "sun-white-dwarf",
    severity: "serious",
    title: "Słońce gaśnie — biały karzeł",
    body: "Po zrzuceniu otoczki zostaje gorące, gęste jądro. Nie ma już światła ciągu głównego. Helioskop zostawia bladą kulę w centrum — stylizowany koniec łuku ewolucji.",
    atYears: 6_800_000_000,
    speculative: true,
    visual: "whitedwarf",
  },
];

export const SOLAR_MILESTONES = [
  { id: "now", label: "Dziś", years: 0 },
  { id: "ms-end", label: "+5 mld", years: 5_000_000_000 },
  { id: "giant", label: "Olbrzym", years: 5_400_000_000 },
  { id: "dwarf", label: "Karzeł", years: 6_800_000_000 },
] as const;
