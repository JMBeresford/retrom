import { FocusContainer } from "@/components/fullscreen/focus-container";
import { ConfigCheckbox } from "@/components/fullscreen/menubar/config-inputs/checkbox";
import { ConfigInput } from "@/components/fullscreen/menubar/config-inputs/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EmulatorJS } from "@/lib/emulatorjs/emulator";
import { cn } from "@/lib/utils";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useCallback, useState } from "react";

type EmulationOptions = {
  ["ff-ratio"]: string;
  fastForward: "enabled" | "disabled";
};

export function EmulationOptions(props: { emulatorJS: EmulatorJS }) {
  const { emulatorJS } = props;
  const [volume, setVolume] = useState(Math.floor(emulatorJS.volume * 100));
  const [fastForward, _setFastForward] = useState(emulatorJS.isFastForward);
  const [ffRatio, setFFRatio] = useState(
    emulatorJS.settings["ff-ratio"] ?? "3.0",
  );

  /**
   * Muted state is derived from volume in EJS internals,
   * setting volume to 0 will mute the emulator.
   *
   * This means we need to duplicate that logic
   * here to trigger re-renders correctly
   */
  const setEmulatorVolume = useCallback(
    (value: number) => {
      emulatorJS.volume = value / 100;
      emulatorJS.setVolume(value / 100);
      setVolume(value);
    },
    [emulatorJS],
  );

  const setSetting = useCallback(
    <K extends keyof EmulationOptions>(key: K, value: EmulationOptions[K]) => {
      emulatorJS.changeSettingOption(key, value);
      // emulatorJS.menuOptionChanged(key, value);
    },
    [emulatorJS],
  );

  const setFastForward = useCallback(
    (value: boolean) => {
      setSetting("fastForward", value ? "enabled" : "disabled");
      _setFastForward(value);
    },
    [setSetting],
  );

  return (
    <ScrollArea
      className={cn(
        "flex flex-col w-fit h-full min-w-48",
        "bg-background border-r",
      )}
    >
      <FocusContainer
        className={cn(
          "flex flex-col gap-2 py-6",
          "transition-opacity ease-in-out [&:not(:focus-within):not(:hover)]:opacity-50",
        )}
        onFocus={(e) => e.target.scrollIntoView({ block: "center" })}
        opts={{
          focusKey: "emulation-options",
        }}
      >
        <HotkeyLayer id="emulation-options">
          <ConfigInput
            className="w-full"
            value={volume}
            type="number"
            onChange={(e) => {
              if (typeof e === "number" || typeof e === "string") {
                setEmulatorVolume(Number(e));
              }
            }}
            min={0}
            max={100}
            step={1}
            label="Volume"
          />

          <ConfigCheckbox
            id="emulation-options-muted"
            label="Muted"
            checked={volume === 0}
            onCheckedChange={(v) => {
              if (v) {
                setEmulatorVolume(0);
              } else {
                setEmulatorVolume(5);
              }
            }}
          >
            Mutes the emulator audio
          </ConfigCheckbox>

          <Separator className="w-[90%] mx-auto" />

          <ConfigInput
            className="w-full"
            type="number"
            value={ffRatio}
            onChange={(e) => {
              if (typeof e === "number" || typeof e === "string") {
                setFFRatio(e);
                setSetting("ff-ratio", e);
              }
            }}
            min={1.25}
            max={10}
            step={0.25}
            bigStep={1}
            label="Fast Forward Ratio"
          />

          <ConfigCheckbox
            id="emulation-options-fast_forward"
            label="Fast Forward"
            checked={fastForward}
            onCheckedChange={(v) => {
              setFastForward(!!v);
            }}
          >
            Increases emulation speed
          </ConfigCheckbox>
        </HotkeyLayer>
      </FocusContainer>
    </ScrollArea>
  );
}
