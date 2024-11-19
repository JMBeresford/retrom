import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";

export function Description(props: { description: string }) {
  const { description } = props;
  const { ref, focused } = useFocusable<HTMLDivElement>({
    focusKey: "game-description",
    onFocus: ({ node }) => {
      if (node !== document.activeElement) {
        node?.focus();
      }
    },
    onBlur: ({ node }) => {
      if (node === document.activeElement) {
        node?.blur();
      }
    },
  });

  return (
    <HotkeyLayer
      id="game-description"
      handlers={{
        UP: {
          handler: (event) => {
            if (ref.current?.scrollTop === 0) {
              return;
            }

            ref.current?.scrollBy({ top: -100, behavior: "smooth" });
            event?.stopPropagation();
            event?.preventDefault();
          },
        },
        DOWN: {
          handler: (event) => {
            const scrolledToBottom =
              ref.current?.scrollTop + ref.current?.clientHeight ===
              ref.current?.scrollHeight;

            if (scrolledToBottom) {
              return;
            }

            ref.current?.scrollBy({ top: 100, behavior: "smooth" });
            event?.stopPropagation();
            event?.preventDefault();
          },
        },
      }}
    >
      <div
        className={cn(
          "px-4 py-2 border-l border-secondary mx-auto",
          "bg-transparent transition-all",
          "[&_*]:outline-none",
          "focus-hover:bg-muted/80 focus-hover:border-accent",
          focused && "bg-muted/80 border-accent",
        )}
      >
        <h3 className="text-3xl font-black uppercase mb-2">Description</h3>

        <ScrollArea
          ref={ref}
          tabIndex={-1}
          type={focused ? "auto" : "hover"}
          className={cn()}
        >
          <div>
            <p className="text-lg text-muted-foreground max-w-[75ch]">
              {description}
            </p>
          </div>
        </ScrollArea>
      </div>
    </HotkeyLayer>
  );
}
