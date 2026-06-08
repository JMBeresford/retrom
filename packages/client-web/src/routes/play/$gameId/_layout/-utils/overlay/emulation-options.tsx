import { ConfigCheckbox } from "@/components/fullscreen/menubar/config-inputs/checkbox";
import { ConfigInput } from "@/components/fullscreen/menubar/config-inputs/input";
import { useEmulatorJS } from "@/providers/emulator-js";
import { useCallback, useState } from "react";
import { OverlayMenuItem } from ".";

export const emulationOptions: OverlayMenuItem = {
  label: "Emulation Options",
  labelSub: "Options related to emulation, e.g. speed and audio",
  items: [{ Render: EmulationOptions }],
};

type EmulationOptions = {
  ["ff-ratio"]: string;
  fastForward: "enabled" | "disabled";
};

export function EmulationOptions() {
  const emulatorJS = useEmulatorJS();
  const [volume, setVolume] = useState(Math.floor(emulatorJS.volume * 100));
  const [fastForward, _setFastForward] = useState(emulatorJS.isFastForward);
  const [ffRatio, _setFFRatio] = useState(
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

  const setFFRatio = useCallback(
    (value: string | number) => {
      const ratio = Number(value);
      if (isNaN(ratio) || ratio <= 1) {
        return;
      }

      setSetting("ff-ratio", String(ratio));
      _setFFRatio(String(ratio));
    },
    [setSetting],
  );

  const setFastForward = useCallback(
    (value: boolean) => {
      setSetting("fastForward", value ? "enabled" : "disabled");
      _setFastForward(value);
    },
    [setSetting],
  );

  return (
    <>
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

      <ConfigInput
        className="w-full"
        type="number"
        value={ffRatio}
        onChange={(e) => {
          if (typeof e === "number" || typeof e === "string") {
            setFFRatio(e);
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
    </>
  );
}
