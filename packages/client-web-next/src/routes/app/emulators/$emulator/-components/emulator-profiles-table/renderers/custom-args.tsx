import { createHighlighterCore, createOnigurumaEngine } from "shiki";
import ShikiHighlighter from "react-shiki/core";
import type { Row } from "@tanstack/react-table";
import type { EmulatorProfileTableFeatures } from "../defs";
import type { EmulatorProfile } from "@retrom/codegen/retrom/services/emulators/v1/emulator_profile_pb";

const highlighter = await createHighlighterCore({
  themes: [import("@shikijs/themes/one-dark-pro")],
  langs: [import("@shikijs/langs/bash")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export function CustomArgsCell({
  row,
}: {
  row: Row<EmulatorProfileTableFeatures, EmulatorProfile>;
}) {
  return (
    <ShikiHighlighter
      highlighter={highlighter}
      language="bash"
      theme="one-dark-pro"
      structure="inline"
      showLanguage={false}
    >
      {row.original.customArgs}
    </ShikiHighlighter>
  );
}
