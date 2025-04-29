import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckboxProps } from "@radix-ui/react-checkbox";
import {
  ElementRef,
  forwardRef,
  ReactNode,
  useId,
  useImperativeHandle,
} from "react";
import { FocusContainer, useFocusable } from "../../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";

const ConfigCheckbox = forwardRef<
  ElementRef<typeof Checkbox>,
  CheckboxProps & { label: ReactNode }
>((props, forwardedRef) => {
  const genId = useId();
  const id = `${props.id ?? genId}-checkbox`;

  const { ref, focusSelf } = useFocusable<HTMLButtonElement>({
    focusKey: id,
  });

  useImperativeHandle(forwardedRef, () => ref.current!);
  const { className, label, children, ...rest } = props;

  return (
    <FocusContainer
      opts={{ focusKey: `${id}-container`, onFocus: () => focusSelf() }}
      className={cn(
        "relative flex gap-2 py-2 px-4 bg-transparent transition-colors",
        "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-secondary before:transition-all",
        "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
        "hover:before:w-1 hover:bg-secondary/20 before:rounded-r",
      )}
    >
      <HotkeyLayer
        id={id}
        className="block"
        handlers={{
          ACCEPT: { handler: () => ref.current?.click(), label: "Toggle" },
        }}
      >
        <Checkbox
          ref={ref}
          id={id}
          className={cn("h-5 w-5 focus-visible:ring-0", className)}
          {...rest}
        />
      </HotkeyLayer>

      <div className="flex flex-col gap-2">
        {typeof label === "string" ? (
          <Label htmlFor={id} className="font-normal text-base leading-none">
            {label}
          </Label>
        ) : (
          label
        )}
        {children && (
          <span className="text-sm text-muted-foreground">{children}</span>
        )}
      </div>
    </FocusContainer>
  );
});

ConfigCheckbox.displayName = "ConfigCheckbox";

export { ConfigCheckbox };
