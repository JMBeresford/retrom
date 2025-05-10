import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HotkeyHandlers } from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { useFocusable, UseFocusableConfig } from "../focus-container";
import { forwardRef, useId, useImperativeHandle } from "react";

type Props = ButtonProps & { handlers?: HotkeyHandlers } & {
  label?: string;
  focusOpts?: UseFocusableConfig<HTMLButtonElement>;
};

export const MenuEntryButton = forwardRef<HTMLButtonElement, Props>(
  (props: Props, forwardedRef) => {
    const {
      children,
      className,
      type = "button",
      handlers,
      id: _id,
      focusOpts,
      onFocus,
      label,
      ...rest
    } = props;

    const genId = useId();
    const id = _id ?? genId;

    const { ref, focused, focusSelf } = useFocusable<HTMLButtonElement>({
      focusKey: id,
      focusable: !rest.disabled,
      ...focusOpts,
    });

    useImperativeHandle(forwardedRef, () => ref.current!);

    return (
      <HotkeyLayer
        id={`${id}-hotkeys`}
        handlers={{
          ...handlers,
          ACCEPT: {
            handler: () => ref.current?.click(),
            label: "Accept",
            ...handlers?.ACCEPT,
          },
        }}
      >
        <Button
          ref={ref}
          id={id}
          variant="ghost"
          type={type}
          {...rest}
          onFocus={(e) => {
            if (!focused && e.target === e.currentTarget) {
              focusSelf();
            }

            onFocus?.(e);
          }}
          className={cn(
            "text-base font-semibold relative py-4 sm:py-3 pl-4 pr-8 h-max overflow-hidden w-full",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
            "justify-start focus-hover:bg-secondary/30 rounded-none transition-all",
            "text-foreground focus-hover:text-accent-text",

            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-border",
            "before:transition-all before:rounded-r",

            "focus-hover:before:bg-accent focus-hover:before:w-1",
            "data-[state=active]:before:w-1",
            "data-[state=active]:text-accent-text",
            label && "flex flex-col items-start",
            className,
          )}
        >
          {label ? (
            <>
              <span>{children}</span>
              <span className="text-muted-foreground text-sm font-light">
                {label}
              </span>
            </>
          ) : (
            children
          )}
        </Button>
      </HotkeyLayer>
    );
  },
);

MenuEntryButton.displayName = "MenuEntryButton";
