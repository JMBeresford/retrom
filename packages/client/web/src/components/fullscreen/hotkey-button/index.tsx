import { Button, ButtonProps } from "@/components/ui/button";
import { Code } from "@/components/ui/code";
import { cn } from "@/lib/utils";
import { useGamepadContext } from "@/providers/gamepad";
import { getButtonMapValue } from "@/providers/gamepad/maps";
import {
  Hotkey,
  HotkeyToGamepadButton,
  HotkeyToKeyboardHotkey,
} from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useInputDeviceContext } from "@/providers/input-device";
import { ComponentProps, forwardRef, useImperativeHandle, useRef } from "react";

export const HotkeyButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { hotkey: Hotkey }
>((props, forwardedRef) => {
  const ref = useRef<HTMLButtonElement>(null!);
  useImperativeHandle(forwardedRef, () => ref.current);
  const { children, className, hotkey, ...rest } = props;

  return (
    <HotkeyLayer
      id={props.id}
      handlers={{
        ACCEPT: {
          handler: () => ref.current.click(),
        },
      }}
    >
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2 focus-hover:bg-white/5 transition-all",
          className,
        )}
        {...rest}
      >
        <HotkeyIcon hotkey={hotkey} />
        <span className="font-semibold text-xl leading-none h-min uppercase">
          {children}
        </span>
      </Button>
    </HotkeyLayer>
  );
});

export function HotkeyIcon(
  props: ComponentProps<typeof Code> & { hotkey: Hotkey },
) {
  const { hotkey, className, ...rest } = props;
  const { controllerType } = useGamepadContext();
  const keyboardHotkeyRender = HotkeyToKeyboardHotkey[hotkey];
  const gamepadButton = HotkeyToGamepadButton[hotkey];
  const [inputDevice] = useInputDeviceContext();

  const usingGamepad = inputDevice === "gamepad";

  const hotkeyRender = usingGamepad
    ? getButtonMapValue(gamepadButton, controllerType)
    : keyboardHotkeyRender;

  return (
    <Code
      {...rest}
      style={{ aspectRatio: usingGamepad ? "unset" : "1/1" }}
      className={cn(
        "uppercase shadow-[0_0_5px_2px_hsl(var(--accent)_/_0.8)]",
        "grid place-items-center",
        "text-lg leading-[0] bg-primary/15 p-[8px]",
        inputDevice === "gamepad" && "rounded-full py-[12px] px-[8px]",
        className,
      )}
    >
      {hotkeyRender}
    </Code>
  );
}
