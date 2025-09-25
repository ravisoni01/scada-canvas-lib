import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: "dist",
      include: ["src/**/*"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ScadaCanvas",
      fileName: (format) => {
        switch (format) {
          case "es":
            return "index.esm.js";
          case "cjs":
            return "index.cjs.js";
          case "umd":
            return "index.umd.js";
          default:
            return `index.${format}.js`;
        }
      },
      formats: ["es", "cjs", "umd"],
    },
    sourcemap: true,
    outDir: "dist",
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        globals: {},
      },
    },
  },
});
