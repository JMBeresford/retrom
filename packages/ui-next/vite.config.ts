import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { globSync } from "glob";
import dts from "vite-plugin-dts";
import { resolve, relative, extname } from "node:path";

export default defineConfig({
  root: __dirname,
  plugins: [
    nxViteTsPaths(),
    react(),
    tailwindcss(),
    nxCopyAssetsPlugin([
      "*.md",
      { glob: "**/*", input: "src/styles", output: "styles" },
    ]),
    dts({
      tsconfigPath: resolve(__dirname, "tsconfig.lib.json"),
    }),
  ],
  build: {
    lib: {
      entry: Object.fromEntries(
        globSync(resolve(__dirname, "src/**/*.{ts,tsx}"), {
          windowsPathsNoEscape: true,
        }).map((f) => [
          relative("src", f.slice(0, f.length - extname(f).length)),
          resolve(__dirname, f),
        ]),
      ),
      formats: ["es" as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "tailwindcss",
        "tw-animate-css",
      ],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-dom": "ReactDOM",
          tailwindcss: "tailwindcss",
          "tw-animate-css": "tw-animate-css",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
