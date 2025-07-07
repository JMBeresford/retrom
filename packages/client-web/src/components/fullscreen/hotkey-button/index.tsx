import { Button, ButtonProps } from "@retrom/ui/components/button";
import { Code } from "@retrom/ui/components/code";
import { cn } from "@retrom/ui/lib/utils";
import { useGamepadContext } from "@/providers/gamepad";
import { getButtonMapValue } from "@/providers/gamepad/maps";
import { Hotkey } from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useInputDeviceContext } from "@/providers/input-device";
import { ComponentProps, forwardRef, useImperativeHandle } from "react";
import { useFocusable, UseFocusableConfig } from "../focus-container";
import { useHotkeyMapping } from "@/providers/hotkeys/mapping";

export const HotkeyButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    hotkey: Hotkey;
    focusOpts?: UseFocusableConfig<HTMLButtonElement>;
  }
>((props, forwardedRef) => {
  const {
    children,
    className,
    hotkey,
    focusOpts = { focusable: false },
    ...rest
  } = props;
  const { ref } = useFocusable<HTMLButtonElement>(focusOpts);
  useImperativeHandle(forwardedRef, () => ref.current!);

  return (
    <HotkeyLayer
      id={props.id}
      handlers={{
        ACCEPT: {
          handler: () => ref.current?.click(),
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
        <span className="font-medium text-base leading-none h-min uppercase">
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
  const gamepad = useGamepadContext().gamepads?.at(0);
  const { hotkeyToKeyboard, hotkeyToGamepadButton } = useHotkeyMapping();
  const keyboardHotkeyRender = hotkeyToKeyboard[hotkey];
  const gamepadButton = hotkeyToGamepadButton[hotkey];

  const [inputDevice] = useInputDeviceContext();

  const usingGamepad = inputDevice === "gamepad";

  const hotkeyRender =
    usingGamepad && gamepad?.controllerType
      ? getButtonMapValue(gamepadButton, gamepad.controllerType)
      : keyboardHotkeyRender;

  return (
    <Code
      {...rest}
      style={{ aspectRatio: usingGamepad ? "unset" : "1/1" }}
      className={cn(
        "uppercase outline-accent/80 outline",
        "grid place-items-center font-normal",
        "leading-[0] bg-primary/15 p-[6px]",
        inputDevice === "gamepad" && "rounded-full py-[12px] px-[8px]",
        className,
      )}
    >
      {hotkeyRender}
    </Code>
  );
}
