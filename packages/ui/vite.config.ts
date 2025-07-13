/// <reference types='vitest' />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { resolve, relative, extname } from "node:path";
import { globSync } from "glob";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => ({
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
    outDir: "./dist",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: Object.fromEntries(
        globSync(resolve(__dirname, "src/**/*.{ts,tsx}"), {
          windowsPathsNoEscape: true,
        }).map((f) => [
          relative("src", f.slice(0, f.length - extname(f).length)),
          resolve(__dirname, f),
        ]),
      ),
      name: "@retrom/ui",
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ["es" as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ["react", "react/jsx-runtime", "react-dom", "tailwindcss"],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-dom": "ReactDOM",
          tailwindcss: "tailwindcss",
        },
      },
    },
  },
}));
