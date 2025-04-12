import {
  FormControl,
  FormLabel,
  useMaybeFormField,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useFocusable } from "../../focus-container";

type Props = InputProps & { label?: string; bigStep?: number };

export const ConfigInput = forwardRef<HTMLInputElement, Props>(
  (props: Props, forwardedRef) => {
    const { className, label, bigStep: _bigStep, ...rest } = props;
    const { error } = useMaybeFormField() ?? {};

    const wrapperRef = useRef<HTMLDivElement>(null!);
    const { ref, focused, focusSelf } = useFocusable<HTMLInputElement>({
      focusKey: props.id,
      onFocus: () => {
        if (wrapperRef.current !== document.activeElement) {
          wrapperRef.current.focus();
        }
      },
      onBlur: () => {
        if (wrapperRef.current === document.activeElement) {
          wrapperRef.current.blur();
        }
      },
    });

    const onChange = rest.onChange as
      | ControllerRenderProps["onChange"]
      | undefined;

    const node = ref.current;
    useImperativeHandle(forwardedRef, () => ref.current!);

    const step = Number(props.step ?? 1);
    const bigStep = _bigStep ?? step * 5;
    const min = props.min ? Number(props.min) : -Infinity;
    const max = props.max ? Number(props.max) : Infinity;

    return (
      <HotkeyLayer
        handlers={{
          ACCEPT: {
            handler: () => {
              if (focused && node) {
                if (node === document.activeElement) {
                  node.blur();
                  wrapperRef.current.focus();
                } else {
                  node.focus();
                }
              }
            },
          },
          BACK:
            node && node === document.activeElement
              ? { handler: () => wrapperRef.current.focus() }
              : undefined,
          UP: {
            handler: (event) => {
              if (node && node === document.activeElement && onChange) {
                onChange(
                  String(
                    Math.max(Math.min(Number(node.value) + step, max), min),
                  ),
                );

                event?.preventDefault();
                event?.stopPropagation();
              }
            },
          },
          DOWN: {
            handler: (event) => {
              if (node && node === document.activeElement && onChange) {
                onChange(
                  String(
                    Math.max(Math.min(Number(node.value) - step, max), min),
                  ),
                );

                event?.preventDefault();
                event?.stopPropagation();
              }
            },
          },
          LEFT: {
            handler: (event) => {
              if (node && node === document.activeElement && onChange) {
                onChange(
                  String(
                    Math.max(Math.min(Number(node.value) - bigStep, max), min),
                  ),
                );

                event?.preventDefault();
                event?.stopPropagation();
              }
            },
          },
          RIGHT: {
            handler: (event) => {
              if (node && node === document.activeElement && onChange) {
                onChange(
                  String(
                    Math.max(Math.min(Number(node.value) + bigStep, max), min),
                  ),
                );

                event?.preventDefault();
                event?.stopPropagation();
              }
            },
          },
        }}
      >
        <div
          ref={wrapperRef}
          tabIndex={-1}
          onClick={() => {
            focusSelf();
            node?.focus();
          }}
          className={cn(
            "relative flex flex-col px-2 pl-4 bg-transparent transition-colors",
            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-secondary before:transition-all",
            "focus-within:before:bg-accent focus-within:before:w-1 focus-within:bg-secondary/20",
            focused && "before:bg-accent before:w-1 bg-secondary/20",
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
            <Input
              ref={ref}
              className={cn(
                "text-lg border-none p-0 focus-visible:ring-0 focus-visible:ring-transparent ring-offset-transparent",
                "bg-transparent outline-none shadow-none",
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                'aria-[invalid="true"]:ring-transparent',
                className,
              )}
              {...rest}
            />
          </FormControl>
        </div>
      </HotkeyLayer>
    );
  },
);

ConfigInput.displayName = "ConfigInput";
