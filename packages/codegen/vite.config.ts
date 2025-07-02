/// <reference types='vitest' />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative, extname } from "node:path";
import { globSync } from "glob";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  root: __dirname,
  plugins: [
    nxViteTsPaths(),
    nxCopyAssetsPlugin(["*.md"]),
    dts({
      entryRoot: "generated",
      tsconfigPath: resolve(__dirname, "tsconfig.lib.json"),
    }),
  ],
  build: {
    outDir: resolve(__dirname, "./dist"),
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: Object.fromEntries(
        globSync(resolve(__dirname, "generated/**/*.ts")).map((f) => [
          relative("generated", f.slice(0, f.length - extname(f).length)),
          resolve(__dirname, f),
        ]),
      ),
      name: "@retrom/codegen",
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ["es" as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [],
    },
  },
}));
