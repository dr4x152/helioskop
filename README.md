# Helioskop

Polskie obserwatorium 3D Układu Słonecznego. Pełnoekranowa scena WebGL
(Słońce, Merkury–Neptun, Pluton i główne księżyce), schematyczny Kepler,
idle-time i ciemny interfejs bez brandingu Grok.

Live-inspiracja: oryginalny Helioskop na grok.me — ta wersja poprawia nachodzące
etykiety przy Słońcu, kadr przeglądu (zewnętrzne planety widać od razu),
przycinanie ekstremalnych zbliżeń i czytelne stany przełączników.

## Wymagania

- Node.js 20+
- Nowoczesna przeglądarka z WebGL

## Uruchomienie

```bash
npm install
npm run textures   # opcjonalnie: ponowne pobranie map CC BY 4.0
npm run dev
```

Dev server: `http://localhost:5173`.

Build statyczny (GitHub Pages):

```bash
npm run build
npm run preview    # lokalny podgląd katalogu dist/
```

Wyjście ląduje w `dist/` — ścieżki są względne (`base: './'`), więc działa
zarówno jako project site (`user.github.io/helioskop/`), jak i custom domain.

## Sterowanie

| Wejście | Działanie |
| --- | --- |
| Przeciągnij | obrót kamery (OrbitControls) |
| Scroll / szczypanie | przybliżenie |
| Klik ciała | zaznaczenie + śledzenie |
| **Space** | pauza / wznów |
| **R** | reset kamery (przegląd) |
| **+** / **-** | szybszy / wolniejszy czas |
| **0–9** | Słońce i planety |
| **Esc** | odznacz |

Pasek: Wznów/Pauza, 1 d / 10 d / 1 mies. / 1 rok / 10 lat, **Dziś**, **+100 lat**,
Orbity, Księżyce, Etykiety, Śledź, Reset kamery.

Księżyce pojawiają się przy zbliżeniu, zaznaczeniu rodzica albo włączonym
przełączniku (wszystkie trzy warunki jak w oryginale: toggle jest nadrzędny).

## Model

Pozycje liczy Kepler: elipsa z katalogowym mimośrodem, inklinacją i długością
średnią z epoki J2000. To nie jest VSOP87 — wystarcza do czytelnego idle.

Odległości w scenie są lekko ściśnięte (`r ∝ AU^0.58` + offset), żeby Merkury
nie tonął w tarczy Słońca, a Pluton mieścił się w kadrze przeglądu. Promienie
ciał są powiększone jak w oryginale.

## Tekstury

Mapy 2k: Solar System Scope / NASA, **CC BY 4.0**. Szczegóły w
[`ATTRIBUTION.md`](./ATTRIBUTION.md). Skrypt `npm run textures` pobiera je z
Wikimedia Commons (zapasowo z solarsystemscope.com).

## GitHub Pages

### Ręcznie

1. `npm run build`
2. W ustawieniach repo: Pages → Deploy from a branch → `gh-pages` **albo**
   folder `/docs` po skopiowaniu `dist/`.
3. Albo użyj workflow poniżej (Actions).

### Actions (zalecane)

Repozytorium zawiera [`.github/workflows/pages.yml`](./.github/workflows/pages.yml).
W Settings → Pages wybierz **GitHub Actions**. Push na `main` publikuje `dist/`.

```yml
# skrót: checkout → npm ci → npm run build → upload-pages-artifact → deploy-pages
```

Plik `public/.nojekyll` wyłącza przetwarzanie Jekylla (kropki w chunkach Vite).

## Stack

Vite · React 19 · TypeScript · React Three Fiber · drei · Three.js · Tailwind v4 · Zustand

## Licencja kodu

Kod aplikacji: MIT (to repozytorium). Tekstury: CC BY 4.0 — patrz ATTRIBUTION.md.
