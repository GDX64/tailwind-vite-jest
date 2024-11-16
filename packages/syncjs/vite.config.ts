import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  worker: {
    format: "es",
  },
  plugins: [dts({}) as any],
  build: {
    minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        lib: path.resolve(__dirname, "src/lib.ts"),
      },
      name: "syncjs",
      formats: ["es"],
      // fileName: "syncjs",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue", "pixi.js"],
    },
  },
});
