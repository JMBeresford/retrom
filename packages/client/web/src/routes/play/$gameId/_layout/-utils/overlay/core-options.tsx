import { FocusContainer } from "@/components/fullscreen/focus-container";
import {
  ConfigSelect,
  ConfigSelectItem,
} from "@/components/fullscreen/menubar/config-inputs/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CoreOption,
  useCoreOptions,
} from "@/providers/emulator-js/core-options";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { memo, useState } from "react";

export const CoreOptions = function CoreOptions() {
  const { coreOptions } = useCoreOptions();

  return (
    <ScrollArea
      className={cn(
        "flex flex-col w-fit h-full min-w-48",
        "bg-background border-r *:scroll-p-[5dvh]",
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
          <div className="flex flex-col gap-2 scroll-m-6">
            {Object.entries(coreOptions).map(([label, opts]) => (
              <Option key={label} label={label} opts={opts} />
            ))}
          </div>
        </HotkeyLayer>
      </FocusContainer>
    </ScrollArea>
  );
};

const Option = memo(function Option(props: {
  label: string;
  opts: CoreOption;
}) {
  const [open, setOpen] = useState(false);
  const {
    label,
    opts: { value, allValues },
  } = props;
  const { setCoreOption } = useCoreOptions();

  return (
    <div key={label}>
      <ConfigSelect
        value={value}
        open={open}
        onValueChange={(newValue) => setCoreOption(label, newValue)}
        onOpenChange={(value) => {
          setOpen(value);
        }}
        triggerProps={{
          label,
          id: label,
        }}
      >
        {allValues
          .filter((v) => open || v === value)
          .map((val) => (
            <ConfigSelectItem key={val} value={val}>
              {val}
            </ConfigSelectItem>
          ))}
      </ConfigSelect>
    </div>
  );
});
