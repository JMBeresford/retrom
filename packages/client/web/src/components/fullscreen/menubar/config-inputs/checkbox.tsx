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
  useRef,
} from "react";
import { FocusableElement } from "../../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";

const ConfigCheckbox = forwardRef<
  ElementRef<typeof Checkbox>,
  CheckboxProps & { label: ReactNode }
>((props, forwardedRef) => {
  const ref = useRef<HTMLButtonElement>(null!);
  useImperativeHandle(forwardedRef, () => ref.current);
  const { className, label, children, ...rest } = props;
  const genId = useId();
  const id = `${props.id ?? genId}-checkbox`;

  return (
    <div
      className={cn(
        "relative flex gap-2 py-2 px-4 bg-transparent transition-colors",
        "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-secondary before:transition-all",
        "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
        "hover:before:w-1 hover:bg-secondary/20 before:rounded-r",
      )}
    >
      <HotkeyLayer
        id={id}
        handlers={{ ACCEPT: { handler: () => ref.current?.click() } }}
      >
        <FocusableElement
          ref={ref}
          opts={{
            focusKey: id,
          }}
        >
          <Checkbox
            id={id}
            className={cn("h-5 w-5 focus-visible:ring-0", className)}
            {...rest}
          />
        </FocusableElement>
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
    </div>
  );
});

ConfigCheckbox.displayName = "ConfigCheckbox";

export { ConfigCheckbox };
