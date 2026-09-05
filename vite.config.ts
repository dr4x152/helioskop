import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite — ścieżki względne (`base: './'`), żeby statyczny build
 * działał zarówno lokalnie, jak i na GitHub Pages (project site).
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  build: {
    // Three + tekstury i tak dominują; próg tylko tłumi fałszywy warning.
    chunkSizeWarningLimit: 1200,
  },
});
