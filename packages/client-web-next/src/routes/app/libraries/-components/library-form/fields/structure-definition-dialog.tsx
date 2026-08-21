import { Input } from "@retrom/ui-next/components/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@retrom/ui-next/components/field";
import { useMemo } from "react";
import { cn } from "@retrom/ui-next/lib/utils";
import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retrom/ui-next/components/accordion";
import { builtinMacros } from "../schema";
import { useLibraryFormFieldContext } from "..";

export function StructureDefinitionField() {
  const field = useLibraryFormFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className="mt-2">
      <FieldLabel>Structure Definition</FieldLabel>

      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        autoComplete="off"
        placeholder="{library}/{platform}/{game}"
      />

      <FieldDescription>
        This describes how your library is structured, allowing Retrom to
        automatically scan for content. Read the{" "}
        <a
          className="text-primary underline"
          href="https://github.com/JMBeresford/retrom/wiki/Library-Structure#custom"
          target="_blank"
          rel="noreferrer"
        >
          documentation
        </a>{" "}
        to learn more.
      </FieldDescription>

      {isInvalid ? (
        <FieldError errors={field.state.meta.errors} />
      ) : (
        <Accordion>
          <AccordionItem className="border px-2 rounded mt-2">
            <AccordionTrigger className="text-muted-foreground">
              Interactive Demo Structure
            </AccordionTrigger>
            <AccordionContent className="">
              <ExampleStructure value={field.state.value} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Field>
  );
}

function ExampleStructure(props: { value: string }) {
  const { value } = props;
  const parts = useMemo(() => {
    const p = value.split("/");

    return p;
  }, [value]);

  // function Entry({ depth, suffix }: { depth: number; suffix?: string }) {
  //   const part = parts.at(depth);
  //
  //   if (part === undefined) {
  //     return null;
  //   }
  //
  //   const name = part.replace("{", "").replace("}", "");
  //   const builtIn = builtinMacros.includes(part);
  //   const custom = !builtIn && part.startsWith("{") && part.endsWith("}");
  //
  //   return (
  //     <span
  //       className={cn(
  //         "flex text-muted-foreground",
  //         (builtIn || custom) && "text-foreground font-normal",
  //       )}
  //     >
  //       {part === "{game}" ? <File /> : <Directory />}
  //     </span>
  //   );
  // }

  return (
    <div className="flex flex-col gap-2 overflow-hidden">
      <ScrollArea className="flex flex-col bg-input/50 p-2 rounded-sm">
        <pre className={cn("flex flex-col text-foreground text-sm")}>
          <span className="flex">
            <Directory parts={parts} depth={0} />
          </span>
        </pre>
      </ScrollArea>
    </div>
  );
}

function isMacro(part: string) {
  return (
    builtinMacros.includes(part) || (part.startsWith("{") && part.endsWith("}"))
  );
}

function partName(part: string) {
  return part.replace("{", "").replace("}", "");
}

function Indentation({ depth }: { depth: number }) {
  return (
    <div className="grid items-center">
      <span
        data-depth={depth}
        className={cn(
          "flex flex-col before:w-full before:bg-border before:h-px pb-px",
          "w-[1ch] mr-[1ch]",
        )}
      />
    </div>
  );
}

function File({
  name,
  suffix,
  depth,
  extension = ".rom",
}: {
  name: string;
  suffix?: string;
  depth: number;
  extension?: string;
}) {
  return (
    <span className="flex">
      <Indentation depth={depth} />
      <span>
        {name}
        {suffix}
        {extension}
      </span>
    </span>
  );
}

function GameDirectory({ suffix, depth }: { suffix?: string; depth: number }) {
  const name = `game${suffix ?? ""}`;

  return (
    <span className="flex flex-col">
      <span className="flex items-stretch">
        <Indentation depth={depth} />
        {name}
        <span className={cn("text-accent-text font-bold")}>/</span>
      </span>

      <span className={cn("flex flex-col", depth && "*:ml-[2ch]")}>
        <span className="border-l">
          <File name="gamefile_1" extension=".bin" depth={depth + 1} />
        </span>
        <span
          className={cn(
            "relative before:absolute",
            "before:h-[1ch] before:w-px before:bg-border",
          )}
        >
          <File name="gamefile_2" extension=".cue" depth={depth + 1} />
        </span>
      </span>
    </span>
  );
}

function Directory({
  parts,
  depth,
  suffix,
}: {
  parts: Array<string>;
  depth: number;
  suffix?: string;
}) {
  const part = parts.at(depth);
  const nextPart = parts.at(depth + 1);
  const nextIsGame = nextPart === "{game}";

  if (part === undefined) {
    return null;
  }

  const name = `${partName(part)}${suffix ?? ""}`;

  return (
    <span className="flex flex-col">
      <span className="flex items-stretch">
        {depth > 0 && <Indentation depth={depth} />}
        <span
          className={cn(
            isMacro(part) ? "text-accent-text" : "text-muted-foreground",
          )}
        >
          {isMacro(part) ? name : "(untracked)"}/
        </span>
      </span>

      <span className={cn("flex flex-col", depth && "*:ml-[2ch]")}>
        <span className="border-l">
          {nextIsGame ? (
            <File name="game_1" depth={depth + 1} />
          ) : (
            <Directory parts={parts} depth={depth + 1} suffix="_1" />
          )}
        </span>
        <span
          className={cn(
            "relative before:absolute",
            "before:h-[1ch] before:w-px before:bg-border",
          )}
        >
          {nextIsGame ? (
            <GameDirectory suffix="_2" depth={depth} />
          ) : (
            <Directory parts={parts} depth={depth + 1} suffix="_2" />
          )}
        </span>
      </span>
    </span>
  );
}
