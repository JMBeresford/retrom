import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HotkeyLayer } from "@/providers/hotkeys/layers";
import { forwardRef, useImperativeHandle, useRef } from "react";

export const MenuEntryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props: ButtonProps, forwardedRef) => {
    const ref = useRef<HTMLButtonElement>(null!);
    useImperativeHandle(forwardedRef, () => ref.current);
    const { children, className, ...rest } = props;

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
          {...rest}
          className={cn(
            className,
            "text-2xl font-bold uppercase relative p-2 pl-4 h-max overflow-hidden",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
            "items-end justify-start focus-hover:bg-secondary/20",
            "transition-all text-foreground/30 focus-hover:text-foreground",
            "before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border before:transition-all",
            "focus-hover:before:bg-accent focus-hover:before:w-1",
          )}
        >
          {children}
        </Button>
      </HotkeyLayer>
    );
  },
);

MenuEntryButton.displayName = "MenuEntryButton";
