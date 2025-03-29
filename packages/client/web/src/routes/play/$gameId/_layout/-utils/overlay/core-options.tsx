import { FocusContainer } from "@/components/fullscreen/focus-container";
import {
  ConfigSelect,
  ConfigSelectItem,
} from "@/components/fullscreen/menubar/config-inputs/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEmulatorJS } from "@/providers/emulator-js";
import { HotkeyLayer } from "@/providers/hotkeys/layers";

export function CoreOptions() {
  const { settings } = useEmulatorJS();
  const { coreOptions, setCoreOption } = settings;

  return (
    <ScrollArea
      className={cn(
        "flex flex-col w-fit h-full min-w-48",
        "bg-background border-r",
      )}
    >
      <FocusContainer
        className={cn(
          "block py-8",
          "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
        )}
        onFocus={(e) => e.target.scrollIntoView({ block: "center" })}
        opts={{
          focusKey: "core-options",
        }}
      >
        <HotkeyLayer id="core-options">
          <div className="flex flex-col gap-2">
            {Object.entries(coreOptions).map(
              ([label, { value, allValues }]) => (
                <div key={label}>
                  <ConfigSelect
                    value={value}
                    onValueChange={(newValue) => setCoreOption(label, newValue)}
                    triggerProps={{
                      label,
                      id: label,
                    }}
                  >
                    {allValues.map((value) => (
                      <ConfigSelectItem key={value} value={value}>
                        {value}
                      </ConfigSelectItem>
                    ))}
                  </ConfigSelect>
                </div>
              ),
            )}
          </div>
        </HotkeyLayer>
      </FocusContainer>
    </ScrollArea>
  );
}
