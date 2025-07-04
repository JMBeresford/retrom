import dts from "vite-plugin-dts";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { join, resolve } from "node:path";

/**
 * @param {import("vite").ConfigEnv} _config
 * @returns {import("vite").UserConfig}
 */
export const definePluginConfig = (_config) => {
  const __dirname = resolve(process.cwd());

  return {
    root: __dirname,
    plugins: [
      nxViteTsPaths(),
      nxCopyAssetsPlugin(["*.md"]),
      dts({
        entryRoot: "guest-js",
        tsconfigPath: join(__dirname, "tsconfig.lib.json"),
      }),
    ],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        // Could also be a dictionary or array of multiple entry points.
        entry: "guest-js/index.ts",
        fileName: "index",
        // Change this to the formats you want to support.
        // Don't forget to update your package.json as well.
        formats: ["es"],
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: [],
      },
    },
  };
};
