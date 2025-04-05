import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HotkeyHandlers } from "@/providers/hotkeys";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { forwardRef, useImperativeHandle, useRef } from "react";

type Props = ButtonProps & { handlers?: HotkeyHandlers };

export const MenuEntryButton = forwardRef<HTMLButtonElement, Props>(
  (props: Props, forwardedRef) => {
    const ref = useRef<HTMLButtonElement>(null!);
    useImperativeHandle(forwardedRef, () => ref.current);
    const { children, className, type = "button", handlers, ...rest } = props;

    return (
      <HotkeyLayer
        id={props.id}
        handlers={{
          ACCEPT: {
            handler: () => ref.current?.click(),
          },
          ...handlers,
        }}
      >
        <Button
          ref={ref}
          variant="ghost"
          type={type}
          {...rest}
          className={cn(
            "text-base font-semibold relative py-3 pl-4 pr-8 h-max overflow-hidden w-full",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
            "items-end justify-start focus-hover:bg-secondary/30 rounded-none transition-all",
            "text-foreground focus-hover:text-accent-text",

            "before:absolute before:inset-y-0 before:left-0 before:w-0 before:bg-border",
            "before:transition-all before:rounded-r",

            "focus-hover:before:bg-accent focus-hover:before:w-1",
            "data-[state=active]:before:w-1",
            "data-[state=active]:text-accent-text",
            className,
          )}
        >
          {children}
        </Button>
      </HotkeyLayer>
    );
  },
);

MenuEntryButton.displayName = "MenuEntryButton";
