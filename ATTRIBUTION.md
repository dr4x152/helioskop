# Atrybucja

## Tekstury planet (CC BY 4.0)

Mapy równokątne 2k w `public/textures/` pochodzą z biblioteki
**Solar System Scope Texture Library** (INOVE), opartej na danych i zdjęciach NASA
(Messenger, Viking, Cassini, Hubble, Blue Marble).

- Źródło: <https://www.solarsystemscope.com/textures/>
- Licencja: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
- Kopia na Wikimedia Commons: <https://commons.wikimedia.org/wiki/Category:Solar_System_Scope>

Pliki w tym repozytorium:

| Plik | Ciało |
| --- | --- |
| `2k_sun.jpg` | Słońce |
| `2k_mercury.jpg` | Merkury |
| `2k_venus_surface.jpg` | Wenus (powierzchnia) |
| `2k_earth_daymap.jpg` | Ziemia (dzień) |
| `2k_earth_clouds.jpg` | Ziemia (chmury) |
| `2k_mars.jpg` | Mars |
| `2k_moon.jpg` | Księżyc |
| `2k_saturn.jpg` | Saturn |
| `2k_uranus.jpg` | Uran |
| `2k_neptune.jpg` | Neptun |

Jowisz i Pluton nie mają mapy w pakiecie wymaganym przez projekt — Helioskop
rysuje je proceduralnie (pasma / plamy). Pierścienie Saturna i Urana też są
generowane w runtime.

## Model i dane

- Okresy, średnice i mimośrody: wartości katalogowe (NASA / IAU), zaokrąglone.
- Pozycje: **schematyczny Kepler** (elipsa + inklinacja + elementy średnie J2000),
  nie pełny VSOP87.
- Fakty w panelu ciała: polskie opisy z oryginalnego Helioskopu (grok.me),
  dostosowane do tego przebudowania.

## Oprogramowanie

Aplikacja używa React, React Three Fiber, drei, Three.js, Vite, Tailwind CSS
i Zustand — licencje MIT.
