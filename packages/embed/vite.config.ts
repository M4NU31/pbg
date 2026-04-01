import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PunchBug",
      formats: ["iife"],
      fileName: () => "punchbug.js",
    },
    outDir: resolve(__dirname, "../../apps/web/public/embed"),
    minify: "esbuild",
    rollupOptions: {
      external: [],
    },
  },
});
