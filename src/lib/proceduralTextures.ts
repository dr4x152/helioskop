/**
 * Tekstury awaryjne (Jowisz, Pluton, pierścienie, poświata Słońca)
 * oraz drobne księżyce bez mapy. Generowane raz, cache'owane.
 */

import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
} from "three";

const cache = new Map<string, CanvasTexture>();

function finish(key: string, canvas: HTMLCanvasElement): CanvasTexture {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}

function getCached(key: string, build: () => HTMLCanvasElement): CanvasTexture {
  const hit = cache.get(key);
  if (hit) return hit;
  return finish(key, build());
}

/** Deterministyczny szum 0..1 — bez biblioteki. */
function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Pasma Jowisza + Wielka Czerwona Plama. */
export function jupiterTexture(): CanvasTexture {
  return getCached("jupiter", () => {
    const w = 1024;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const bands = [
      ["#c9b48a", 0.0],
      ["#e8d3a4", 0.12],
      ["#b8895a", 0.22],
      ["#f0e0b8", 0.34],
      ["#c49a68", 0.46],
      ["#ead4a6", 0.58],
      ["#a87448", 0.7],
      ["#dcc8a0", 0.82],
      ["#c4ae86", 1],
    ] as const;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    for (const [color, stop] of bands) g.addColorStop(stop, color);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const n = (hash2(x * 0.04, y * 0.18) - 0.5) * 28;
        const i = (y * w + x) * 4;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n * 0.7));
        d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n * 0.4));
      }
    }
    ctx.putImageData(img, 0, 0);
    // Wielka Czerwona Plama — eliptyczna, na południowej półkuli.
    ctx.fillStyle = "rgba(176, 72, 48, 0.72)";
    ctx.beginPath();
    ctx.ellipse(w * 0.72, h * 0.62, 70, 36, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(210, 120, 80, 0.35)";
    ctx.beginPath();
    ctx.ellipse(w * 0.72, h * 0.62, 42, 20, -0.25, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  });
}

/** Pluton: ochra + jaśniejsza „plama serca”. */
export function plutoTexture(): CanvasTexture {
  return getCached("pluto", () => {
    const w = 512;
    const h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#b89a7c";
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const n = hash2(x * 0.08, y * 0.08);
        const i = (y * w + x) * 4;
        const shade = 90 + n * 90;
        d[i] = shade + 40;
        d[i + 1] = shade + 18;
        d[i + 2] = shade - 8;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = "rgba(232, 210, 190, 0.7)";
    ctx.beginPath();
    ctx.ellipse(w * 0.42, h * 0.52, 70, 58, 0.4, 0, Math.PI * 2);
    ctx.fill();
    return canvas;
  });
}

/** Jednolity + szum — Io, Tytan, Charon itd. */
export function moonTexture(id: string, hex: string): CanvasTexture {
  return getCached(`moon:${id}`, () => {
    const w = 256;
    const h = 128;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const n = (hash2(x * 0.2 + id.length, y * 0.2) - 0.5) * 40;
        const i = (y * w + x) * 4;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
        d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  });
}

/** Radialny gradient pierścieni (przerwy jak Cassini — uproszczone). */
export function ringTexture(): CanvasTexture {
  return getCached("rings", () => {
    const w = 1024;
    const h = 8;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let x = 0; x < w; x += 1) {
      const u = x / (w - 1);
      let a = 0;
      if (u < 0.08) a = u / 0.08;
      else if (u > 0.92) a = (1 - u) / 0.08;
      else a = 0.75 + Math.sin(u * 70) * 0.12;
      // Przerwa Cassiniego — ciemniejszy pas w ~2/3.
      if (u > 0.58 && u < 0.66) a *= 0.12;
      if (u > 0.3 && u < 0.33) a *= 0.35;
      const c = 210 + Math.sin(u * 40) * 20;
      for (let y = 0; y < h; y += 1) {
        const i = (y * w + x) * 4;
        d[i] = c;
        d[i + 1] = c - 12;
        d[i + 2] = c - 36;
        d[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  });
}

/** Miękka poświata Słońca (sprite). */
export function glowTexture(): CanvasTexture {
  return getCached("glow", () => {
    const s = 256;
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255, 236, 190, 1)");
    g.addColorStop(0.25, "rgba(255, 200, 120, 0.55)");
    g.addColorStop(0.55, "rgba(255, 160, 70, 0.16)");
    g.addColorStop(1, "rgba(255, 140, 40, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return canvas;
  });
}

/** Miękki krążek — kometa, meteory, pył (bez kwadratowych Points). */
export function softDiscTexture(): CanvasTexture {
  return getCached("softdisc", () => {
    const s = 128;
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.35, "rgba(230,240,255,0.45)");
    g.addColorStop(1, "rgba(200,220,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    return canvas;
  });
}

/** Wstęga ogona: jasna przy jądrze, znika na końcu, miękkie boki. */
export function cometTailTexture(): CanvasTexture {
  return getCached("comettail", () => {
    const w = 64;
    const h = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let y = 0; y < h; y += 1) {
      const v = y / (h - 1);
      const along = Math.pow(1 - v, 1.35);
      for (let x = 0; x < w; x += 1) {
        const u = (x / (w - 1)) * 2 - 1;
        const side = Math.exp(-u * u * 5.2);
        const a = along * side;
        const i = (y * w + x) * 4;
        d[i] = 220;
        d[i + 1] = 235;
        d[i + 2] = 255;
        d[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  });
}

/** Dysk spiralny do trybu „Kosmos lokalny”. */
export function galaxyDiskTexture(id: string, hex: string): CanvasTexture {
  return getCached(`galaxy:${id}`, () => {
    const s = 256;
    const canvas = document.createElement("canvas");
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    const cx = s / 2;
    const cy = s / 2;
    ctx.clearRect(0, 0, s, s);
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, s / 2);
    g.addColorStop(0, "rgba(255,248,230,1)");
    g.addColorStop(0.18, hex);
    g.addColorStop(0.48, "rgba(170,190,230,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "rgba(230,220,200,0.3)";
    ctx.lineWidth = 7;
    for (let arm = 0; arm < 3; arm += 1) {
      ctx.beginPath();
      for (let i = 0; i < 90; i += 1) {
        const t = i / 90;
        const a = arm * 2.1 + t * 4.6;
        const r = 16 + t * 100;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.72;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return canvas;
  });
}
