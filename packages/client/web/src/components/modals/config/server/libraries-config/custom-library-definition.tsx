import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import { LibrariesSchema } from ".";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { CustomLibraryDefinition } from "@/generated/retrom/server/config";
import { cn, InferSchema } from "@/lib/utils";
import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CustomLibraryDefinitionInput<
  Field extends ControllerRenderProps<
    LibrariesSchema,
    `contentDirectories.${number}.customLibraryDefinition.definition`
  >,
>(props: { field: Field; fieldState: ControllerFieldState }) {
  const { field, fieldState } = props;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "min-h-0 h-min w-min p-2",
            fieldState.error && "ring-2 ring-destructive",
          )}
          disabled={field.disabled}
        >
          <Settings2 className="h-[1rem] w-[1rem]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto max-w-[60ch] max-h-[80dvh] flex flex-col relative"
        side="left"
        avoidCollisions
        collisionPadding={4}
      >
        <h3 className="text-lg font-extrabold">Library Structure</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This describes how your library is structured, allowing Retrom to
          automatically scan for content. Read the{" "}
          <a
            className="text-accent-text underline"
            href="https://github.com/JMBeresford/retrom/wiki/Library-Structure#custom"
            target="_blank"
          >
            documentation
          </a>{" "}
          to learn more.
        </p>

        <FormItem>
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
        </FormItem>

        {field.value && fieldState.error === undefined ? (
          <ExampleStructure value={field.value} />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

const builtinMacros = ["{library}", "{platform}", "{gameFile}", "{gameDir}"];

function ExampleStructure(props: { value: string }) {
  const { value } = props;
  const parts = useMemo(() => {
    const parts = value.split("/");
    if (parts.includes("{gameDir}")) {
      parts.push("{gameFile}");
    }

    return parts;
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

export const CustomLibraryDefinitionSchema = z.object({
  definition: z.literal("").or(
    z
      .string()
      .refine(
        (value) =>
          value.startsWith("{library}") || value.startsWith("{platform}"),
        { message: "Must start with {library} or {platform}" },
      )
      .refine((value) => value.includes("{platform}"), {
        message: "Must contain {platform}",
      })
      .refine(
        (value) => value.includes("{gameFile}") || value.includes("gameDir"),
        {
          message: "Must contain {gameFile} or {gameDir}",
        },
      )
      .refine(
        (value) =>
          !(value.includes("{gameFile}") && value.includes("{gameDir}")),
        {
          message: "Cannot contain both {gameFile} and {gameDir}",
        },
      )
      .refine(
        (value) => {
          const gamePos = value.includes("{gameFile}")
            ? value.indexOf("{gameFile}")
            : value.indexOf("{gameDir}");

          const platformPos = value.indexOf("{platform}");

          return gamePos > platformPos;
        },
        { message: "{platform} must be before {gameDir} or {gameFile}" },
      )
      .refine(
        (value) =>
          builtinMacros.every((macro) => value.split(macro).length <= 2),
        (value) => {
          const macro = builtinMacros.find(
            (macro) => value.split(macro).length > 2,
          );

          return { message: `Must contain at most one ${macro}` };
        },
      )
      .refine(
        (value) => {
          for (let i = 0; i < value.length; i++) {
            const char = value[i];

            if (char === "{" && i !== 0 && value[i - 1] !== "/") {
              return false;
            }

            if (char === "}" && i + 1 > value.length && value[i + 1] !== "/") {
              return false;
            }
          }

          return true;
        },
        {
          message:
            "Macros must not be immediately followed or preceeded by anything but '/'",
        },
      )
      .refine((value) => !value.endsWith("/") && !value.startsWith("/"), {
        message: "Cannot end with a slash",
      })
      .refine((value) => !value.includes("//"), {
        message: "Cannot contain empty sections between slashes",
      }),
  ),
}) satisfies InferSchema<CustomLibraryDefinition>;
