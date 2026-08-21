import {
  ShikiHighlighter,
  createHighlighterCore,
  createOnigurumaEngine,
} from "react-shiki/core";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@retrom/ui-next/components/input-group";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui-next/components/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@retrom/ui-next/components/table";
import { Button } from "@retrom/ui-next/components/button";
import { useLibraryFormFieldContext } from "../defs";

const highlighter = await createHighlighterCore({
  themes: [import("@shikijs/themes/one-dark-pro")],
  langs: [import("@shikijs/langs/regex")],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

export function IgnorePatternsField() {
  const field = useLibraryFormFieldContext<Array<string>>();
  const [toAdd, setToAdd] = useState("");

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const patterns = field.state.value;

  const addPattern = () => {
    const newValue = toAdd.trim();
    if (newValue === "") return;

    field.pushValue(newValue);
    setToAdd("");
  };

  const removePattern = (index: number) => {
    field.removeValue(index);
  };

  return (
    <Field>
      <FieldLabel>Ignore Patterns</FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={`${field.name}-add`}
          placeholder="e.g. ^\.DS_Store$"
          value={toAdd}
          onChange={(event) => {
            setToAdd(event.target.value);
          }}
        />

        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary" onClick={addPattern}>
            <Plus /> Add
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <Accordion defaultValue={["patterns"]}>
        <AccordionItem
          value="patterns"
          disabled={patterns.length === 0}
          className="border px-2 rounded mt-2"
        >
          <AccordionTrigger className="text-muted-foreground">
            {patterns.length || "No"} pattern(s) configured
          </AccordionTrigger>
          <AccordionContent hidden={!patterns.length}>
            <Table className="border-t">
              <TableBody>
                {patterns.map((pattern, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-full">
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
                    <TableCell>
                      <Button
                        size="icon-xs"
                        variant="destructive"
                        onClick={() => removePattern(index)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <FieldDescription>
        Ignore patterns are <strong>regular expressions</strong> that are used
        to skip files and/or directories when scanning your library. Read the{" "}
        <a
          className="text-primary underline"
          href="https://github.com/JMBeresford/retrom/wiki/Configuration#ignore-patterns"
          target="_blank"
          rel="noreferrer"
        >
          documentation
        </a>{" "}
        to learn more.
      </FieldDescription>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
