/** Ścieżka z `public/` z uwzględnieniem `base` Vite (GitHub Pages). */
export function publicUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${clean}`;
}
