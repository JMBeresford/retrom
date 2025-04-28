import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, X } from "lucide-react";
import { CSSProperties, useCallback, useRef } from "react";
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import theme from "react-syntax-highlighter/dist/esm/styles/prism/nord";
import { LibrariesSchema } from ".";

export function IgnorePatternsInput<
  Field extends ControllerRenderProps<
    LibrariesSchema,
    `contentDirectories.${number}.ignorePatterns.patterns`
  >,
>(props: { field: Field; fieldState: ControllerFieldState }) {
  const input = useRef<HTMLInputElement>(null);
  const { field } = props;

  const addPattern = useCallback(() => {
    if (!input.current) {
      return;
    }

    if (field.value.includes(input.current.value)) {
      input.current.value = "";
      return;
    }

    field.onChange([...field.value, input.current.value]);

    input.current.value = "";
  }, [field]);

  const removePattern = useCallback(
    (pattern: string) => {
      field.onChange(field.value.filter((p) => p !== pattern));
    },
    [field],
  );

  return (
    <Popover>
      <FormItem className="sm:contents w-full">
        <FormLabel className="sm:hidden">Ignore Patterns</FormLabel>
        <FormControl>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              disabled={field.disabled}
            >
              {field.value.length
                ? `${field.value.length} ${field.value.length > 1 ? "patterns" : "pattern"}`
                : "Add pattern"}
            </Button>
          </PopoverTrigger>
        </FormControl>

        <PopoverContent className="flex flex-col gap-2 w-full">
          <div className="flex gap-2">
            <Input
              ref={input}
              placeholder="Enter ignore pattern..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  addPattern();
                }
              }}
            />
            <Button onClick={addPattern}>Add</Button>
          </div>

          <Separator className="mt-2" />

          <FormItem>
            {field.value.length ? (
              field.value.map((pattern, i) => (
                <div
                  key={pattern + i}
                  className="flex gap-2 items-center justify-between mt-2 py-1"
                >
                  <SyntaxHighlighter
                    language={"regex"}
                    style={theme as { [key: string]: CSSProperties }}
                    customStyle={{ background: "none", padding: 0, margin: 0 }}
                    codeTagProps={{ className: "bg-none text-sm" }}
                  >
                    {pattern}
                  </SyntaxHighlighter>

                  <Button
                    variant="destructive"
                    className="w-min h-min p-2"
                    onClick={() => removePattern(pattern)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))
            ) : (
              <>
                <p className="text-muted-foreground text-sm italic text-center">
                  No ignore patterns added
                </p>
              </>
            )}
          </FormItem>
        </PopoverContent>
      </FormItem>
    </Popover>
  );
}

export function IgnorePatternsTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info size={14} className="text-accent-text" />
        </TooltipTrigger>

        <TooltipContent className="max-w-[45ch]">
          Ignore patterns are <strong>regular expressions</strong> that are used
          to skip files and/or directories when scanning your library.
          <br />
          <br />
          <a
            href="https://github.com/JMBeresford/retrom/wiki/Configuration#ignore-patterns"
            target="_blank"
            className="text-accent-text"
          >
            See Documentation
          </a>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
