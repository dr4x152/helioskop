/**
 * Pobiera tekstury 2k (CC BY 4.0) Solar System Scope / NASA
 * do public/textures/. Kilka źródeł zapasowych, bo Wikimedia
 * i solarsystemscope.com czasem różnie odpowiadają na User-Agent.
 */
import { createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "textures");

/** Minimalny rozmiar pliku — poniżej tego uznajemy pobranie za nieudane. */
const MIN_BYTES = 20_000;

/**
 * Nazwy zgodne z live app + wymaganiem zadania.
 * Jupiter i Pluton świadomie pominięte — fallback proceduralny.
 */
const FILES = [
  "2k_sun.jpg",
  "2k_mercury.jpg",
  "2k_venus_surface.jpg",
  "2k_earth_daymap.jpg",
  "2k_earth_clouds.jpg",
  "2k_mars.jpg",
  "2k_moon.jpg",
  "2k_saturn.jpg",
  "2k_uranus.jpg",
  "2k_neptune.jpg",
];

/** Wikimedia: Special:FilePath przekierowuje na aktualny upload. */
const wikimedia = (file) => {
  const wikiName = `Solarsystemscope_texture_${file}`;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${wikiName}`;
};

const solarsystemscope = (file) =>
  `https://www.solarsystemscope.com/textures/download/${file}`;

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      // Wikimedia czasem blokuje domyślny UA Node.
      "User-Agent": "HelioskopTextureFetcher/1.0 (https://github.com/dr4x152/helioskop; educational)",
      Accept: "image/jpeg,image/*,*/*",
    },
  });
  if (!res.ok || !res.body) {
    throw new Error(`${res.status} ${res.statusText} — ${url}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  const size = statSync(dest).size;
  if (size < MIN_BYTES) {
    throw new Error(`za mały plik (${size} B) z ${url}`);
  }
  return size;
}

async function ensure(file) {
  const dest = join(outDir, file);
  if (existsSync(dest) && statSync(dest).size >= MIN_BYTES) {
    console.log(`✓ już jest  ${file}  (${statSync(dest).size} B)`);
    return;
  }
  const sources = [wikimedia(file), solarsystemscope(file)];
  let lastErr = null;
  for (const url of sources) {
    try {
      const size = await download(url, dest);
      console.log(`✓ pobrano  ${file}  (${size} B)  ← ${url}`);
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`✗ ${file} z ${url}: ${err.message}`);
    }
  }
  throw lastErr ?? new Error(`nie udało się pobrać ${file}`);
}

mkdirSync(outDir, { recursive: true });
let failed = 0;
for (const file of FILES) {
  try {
    await ensure(file);
  } catch (err) {
    failed += 1;
    console.error(`!! ${file}: ${err.message}`);
  }
}
if (failed) {
  console.error(`Nie pobrano ${failed} plików. Aplikacja użyje kolorów zapasowych.`);
  process.exitCode = 1;
} else {
  console.log("Wszystkie wymagane tekstury są na miejscu.");
}
