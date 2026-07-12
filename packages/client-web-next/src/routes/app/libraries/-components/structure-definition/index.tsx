import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retrom/ui-next/components/popover";
import { Button } from "@retrom/ui-next/components/button";
import { Settings2 } from "lucide-react";
import { Input } from "@retrom/ui-next/components/input";
import { z } from "zod";
import { cn } from "@retrom/ui-next/lib/utils";
import { useLayoutEffect, useMemo } from "react";
import { Separator } from "@retrom/ui-next/components/separator";
import { ScrollArea } from "@retrom/ui-next/components/scroll-area";
import type { librarySchema } from "../schema";

export function CustomLibraryDefinitionInput<
  TField extends ControllerRenderProps<
    LibrariesSchema,
    `contentDirectories.${number}.customLibraryDefinition.definition`
  >,
>(props: { field: TField; fieldState: ControllerFieldState; index: number }) {
  const { field, fieldState, index } = props;

  const storageType = useWatch<LibrariesSchema>({
    name: `contentDirectories.${index}.storageType`,
  });

  useLayoutEffect(() => {
    if (storageType !== StorageType.CUSTOM && field.value) {
      field.onChange("");
    }
  }, [storageType, index, field]);

  return (
    <Popover>
      <FormItem>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className={cn(
              "w-full flex gap-2 sm:min-h-0 sm:w-min sm:h-min sm:p-2",
              !field.disabled && fieldState.error && "ring-2 ring-destructive",
            )}
            disabled={field.disabled}
          >
            <span className="sm:hidden">Configure Library Structure</span>
            <Settings2 className="h-[1rem] w-[1rem]" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[90dvw] p-4 sm:w-auto sm:max-w-[60ch] max-h-[80dvh] flex flex-col">
          <h3 className="text-lg font-extrabold">Library Structure</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This describes how your library is structured, allowing Retrom to
            automatically scan for content. Read the{" "}
            <a
              className="text-accent-text underline"
              href="https://github.com/JMBeresford/retrom/wiki/Library-Structure#custom"
              target="_blank"
              rel="noreferrer"
            >
              documentation
            </a>{" "}
            to learn more.
          </p>

          <div className="flex gap-2">
            <FormControl>
              <Input
                {...field}
                autoComplete="off"
                placeholder="ex: {library}/{platform}/{gameFile}"
              />
            </FormControl>

            <PopoverClose asChild>
              <Button>Done</Button>
            </PopoverClose>
          </div>
          <FormMessage />

          {field.value && fieldState.error === undefined ? (
            <ExampleStructure value={field.value} />
          ) : null}
        </PopoverContent>
      </FormItem>
    </Popover>
  );
}

const builtinMacros = ["{library}", "{platform}", "{gameFile}", "{gameDir}"];

function ExampleStructure(props: { value: string }) {
  const { value } = props;
  const parts = useMemo(() => {
    const p = value.split("/");
    if (p.includes("{gameDir}")) {
      p.push("{gameFile}");
    }

    return p;
  }, [value]);

  function Entry(props: { depth: number }) {
    const { depth } = props;
    const part = parts.at(depth);

    if (part === undefined) {
      return null;
    }

    const name = part.replace("{", "").replace("}", "");
    const builtIn = builtinMacros.includes(part);
    const custom = !builtIn && part.startsWith("{") && part.endsWith("}");

    function Indentation() {
      return (
        <span
          className={cn(
            "flex h-1/2 before:w-full before:bg-border before:h-px items-end pb-px",
            depth && "w-[1ch] mr-[1ch]",
          )}
        />
      );
    }

    function File() {
      return (
        <span className="flex">
          <Indentation />
          <span>gameFile.rom</span>
        </span>
      );
    }

    function Directory() {
      return (
        <span className="flex flex-col">
          <span className="flex">
            <Indentation />
            {name}
            <span
              className={cn(
                (builtIn || custom) && "text-accent-text font-bold",
              )}
            >
              /
            </span>
          </span>

          <span className={cn("flex flex-col", depth && "*:ml-[2ch]")}>
            <span className="border-l-[1px]">
              <Entry depth={depth + 1} />
            </span>
            <span
              className={cn(
                "relative before:absolute",
                "before:h-[1ch] before:w-px before:bg-border",
              )}
            >
              <Entry depth={depth + 1} />
            </span>
          </span>
        </span>
      );
    }

    return (
      <span
        className={cn(
          "flex text-muted-foreground font-thin",
          (builtIn || custom) && "text-foreground font-normal",
        )}
      >
        {part === "{gameFile}" ? <File /> : <Directory />}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-4 overflow-hidden">
      <Separator className="mb-2" />
      <p className="text-sm italic">
        Example library based on the current value:
      </p>

      <ScrollArea className="flex flex-col bg-muted p-2 rounded-sm" type="auto">
        <pre className={cn("flex flex-col text-foreground text-sm")}>
          <Entry depth={0} />
        </pre>
      </ScrollArea>
    </div>
  );
}
