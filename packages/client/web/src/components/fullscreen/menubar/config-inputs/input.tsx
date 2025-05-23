import {
  FormControl,
  FormLabel,
  useMaybeFormField,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef, useId, useImperativeHandle } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useFocusable } from "../../focus-container";
import { clamp } from "@/utils/math";

type Props = InputProps & { label?: string; bigStep?: number };

export const ConfigInput = forwardRef<HTMLInputElement, Props>(
  (props: Props, forwardedRef) => {
    const { className, label, bigStep: _bigStep, id: _id, ...rest } = props;
    const { error } = useMaybeFormField() ?? {};
    const genId = useId();
    const id = `${_id ?? genId}-input`;

    const wrapperFocusable = useFocusable<HTMLDivElement>({
      focusKey: id + "wrapper",
    });

    const focusable = useFocusable<HTMLInputElement>({
      focusKey: id,
      focusable: false,
      isFocusBoundary: true,
    });

    const onChange = rest.onChange as
      | ControllerRenderProps["onChange"]
      | undefined;

    useImperativeHandle(forwardedRef, () => focusable.ref.current!);

    const step = Number(props.step ?? 1);
    const bigStep = _bigStep ?? step * 5;
    const min = props.min !== undefined ? Number(props.min) : -Infinity;
    const max = props.max !== undefined ? Number(props.max) : Infinity;

    const node = focusable.ref.current;

    return (
      <HotkeyLayer
        id={id + "wrapper-hotkeys"}
        handlers={{
          ACCEPT: {
            handler: () => {
              focusable.focusSelf();
            },
            actionBar: {
              label: "Edit",
            },
          },
        }}
      >
        <div
          ref={wrapperFocusable.ref}
          tabIndex={-1}
          onClick={() => {
            focusable.focusSelf();
          }}
          className={cn(
            "relative flex flex-col px-2 pl-4 bg-transparent transition-colors",
            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-secondary before:transition-all",
            "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
            focusable.focused && "before:bg-accent before:w-1 bg-secondary/20",
            "border-none outline-none before:rounded-r",
            "hover:before:w-1 hover:bg-secondary/20",
            error && "before:bg-destructive",
            label && "pt-2",
          )}
        >
          {label ? (
            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
              {label}
            </FormLabel>
          ) : (
            <></>
          )}

          <FormControl>
            <HotkeyLayer
              id={id + "hotkeys"}
              handlers={{
                ACCEPT: {
                  handler: () => wrapperFocusable.focusSelf(),
                  actionBar: {
                    label: "Accept",
                  },
                },
                BACK: {
                  handler: () => wrapperFocusable.focusSelf(),
                  actionBar: {
                    label: "Back",
                  },
                },
                UP: {
                  handler: (event) => {
                    if (node && focusable.focused && onChange) {
                      onChange(
                        String(
                          clamp({ value: node.valueAsNumber + step, min, max }),
                        ),
                      );

                      event?.preventDefault();
                      event?.stopPropagation();
                    }
                  },
                  actionBar: {
                    label: `+${step}`,
                  },
                },
                DOWN: {
                  handler: (event) => {
                    if (node && focusable.focused && onChange) {
                      onChange(
                        String(
                          clamp({ value: node.valueAsNumber - step, min, max }),
                        ),
                      );

                      event?.preventDefault();
                      event?.stopPropagation();
                    }
                  },
                  actionBar: {
                    label: `-${step}`,
                  },
                },
                LEFT: {
                  handler: (event) => {
                    if (node && focusable.focused && onChange) {
                      onChange(
                        String(
                          clamp({
                            value: node.valueAsNumber - bigStep,
                            min,
                            max,
                          }),
                        ),
                      );

                      event?.preventDefault();
                      event?.stopPropagation();
                    }
                  },
                  actionBar: {
                    label: `-${bigStep}`,
                  },
                },
                RIGHT: {
                  handler: (event) => {
                    if (node && focusable.focused && onChange) {
                      onChange(
                        String(
                          clamp({
                            value: node.valueAsNumber + bigStep,
                            min,
                            max,
                          }),
                        ),
                      );

                      event?.preventDefault();
                      event?.stopPropagation();
                    }
                  },
                  actionBar: {
                    label: `+${bigStep}`,
                  },
                },
              }}
            >
              <Input
                ref={focusable.ref}
                className={cn(
                  "text-lg border-none p-0 focus-visible:ring-0 focus-visible:ring-transparent ring-offset-transparent",
                  "bg-transparent outline-none shadow-none",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  'aria-[invalid="true"]:ring-transparent',
                  className,
                )}
                {...rest}
                onChange={(e) => {
                  onChange?.(e.target.value);
                }}
              />
            </HotkeyLayer>
          </FormControl>
        </div>
      </HotkeyLayer>
    );
  },
);

ConfigInput.displayName = "ConfigInput";
