import { copyFileSync, cpSync } from "fs";
import { execa } from "execa";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

async function getNodeBin() {
  const rustc = await execa("rustc", ["-vV"]);
  const rustcOut = rustc.stdout;

  const targetTriple = /host: (\S+)/g.exec(rustcOut)?.[1];

  if (!targetTriple) {
    throw new Error("Could not find target triple");
  }

  const dir = dirname(fileURLToPath(import.meta.url));
  const dest = `./bin/node-${targetTriple}${process.platform === "win32" ? ".exe" : ""}`;

  copyFileSync(process.execPath, resolve(dir, dest));
}

function prepareWebDir() {
  const dir = dirname(fileURLToPath(import.meta.url));

  let target = "web/.next/standalone";
  let dest = "web/.next/node-server";

  cpSync(resolve(dir, target), resolve(dir, dest), {
    recursive: true,
  });

  target = "web/.next/static";
  dest = "web/.next/node-server/packages/client/web/.next/static";

  cpSync(resolve(dir, target), resolve(dir, dest), {
    recursive: true,
  });

  target = "web/public";
  dest = "web/.next/node-server/packages/client/web/public";

  cpSync(resolve(dir, target), resolve(dir, dest), {
    recursive: true,
  });
}

getNodeBin().catch(console.error);
prepareWebDir();
