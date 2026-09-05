/**
 * Ładuje mapę z public/ bez wywalania Suspense, gdy pliku brak.
 * Przy błędzie zostaje null — mesh użyje koloru / tekstury proceduralnej.
 */

import { useEffect, useState } from "react";
import { LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace, Texture, TextureLoader } from "three";
import { publicUrl } from "../lib/publicUrl";

const loader = new TextureLoader();
const memo = new Map<string, Texture | null>();
const inflight = new Map<string, Promise<Texture | null>>();

function loadOnce(url: string): Promise<Texture | null> {
  if (memo.has(url)) return Promise.resolve(memo.get(url) ?? null);
  const pending = inflight.get(url);
  if (pending) return pending;
  const job = new Promise<Texture | null>((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.minFilter = LinearMipmapLinearFilter;
        tex.magFilter = LinearFilter;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        memo.set(url, tex);
        inflight.delete(url);
        resolve(tex);
      },
      undefined,
      () => {
        memo.set(url, null);
        inflight.delete(url);
        resolve(null);
      },
    );
  });
  inflight.set(url, job);
  return job;
}

export function useSafeTexture(path: string | null | undefined): Texture | null {
  const url = path ? publicUrl(path) : null;
  const [tex, setTex] = useState<Texture | null>(() => (url ? (memo.get(url) ?? null) : null));

  useEffect(() => {
    if (!url) {
      setTex(null);
      return;
    }
    let alive = true;
    void loadOnce(url).then((loaded) => {
      if (alive) setTex(loaded);
    });
    return () => {
      alive = false;
    };
  }, [url]);

  return tex;
}
