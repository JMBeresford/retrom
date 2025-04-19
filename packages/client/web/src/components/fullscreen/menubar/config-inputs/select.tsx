import { ButtonProps } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SelectItemProps,
  SelectProps,
  SelectValueProps,
} from "@radix-ui/react-select";
import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useState,
} from "react";
import { useFocusable } from "../../focus-container";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { FocusContext } from "@noriginmedia/norigin-spatial-navigation";

type TriggerProps = ButtonProps & { label?: string };

const ConfigSelect = forwardRef<
  HTMLButtonElement,
  SelectProps & { triggerProps: TriggerProps }
>(
  (
    { children, triggerProps, open: openProp, defaultOpen = false, ...props },
    forwardedRef,
  ) => {
    const { label, className, id: _id, ...rest } = triggerProps;

    const genId = useId();
    const id = `${_id ?? genId}-select`;
    const [openInner, setOpenInner] = useState(defaultOpen);
    const open = openProp ?? openInner;

    const contentFocus = useFocusable<HTMLDivElement>({
      focusKey: id + "-content",
      focusable: false,
      forceFocus: true,
      isFocusBoundary: true,
    });

    const triggerFocus = useFocusable<HTMLButtonElement>({
      focusKey: id + "-trigger",
    });

    useImperativeHandle(forwardedRef, () => triggerFocus.ref.current!);

    const onOpenChange = useCallback(
      (val: boolean) => {
        setOpenInner(val);
        props.onOpenChange?.(val);

        if (val) {
          contentFocus.focusSelf();
        } else {
          triggerFocus.focusSelf();
        }
      },
      [props, contentFocus, triggerFocus],
    );

    return (
      <Select {...props} open={open} onOpenChange={onOpenChange}>
        <div
          className={cn(
            "relative flex flex-col pt-1 bg-transparent transition-colors",
            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-secondary before:transition-all",
            "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
            "hover:before:w-1 hover:bg-secondary/20 before:rounded-r",
          )}
        >
          {label ? (
            <FormLabel
              htmlFor={id}
              className="text-xs font-semibold uppercase text-muted-foreground px-4"
            >
              {label}
            </FormLabel>
          ) : (
            <></>
          )}

          <HotkeyLayer
            id={`${id}-trigger-hotkeys`}
            handlers={{
              ACCEPT: {
                handler: () => onOpenChange(true),
                label: "Select",
              },
            }}
          >
            <SelectTrigger
              ref={triggerFocus.ref}
              id={id}
              {...rest}
              className={cn(
                "border-none focus:ring-0 bg-transparent focus:ring-transparent ring-offset-transparent",
                "px-4 py-0 text-base hover:bg-transparent text-left",
                className,
              )}
            >
              <SelectValue />
            </SelectTrigger>
          </HotkeyLayer>
        </div>

        <FocusContext.Provider value={contentFocus.focusKey}>
          <div ref={contentFocus.ref}>
            <SelectContent>
              <HotkeyLayer
                id={`${id}-content`}
                handlers={{
                  BACK: { handler: () => onOpenChange(false), label: "Back" },
                }}
              >
                {children}
              </HotkeyLayer>
            </SelectContent>
          </div>
        </FocusContext.Provider>
      </Select>
    );
  },
);

const ConfigSelectValue = forwardRef<HTMLDivElement, SelectValueProps>(
  (props, ref) => {
    const { children, className, ...rest } = props;

    return (
      <SelectValue ref={ref} {...rest} className={className}>
        {children}
      </SelectValue>
    );
  },
);

ConfigSelectValue.displayName = "ConfigSelectValue";

const ConfigSelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (props, forwardedRef) => {
    const genId = useId();
    const id = `${props.id ?? genId}-select-item-${props.value}`;
    const { ref, focusSelf, focused } = useFocusable<HTMLDivElement>({
      focusKey: id,
    });

    useImperativeHandle(forwardedRef, () => ref.current!);
    const { children, className, ...rest } = props;

    return (
      <HotkeyLayer
        id={`${id}-hotkeys`}
        handlers={{
          ACCEPT: {
            handler: () => {
              ref.current?.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "Enter",
                  bubbles: true,
                  cancelable: true,
                }),
              );
            },
            label: "Confirm",
          },
        }}
      >
        <SelectItem
          ref={ref}
          {...rest}
          className={cn("text-base", className)}
          onFocus={() => {
            if (!focused) {
              focusSelf();
            }
          }}
        >
          {children}
        </SelectItem>
      </HotkeyLayer>
    );
  },
);

ConfigSelectItem.displayName = "ConfigSelectItem";

export { ConfigSelect, ConfigSelectValue, ConfigSelectItem };
