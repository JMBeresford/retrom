import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retrom/ui-next/components/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@retrom/ui-next/components/table";
import { createHighlighterCore, createOnigurumaEngine } from "shiki";
import ShikiHighlighter from "react-shiki/core";
import { Button } from "@retrom/ui-next/components/button";
import type { Row } from "@tanstack/react-table";
import type { LibraryTableFeatures } from "../defs";
import type { Library } from "@retrom/codegen/retrom/services/library/v1/resources_pb";

const highlighter = await createHighlighterCore({
  themes: [import("@shikijs/themes/one-dark-pro")],
  langs: [import("@shikijs/langs/regex")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export function IgnorePatterns({
  row,
}: {
  row: Row<LibraryTableFeatures, Library>;
}) {
  const patterns = row.original.ignorePatterns;

  return (
    <Popover>
      <PopoverTrigger
        disabled={!patterns.length}
        render={<Button variant="outline" />}
      >
        {patterns.length} Ignore Pattern(s)
      </PopoverTrigger>

      <PopoverContent className="w-min min-w-40">
        <Table>
          <TableBody>
            {patterns.map((pattern, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <ShikiHighlighter
                    highlighter={highlighter}
                    language="regex"
                    theme="one-dark-pro"
                    structure="inline"
                    showLanguage={false}
                  >
                    {pattern.trim()}
                  </ShikiHighlighter>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PopoverContent>
    </Popover>
  );
}
